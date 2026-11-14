import { requireUser } from '@/lib/session';
import { integrationStatus } from '@/lib/integrations';
import AccountForms from './AccountForms';
export const metadata = { title: 'My account' };
export default async function Page() {
  const u = await requireUser('/account');
  const st = (await integrationStatus());
  return <AccountForms user={{ name: u.name, email: u.email, phone: u.phone || '', verified: !!u.email_verified_at, remindEmail: !!u.remind_email, remindSms: !!u.remind_sms }} emailOn={st.email} smsOn={st.sms} />;
}
