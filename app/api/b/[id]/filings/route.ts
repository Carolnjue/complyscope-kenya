import { ok, fail, body, needBusiness } from '@/lib/http';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'editor'); if ('res' in a) return a.res;
  const b = await body(req);
  const inst = String(b.instId || '');
  if (!/^[a-z0-9-]{2,40}(@l\d{1,4})?$/.test(inst)) return fail('Unknown obligation.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) return fail('Enter the date.');
  const today = new Date(Date.now() + 3 * 3600000).toISOString().slice(0, 10);
  if (b.date > today) return fail('The date cannot be in the future.');
  const period = String(b.period || '').slice(0, 40);
  if (!period) return fail('Choose the period.');
  const r = await exec('INSERT INTO filings (business_id, inst_id, period, filed_on, ref, title, loc, kind, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
    [a.business.id, inst, period, b.date, String(b.ref || '').slice(0, 120), String(b.title || inst).slice(0, 190), String(b.loc || '').slice(0, 120), ['filing', 'record', 'renewal'].includes(b.kind) ? b.kind : 'filing', a.user.id]);
  await audit(a.user.id, a.business.id, 'filing_added', inst + ' ' + period);
  return ok({ id: r.insertId });
}
