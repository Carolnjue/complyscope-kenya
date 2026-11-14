import { ok, fail, body, needUser } from '@/lib/http';
import { q, exec, one } from '@/lib/db';
import { setSetting, sendEmail, emailLayout, integrationStatus, escHtml, button, appUrl } from '@/lib/integrations';
import { runReminders } from '@/lib/reminders';
import { INTEGRATIONS, saveIntegration, IntegrationName } from '@/lib/config';
import { testIntegration } from '@/lib/integrations';
import { billingSettings, saveBillingSettings, startTrialsForPilotBusinesses } from '@/lib/billing';
import { reviewManualPayment } from '@/lib/payments';
import { audit } from '@/lib/auth';

async function admin() { const u = await needUser(); if ('res' in u) return u; if (!u.user.is_admin) return { res: fail('Admins only.', 403) }; return u; }

export async function POST(req: Request) {
  const a = await admin(); if ('res' in a) return a.res;
  const b = await body(req);
  switch (b.action) {
    case 'user-disable': {
      const id = Number(b.userId); if (id === a.user.id) return fail('You cannot disable your own account.');
      await exec('UPDATE users SET is_disabled = ? WHERE id = ?', [b.value ? 1 : 0, id]);
      if (b.value) await exec('DELETE FROM sessions WHERE user_id = ?', [id]);
      break;
    }
    case 'user-admin': { const id = Number(b.userId); if (id === a.user.id && !b.value) return fail('You cannot remove your own admin access.'); await exec('UPDATE users SET is_admin = ? WHERE id = ?', [b.value ? 1 : 0, id]); break; }
    case 'user-verify': await exec('UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?', [Number(b.userId)]); break;
    case 'business-plan': {
      if (!['pilot', 'trial', 'starter', 'growth', 'enterprise'].includes(b.plan)) return fail('Unknown plan.');
      const days = Math.max(0, Math.min(3660, Number(b.days) || 0));
      await exec('UPDATE businesses SET plan = ?, plan_expires_at = ' + (days ? 'DATE_ADD(NOW(), INTERVAL ? DAY)' : 'NULL') + ' WHERE id = ?', days ? [b.plan, days, Number(b.businessId)] : [b.plan, Number(b.businessId)]);
      break;
    }
    case 'setting': {
      const allowed = ['review_status', 'review_note', 'announcement'];
      if (!allowed.includes(b.key)) return fail('Unknown setting.');
      await setSetting(b.key, String(b.value || '').slice(0, 1000));
      break;
    }
    case 'integration-save': {
      const name = b.name as IntegrationName;
      if (!INTEGRATIONS[name]) return fail('Unknown integration.');
      await saveIntegration(name, b.values || {}, !!b.enabled);
      await audit(a.user.id, null, 'admin_integration_' + name, b.enabled ? 'enabled' : 'disabled');
      return ok();
    }
    case 'integration-test': {
      if (!['email', 'mpesa', 'sms'].includes(b.name)) return fail('Nothing to test for this one.');
      const r = await testIntegration(b.name, { email: a.user.email, phone: a.user.phone });
      return r.ok ? ok({ message: r.message }) : fail(r.message);
    }
    case 'billing-save': {
      const before = await billingSettings();
      await saveBillingSettings({ mode: b.mode, trialDays: b.trialDays, starter: b.starter, growth: b.growth, annualMonths: b.annualMonths });
      const after = await billingSettings();
      if (before.mode === 'pilot' && after.mode === 'paid') {
        await startTrialsForPilotBusinesses(after.trialDays);
        const days = Math.max(30, after.trialDays);
        const owners = await q<any>('SELECT DISTINCT u.email, u.name FROM memberships m JOIN users u ON u.id = m.user_id JOIN businesses b ON b.id = m.business_id WHERE m.role = "owner" AND u.is_disabled = 0 AND b.deleted_at IS NULL');
        for (const o of owners) await sendEmail(o.email, 'ComplyScope paid plans are starting', emailLayout('Paid plans are starting', `<p>Hi ${escHtml(String(o.name).split(' ')[0])},</p><p>Thank you for using ComplyScope during the pilot. Paid plans start today. Your businesses keep full access free for the next <b>${days} days</b>. After that, choose a plan on each business's Billing tab: Starter is KSh ${after.prices.starter.toLocaleString('en-KE')} a month and Growth is KSh ${after.prices.growth.toLocaleString('en-KE')} a month.</p><p>If you do nothing, your records stay safe and readable; you just won't be able to add new ones until you subscribe.</p>` + button(appUrl() + '/app', 'Open ComplyScope')));
      }
      await audit(a.user.id, null, 'admin_billing_save', JSON.stringify(after));
      return ok();
    }
    case 'payment-review': {
      const done = await reviewManualPayment(Number(b.paymentId), !!b.approve, a.user.id);
      return done ? ok() : fail('That payment is no longer waiting for review.');
    }
    case 'run-reminders': { const r = await runReminders(); await audit(a.user.id, null, 'admin_run_reminders', JSON.stringify(r)); return ok({ result: r }); }
    default: return fail('Unknown action.');
  }
  await audit(a.user.id, Number(b.businessId) || null, 'admin_' + b.action, JSON.stringify(b).slice(0, 300));
  return ok();
}
