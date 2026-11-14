import { runReminders } from '@/lib/reminders';
import { getSetting } from '@/lib/integrations';
import { ok } from '@/lib/http';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/* Daily reminder run. Safe to call publicly: without the optional CRON_SECRET key it runs at most once every 20 hours,
   and reminders are de-duplicated per item and day, so repeated calls never send duplicates. */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key') || '';
  const secret = process.env.CRON_SECRET || '';
  const forced = !!secret && key.length === secret.length && crypto.timingSafeEqual(Buffer.from(key), Buffer.from(secret));
  if (!forced) {
    const last = Date.parse(String(await getSetting('last_cron_run', '')).split(' · ')[0]);
    if (last && Date.now() - last < 20 * 3600 * 1000) return ok({ skipped: true, reason: 'Already ran in the last 20 hours' });
  }
  return ok(await runReminders());
}
