import { ok, fail, body, needBusiness } from '@/lib/http';
import { cleanProfile } from '@/lib/business';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'editor'); if ('res' in a) return a.res;
  const b = await body(req);
  if (!b.profile || !String(b.profile.name || '').trim()) return fail('Enter the business or trading name.');
  const p = cleanProfile(b.profile);
  const tf = /^\d{4}-\d{2}-\d{2}$/.test(b.trackFrom || '') ? b.trackFrom : null;
  await exec('UPDATE businesses SET name = ?, profile = ?' + (tf ? ', track_from = ?' : '') + ' WHERE id = ?', tf ? [p.name, JSON.stringify(p), tf, a.business.id] : [p.name, JSON.stringify(p), a.business.id]);
  await audit(a.user.id, a.business.id, 'profile_updated', '');
  return ok();
}
