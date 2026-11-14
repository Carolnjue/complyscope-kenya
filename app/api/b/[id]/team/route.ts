import { ok, fail, body, needBusiness } from '@/lib/http';
import { q, one, exec } from '@/lib/db';
import { issueToken, normEmail, validEmail, audit } from '@/lib/auth';
import { sendEmail, emailLayout, button, appUrl, integrationStatus } from '@/lib/integrations';

const ROLES = ['owner', 'editor', 'viewer'];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id); if ('res' in a) return a.res;
  const members = await q<any>('SELECT u.id, u.name, u.email, m.role, m.created_at FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.business_id = ? ORDER BY FIELD(m.role,"owner","editor","viewer"), u.name', [a.business.id]);
  const invites = a.role === 'owner' ? await q<any>('SELECT id, email, role, expires_at FROM tokens WHERE type = "invite" AND business_id = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC', [a.business.id]) : [];
  return ok({ members, invites });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'owner'); if ('res' in a) return a.res;
  const b = await body(req);
  const email = normEmail(b.email), role = ROLES.includes(b.role) ? b.role : 'editor';
  if (!validEmail(email)) return fail('Enter a valid email address.');
  const existing = await one<any>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing && await one('SELECT 1 FROM memberships WHERE business_id = ? AND user_id = ?', [a.business.id, existing.id])) return fail('That person is already on the team.');
  const t = await issueToken('invite', { email, businessId: a.business.id, role, hours: 24 * 7 });
  const link = appUrl() + '/invite?token=' + t;
  const sent = await sendEmail(email, `${a.user.name} invited you to ${a.business.name} on ComplyScope Kenya`, emailLayout('You have been invited', `<p>${a.user.name.replace(/</g, '')} invited you to help manage compliance for <b>${a.business.name.replace(/</g, '')}</b> as ${role === 'viewer' ? 'a viewer' : 'an ' + role}.</p>${button(link, 'Accept invitation')}<p style="font-size:13px;color:#64748b">This invitation expires in 7 days.</p>`));
  await audit(a.user.id, a.business.id, 'member_invited', email + ' ' + role);
  return ok({ sent, link: (await integrationStatus()).email ? null : link });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'owner'); if ('res' in a) return a.res;
  const b = await body(req);
  if (!ROLES.includes(b.role)) return fail('Choose a role.');
  const uid = Number(b.userId);
  if (b.role !== 'owner') {
    const owners = await q<any>('SELECT user_id FROM memberships WHERE business_id = ? AND role = "owner"', [a.business.id]);
    if (owners.length === 1 && owners[0].user_id === uid) return fail('The business needs at least one owner.');
  }
  await exec('UPDATE memberships SET role = ? WHERE business_id = ? AND user_id = ?', [b.role, a.business.id, uid]);
  await audit(a.user.id, a.business.id, 'member_role', uid + ' ' + b.role);
  return ok();
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'viewer'); if ('res' in a) return a.res;
  const b = await body(req);
  if (b.inviteId) {
    if (a.role !== 'owner') return fail('Only owners can cancel invitations.', 403);
    await exec('UPDATE tokens SET used_at = NOW() WHERE id = ? AND business_id = ? AND type = "invite"', [Number(b.inviteId), a.business.id]);
    return ok();
  }
  const uid = Number(b.userId);
  if (uid !== a.user.id && a.role !== 'owner') return fail('Only owners can remove team members.', 403);
  const owners = await q<any>('SELECT user_id FROM memberships WHERE business_id = ? AND role = "owner"', [a.business.id]);
  if (owners.length === 1 && owners[0].user_id === uid) return fail('The business needs at least one owner. Make someone else an owner first.');
  await exec('DELETE FROM memberships WHERE business_id = ? AND user_id = ?', [a.business.id, uid]);
  await audit(a.user.id, a.business.id, 'member_removed', String(uid));
  return ok();
}
