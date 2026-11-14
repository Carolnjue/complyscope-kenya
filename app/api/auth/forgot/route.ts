import { ok, fail, body } from '@/lib/http';
import { one } from '@/lib/db';
import { normEmail, issueToken, tooManyAttempts, noteAttempt } from '@/lib/auth';
import { sendEmail, emailLayout, button, appUrl, integrationStatus } from '@/lib/integrations';

export async function POST(req: Request) {
  const b = await body(req);
  const email = normEmail(b.email);
  if (!integrationStatus().email) return fail('Password reset by email is not switched on yet. Contact support to reset your password.', 503);
  if (await tooManyAttempts('forgot:' + email, 5, 60)) return ok();
  await noteAttempt('forgot:' + email);
  const u = await one<any>('SELECT id, name FROM users WHERE email = ? AND is_disabled = 0', [email]);
  if (u) {
    const t = await issueToken('reset', { userId: u.id, hours: 2 });
    await sendEmail(email, 'Reset your ComplyScope Kenya password', emailLayout('Reset your password', `<p>Someone asked to reset the password for this account. If it was you, choose a new password:</p>${button(appUrl() + '/reset?token=' + t, 'Choose a new password')}<p style="font-size:13px;color:#64748b">This link expires in 2 hours. If you did not ask for this, ignore this email.</p>`));
  }
  return ok();
}
