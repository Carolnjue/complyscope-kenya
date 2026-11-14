import { ok, fail, body, needUser } from '@/lib/http';
import { q, exec, one } from '@/lib/db';
import { setSetting, sendEmail, emailLayout, integrationStatus } from '@/lib/integrations';
import { runReminders } from '@/lib/reminders';
import { PLANS } from '@/lib/business';
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
      if (!PLANS[b.plan]) return fail('Unknown plan.');
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
    case 'run-reminders': { const r = await runReminders(); await audit(a.user.id, null, 'admin_run_reminders', JSON.stringify(r)); return ok({ result: r }); }
    case 'test-email': {
      if (!integrationStatus().email) return fail('Email is still pending: add the SMTP settings first.');
      const sent = await sendEmail(a.user.email, 'ComplyScope test email', emailLayout('Email is working', '<p>This test confirms that ComplyScope can send email from your server.</p>'));
      return sent ? ok() : fail('Sending failed. Check the SMTP settings and the outbox for the error.');
    }
    default: return fail('Unknown action.');
  }
  await audit(a.user.id, Number(b.businessId) || null, 'admin_' + b.action, JSON.stringify(b).slice(0, 300));
  return ok();
}
