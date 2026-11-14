import { ok, fail, body, needUser } from '@/lib/http';
import { createBusiness, listBusinesses } from '@/lib/business';
import { audit } from '@/lib/auth';

export async function GET() {
  const u = await needUser(); if ('res' in u) return u.res;
  const list = await listBusinesses(u.user.id);
  return ok({ businesses: list.map((b) => ({ id: b.id, name: b.name, role: b.role, plan: b.plan })) });
}

export async function POST(req: Request) {
  const u = await needUser(); if ('res' in u) return u.res;
  const b = await body(req);
  if (!b.profile || !String(b.profile.name || '').trim()) return fail('Enter the business or trading name.');
  const owned = (await listBusinesses(u.user.id)).filter((x) => x.role === 'owner').length;
  if (owned >= 25 && !u.user.is_admin) return fail('You have reached the limit of 25 businesses on one account.');
  const tf = /^\d{4}-\d{2}-\d{2}$/.test(b.trackFrom || '') ? b.trackFrom : new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 8) + '01';
  const id = await createBusiness(u.user.id, b.profile, tf);
  await audit(u.user.id, id, 'business_created', String(b.profile.name).slice(0, 100));
  return ok({ id });
}
