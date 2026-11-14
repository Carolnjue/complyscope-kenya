import { ok, fail, body } from '@/lib/http';
import { one, exec } from '@/lib/db';
import { hashPassword, passwordProblem, normEmail, validEmail, createSession, issueToken, isSuperadminEmail, audit, tooManyAttempts, noteAttempt } from '@/lib/auth';
import { sendEmail, emailLayout, button, appUrl, integrationStatus, normPhone } from '@/lib/integrations';

export async function POST(req: Request) {
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 120);
  const email = normEmail(b.email);
  const phone = String(b.phone || '').trim();
  if (!name) return fail('Enter your full name.');
  if (!validEmail(email)) return fail('Enter a valid email address.');
  if (phone && !normPhone(phone)) return fail('Enter a Kenyan mobile number like 0712 345 678, or leave it blank.');
  const pp = passwordProblem(b.password); if (pp) return fail(pp);
  if (!b.terms) return fail('Please accept the terms of use and privacy policy.');
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (await tooManyAttempts('signup:' + ip, 10, 60)) return fail('Too many sign-ups from this connection. Try again later.', 429);
  await noteAttempt('signup:' + ip);
  if (await one('SELECT id FROM users WHERE email = ?', [email])) return fail('An account with this email already exists. Sign in instead.');
  const emailOn = (await integrationStatus()).email;
  const r = await exec('INSERT INTO users (email, name, phone, password_hash, is_admin, email_verified_at) VALUES (?,?,?,?,?, ' + (emailOn ? 'NULL' : 'NOW()') + ')',
    [email, name, normPhone(phone), await hashPassword(b.password), isSuperadminEmail(email) ? 1 : 0]);
  await audit(r.insertId, null, 'signup', email);
  if (emailOn) {
    const t = await issueToken('verify', { userId: r.insertId, hours: 72 });
    await sendEmail(email, 'Confirm your ComplyScope Kenya email', emailLayout('Confirm your email', `<p>Hi ${name.replace(/</g, '')},</p><p>Confirm your email address to finish setting up your ComplyScope Kenya account.</p>${button(appUrl() + '/verify?token=' + t, 'Confirm my email')}<p style="font-size:13px;color:#64748b">This link expires in 3 days.</p>`));
  }
  await createSession(r.insertId);
  return ok({ verified: !emailOn });
}
