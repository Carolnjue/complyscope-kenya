import { needUser, fail } from '@/lib/http';
import { q } from '@/lib/db';
import { audit } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Full data export for admins. Sessions, one-time tokens and login attempts are left out.
// Integration secrets stay encrypted, and uploaded files are not included (they live in the upload folder).
const TABLES = ['users', 'businesses', 'memberships', 'records', 'filings', 'documents', 'reminders_sent', 'payments', 'email_outbox', 'audit_log', 'settings'];

export async function GET() {
  const u = await needUser(); if ('res' in u) return u.res;
  if (!u.user.is_admin) return fail('Admins only.', 403);
  const out: any = { app: 'ComplyScope Kenya', exportedAt: new Date().toISOString(), tables: {} };
  for (const t of TABLES) out.tables[t] = await q<any>('SELECT * FROM `' + t + '`');
  await audit(u.user.id, null, 'admin.backup', 'Downloaded a data backup');
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(out, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="complyscope-backup-${stamp}.json"`, 'Cache-Control': 'no-store' } });
}
