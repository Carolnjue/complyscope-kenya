import { ok, fail, body, needBusiness } from '@/lib/http';
import { q, exec, one } from '@/lib/db';
import { integrationStatus, normPhone, sendEmail, emailLayout, button, appUrl, escHtml } from '@/lib/integrations';
import { billingSettings, planCatalogue, planState, priceFor } from '@/lib/billing';
import { stkPush } from '@/lib/mpesa';
import { audit } from '@/lib/auth';
import { reconcileMpesa } from '@/lib/payments';

const MONTHS = [1, 3, 6, 12];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id); if ('res' in a) return a.res;
  await reconcileMpesa(a.business.id).catch(() => 0);
  const [s, st, plans] = await Promise.all([billingSettings(), integrationStatus(), planCatalogue()]);
  const payments = await q<any>('SELECT id, plan, amount, phone, receipt, reference, method, months, status, result_desc, created_at FROM payments WHERE business_id = ? ORDER BY id DESC LIMIT 30', [a.business.id]);
  const state = planState(a.business, s);
  const quotes: any = {};
  for (const k of ['starter', 'growth'] as const) quotes[k] = MONTHS.map((m) => ({ months: m, amount: priceFor(plans[k].price, m, s.annualMonths) }));
  return ok({
    mode: s.mode, state, plans, quotes, annualMonths: s.annualMonths,
    methods: { mpesa: st.mpesa, manual: st.manual, manualInstructions: st.manualInstructions },
    payments: payments.map((p) => ({ ...p, phone: p.phone ? String(p.phone).replace(/^(\d{6})\d{3}/, '$1***') : '' })),
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'owner', { allowInactive: true }); if ('res' in a) return a.res;
  const b = await body(req);
  const [s, st, plans] = await Promise.all([billingSettings(), integrationStatus(), planCatalogue()]);
  if (s.mode !== 'paid') return fail('ComplyScope is in its free pilot, so there is nothing to pay yet.');
  const planKey = b.plan === 'growth' ? 'growth' : b.plan === 'starter' ? 'starter' : '';
  if (!planKey) return fail('Choose the Starter or Growth plan.');
  const months = MONTHS.includes(Number(b.months)) ? Number(b.months) : 1;
  if (planKey === 'starter') {
    const counties = new Set((a.business.profile.locations || []).map((l: any) => l.county));
    if (counties.size > 1) return fail('Starter covers one county. This business has locations in ' + counties.size + ' counties, so choose Growth.');
  }
  const amount = priceFor(plans[planKey].price, months, s.annualMonths);

  if (b.method === 'manual') {
    if (!st.manual) return fail('Manual payments are not switched on.');
    const ref = String(b.reference || '').trim().toUpperCase().replace(/\s+/g, ' ').slice(0, 60);
    if (ref.length < 6) return fail('Enter the M-Pesa or bank transaction code.');
    if (await one('SELECT id FROM payments WHERE reference = ? AND status IN ("review","paid")', [ref])) return fail('That transaction code has already been submitted.');
    const r = await exec('INSERT INTO payments (business_id, user_id, plan, amount, phone, method, months, reference, status) VALUES (?,?,?,?,?,?,?,?,?)',
      [a.business.id, a.user.id, planKey, amount, normPhone(b.phone) || '', 'manual', months, ref, 'review']);
    await audit(a.user.id, a.business.id, 'payment_submitted', planKey + ' ' + months + 'm ' + ref);
    const admins = await q<any>('SELECT email FROM users WHERE is_admin = 1 AND is_disabled = 0');
    for (const ad of admins) await sendEmail(ad.email, 'Payment to confirm: ' + String(a.business.name).slice(0, 80), emailLayout('Payment to confirm', `<p><b>${escHtml(a.business.name)}</b> says it paid <b>KSh ${amount.toLocaleString('en-KE')}</b> for ${plans[planKey].name}, ${months} month(s).</p><p>Transaction code: <b>${escHtml(ref)}</b></p>` + button(appUrl() + '/admin#payments', 'Review payment')));
    return ok({ paymentId: r.insertId, review: true });
  }

  if (!st.mpesa) return fail('M-Pesa payments are not switched on yet.', 503);
  const phone = normPhone(b.phone);
  if (!phone) return fail('Enter the M-Pesa number, e.g. 0712 345 678.');
  try {
    const cid = await stkPush(phone, amount, 'CS' + a.business.id, 'ComplyScope');
    const r = await exec('INSERT INTO payments (business_id, user_id, plan, amount, phone, checkout_request_id, method, months) VALUES (?,?,?,?,?,?,?,?)', [a.business.id, a.user.id, planKey, amount, phone, cid, 'mpesa', months]);
    await audit(a.user.id, a.business.id, 'payment_started', planKey + ' ' + months + 'm');
    return ok({ paymentId: r.insertId });
  } catch (e: any) { return fail('M-Pesa could not start the payment: ' + String(e?.message || e), 502); }
}
