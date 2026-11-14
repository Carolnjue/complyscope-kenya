import { one } from '@/lib/db';
import { loadWorkspace, evaluateWorkspace } from '@/lib/business';
import CS from '@/lib/engine';
import { appUrl } from '@/lib/integrations';

export const dynamic = 'force-dynamic';
function esc(s: string) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function d8(t: number) { return CS.iso(t).replace(/-/g, ''); }
function fold(line: string) { const out: string[] = []; while (line.length > 74) { out.push(line.slice(0, 74)); line = ' ' + line.slice(74); } out.push(line); return out.join('\r\n'); }

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token.replace(/\.ics$/, '');
  if (!/^[a-f0-9]{32}$/.test(token)) return new Response('Not found', { status: 404 });
  const b = await one<any>('SELECT id FROM businesses WHERE calendar_token = ? AND deleted_at IS NULL', [token]);
  if (!b) return new Response('Not found', { status: 404 });
  const ws = await loadWorkspace(b.id);
  const today = CS.todayKE();
  const res = evaluateWorkspace(ws, today);
  const ag = CS.agenda(res, today, 400);
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pentarch Systems Solutions//ComplyScope Kenya//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc('ComplyScope · ' + ws!.name), 'X-WR-TIMEZONE:Africa/Nairobi', 'REFRESH-INTERVAL;VALUE=DURATION:PT12H'];
  for (const a of ag) {
    lines.push('BEGIN:VEVENT', 'UID:' + esc(b.id + '-' + a.r.id + '-' + a.period) + '@complyscope', 'DTSTAMP:' + now, 'DTSTART;VALUE=DATE:' + d8(a.due), 'DTEND;VALUE=DATE:' + d8(a.due + CS.DAY),
      'SUMMARY:' + esc((a.days < 0 ? 'OVERDUE: ' : '') + a.r.inst.title + (a.r.inst.loc ? ' – ' + a.r.inst.loc.name : '')),
      'DESCRIPTION:' + esc(CS.periodLabel(a.period) + '. ' + a.r.inst.ob.how + '\n' + appUrl() + '/app/b/' + b.id),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(a.r.inst.title), 'TRIGGER:-P2D', 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return new Response(lines.map(fold).join('\r\n'), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' } });
}
