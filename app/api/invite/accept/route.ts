import { ok, fail, body, needUser } from '@/lib/http';
import { exec, one } from '@/lib/db';
import { readToken, useToken, audit } from '@/lib/auth';

export async function POST(req: Request) {
  const u = await needUser(); if ('res' in u) return u.res;
  const b = await body(req);
  const t = await readToken('invite', String(b.token || ''));
  if (!t) return fail('This invitation has expired or was already used.');
  if (t.email && t.email !== u.user.email) return fail(`This invitation was sent to ${t.email}. Sign in with that email to accept it.`, 403);
  const biz = await one<any>('SELECT id FROM businesses WHERE id = ? AND deleted_at IS NULL', [t.business_id]);
  if (!biz) return fail('That business no longer exists.');
  await exec('INSERT INTO memberships (business_id, user_id, role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE role = VALUES(role)', [t.business_id, u.user.id, t.role || 'editor']);
  await exec('UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?', [u.user.id]);
  await useToken(t.id);
  await audit(u.user.id, t.business_id, 'invite_accepted', '');
  return ok({ businessId: t.business_id });
}
