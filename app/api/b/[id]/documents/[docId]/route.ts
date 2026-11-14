import { ok, fail, needBusiness } from '@/lib/http';
import { one, exec } from '@/lib/db';
import { audit } from '@/lib/auth';
import { readUpload, removeUpload } from '@/lib/files';

function disposition(name: string) {
  const clean = String(name || 'document').replace(/[\r\n"]/g, '');
  const ascii = clean.replace(/[^\x20-\x7e]/g, '_');
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(clean)}`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const p = await params;
  const a = await needBusiness(p.id); if ('res' in a) return a.res;
  const d = await one<any>('SELECT * FROM documents WHERE id = ? AND business_id = ?', [Number(p.docId), a.business.id]);
  if (!d) return fail('Document not found.', 404);
  try {
    const buf = await readUpload(a.business.id, d.stored_name);
    return new Response(new Uint8Array(buf), { headers: { 'Content-Type': d.mime, 'Content-Disposition': disposition(d.filename), 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return fail('The file is missing from storage.', 404); }
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const p = await params;
  const a = await needBusiness(p.id, 'editor'); if ('res' in a) return a.res;
  const d = await one<any>('SELECT * FROM documents WHERE id = ? AND business_id = ?', [Number(p.docId), a.business.id]);
  if (!d) return ok();
  await exec('DELETE FROM documents WHERE id = ?', [d.id]);
  await removeUpload(a.business.id, d.stored_name);
  await audit(a.user.id, a.business.id, 'document_deleted', d.filename);
  return ok();
}
