import { LANDING_HTML } from '@/lib/landing-html';
import LandingDemo from '@/components/LandingDemo';
import { billingSettings } from '@/lib/billing';

export const dynamic = 'force-dynamic';

const ksh = (n: number) => n.toLocaleString('en-KE');

/* The landing markup is static design HTML; prices and pilot wording follow the billing settings in the admin console. */
async function landingHtml() {
  let s;
  try { s = await billingSettings(); } catch { return LANDING_HTML; }
  let h = LANDING_HTML.replace('KSh 4,999<span', 'KSh ' + ksh(s.prices.starter) + '<span').replace('KSh 14,999<span', 'KSh ' + ksh(s.prices.growth) + '<span');
  if (s.mode === 'paid') {
    h = h.replace('FREE DURING PILOT · ALL 47 COUNTIES', (s.trialDays ? s.trialDays + '-DAY FREE TRIAL' : 'NOW LIVE') + ' · ALL 47 COUNTIES')
      .replace('Free during the pilot. Scale with your compliance burden;', (s.trialDays ? 'Start with a ' + s.trialDays + '-day free trial. ' : '') + (s.annualMonths < 12 ? 'Pay yearly and get ' + (12 - s.annualMonths) + ' months free. ' : '') + 'Scale with your compliance burden;')
      .replace('No card or M-Pesa needed.', s.trialDays ? 'Free for ' + s.trialDays + ' days, no payment needed to start.' : 'Pay by M-Pesa when you are ready.');
  }
  return h;
}

export default async function Home() {
  return (
    <>
      <div id="view-home" dangerouslySetInnerHTML={{ __html: await landingHtml() }} />
      <LandingDemo />
    </>
  );
}
