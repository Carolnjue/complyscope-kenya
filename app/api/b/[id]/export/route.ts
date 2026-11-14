import { needBusiness } from '@/lib/http';
import { loadWorkspace, evaluateWorkspace } from '@/lib/business';
import CS from '@/lib/engine';

const LABEL: Record<string, string> = { overdue: 'Overdue', soon: 'Due soon', ok: 'On track', missing: 'Not recorded', info: 'Needs a date', done: 'In place', na: 'Not applicable' };
function csv(rows: any[][]) { return '\ufeff' + rows.map((r) => r.map((c) => { c = String(c ?? ''); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(',')).join('\r\n'); }

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await needBusiness((await params).id); if ('res' in a) return a.res;
  const type = new URL(req.url).searchParams.get('type') || 'obligations';
  const ws = await loadWorkspace(a.business.id);
  const today = CS.todayKE();
  const res = evaluateWorkspace(ws, today);
  let rows: any[][];
  if (type === 'deadlines') {
    rows = [['Due date', 'Obligation', 'Period', 'Applies to', 'Authority', 'Days left']].concat(CS.agenda(res, today, 365).map((x: any) => [CS.iso(x.due), x.r.inst.title, CS.periodLabel(x.period), x.r.inst.loc ? x.r.inst.loc.name + ' (' + x.r.inst.loc.county + ')' : 'Business-wide', x.r.inst.ob.auth, x.days]));
  } else if (type === 'filings') {
    rows = [['Date', 'Obligation', 'Period', 'Location', 'Reference', 'Type']].concat(ws!.filings.map((f: any) => [f.date, f.title, CS.periodLabel(f.period), f.loc, f.ref, f.kind]));
  } else {
    rows = [['Area', 'Obligation', 'Authority', 'Applies to', 'Status', 'Next date', 'Notes']].concat(res.map((r: any) => [r.inst.ob.group, r.inst.title, r.inst.ob.auth, r.inst.loc ? r.inst.loc.name + ' (' + r.inst.loc.county + ')' : 'Business-wide', LABEL[r.status], r.next != null ? CS.iso(r.next) : '', r.note]));
  }
  const name = `complyscope-${type}-${ws!.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${CS.iso(today)}.csv`;
  return new Response(csv(rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'private, no-store' } });
}
