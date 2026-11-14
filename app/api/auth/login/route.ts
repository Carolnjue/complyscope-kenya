import { ok, fail, body } from '@/lib/http';
import { one } from '@/lib/db';
import { checkPassword, normEmail, createSession, tooManyAttempts, noteAttempt, audit, isSuperadminEmail } from '@/lib/auth';
import { exec } from '@/lib/db';

export async function POST(req: Request) {
  const b = await body(req);
  const email = normEmail(b.email);
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (await tooManyAttempts('login:' + email + ':' + ip)) return fail('Too many attempts. Wait 15 minutes and try again.', 429);
  const u = await one<any>('SELECT id, password_hash, is_disabled, is_admin FROM users WHERE email = ?', [email]);
  if (!u || !(await checkPassword(String(b.password || ''), u.password_hash))) { await noteAttempt('login:' + email + ':' + ip); return fail('Email or password is incorrect.', 401); }
  if (u.is_disabled) return fail('This account has been disabled. Contact support.', 403);
  if (!u.is_admin && isSuperadminEmail(email)) await exec('UPDATE users SET is_admin = 1 WHERE id = ?', [u.id]);
  await createSession(u.id);
  await audit(u.id, null, 'login', '');
  return ok();
}
