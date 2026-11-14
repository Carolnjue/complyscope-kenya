'use client';
import { useEffect } from 'react';
import CS from '@/lib/engine';
import COUNTY_DATA, { COUNTY_BY_NAME } from '@/lib/counties';

/* Drives the "Live Dashboard" section of the landing page with the real rules engine and an example business. */
export default function LandingDemo() {
  useEffect(() => {
    var $ = function (s: string) { return document.querySelector(s) as any; };
    var $$ = function (s: string) { return Array.prototype.slice.call(document.querySelectorAll(s)) as any[]; };
    var esc = function (s: any) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as any)[c]; }); };
    var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var TODAY = CS.todayKE();
    if (!$('#obligationBody')) return;
    function openDemoDetail(r: any) {
      var ob = r.inst.ob, src = r.inst.src;
      var root = document.createElement('div');
      root.className = 'scrim';
      root.innerHTML = '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgTitle"><header><div><p style="font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)">' + esc(ob.group.toUpperCase()) + ' · EXAMPLE BUSINESS</p><h3 id="dlgTitle" style="font-size:21px;margin-top:4px;font-weight:800">' + esc(r.inst.title) + '</h3></div><button class="btn sm ghost" type="button" data-close>Close</button></header>' +
        '<div class="body"><dl class="kv"><dt>Why it applies</dt><dd>' + esc(ob.why) + '</dd><dt>Authority</dt><dd>' + esc(ob.auth) + '</dd><dt>What to do</dt><dd>' + esc(ob.how) + '</dd>' + (ob.penalty ? '<dt>If late</dt><dd>' + esc(ob.penalty) + '</dd>' : '') + (src && src.url ? '<dt>Source</dt><dd><a href="' + esc(src.url) + '" target="_blank" rel="noopener">' + esc(src.label) + '</a></dd>' : '') + '</dl></div>' +
        '<footer><a class="btn primary" href="/signup">Add your business</a></footer></div>';
      document.body.appendChild(root);
      var close = function () { root.remove(); document.removeEventListener('keydown', onKey); };
      var onKey = function (e: KeyboardEvent) { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', onKey);
      root.addEventListener('mousedown', function (e) { if (e.target === root) close(); });
      (root.querySelector('[data-close]') as any).addEventListener('click', close);
      (root.querySelector('[data-close]') as any).focus();
    }
  // ---------------- Live dashboard section of the design, driven by the rules engine ----------------
    function dInfo(name) {
      var c = COUNTY_BY_NAME[name] || COUNTY_BY_NAME['Nairobi City'];
      var full = c.name + ' County';
      var portal = c.portal ? c.portal.label + (c.portal.url ? ' (' + c.portal.url.replace(/^https?:\/\//, '') + ')' : '') : 'County or sub-county revenue office';
      return { name: full, permit: c.permit, fee: 'Set by the ' + full + ' Finance Act by activity, size and zone', portal: portal + (c.ussd ? ' · ' + c.ussd : ''),
        addons: c.notes[0] || 'Fees and add-ons follow the county Finance Act; confirm on your county invoice.',
        alerts: c.notes.slice(1, 3).map(function (t) { return { level: 'update', text: t }; }) };
    }
  var SHARED_ALERTS=[
    {level:"update",text:"NSSF Year 4 rates apply from February 2026: Tier I up to KSh 9,000 and Tier II up to KSh 108,000, at 6% employee plus 6% employer. Due by the 9th."},
    {level:"update",text:"SHIF is 2.75% of gross pay, remitted to SHA by the 9th of the following month. Late remittance attracts 2% a month."},
    {level:"update",text:"Affordable Housing Levy is 1.5% employee plus 1.5% employer, due by the 9th working day after month end. Late payment attracts 3% a month."},
    {level:"update",text:"NITA levy is KSh 50 per employee per month, declared on the PAYE return and due by the 9th."},
    {level:"warning",text:"Under the County Licensing (Uniform Procedures) Act, 2024 a county permit runs 12 months from the date of issue. Renew before the expiry printed on it."}
  ];
  var DSTATUS = { done:{label:"Compliant",color:"#047857",bg:"rgba(5,150,105,.12)"}, ok:{label:"Compliant",color:"#047857",bg:"rgba(5,150,105,.12)"}, soon:{label:"Expiring soon",color:"#92400e",bg:"rgba(217,119,6,.12)"}, overdue:{label:"At risk",color:"#b91c1c",bg:"rgba(220,38,38,.12)"}, missing:{label:"Not started",color:"#b91c1c",bg:"rgba(185,28,28,.12)"}, info:{label:"Needs a date",color:"#9a3412",bg:"rgba(194,65,12,.12)"} };
  var dState = { cnty: 'Nairobi City', filter: 'all', res: [] };
  function dFmt(t){ var p = CS.parts(t); return MON[p.m-1] + ' ' + p.d + ', ' + p.y; }
  function dBuild() {
    var ws0 = CS.sample('usafi', TODAY);
    ws0.profile.locations = [{ id: 'l1', name: 'Head office', county: dState.cnty, signage: true }];
    Object.keys(ws0.records).forEach(function (k) { if (/@l[23]$/.test(k)) delete ws0.records[k]; });
    dState.res = CS.evaluateAll(ws0, TODAY).filter(function (r) { return r.status !== 'na'; });
  }
  function dRender() {
    var ci = dInfo(dState.cnty), obs = dState.res;
    var isCounty = function (r) { return r.inst.ob.group === 'County'; };
    var sc = CS.score(obs).value || 0;
    $('#scoreNum').textContent = sc;
    $('#gaugeCircle').setAttribute('stroke-dashoffset', (326.7 * (1 - sc / 100)).toFixed(1));
    var sl = $('#scoreLabel'), ss = $('#scoreSub');
    if (sc >= 80) { sl.textContent = 'On track'; sl.style.color = 'var(--ok)'; } else if (sc >= 60) { sl.textContent = 'Needs attention'; sl.style.color = 'var(--warn)'; } else { sl.textContent = 'Critical gaps'; sl.style.color = 'var(--crit)'; }
    var compliant = obs.filter(function (o) { return o.status === 'done' || o.status === 'ok'; }).length;
    var action = obs.length - compliant;
    var exp60 = obs.filter(function (o) { return o.next != null && o.days <= 60 && o.status !== 'done' && o.status !== 'ok'; }).length;
    var nat = obs.filter(function (o) { return !isCounty(o); }).length;
    ss.textContent = ci.name + ' · ' + obs.length + ' obligations (' + nat + ' national + ' + (obs.length - nat) + ' county) · ' + action + ' need action · ' + exp60 + ' due within 60 days.';
    var kpis = [{label:'Obligations',value:obs.length,color:'var(--accent)'},{label:'Compliant',value:compliant,color:'var(--ok)'},{label:'Action needed',value:action,color:action>0?'var(--crit)':'var(--ok)'},{label:'Due <60d',value:exp60,color:exp60>2?'var(--warn)':'var(--ok)'}];
    $('#kpiRow').innerHTML = kpis.map(function (k) { return '<div class="rounded-xl p-4" style="background:#fbfdfc;border:1px solid var(--border);flex:1 1 110px;min-width:100px"><p style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin:0 0 6px">' + k.label + '</p><p style="font-size:24px;font-weight:800;margin:0;color:' + k.color + '">' + k.value + '</p></div>'; }).join('');
    $('#countyInfo').innerHTML = '<div class="flex flex-wrap gap-x-6 gap-y-2"><span><b style="color:var(--text)">' + ci.name + '</b></span><span><b style="color:var(--muted);font-weight:600">Permit:</b> <span style="color:var(--text)">' + ci.permit + '</span></span><span class="hide-sm"><b style="color:var(--muted);font-weight:600">Fee basis:</b> <span style="color:var(--text)">' + ci.fee + '</span></span><span><b style="color:var(--muted);font-weight:600">Portal:</b> <span style="color:var(--text)">' + ci.portal + '</span></span><span style="flex-basis:100%"><b style="color:var(--muted);font-weight:600">Note:</b> <span style="color:var(--text)">' + ci.addons + '</span></span></div>';
    var list = obs.slice();
    if (dState.filter === 'national') list = list.filter(function (o) { return !isCounty(o); });
    if (dState.filter === 'county') list = list.filter(isCounty);
    if (dState.filter === 'action') list = list.filter(function (o) { return o.status !== 'done' && o.status !== 'ok'; });
    list.sort(function (a, b) { return (a.next == null ? 9e15 : a.next) - (b.next == null ? 9e15 : b.next); });
    var freq = function (ob) { return { once: 'One-off', monthly: 'Monthly', anniversary: 'Annual', fy: 'Annual', instalment: 'Quarterly instalments', expiry: ob.validityMonths ? 'Every ' + ob.validityMonths + ' months' : 'Annual' }[ob.kind]; };
    $('#obligationBody').innerHTML = list.map(function (o) {
      var s = DSTATUS[o.status], dl = o.days;
      var dlTxt = o.next == null ? '<span style="color:var(--muted)">—</span>' : dl < 0 ? '<span style="color:var(--crit);font-weight:700">Overdue</span>' : '<span style="font-weight:700;color:' + (dl <= 30 ? 'var(--crit)' : dl <= 60 ? 'var(--warn)' : 'var(--text)') + '">' + dl + 'd</span>';
      var layerTxt = isCounty(o) ? '<span class="layer-cnty">COUNTY</span>' : '<span class="layer-nat">NATIONAL</span>';
      return '<tr class="tr" data-r="' + obs.indexOf(o) + '" style="border-bottom:1px solid var(--border)"><td class="py-3 px-4" style="vertical-align:top"><div style="font-weight:600;font-size:13px">' + esc(o.inst.title) + '</div><div class="hide-sm" style="font-size:11.5px;color:var(--muted);margin-top:3px">' + esc(o.note) + '</div></td><td class="py-3 px-4 hide-sm" style="font-size:12.5px;color:var(--muted);vertical-align:top">' + esc(o.inst.ob.auth) + '<br><span style="font-size:11px">' + freq(o.inst.ob) + '</span></td><td class="py-3 px-4" style="vertical-align:top;font-size:11px">' + layerTxt + '</td><td class="py-3 px-4" style="vertical-align:top"><span class="pill" style="background:' + s.bg + ';color:' + s.color + '"><span class="dot" style="background:' + s.color + '"></span>' + s.label + '</span></td><td class="py-3 px-4" style="font-size:12.5px;vertical-align:top">' + (o.next != null ? dFmt(o.next) : '—') + '</td><td class="py-3 px-4 text-right" style="vertical-align:top">' + dlTxt + '</td></tr>';
    }).join('') || '<tr><td colspan="6" class="py-6 text-center" style="color:var(--muted)">No obligations match this filter.</td></tr>';
    $('#tableNote').textContent = 'Showing ' + list.length + ' of ' + obs.length + ' obligations for ' + ci.name + '. Deadlines computed live from today. County fees indicative — verify with the county revenue office.';
    var soon = CS.agenda(obs, TODAY, 90).filter(function (a) { return a.days >= 0; }).slice(0, 5);
    $('#deadlineList').innerHTML = soon.map(function (a) { return '<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border)"><span style="line-height:1.45">' + esc(a.r.inst.title) + '</span><span style="font-weight:700;font-size:12px;white-space:nowrap;color:' + (a.days <= 30 ? 'var(--crit)' : 'var(--warn)') + '">' + a.days + 'd · ' + dFmt(a.due).split(',')[0] + '</span></div>'; }).join('');
    var ac = { contested: '#9a3412', update: 'var(--accent)', warning: 'var(--warn)' };
    $('#alertsList').innerHTML = ci.alerts.concat(SHARED_ALERTS).map(function (a) { return '<div style="display:flex;gap:8px;padding:8px 0;border-bottom:1px dashed var(--border);line-height:1.5"><span class="dot" style="background:' + ac[a.level] + ';margin-top:5px;flex-shrink:0"></span><span>' + a.text + '</span></div>'; }).join('');
  }
  var sel = $('#cntySel') as any;
  if (sel && sel.options.length < 2) COUNTY_DATA.forEach(function (c) { var o = document.createElement('option'); o.value = c.name; o.textContent = c.name; sel.appendChild(o); });
  $$('button.jbtn[data-cnty]').forEach(function (b) { b.addEventListener('click', function () { $$('.jbtn').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); if (sel) sel.value = ''; dState.cnty = b.getAttribute('data-cnty'); dBuild(); dRender(); }); });
  if (sel) sel.addEventListener('change', function () { if (!sel.value) return; $$('.jbtn').forEach(function (x) { x.classList.remove('active'); }); sel.classList.add('active'); dState.cnty = sel.value; dBuild(); dRender(); });
  $$('.fbtn').forEach(function (b) { b.addEventListener('click', function () { $$('.fbtn').forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); dState.filter = b.getAttribute('data-filter'); dRender(); }); });
  $('#scanBtn').addEventListener('click', function () {
    var bar = $('#scanBar'); bar.style.display = 'block'; var btn = $('#scanBtn'); btn.textContent = 'Scanning…'; btn.disabled = true;
    setTimeout(function () { TODAY = CS.todayKE(); dBuild(); dRender(); bar.style.display = 'none'; btn.textContent = 'Run scan'; btn.disabled = false; }, 1400);
  });
  $('#obligationBody').addEventListener('click', function (e) { var tr = e.target.closest('[data-r]'); if (tr) openDemoDetail(dState.res[+tr.getAttribute('data-r')]); });
  dBuild(); dRender();
  }, []);
  return null;
}
