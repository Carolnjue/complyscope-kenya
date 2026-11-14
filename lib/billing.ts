import 'server-only';
import { getSetting, setSetting } from './integrations';
import { exec } from './db';

/* Billing rules.
   mode "pilot": everything is free and open (the default until you decide to charge).
   mode "paid":  new businesses get a free trial; after it ends, owners pay to keep recording.
                 Viewing, exports and the dossier always stay available, so nobody loses their records. */

export type PlanKey = 'pilot' | 'trial' | 'starter' | 'growth' | 'enterprise';
export type BillingSettings = { mode: 'pilot' | 'paid'; trialDays: number; prices: { starter: number; growth: number }; annualMonths: number };

export async function billingSettings(): Promise<BillingSettings> {
  const mode = (await getSetting('billing_mode', 'pilot')) === 'paid' ? 'paid' : 'pilot';
  const num = async (k: string, d: number) => { const n = Number(await getSetting(k, String(d))); return Number.isFinite(n) && n >= 0 ? Math.round(n) : d; };
  return { mode, trialDays: await num('trial_days', 14), prices: { starter: await num('price_starter', 4999), growth: await num('price_growth', 14999) }, annualMonths: await num('annual_months', 10) };
}

export async function saveBillingSettings(b: Partial<{ mode: string; trialDays: number; starter: number; growth: number; annualMonths: number }>) {
  if (b.mode) await setSetting('billing_mode', b.mode === 'paid' ? 'paid' : 'pilot');
  const n = (v: any, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(Number(v) || 0)));
  if (b.trialDays != null) await setSetting('trial_days', String(n(b.trialDays, 0, 365)));
  if (b.starter != null) await setSetting('price_starter', String(n(b.starter, 1, 10000000)));
  if (b.growth != null) await setSetting('price_growth', String(n(b.growth, 1, 10000000)));
  if (b.annualMonths != null) await setSetting('annual_months', String(n(b.annualMonths, 1, 12)));
}

export async function planCatalogue() {
  const s = await billingSettings();
  return {
    pilot: { name: 'Pilot (free)', price: 0, maxCounties: null as number | null, note: 'All features free during the pilot' },
    trial: { name: 'Free trial', price: 0, maxCounties: null as number | null, note: 'Every feature, free for ' + s.trialDays + ' days' },
    starter: { name: 'Starter', price: s.prices.starter, maxCounties: 1 as number | null, note: '1 business, 1 county' },
    growth: { name: 'Growth', price: s.prices.growth, maxCounties: null as number | null, note: 'Multi-county and branches' },
    enterprise: { name: 'Enterprise', price: 0, maxCounties: null as number | null, note: 'Custom agreement' },
  };
}

/** Price for a number of months; a full year costs `annualMonths` months. */
export function priceFor(monthly: number, months: number, annualMonths: number) {
  return months >= 12 ? monthly * annualMonths * Math.floor(months / 12) + monthly * (months % 12) : monthly * months;
}

/** Whether the business can still be changed, and what to tell the owner. */
export function planState(b: { plan: string; plan_expires_at: string | null; created_at?: string }, s: BillingSettings) {
  if (s.mode === 'pilot') return { active: true, plan: 'pilot', expires: null as string | null, label: 'Pilot (free)', message: '' };
  const now = Date.now();
  const exp = b.plan_expires_at ? Date.parse(String(b.plan_expires_at).replace(' ', 'T') + '+03:00') : null;
  if (b.plan === 'enterprise' && !exp) return { active: true, plan: 'enterprise', expires: null, label: 'Enterprise', message: '' };
  let plan = b.plan, expires = exp;
  if (plan === 'pilot') { // businesses created during the pilot get a trial from the day paid mode starts
    plan = 'trial';
    expires = null;
  }
  if (expires && expires > now) return { active: true, plan, expires: new Date(expires).toISOString().slice(0, 10), label: plan === 'trial' ? 'Free trial' : plan[0].toUpperCase() + plan.slice(1), message: '' };
  if (!expires && plan === 'trial') return { active: true, plan, expires: null, label: 'Free trial', message: '' };
  return { active: false, plan, expires: expires ? new Date(expires).toISOString().slice(0, 10) : null, label: (plan === 'trial' ? 'Trial' : plan) + ' ended', message: 'Your plan has ended. Renew on the Billing tab to keep recording filings and documents. Everything you saved is still here.' };
}

/** When paid mode is switched on, give every pilot business a free period from today (at least 30 days). */
export async function startTrialsForPilotBusinesses(days: number) {
  days = Math.max(days, 30); // the terms promise pilot users at least 30 days' free access when paid plans start
  await exec("UPDATE businesses SET plan = 'trial', plan_expires_at = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE plan = 'pilot' AND deleted_at IS NULL", [days]);
}

/** Extends a business's plan by whole months from the later of now and its current expiry. */
export async function extendPlan(businessId: number, plan: string, months: number) {
  await exec('UPDATE businesses SET plan = ?, plan_expires_at = DATE_ADD(GREATEST(COALESCE(plan_expires_at, NOW()), NOW()), INTERVAL ? MONTH) WHERE id = ?', [plan, Math.max(1, months), businessId]);
}
