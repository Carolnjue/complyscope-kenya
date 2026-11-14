import { q } from '@/lib/db';
export const dynamic = 'force-dynamic';
/* Public health check: reports whether the database is reachable, with the error code only (never credentials). */
export async function GET() {
  const env = { database: !!process.env.DATABASE_URL, appUrl: !!process.env.APP_URL };
  try { await q('SELECT 1'); return Response.json({ ok: true, env }); }
  catch (e: any) { return Response.json({ ok: false, env, error: e?.code || e?.message?.split('\n')[0]?.slice(0, 120) || 'unknown' }, { status: 503 }); }
}
