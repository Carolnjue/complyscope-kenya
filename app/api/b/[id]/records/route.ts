import { ok, fail, body, needBusiness } from '@/lib/http';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'editor'); if ('res' in a) return a.res;
  const b = await body(req);
  const inst = String(b.instId || '');
  if (!/^[a-z0-9-]{2,40}(@l\d{1,4})?$/.test(inst)) return fail('Unknown obligation.');
  if (b.data == null) { await exec('DELETE FROM records WHERE business_id = ? AND inst_id = ?', [a.business.id, inst]); return ok(); }
  const d = b.data, clean: any = {};
  if (d.held) clean.held = true;
  if (d.na) clean.na = true;
  if (ISO.test(d.expiry || '')) clean.expiry = d.expiry;
  if (ISO.test(d.last || '')) clean.last = d.last;
  if (ISO.test(d.date || '')) clean.date = d.date;
  if (d.ref) clean.ref = String(d.ref).slice(0, 80);
  await exec('INSERT INTO records (business_id, inst_id, data, updated_by) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by)', [a.business.id, inst, JSON.stringify(clean), a.user.id]);
  await audit(a.user.id, a.business.id, 'record_updated', inst);
  return ok();
}
