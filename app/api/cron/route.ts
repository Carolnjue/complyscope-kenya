import { runReminders } from '@/lib/reminders';
import { fail, ok } from '@/lib/http';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key') || '';
  const secret = process.env.CRON_SECRET || '';
  if (!secret || key.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret))) return fail('Not allowed.', 403);
  const r = await runReminders();
  return ok(r);
}
