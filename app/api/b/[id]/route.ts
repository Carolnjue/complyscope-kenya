import { ok, fail, needBusiness } from '@/lib/http';
import { loadWorkspace } from '@/lib/business';
import { exec } from '@/lib/db';
import { audit } from '@/lib/auth';
import { integrationStatus, appUrl } from '@/lib/integrations';
import { billingSettings, planState } from '@/lib/billing';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id); if ('res' in a) return a.res;
  const ws = await loadWorkspace(a.business.id);
  const st = (await integrationStatus());
  const plan = planState(a.business, await billingSettings());
  return ok({ ws, role: a.role, plan, me: { id: a.user.id, name: a.user.name, email: a.user.email }, integrations: { email: st.email, sms: st.sms, mpesa: st.mpesa }, calendarUrl: appUrl() + '/api/calendar/' + ws!.calendarToken });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id, 'owner'); if ('res' in a) return a.res;
  await exec('UPDATE businesses SET deleted_at = NOW() WHERE id = ?', [a.business.id]);
  await audit(a.user.id, a.business.id, 'business_deleted', a.business.name);
  return ok();
}
