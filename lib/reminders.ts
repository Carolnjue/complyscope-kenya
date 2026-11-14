import 'server-only';
import { q, exec, one } from './db';
import { loadWorkspace, evaluateWorkspace } from './business';
import { sendEmail, emailLayout, button, appUrl, sendSms, integrationStatus, flushOutbox } from './integrations';
import CS from './engine';

const NOTIFY_DAYS = [14, 7, 1, 0, -1, -7];

export async function runReminders(today = CS.todayKE()) {
  const st = integrationStatus();
  const businesses = await q<any>('SELECT id FROM businesses WHERE deleted_at IS NULL');
  let emails = 0, sms = 0, items = 0;
  for (const b of businesses) {
    const ws = await loadWorkspace(b.id);
    if (!ws) continue;
    const res = evaluateWorkspace(ws, today);
    const due = CS.agenda(res, today, 15).filter((a: any) => NOTIFY_DAYS.includes(a.days));
    if (!due.length) continue;
    const members = await q<any>('SELECT u.id, u.name, u.email, u.phone, u.remind_email, u.remind_sms FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.business_id = ? AND m.role IN ("owner","editor") AND u.is_disabled = 0', [b.id]);
    // Only remind once per item, period and stage
    const fresh: any[] = [];
    for (const a of due) {
      const seen = await one('SELECT 1 FROM reminders_sent WHERE business_id=? AND inst_id=? AND period=? AND days_before=? AND channel="email"', [b.id, a.r.id, a.period, a.days]);
      if (!seen) fresh.push(a);
    }
    if (!fresh.length) continue;
    items += fresh.length;
    const rows = fresh.map((a: any) => `<tr><td style="padding:8px 6px;border-bottom:1px solid #eef2f1"><b>${a.r.inst.title}</b><br><span style="color:#64748b;font-size:13px">${CS.periodLabel(a.period)}${a.r.inst.loc ? ' · ' + a.r.inst.loc.name : ''}</span></td><td style="padding:8px 6px;border-bottom:1px solid #eef2f1;white-space:nowrap;color:${a.days < 0 ? '#dc2626' : a.days <= 1 ? '#d97706' : '#0f172a'};font-weight:700">${a.days < 0 ? -a.days + ' days overdue' : a.days === 0 ? 'Due today' : 'Due ' + CS.fmt(a.due) + ' (' + a.days + ' days)'}</td></tr>`).join('');
    const html = (name: string) => emailLayout(`${fresh.length} compliance date${fresh.length > 1 ? 's' : ''} for ${ws.name}`, `<p>Hi ${String(name).replace(/</g, '')},</p><p>These items for <b>${ws.name.replace(/</g, '')}</b> need attention:</p><table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>${button(appUrl() + '/app/b/' + b.id + '#deadlines', 'Open ComplyScope')}<p style="font-size:13px;color:#64748b">Already done? Mark it as filed in ComplyScope and the reminder stops.</p>`);
    for (const m of members) {
      if (m.remind_email && st.email) { if (await sendEmail(m.email, `ComplyScope: ${fresh.length} date${fresh.length > 1 ? 's' : ''} for ${ws.name}`, html(m.name))) emails++; }
      if (m.remind_sms && st.sms && m.phone) {
        const first = fresh[0];
        const msg = `ComplyScope: ${ws.name} - ${first.r.inst.title} ${first.days < 0 ? 'is overdue' : first.days === 0 ? 'is due today' : 'due ' + CS.fmt(first.due)}${fresh.length > 1 ? ' (+' + (fresh.length - 1) + ' more)' : ''}. ${appUrl()}/app/b/${b.id}`;
        if (await sendSms(m.phone, msg.slice(0, 300))) sms++;
      }
    }
    if (st.email || st.sms) for (const a of fresh) await exec('INSERT IGNORE INTO reminders_sent (business_id, inst_id, period, days_before, channel) VALUES (?,?,?,?,"email")', [b.id, a.r.id, a.period, a.days]);
  }
  const flushed = await flushOutbox();
  await exec('INSERT INTO settings (k, v) VALUES ("last_cron_run", ?) ON DUPLICATE KEY UPDATE v = VALUES(v)', [new Date().toISOString() + ` · ${items} items, ${emails} emails, ${sms} SMS, ${flushed} retried`]);
  return { items, emails, sms, flushed };
}
