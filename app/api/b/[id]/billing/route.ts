import { ok, fail, body, needBusiness } from '@/lib/http';
import { q, exec } from '@/lib/db';
import { PLANS } from '@/lib/business';
import { integrationStatus, normPhone } from '@/lib/integrations';
import { stkPush } from '@/lib/mpesa';
import { audit } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id); if ('res' in a) return a.res;
  const payments = await q<any>('SELECT id, plan, amount, phone, receipt, status, result_desc, created_at FROM payments WHERE business_id = ? ORDER BY id DESC LIMIT 30', [a.business.id]);
  return ok({ plan: a.business.plan, planExpiresAt: a.business.plan_expires_at, payments: payments.map((p) => ({ ...p, phone: String(p.phone).replace(/^(\d{6})\d{3}/, '$1***') })), mpesa: integrationStatus().mpesa, plans: PLANS });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'owner'); if ('res' in a) return a.res;
  if (!integrationStatus().mpesa) return fail('M-Pesa payments are not switched on yet. Your account stays on the free pilot.', 503);
  const b = await body(req);
  const plan = PLANS[b.plan];
  if (!plan || !plan.price) return fail('Choose the Starter or Growth plan.');
  const phone = normPhone(b.phone);
  if (!phone) return fail('Enter the M-Pesa number, e.g. 0712 345 678.');
  try {
    const cid = await stkPush(phone, plan.price, 'CS' + a.business.id, 'ComplyScope');
    const r = await exec('INSERT INTO payments (business_id, user_id, plan, amount, phone, checkout_request_id) VALUES (?,?,?,?,?,?)', [a.business.id, a.user.id, b.plan, plan.price, phone, cid]);
    await audit(a.user.id, a.business.id, 'payment_started', b.plan);
    return ok({ paymentId: r.insertId });
  } catch (e: any) { return fail('M-Pesa could not start the payment: ' + String(e?.message || e), 502); }
}
