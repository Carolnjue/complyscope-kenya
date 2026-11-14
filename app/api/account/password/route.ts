import { ok, fail, body, needUser } from '@/lib/http';
import { one, exec } from '@/lib/db';
import { checkPassword, hashPassword, passwordProblem, audit, sha256, SESSION_COOKIE } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const u = await needUser(); if ('res' in u) return u.res;
  const b = await body(req);
  const row = await one<any>('SELECT password_hash FROM users WHERE id = ?', [u.user.id]);
  if (!(await checkPassword(String(b.current || ''), row.password_hash))) return fail('Your current password is incorrect.');
  const pp = passwordProblem(b.password); if (pp) return fail(pp);
  await exec('UPDATE users SET password_hash = ? WHERE id = ?', [await hashPassword(b.password), u.user.id]);
  const keep = (await cookies()).get(SESSION_COOKIE)?.value || '';
  await exec('DELETE FROM sessions WHERE user_id = ? AND id <> ?', [u.user.id, sha256(keep)]);
  await audit(u.user.id, null, 'password_changed', '');
  return ok();
}
