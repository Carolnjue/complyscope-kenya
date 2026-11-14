import 'server-only';
import { NextResponse } from 'next/server';
import { currentUser, User } from './auth';
import { access, Role } from './business';

export function ok(data: any = {}, status = 200) { return NextResponse.json({ ok: true, ...data }, { status }); }
export function fail(message: string, status = 400) { return NextResponse.json({ ok: false, error: message }, { status }); }

export async function body(req: Request): Promise<any> { try { return await req.json(); } catch { return {}; } }

export async function needUser(): Promise<{ user: User } | { res: NextResponse }> {
  const user = await currentUser();
  if (!user) return { res: fail('Please sign in again.', 401) };
  return { user };
}

export async function needBusiness(idParam: string, min: Role = 'viewer') {
  const u = await needUser();
  if ('res' in u) return u;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return { res: fail('Business not found.', 404) };
  const a = await access(u.user.id, id, min, !!u.user.is_admin);
  if (!a) return { res: fail(min === 'viewer' ? 'Business not found.' : 'You do not have permission to change this business.', 403) };
  return { user: u.user, business: a.business, role: a.role };
}

/** Basic same-origin check for state-changing requests. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try { return new URL(origin).host === host; } catch { return false; }
}
