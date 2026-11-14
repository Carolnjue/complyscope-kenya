import 'server-only';
import crypto from 'crypto';
import { billingSettings } from './billing';
import { q, one, exec, asJson } from './db';
import CS from './engine';

export type Role = 'owner' | 'editor' | 'viewer';
const RANK: Record<Role, number> = { viewer: 1, editor: 2, owner: 3 };

export const PLANS: Record<string, { name: string; price: number; maxCounties: number | null; note: string }> = {
  pilot: { name: 'Pilot (free)', price: 0, maxCounties: null, note: 'All features free during the pilot' },
  starter: { name: 'Starter', price: 4999, maxCounties: 1, note: '1 business, 1 county' },
  growth: { name: 'Growth', price: 14999, maxCounties: null, note: 'Multi-county and branches' },
  enterprise: { name: 'Enterprise', price: 0, maxCounties: null, note: 'Custom' },
};

export async function listBusinesses(userId: number) {
  return q<any>(`SELECT b.id, b.name, b.plan, b.plan_expires_at, b.updated_at, m.role, b.profile
    FROM memberships m JOIN businesses b ON b.id = m.business_id WHERE m.user_id = ? AND b.deleted_at IS NULL ORDER BY b.name`, [userId]);
}

export async function access(userId: number, businessId: number, min: Role = 'viewer', isAdmin = false) {
  const b = await one<any>('SELECT * FROM businesses WHERE id = ? AND deleted_at IS NULL', [businessId]);
  if (!b) return null;
  const m = await one<{ role: Role }>('SELECT role FROM memberships WHERE business_id = ? AND user_id = ?', [businessId, userId]);
  const role: Role | null = m ? m.role : (isAdmin ? 'viewer' : null);
  if (!role || RANK[role] < RANK[min]) return null;
  b.profile = asJson(b.profile);
  return { business: b, role };
}

export function cleanProfile(p: any) {
  const str = (v: any, n = 120) => String(v ?? '').trim().slice(0, n);
  const bool = (v: any) => v === true || v === 'true' || v === 'on' || v === 1;
  const sectors = Array.isArray(p.sectors) ? p.sectors.filter((s: string) => CS.SECTORS.some((x: any) => x[0] === s)) : [];
  const locs = (Array.isArray(p.locations) ? p.locations : []).slice(0, 60).map((l: any, i: number) => ({
    id: /^l\d{1,4}$/.test(l.id) ? l.id : 'l' + (i + 1), name: str(l.name, 80) || 'Location ' + (i + 1),
    county: CS.COUNTIES.includes(l.county) ? l.county : 'Nairobi City', signage: bool(l.signage),
  }));
  const ids = new Set<string>(); locs.forEach((l: any) => { while (ids.has(l.id)) l.id = 'l' + (Number(l.id.slice(1)) + 100); ids.add(l.id); });
  return {
    name: str(p.name, 150), structure: CS.STRUCTURES[p.structure] ? p.structure : 'company', stage: p.stage === 'starting' ? 'starting' : 'operating',
    incDate: /^\d{4}-\d{2}-\d{2}$/.test(p.incDate || '') ? p.incDate : '', fyEnd: Math.min(12, Math.max(1, Number(p.fyEnd) || 12)),
    sectors, activities: str(p.activities, 400), employees: Math.max(0, Math.min(100000, Math.floor(Number(p.employees) || 0))),
    turnover: CS.TURNOVER[p.turnover] ? p.turnover : 'unknown', vat: ['yes', 'no', 'unknown'].includes(p.vat) ? p.vat : 'unknown', tot: ['yes', 'no'].includes(p.tot) ? p.tot : 'auto',
    personalData: bool(p.personalData), foreignStaff: bool(p.foreignStaff), weighing: bool(p.weighing), fumigation: bool(p.fumigation), wasteTransport: bool(p.wasteTransport), cctv: bool(p.cctv), pharmacy: bool(p.pharmacy), healthFacility: bool(p.healthFacility), liquor: bool(p.liquor), paysFees: bool(p.paysFees), residentialRent: bool(p.residentialRent),
    kraPin: str(p.kraPin, 20).toUpperCase(), regNo: str(p.regNo, 40).toUpperCase(),
    locations: locs.length ? locs : [{ id: 'l1', name: 'Main premises', county: 'Nairobi City', signage: false }],
  };
}

export async function createBusiness(userId: number, profile: any, trackFrom: string) {
  const p = cleanProfile(profile);
  const bs = await billingSettings();
  const trial = bs.mode === 'paid';
  const r = await exec('INSERT INTO businesses (owner_id, name, profile, track_from, calendar_token, plan, plan_expires_at) VALUES (?,?,?,?,?,?,' + (trial ? 'DATE_ADD(NOW(), INTERVAL ? DAY)' : 'NULL') + ')',
    trial ? [userId, p.name, JSON.stringify(p), trackFrom, crypto.randomBytes(16).toString('hex'), 'trial', bs.trialDays] : [userId, p.name, JSON.stringify(p), trackFrom, crypto.randomBytes(16).toString('hex'), 'pilot']);
  await exec('INSERT INTO memberships (business_id, user_id, role) VALUES (?,?,?)', [r.insertId, userId, 'owner']);
  return r.insertId;
}

export async function loadWorkspace(businessId: number) {
  const b = await one<any>('SELECT id, name, profile, track_from, DATE_FORMAT(created_at, "%Y-%m-%d") AS created_on, plan, plan_expires_at, calendar_token FROM businesses WHERE id = ?', [businessId]);
  if (!b) return null;
  const recs = await q<any>('SELECT inst_id, data FROM records WHERE business_id = ?', [businessId]);
  const records: Record<string, any> = {};
  recs.forEach((r) => { records[r.inst_id] = asJson(r.data); });
  const filings = await q<any>('SELECT id, inst_id, period, DATE_FORMAT(filed_on, "%Y-%m-%d") AS filed_on, ref, title, loc, kind, created_at FROM filings WHERE business_id = ? ORDER BY filed_on DESC, id DESC', [businessId]);
  const docs = await q<any>('SELECT id, inst_id, filing_id, filename, mime, size, created_at FROM documents WHERE business_id = ? ORDER BY id DESC', [businessId]);
  return {
    id: b.id, name: b.name, plan: b.plan, planExpiresAt: b.plan_expires_at, calendarToken: b.calendar_token,
    profile: asJson(b.profile), trackFrom: String(b.track_from).slice(0, 10), createdOn: b.created_on, records,
    filings: filings.map((f) => ({ fid: String(f.id), id: f.inst_id, period: f.period, date: f.filed_on, ref: f.ref, title: f.title, loc: f.loc, kind: f.kind })),
    documents: docs,
  };
}

/** Evaluate all obligations for a stored workspace with the shared engine. */
export function evaluateWorkspace(ws: any, today?: number) {
  return CS.evaluateAll({ profile: ws.profile, records: ws.records, filings: ws.filings, trackFrom: ws.trackFrom, createdOn: ws.createdOn }, today);
}
