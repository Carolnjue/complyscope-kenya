import { ok, fail, body, needUser } from '@/lib/http';
import { exec } from '@/lib/db';
import { normPhone } from '@/lib/integrations';

export async function POST(req: Request) {
  const u = await needUser(); if ('res' in u) return u.res;
  const b = await body(req);
  const name = String(b.name || '').trim().slice(0, 120);
  if (!name) return fail('Enter your name.');
  const phone = String(b.phone || '').trim();
  if (phone && !normPhone(phone)) return fail('Enter a Kenyan mobile number like 0712 345 678, or leave it blank.');
  await exec('UPDATE users SET name = ?, phone = ?, remind_email = ?, remind_sms = ? WHERE id = ?', [name, normPhone(phone), b.remindEmail ? 1 : 0, b.remindSms ? 1 : 0, u.user.id]);
  return ok();
}
