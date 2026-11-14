import { ok, needBusiness } from '@/lib/http';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; fid: string }> }) {
  const p = await params;
  const a = await needBusiness(p.id, 'editor'); if ('res' in a) return a.res;
  await exec('DELETE FROM filings WHERE id = ? AND business_id = ?', [Number(p.fid), a.business.id]);
  await exec('UPDATE documents SET filing_id = NULL WHERE filing_id = ? AND business_id = ?', [Number(p.fid), a.business.id]);
  await audit(a.user.id, a.business.id, 'filing_deleted', p.fid);
  return ok();
}
