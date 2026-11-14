import { ok, fail, body } from '@/lib/http';
import { exec } from '@/lib/db';
import { readToken, useToken, hashPassword, passwordProblem, createSession, audit } from '@/lib/auth';

export async function POST(req: Request) {
  const b = await body(req);
  const t = await readToken('reset', String(b.token || ''));
  if (!t) return fail('This reset link has expired or was already used. Ask for a new one.');
  const pp = passwordProblem(b.password); if (pp) return fail(pp);
  await exec('UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?', [await hashPassword(b.password), t.user_id]);
  await exec('DELETE FROM sessions WHERE user_id = ?', [t.user_id]);
  await useToken(t.id);
  await audit(t.user_id, null, 'password_reset', '');
  await createSession(t.user_id);
  return ok();
}
