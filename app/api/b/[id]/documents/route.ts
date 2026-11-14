import { ok, fail, needBusiness } from '@/lib/http';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';
import { saveUpload, sniff, ALLOWED, MAX_UPLOAD } from '@/lib/files';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'editor'); if ('res' in a) return a.res;
  let form: FormData;
  try { form = await req.formData(); } catch { return fail('Upload could not be read.'); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return fail('Choose a file to upload.');
  if (file.size > MAX_UPLOAD) return fail('Files must be 10 MB or smaller.');
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  let mime = file.type;
  if (kind === 'zip') { if (!/officedocument/.test(mime)) return fail('Only PDF, JPG, PNG, WEBP, Word (.docx) and Excel (.xlsx) files are allowed.'); }
  else if (!kind || kind !== mime) { if (kind && ALLOWED[kind]) mime = kind; else return fail('Only PDF, JPG, PNG, WEBP, Word (.docx) and Excel (.xlsx) files are allowed.'); }
  if (!ALLOWED[mime]) return fail('Only PDF, JPG, PNG, WEBP, Word (.docx) and Excel (.xlsx) files are allowed.');
  const inst = String(form.get('instId') || '');
  const filingId = Number(form.get('filingId') || 0) || null;
  const stored = await saveUpload(a.business.id, buf, mime);
  const name = String(file.name || 'document').replace(/[^\w.\- ()]/g, '_').slice(0, 180);
  const r = await exec('INSERT INTO documents (business_id, inst_id, filing_id, filename, stored_name, mime, size, uploaded_by) VALUES (?,?,?,?,?,?,?,?)',
    [a.business.id, /^[a-z0-9-]{2,40}(@l\d{1,4})?$/.test(inst) ? inst : null, filingId, name, stored, mime, buf.length, a.user.id]);
  await audit(a.user.id, a.business.id, 'document_uploaded', name);
  return ok({ id: r.insertId });
}
