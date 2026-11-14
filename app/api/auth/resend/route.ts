import { ok, fail, needUser } from '@/lib/http';
import { issueToken, tooManyAttempts, noteAttempt } from '@/lib/auth';
import { sendEmail, emailLayout, button, appUrl, integrationStatus } from '@/lib/integrations';

export async function POST() {
  const u = await needUser(); if ('res' in u) return u.res;
  if (u.user.email_verified_at) return ok();
  if (!integrationStatus().email) return fail('Email is not switched on yet.', 503);
  if (await tooManyAttempts('resend:' + u.user.id, 3, 60)) return fail('Please wait before asking for another email.', 429);
  await noteAttempt('resend:' + u.user.id);
  const t = await issueToken('verify', { userId: u.user.id, hours: 72 });
  await sendEmail(u.user.email, 'Confirm your ComplyScope Kenya email', emailLayout('Confirm your email', `<p>Confirm your email address to finish setting up your account.</p>${button(appUrl() + '/verify?token=' + t, 'Confirm my email')}`));
  return ok();
}
