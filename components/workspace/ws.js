/* ComplyScope Kenya workspace (client). Renders the business workspace and talks to the server API. */
import CS from '@/lib/engine';

export function mountWorkspace(rootEl, BID) {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var TODAY = CS.todayKE();
  var LABEL = { overdue: 'Overdue', soon: 'Due soon', ok: 'On track', missing: 'Not recorded', info: 'Needs a date', done: 'In place', na: 'Not applicable' };
  var ORDER = { overdue: 0, soon: 1, missing: 2, info: 3, ok: 4, done: 5, na: 6 };
  var GROUPS = ['Registration', 'Tax', 'Payroll', 'Data protection', 'Workplace', 'County', 'Sector'];
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function sortResults(a, b) { return (ORDER[a.status] - ORDER[b.status]) || ((a.next == null ? 9e15 : a.next) - (b.next == null ? 9e15 : b.next)) || a.inst.title.localeCompare(b.inst.title); }
  function where(r) { return r.inst.loc ? r.inst.loc.name + ' · ' + r.inst.loc.county : r.inst.ob.auth; }
  function dueText(r) {
    if (r.status === 'done') return 'Recorded';
    if (r.status === 'na') return 'Excluded';
    if (r.next == null) return r.status === 'missing' ? (CAN_EDIT ? 'Add a record' : 'Not recorded') : (CAN_EDIT ? 'Add a date' : 'No date yet');
    if (r.days < 0) return (-r.days) + (r.days === -1 ? ' day' : ' days') + ' overdue';
    if (r.days === 0) return 'Due today';
    return 'Due ' + CS.fmt(r.next) + ' · ' + r.days + (r.days === 1 ? ' day' : ' days');
  }
  function pill(st) { return '<span class="stp s-' + st + '">' + LABEL[st] + '</span>'; }
  function itemHTML(r, i) {
    return '<button type="button" class="item stripe-' + r.status + '" data-i="' + i + '">' +
      '<div><span class="layer ' + (r.inst.ob.group === 'County' ? 'cnty">COUNTY' : 'nat">NATIONAL') + '</span><h4>' + esc(r.inst.title) + '</h4><div class="meta">' + esc(where(r)) + '</div><div class="meta">' + esc(r.note) + '</div></div>' +
      '<div class="right">' + pill(r.status) + '<span class="due num">' + esc(dueText(r)) + '</span></div></button>';
  }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    var tr = $('#toastRoot') || (function () { var d = document.createElement('div'); d.id = 'toastRoot'; d.setAttribute('aria-live', 'polite'); document.body.appendChild(d); return d; })(); tr.innerHTML = ''; tr.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2800);
  }
  function copyText(text) {
    try { navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); }, function () { toast('Copy was blocked. Select the text and copy it instead.'); }); }
    catch (e) { toast('Copy is not available here.'); }
  }
  function ring(value, size) {
    size = size || 118; var r = size / 2 - 9, c = 2 * Math.PI * r;
    var v = value == null ? 0 : value;
    var col = value == null ? 'var(--line)' : v >= 80 ? 'var(--good)' : v >= 55 ? 'var(--warn)' : 'var(--bad)';
    return '<div class="sring" style="width:' + size + 'px;height:' + size + 'px"><svg width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--surface-2)" stroke-width="10"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - v / 100)).toFixed(1) + '"/></svg>' +
      '<div class="val"><div><b class="num">' + (value == null ? '–' : value) + '</b><small>SCORE</small></div></div></div>';
  }
  function scoreWord(v, p) { if (v == null) return 'No score yet'; if (p && !p.done && !p.ok && !p.overdue) return 'Let\u2019s get started: record what you already have'; return v >= 80 ? 'In good shape' : v >= 55 ? 'Needs attention' : 'Act now'; }
  function summaryHTML(results) {
    var s = CS.score(results), p = s.parts;
    var dated = CS.agenda(results, TODAY, 90).filter(function (a) { return a.days >= 0; }).length;
    var k = [['Overdue', p.overdue || 0, 'overdue'], ['Due in 14 days', p.soon || 0, 'soon'], ['Not recorded', (p.missing || 0) + (p.info || 0), 'missing'], ['Dates in 90 days', dated, 'ok'], ['In place / on track', (p.done || 0) + (p.ok || 0), 'done']];
    return ring(s.value) +
      '<div style="display:flex;flex-direction:column;gap:12px"><div><h3 style="font-size:22px">' + scoreWord(s.value, p) + '</h3>' +
      '<p class="tiny muted" style="margin-top:4px">The score is the share of your obligations that are in order: items in place or on track count fully, items due within 14 days count 80%, items missing a date 50%, and overdue or unrecorded items count nothing. It is a working indicator, not a certificate.</p></div>' +
      '<div class="kpis">' + k.map(function (x) { return '<div class="kpi stripe-' + x[2] + '"><span>' + x[0] + '</span><b class="num">' + x[1] + '</b></div>'; }).join('') + '</div></div>';
  }

  // ---------------- dialog ----------------
  var lastFocus = null;
  function openDialog(html, onMount) {
    lastFocus = document.activeElement;
    var root = $('#dialogRoot') || (function () { var d = document.createElement('div'); d.id = 'dialogRoot'; document.body.appendChild(d); return d; })();
    root.innerHTML = '<div class="scrim" id="scrim"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">' + html + '</div></div>';
    $('#scrim').addEventListener('mousedown', function (e) { if (e.target.id === 'scrim') closeDialog(); });
    $$('[data-close]', root).forEach(function (b) { b.addEventListener('click', closeDialog); });
    if (onMount) onMount($('.dialog', root));
    var f = $('.dialog input, .dialog select, .dialog button', root); if (f) f.focus();
  }
  function closeDialog() { $('#dialogRoot').innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#scrim')) closeDialog(); });

  function detailBody(r) {
    var ob = r.inst.ob, src = r.inst.src;
    var freq = { once: 'One-off', monthly: 'Monthly', anniversary: 'Yearly, on the incorporation anniversary', fy: 'Yearly, after your financial year end', instalment: 'Four times a year', expiry: ob.validityMonths ? 'Renew every ' + ob.validityMonths + ' months' : (ob.calendarYear ? 'Yearly, by calendar year' : 'Yearly') }[ob.kind];
    return '<dl class="kv">' +
      '<dt>Why it applies</dt><dd>' + esc(ob.why) + '</dd>' +
      '<dt>Authority</dt><dd>' + esc(ob.auth) + (r.inst.loc ? ' · ' + esc(r.inst.loc.name) + ', ' + esc(r.inst.loc.county) : '') + '</dd>' +
      '<dt>How often</dt><dd>' + esc(freq) + '</dd>' +
      '<dt>What to do</dt><dd>' + esc(ob.how) + '</dd>' +
      (ob.penalty ? '<dt>If late</dt><dd>' + esc(ob.penalty) + '</dd>' : '') +
      (r.inst.loc && ob.group === 'County' ? '<dt>County notes</dt><dd>' + esc(CS.countyInfo(r.inst.loc.county).note) + ' Pay via ' + esc(CS.countyInfo(r.inst.loc.county).portal) + '. <a href="/counties#' + esc(CS.countyInfo(r.inst.loc.county).slug || '') + '">Full county guide</a></dd>' : '') +
      '<dt>Status</dt><dd>' + pill(r.status) + ' <span class="small">' + esc(r.note) + '</span></dd>' +
      (r.next != null ? '<dt>Next date</dt><dd class="num">' + CS.fmt(r.next) + ' (' + esc(dueText(r)) + ')</dd>' : '') +
      (src ? '<dt>Source</dt><dd>' + (src.url ? '<a href="' + esc(src.url) + '" target="_blank" rel="noopener">' + esc(src.label) + '</a>' : esc(src.label)) + '</dd>' : '') +
      '</dl>';
  }

  // ---------------- server state ----------------
  var ws = { profile: null, records: {}, filings: [], trackFrom: null, documents: [] };
  var META = { role: 'viewer', me: {}, integrations: {}, calendarUrl: '' };
  var CAN_EDIT = false, IS_OWNER = false;
  var PENDING_PROFILE = null, PENDING_TRACK = null;
  var touched = {}, pendingFilings = [];
  function api(url, method, data) {
    return fetch(url, { method: method || 'GET', headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined, credentials: 'same-origin' })
      .then(function (r) { if (r.status === 401) { window.location.href = '/login?next=' + encodeURIComponent(location.pathname); } return r.json().catch(function () { return { ok: false, error: 'The server did not respond properly.' }; }); })
      .catch(function () { return { ok: false, error: 'Network problem. Check your connection and try again.' }; });
  }
  function reload() {
    return api('/api/b/' + BID).then(function (j) {
      if (!j.ok) { $('#appMain', rootEl).innerHTML = '<div class="empty">' + esc(j.error || 'Could not load this business.') + ' <a href="/app">Back to my businesses</a></div>'; return; }
      ws = j.ws; META = j; var planOn = !j.plan || j.plan.active; CAN_EDIT = (j.role === 'owner' || j.role === 'editor') && planOn; IS_OWNER = j.role === 'owner';
      touched = {}; pendingFilings = [];
      route();
    });
  }
  function results() { return ws.profile ? CS.evaluateAll(ws, TODAY).sort(sortResults) : []; }
  function rec(id) { touched[id] = true; if (!ws.records[id]) ws.records[id] = {}; return ws.records[id]; }
  function addFiling(r, period, date, ref, kind) {
    var f = { id: r.id, period: period, date: date, ref: ref || '', title: r.inst.title, loc: r.inst.loc ? r.inst.loc.name : '', kind: kind || 'filing' };
    pendingFilings.push(f);
    ws.filings.unshift(Object.assign({ fid: 'tmp' + Date.now() }, f));
  }
  // Sends the changes made in the dialog to the server, then refreshes from the server.
  function persist() {
    var jobs = [];
    Object.keys(touched).forEach(function (id) { var d = ws.records[id]; var empty = !d || !Object.keys(d).some(function (k) { return d[k]; }); jobs.push(api('/api/b/' + BID + '/records', 'PUT', { instId: id, data: empty ? null : d })); });
    pendingFilings.forEach(function (f) { jobs.push(api('/api/b/' + BID + '/filings', 'POST', { instId: f.id, period: f.period, date: f.date, ref: f.ref, title: f.title, loc: f.loc, kind: f.kind })); });
    touched = {}; pendingFilings = [];
    return Promise.all(jobs).then(function (rs) { var bad = rs.filter(function (x) { return !x.ok; })[0]; if (bad) toast(bad.error || 'Some changes were not saved.'); return reload(); });
  }
  function saveProfile(main) {
    var btn = $('#pf button[type=submit]', main); if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    var call = BID ? api('/api/b/' + BID + '/profile', 'PUT', { profile: PENDING_PROFILE, trackFrom: PENDING_TRACK }) : api('/api/businesses', 'POST', { profile: PENDING_PROFILE, trackFrom: PENDING_TRACK });
    call.then(function (j) {
      if (j.ok && !BID) { window.location.href = '/app/b/' + j.id + '#overview'; return; }
      if (btn) { btn.disabled = false; btn.textContent = 'Save profile and update obligations'; }
      if (!j.ok) { var e = $('#pErr', main); e.textContent = j.error; e.classList.remove('hidden'); return; }
      toast('Profile saved'); location.hash = 'overview'; reload();
    });
  }
  function fmtSize(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function docsFor(r) {
    var docs = (ws.documents || []).filter(function (d) { return d.inst_id === r.id; });
    var list = docs.map(function (d) { return '<div class="tiny"><a href="/api/b/' + BID + '/documents/' + d.id + '" target="_blank" rel="noopener">' + esc(d.filename) + '</a> <span class="muted">' + fmtSize(d.size) + '</span></div>'; }).join('');
    var up = CAN_EDIT ? '<label class="f" for="aFile">Attach evidence <small>PDF, photo, Word or Excel, up to 10 MB</small><input type="file" id="aFile" data-upload="' + esc(r.id) + '" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx"></label>' : '';
    return (list || up) ? '<div><p class="small" style="font-weight:700;margin-bottom:4px">Documents</p>' + (list || '<p class="tiny muted">No documents attached yet.</p>') + up + '</div>' : '';
  }
  function upload(file, instId, done) {
    var fd = new FormData(); fd.append('file', file); if (instId) fd.append('instId', instId);
    toast('Uploading ' + file.name + '…');
    fetch('/api/b/' + BID + '/documents', { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) return toast(j.error || 'Upload failed.');
      toast('Document uploaded'); if (done) done(); reload();
    }).catch(function () { toast('Upload failed. Check your connection.'); });
  }
  document.addEventListener('change', function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute('data-upload') != null && t.files && t.files[0]) { upload(t.files[0], t.getAttribute('data-upload'), function () { closeDialog(); }); } });

  function openAction(r) {
    var ob = r.inst.ob, kind = ob.kind, rc = ws.records[r.id] || {};
    var todayIso = CS.iso(TODAY);
    var form = '';
    if (r.status === 'na') {
      form = '<div class="banner">This item is excluded from your score and deadlines.</div>';
    } else if (kind === 'once') {
      form = r.status === 'done'
        ? '<div class="banner">Recorded as in place' + (rc.date ? ' on ' + CS.fmt(CS.fromIso(rc.date)) : '') + (rc.ref ? ' · ref ' + esc(rc.ref) : '') + '.</div>'
        : '<div class="fgrid"><label class="f" for="aDate">Date completed<input type="date" id="aDate" value="' + todayIso + '" max="' + todayIso + '"></label><label class="f" for="aRef">Reference or certificate number <small>Optional</small><input type="text" id="aRef" autocomplete="off"></label></div>';
    } else if (kind === 'expiry') {
      var useLast = !!ob.annualFromLast;
      form = '<div class="fgrid">' + (useLast
        ? '<label class="f" for="aLast">Date last done<small>Next due 12 months later</small><input type="date" id="aLast" value="' + esc(rc.last || '') + '" max="' + todayIso + '"></label>'
        : '<label class="f" for="aExp">Valid until (expiry date)<small>' + (ob.countyValidity ? 'Use the expiry printed on the permit. Under the 2024 Act permits run 12 months from issue; some counties still end them on 31 December' : ob.calendarYear ? 'DOSH and these county permits usually end on 31 December' : 'As printed on the certificate or policy') + '</small><input type="date" id="aExp" value="' + esc(rc.expiry || '') + '"></label>') +
        '<label class="f" for="aRef">Reference or certificate number <small>Optional</small><input type="text" id="aRef" value="' + esc(rc.ref || '') + '" autocomplete="off"></label></div>' +
        (ob.countyValidity && !useLast ? '<div><button type="button" class="btn sm" id="aIssued">Issued today (valid 12 months)</button>' + (r.inst.loc && CS.countyInfo(r.inst.loc.county).validity === 'calendar' ? ' <button type="button" class="btn sm" id="aNextYear">Renewed for ' + (CS.parts(TODAY).y + (CS.parts(TODAY).m >= 10 ? 1 : 0)) + '</button>' : '') + '</div>' : '') +
        (ob.calendarYear && !useLast ? '<div><button type="button" class="btn sm" id="aNextYear">Renewed for ' + (CS.parts(TODAY).y + (CS.parts(TODAY).m >= 10 ? 1 : 0)) + '</button></div>' : '');
    } else {
      var opts = r.overdue.concat(r.upcoming.slice(0, 2));
      if (kind === 'anniversary' && r.needs) form = '<div class="banner warn">Add your incorporation date in the business profile first.</div>';
      else if (!opts.length) form = '<div class="banner">Nothing is due in the tracking window.</div>';
      else form = '<div class="fgrid"><label class="f" for="aPer">Period<select id="aPer">' + opts.map(function (o) { return '<option value="' + esc(o.period) + '">' + esc(CS.periodLabel(o.period)) + ' · due ' + CS.fmt(o.due) + '</option>'; }).join('') + '</select></label>' +
        '<label class="f" for="aDate">Date filed or paid<input type="date" id="aDate" value="' + todayIso + '" max="' + todayIso + '"></label>' +
        '<label class="f" for="aRef" style="grid-column:1/-1">Acknowledgement or payment reference <small>Optional, e.g. iTax acknowledgement or M-Pesa code</small><input type="text" id="aRef" autocomplete="off"></label></div>';
    }
    var history = ws.filings.filter(function (f) { return f.id === r.id; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 4);
    var histHTML = history.length ? '<div><p class="small" style="font-weight:700;margin-bottom:4px">Recent entries</p>' + history.map(function (f) { return '<div class="tiny muted">' + esc(CS.periodLabel(f.period)) + ' · ' + CS.fmt(CS.fromIso(f.date)) + (f.ref ? ' · ' + esc(f.ref) : '') + '</div>'; }).join('') + '</div>' : '';
    var primary = '';
    if (r.status !== 'na') {
      if (kind === 'once') primary = r.status === 'done' ? '<button type="button" class="btn" id="aUndo">Mark as not done</button>' : '<button type="button" class="btn primary" id="aSave">Mark as in place</button>';
      else if (kind === 'expiry') primary = '<button type="button" class="btn primary" id="aSave">Save record</button>';
      else if (!(kind === 'anniversary' && r.needs) && (r.overdue.length || r.upcoming.length)) primary = '<button type="button" class="btn primary" id="aSave">Save filing</button>';
    }
    if (!CAN_EDIT) { form = ''; primary = ''; }
    var naBtn = !CAN_EDIT ? '' : r.status === 'na' ? '<button type="button" class="btn primary" id="aNa">This applies to us</button>' : '<button type="button" class="btn ghost" id="aNa">Not applicable to us</button>';
    openDialog('<header><div><p class="tiny muted" style="font-weight:700;letter-spacing:.08em">' + esc(ob.group.toUpperCase()) + '</p><h3 id="dlgTitle" style="font-size:21px;margin-top:4px">' + esc(r.inst.title) + '</h3></div><button class="btn sm ghost" data-close type="button" aria-label="Close">Close</button></header>' +
      '<div class="body">' + detailBody(r) + form + histHTML + docsFor(r) + '<p class="err hidden" id="aErr" role="alert"></p></div><footer>' + naBtn + primary + '</footer>', function (dlg) {
      var err = function (m) { var e = $('#aErr', dlg); e.textContent = m; e.classList.remove('hidden'); };
      var nb = $('#aNa', dlg);
      if (nb) nb.addEventListener('click', function () {
        var x = rec(r.id); x.na = !x.na; if (!x.na) delete x.na; persist(); closeDialog(); route();
        toast(x.na ? 'Excluded from your list' : 'Added back to your list');
      });
      var ny = $('#aNextYear', dlg);
      if (ny) ny.addEventListener('click', function () { $('#aExp', dlg).value = ny.textContent.replace(/\D/g, '') + '-12-31'; });
      var iss = $('#aIssued', dlg);
      if (iss) iss.addEventListener('click', function () { var t = CS.parts(TODAY); var e = Date.UTC(t.y + 1, t.m - 1, t.d) - 86400000; $('#aExp', dlg).value = CS.iso(e); });
      var undo = $('#aUndo', dlg);
      if (undo) undo.addEventListener('click', function () { var x = rec(r.id); delete x.held; delete x.date; delete x.ref; persist(); closeDialog(); route(); toast('Marked as not done'); });
      var save = $('#aSave', dlg);
      if (save) save.addEventListener('click', function () {
        var ref = ($('#aRef', dlg) || {}).value || '';
        ref = ref.trim().slice(0, 80);
        if (kind === 'once') {
          var d = $('#aDate', dlg).value; if (!d) return err('Enter the date it was completed.');
          var x = rec(r.id); x.held = true; x.date = d; x.ref = ref; addFiling(r, 'once', d, ref, 'record');
        } else if (kind === 'expiry') {
          var x2 = rec(r.id);
          if (ob.annualFromLast) { var l = $('#aLast', dlg).value; if (!l) return err('Enter the date it was last done.'); if (CS.fromIso(l) > TODAY) return err('That date is in the future.'); x2.last = l; delete x2.expiry; addFiling(r, 'renewal', l, ref, 'renewal'); }
          else { var ex = $('#aExp', dlg).value; if (!ex) return err('Enter the expiry date.'); x2.expiry = ex; addFiling(r, 'renewal', CS.iso(TODAY), ref, 'renewal'); }
          x2.held = true; x2.ref = ref;
        } else {
          var per = $('#aPer', dlg).value, fd = $('#aDate', dlg).value;
          if (!fd) return err('Enter the date you filed or paid.');
          if (CS.fromIso(fd) > TODAY) return err('The filing date cannot be in the future.');
          addFiling(r, per, fd, ref, 'filing');
        }
        persist(); closeDialog(); route(); toast('Saved');
      });
    });
  }

  function viewOverview(main) {
    var res = results();
    var act = res.filter(function (r) { return ['overdue', 'soon', 'missing', 'info'].indexOf(r.status) >= 0; }).slice(0, 8);
    var ag = CS.agenda(res, TODAY, 30).filter(function (a) { return a.days >= 0; }).slice(0, 8);
    main.innerHTML = 
      '<div class="panel panel-pad"><div class="summary">' + summaryHTML(res) + '</div></div>' +
      '<div class="cols"><div><div class="group-h"><h3>Do next</h3><a href="#obligations" class="small">All obligations</a></div><div class="list" id="ovList">' +
      (act.length ? act.map(function (r) { return itemHTML(r, res.indexOf(r)); }).join('') : '<div class="empty">Nothing needs action right now.</div>') + '</div></div>' +
      '<div><div class="group-h"><h3>Next 30 days</h3><a href="#deadlines" class="small">Full calendar</a></div><div class="panel panel-pad" style="box-shadow:none">' +
      (ag.length ? ag.map(function (a) { var p = CS.parts(a.due); return '<div class="log-row" style="grid-template-columns:62px 1fr"><div class="datebox"><b class="num" style="font-size:18px">' + p.d + '</b><small>' + MON[p.m - 1] + '</small></div><div><b style="font-size:14.5px">' + esc(a.r.inst.title) + '</b><div class="tiny muted">' + esc(CS.periodLabel(a.period)) + (a.r.inst.loc ? ' · ' + esc(a.r.inst.loc.name) : '') + ' · ' + a.days + ' days</div></div></div>'; }).join('') : '<p class="small muted">No dated items in the next 30 days.</p>') +
      '</div></div></div>';
    $('#ovList', main).addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) openAction(res[+b.getAttribute('data-i')]); });
  }

  var obFilter = { status: 'all', loc: 'all' };
  function viewObligations(main) {
    var res = results();
    var sts = [['all', 'All'], ['action', 'Needs action'], ['overdue', 'Overdue'], ['soon', 'Due soon'], ['missing', 'Not recorded'], ['done', 'In place or on track'], ['na', 'Not applicable']];
    function match(r) {
      var s = obFilter.status;
      var okS = s === 'all' ? r.status !== 'na' : s === 'action' ? ['overdue', 'soon', 'missing', 'info'].indexOf(r.status) >= 0 : s === 'missing' ? (r.status === 'missing' || r.status === 'info') : s === 'done' ? (r.status === 'done' || r.status === 'ok') : r.status === s;
      var okL = obFilter.loc === 'all' || (obFilter.loc === 'business' ? !r.inst.loc : (r.inst.loc && r.inst.loc.id === obFilter.loc));
      return okS && okL;
    }
    var count = function (key) { var save = obFilter.status; obFilter.status = key; var n = res.filter(match).length; obFilter.status = save; return n; };
    var html = '<div class="panel panel-pad" style="display:flex;flex-direction:column;gap:12px"><div class="filters" role="group" aria-label="Filter by status">' +
      sts.map(function (s) { return '<button type="button" class="chip" data-s="' + s[0] + '" aria-pressed="' + (obFilter.status === s[0]) + '">' + s[1] + ' <span class="n">' + count(s[0]) + '</span></button>'; }).join('') + '</div>' +
      '<label class="f" for="locPick" style="max-width:340px">Show<select id="locPick"><option value="all">Whole business and all locations</option><option value="business">Business-wide items only</option>' +
      ws.profile.locations.map(function (l) { return '<option value="' + esc(l.id) + '"' + (obFilter.loc === l.id ? ' selected' : '') + '>' + esc(l.name) + ' (' + esc(l.county) + ')</option>'; }).join('') + '</select></label></div>';
    var shown = res.filter(match), any = false;
    GROUPS.forEach(function (g) {
      var items = shown.filter(function (r) { return r.inst.ob.group === g; });
      if (!items.length) return; any = true;
      html += '<div><div class="group-h"><h3>' + g + '</h3><span class="small muted">' + items.length + '</span></div><div class="list">' + items.map(function (r) { return itemHTML(r, res.indexOf(r)); }).join('') + '</div></div>';
    });
    if (!any) html += '<div class="empty">No obligations match this filter.</div>';
    html += '<p class="tiny muted">Coverage is broad but not exhaustive. Specialist regulators for your sector (for example CBK, IRA, KMPDC, PPB or the Ministry of Education) may add licences that are not listed here.</p>';
    main.innerHTML = html;
    $$('[data-s]', main).forEach(function (b) { b.addEventListener('click', function () { obFilter.status = b.getAttribute('data-s'); route(); }); });
    var lp = $('#locPick', main); lp.value = obFilter.loc; lp.addEventListener('change', function () { obFilter.loc = lp.value; route(); });
    main.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) openAction(res[+b.getAttribute('data-i')]); });
  }

  function gcalLink(a) {
    var p = CS.parts(a.due), n = CS.parts(a.due + CS.DAY);
    var d1 = p.y + String(p.m).padStart(2, '0') + String(p.d).padStart(2, '0'), d2 = n.y + String(n.m).padStart(2, '0') + String(n.d).padStart(2, '0');
    var text = a.r.inst.title + (a.r.inst.loc ? ' – ' + a.r.inst.loc.name : '');
    var details = CS.periodLabel(a.period) + '. ' + a.r.inst.ob.how;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(text) + '&dates=' + d1 + '/' + d2 + '&details=' + encodeURIComponent(details);
  }
  function viewDeadlines(main) {
    var res = results();
    var ag = CS.agenda(res, TODAY, 120);
    var undated = res.filter(function (r) { return r.status === 'missing' || r.status === 'info'; });
    var html = '<div class="panel panel-pad" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center"><div><h3 style="font-size:20px">Next 120 days</h3><p class="small muted">Weekend and public-holiday dates are moved to the previous working day. Eid holidays are gazetted each year, so check those weeks.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn sm" id="dlCsv">Download as CSV</button><button type="button" class="btn sm" id="cpTxt">Copy as text</button></div></div>';
    if (!ag.length) html += '<div class="empty">No dated items in the next 120 days.</div>';
    var curM = null;
    ag.forEach(function (a, i) {
      var p = CS.parts(a.due), key = p.y + '-' + p.m;
      if (key !== curM) { html += (curM ? '</div>' : '') + '<h3 class="month-h">' + CS.MONTH[p.m - 1] + ' ' + p.y + '</h3><div>'; curM = key; }
      var st = a.days < 0 ? 'overdue' : a.days <= 14 ? 'soon' : 'ok';
      html += '<div class="drow stripe-' + st + '"><div class="datebox"><b class="num">' + p.d + '</b><small>' + WD[p.wd] + '</small></div>' +
        '<div><b>' + esc(a.r.inst.title) + '</b><div class="small muted">' + esc(CS.periodLabel(a.period)) + ' · ' + esc(where(a.r)) + '</div><div class="small ' + (a.days < 0 ? '' : 'muted') + '" style="' + (a.days < 0 ? 'color:var(--bad);font-weight:700' : '') + '">' + (a.days < 0 ? (-a.days) + ' days overdue' : a.days === 0 ? 'Due today' : 'In ' + a.days + ' days') + '</div></div>' +
        '<div class="acts"><button type="button" class="btn sm" data-a="' + i + '">' + (a.r.inst.ob.kind === 'expiry' ? 'Record renewal' : 'Mark filed') + '</button><a class="btn sm ghost" href="' + esc(gcalLink(a)) + '" target="_blank" rel="noopener">Add to Google Calendar</a></div></div>';
    });
    if (curM) html += '</div>';
    if (undated.length) html += '<div class="banner warn"><div><b>' + undated.length + ' items have no date yet.</b> <span class="small">Add expiry or last-done dates on the <a href="#obligations">Obligations</a> tab so they appear here.</span></div></div>';
    main.innerHTML = html;
    $$('[data-a]', main).forEach(function (b) { b.addEventListener('click', function () { openAction(ag[+b.getAttribute('data-a')].r); }); });
    function csv() {
      var rows = [['Due date', 'Weekday', 'Obligation', 'Period', 'Location', 'Authority', 'Days left']].concat(ag.map(function (a) { var p = CS.parts(a.due); return [CS.iso(a.due), WD[p.wd], a.r.inst.title, CS.periodLabel(a.period), a.r.inst.loc ? a.r.inst.loc.name + ' (' + a.r.inst.loc.county + ')' : 'Business-wide', a.r.inst.ob.auth, a.days]; }));
      return rows.map(function (r) { return r.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
    }
    $('#dlCsv', main).addEventListener('click', function () { window.location.href = '/api/b/' + BID + '/export?type=deadlines'; });
    $('#cpTxt', main).addEventListener('click', function () { copyText(ag.map(function (a) { return CS.fmt(a.due) + ' – ' + a.r.inst.title + ' (' + CS.periodLabel(a.period) + (a.r.inst.loc ? ', ' + a.r.inst.loc.name : '') + ')'; }).join('\n')); });
  }

  function viewFilings(main) {
    var list = ws.filings.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    var html = '<div class="panel panel-pad"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px"><div><h3 style="font-size:20px">Filing log</h3><p class="small muted">Every filing, payment and renewal you record. Use "Mark filed" on any obligation to add an entry.</p></div><span class="stp s-ok num">' + list.length + ' entries</span></div>';
    if (!list.length) html += '<div class="empty">No entries yet.</div>';
    else html += '<div class="tbl-wrap"><table class="t"><thead><tr><th>Date</th><th>Obligation</th><th>Period</th><th>Reference</th><th><span class="sr">Actions</span></th></tr></thead><tbody>' +
      list.map(function (f) { return '<tr><td class="num" style="white-space:nowrap">' + CS.fmt(CS.fromIso(f.date)) + '</td><td><b>' + esc(f.title || f.id) + '</b>' + (f.loc ? '<div class="tiny muted">' + esc(f.loc) + '</div>' : '') + '</td><td>' + esc(CS.periodLabel(f.period)) + '</td><td style="font-family:ui-monospace,monospace;font-size:13px">' + esc(f.ref || '–') + '</td><td style="text-align:right"><button type="button" class="btn sm danger" data-del="' + esc(f.fid) + '">Delete</button></td></tr>'; }).join('') + '</tbody></table></div>';
    html += '</div>';
    main.innerHTML = html;
    $$('[data-del]', main).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-armed') !== '1') { b.setAttribute('data-armed', '1'); b.textContent = 'Confirm delete'; setTimeout(function () { if (b.isConnected) { b.removeAttribute('data-armed'); b.textContent = 'Delete'; } }, 4000); return; }
        var id = b.getAttribute('data-del');
        api('/api/b/' + BID + '/filings/' + id, 'DELETE').then(function (j) { if (!j.ok) return toast(j.error); toast('Entry deleted'); reload(); });
      });
    });
  }

  function viewProfile(main) {
    var p = ws.profile || { name: '', structure: 'company', stage: 'operating', incDate: '', fyEnd: 12, sectors: [], activities: '', employees: '', turnover: 'unknown', vat: 'unknown', personalData: false, foreignStaff: false, weighing: false, fumigation: false, wasteTransport: false, locations: [{ id: 'l1', name: 'Main premises', county: 'Nairobi City', signage: false }] };
    var t = CS.parts(TODAY), prev = t.y + '-' + String(t.m).padStart(2, '0');
    var track = (ws.trackFrom || '').slice(0, 7) || prev;
    var opt = function (obj, v) { return Object.keys(obj).map(function (k) { return '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + esc(obj[k]) + '</option>'; }).join(''); };
    var cb = function (id, label, on, help) { return '<label class="check" for="' + id + '"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><span>' + label + (help ? '<br><span class="tiny muted">' + help + '</span>' : '') + '</span></label>'; };
    main.innerHTML = '<form id="pf" novalidate style="display:flex;flex-direction:column;gap:18px;max-width:860px">' +
      '<fieldset><legend>The business</legend><div class="fgrid">' +
      '<label class="f" for="pName">Business or trading name<input type="text" id="pName" value="' + esc(p.name) + '" required autocomplete="organization"></label>' +
      '<label class="f" for="pStruct">Legal form<select id="pStruct">' + opt(CS.STRUCTURES, p.structure) + '</select></label>' +
      '<label class="f" for="pStage">Stage<select id="pStage"><option value="operating"' + (p.stage === 'operating' ? ' selected' : '') + '>Already trading</option><option value="starting"' + (p.stage === 'starting' ? ' selected' : '') + '>Starting up</option></select></label>' +
      '<label class="f" for="pInc">Date of incorporation or registration<small>Used for the annual return date</small><input type="date" id="pInc" value="' + esc(p.incDate || '') + '"></label>' +
      '<label class="f" for="pFy">Financial year ends in<select id="pFy">' + CS.MONTH.map(function (m, i) { return '<option value="' + (i + 1) + '"' + (+p.fyEnd === i + 1 ? ' selected' : '') + '>' + m + '</option>'; }).join('') + '</select></label>' +
      '<label class="f" for="pPin">KRA PIN <small>Optional; shown on your dossier</small><input type="text" id="pPin" maxlength="20" value="' + esc(p.kraPin || '') + '" autocomplete="off"></label>' +
      '<label class="f" for="pReg">BRS registration number <small>Optional, e.g. PVT-XXXXXXX or BN-XXXXXXX</small><input type="text" id="pReg" maxlength="40" value="' + esc(p.regNo || '') + '" autocomplete="off"></label>' +
      '<label class="f" for="pTrack">Track filings from<small>Earlier periods are treated as settled</small><input type="month" id="pTrack" value="' + esc(track) + '"></label>' +
      '</div></fieldset>' +
      '<fieldset><legend>What the business does</legend><div class="checks" id="pSectors">' + CS.SECTORS.map(function (s) { return cb('sec-' + s[0], esc(s[1]), (p.sectors || []).indexOf(s[0]) >= 0); }).join('') + '</div>' +
      '<label class="f" for="pAct">Describe your main activities<small>For your own records and the dossier</small><textarea id="pAct">' + esc(p.activities) + '</textarea></label></fieldset>' +
      '<fieldset><legend>Size</legend><div class="fgrid">' +
      '<label class="f" for="pEmp">Number of employees<small>Include casual staff on payroll; enter 0 if none</small><input type="number" id="pEmp" min="0" step="1" inputmode="numeric" value="' + esc(p.employees) + '"></label>' +
      '<label class="f" for="pTurn">Annual turnover<select id="pTurn">' + opt(CS.TURNOVER, p.turnover) + '</select></label>' +
      '<label class="f" for="pVat">Registered for VAT?<select id="pVat"><option value="yes"' + (p.vat === 'yes' ? ' selected' : '') + '>Yes</option><option value="no"' + (p.vat === 'no' ? ' selected' : '') + '>No</option><option value="unknown"' + (p.vat === 'unknown' ? ' selected' : '') + '>Not sure</option></select></label>' +
      '</div></fieldset>' +
      '<fieldset><legend>Activities that bring extra rules</legend><div class="checks">' +
      cb('pData', 'We keep personal data about customers, pupils, patients or staff', p.personalData, 'Customer lists, CCTV, client records') +
      cb('pForeign', 'We employ foreign nationals', p.foreignStaff) +
      cb('pCctv', 'We run CCTV security cameras', p.cctv) +
      cb('pWeigh', 'We use scales to sell by weight', p.weighing) +
      cb('pFum', 'We offer fumigation or pest control', p.fumigation) +
      cb('pWaste', 'We collect or transport waste', p.wasteTransport) +
      '</div></fieldset>' +
      '<fieldset><legend>Locations</legend><p class="small muted" style="margin-top:-6px">Add the head office and every branch. Each needs its own county permit.</p><div id="pLocs" style="display:flex;flex-direction:column;gap:10px"></div><div><button type="button" class="btn sm" id="addLoc">Add a location</button></div></fieldset>' +
      '<p class="err hidden" id="pErr" role="alert"></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="submit" class="btn primary">Save profile and update obligations</button>' + (ws.profile ? '<button type="button" class="btn danger" id="pReset">Delete this workspace</button>' : '') + '</div></form>';
    var locs = (p.locations || []).map(function (l) { return { id: l.id, name: l.name, county: l.county, signage: !!l.signage }; });
    function drawLocs() {
      $('#pLocs', main).innerHTML = locs.map(function (l, i) {
        return '<div class="loc" data-li="' + i + '"><label class="f" for="ln' + i + '">Location name<input type="text" id="ln' + i + '" value="' + esc(l.name) + '"></label>' +
          '<label class="f" for="lc' + i + '">County<select id="lc' + i + '">' + CS.COUNTIES.map(function (c) { return '<option' + (c === l.county ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
          '<label class="check" for="ls' + i + '" style="min-height:42px;align-items:center"><input type="checkbox" id="ls' + i + '"' + (l.signage ? ' checked' : '') + '><span class="small">Outdoor sign</span></label>' +
          '<button type="button" class="btn sm danger" data-rm="' + i + '"' + (locs.length < 2 ? ' disabled' : '') + '>Remove</button></div>';
      }).join('');
      $$('[data-rm]', main).forEach(function (b) { b.addEventListener('click', function () { readLocs(); locs.splice(+b.getAttribute('data-rm'), 1); drawLocs(); }); });
    }
    function readLocs() { locs.forEach(function (l, i) { l.name = $('#ln' + i, main).value.trim(); l.county = $('#lc' + i, main).value; l.signage = $('#ls' + i, main).checked; }); }
    drawLocs();
    $('#addLoc', main).addEventListener('click', function () {
      readLocs(); var n = 1; while (locs.some(function (l) { return l.id === 'l' + n; })) n++;
      locs.push({ id: 'l' + n, name: '', county: locs.length ? locs[0].county : 'Nairobi City', signage: false }); drawLocs(); $('#ln' + (locs.length - 1), main).focus();
    });
    var reset = $('#pReset', main);
    if (reset) reset.addEventListener('click', function () {
      if (reset.getAttribute('data-armed') !== '1') { reset.setAttribute('data-armed', '1'); reset.textContent = 'Click again to delete profile, records and filing log'; return; }
      api('/api/b/' + BID, 'DELETE').then(function (j) { if (!j.ok) return toast(j.error); window.location.href = '/app'; });
    });
    $('#pf', main).addEventListener('submit', function (e) {
      e.preventDefault(); readLocs();
      var errEl = $('#pErr', main), fail = function (m, el) { errEl.textContent = m; errEl.classList.remove('hidden'); if (el) el.focus(); };
      var name = $('#pName', main).value.trim();
      if (!name) return fail('Enter the business or trading name.', $('#pName', main));
      var empRaw = $('#pEmp', main).value;
      if (empRaw === '' || isNaN(+empRaw) || +empRaw < 0 || Math.floor(+empRaw) !== +empRaw) return fail('Enter the number of employees as a whole number (0 if none).', $('#pEmp', main));
      for (var i = 0; i < locs.length; i++) if (!locs[i].name) return fail('Give location ' + (i + 1) + ' a name.', $('#ln' + i, main));
      var sectors = CS.SECTORS.filter(function (s) { return $('#sec-' + s[0], main).checked; }).map(function (s) { return s[0]; });
      var track = $('#pTrack', main).value;
      PENDING_PROFILE = {
        name: name, structure: $('#pStruct', main).value, stage: $('#pStage', main).value, incDate: $('#pInc', main).value, fyEnd: +$('#pFy', main).value,
        sectors: sectors, activities: $('#pAct', main).value.trim().slice(0, 400), employees: +empRaw, turnover: $('#pTurn', main).value, vat: $('#pVat', main).value,
        personalData: $('#pData', main).checked, foreignStaff: $('#pForeign', main).checked, weighing: $('#pWeigh', main).checked, fumigation: $('#pFum', main).checked, wasteTransport: $('#pWaste', main).checked, cctv: $('#pCctv', main).checked,
        kraPin: $('#pPin', main).value.trim(), regNo: $('#pReg', main).value.trim(),
        locations: locs.map(function (l) { return { id: l.id, name: l.name.slice(0, 80), county: l.county, signage: l.signage }; })
      };
      PENDING_TRACK = (track && /^\d{4}-\d{2}$/.test(track) ? track : prev) + '-01';
      saveProfile(main);
    });
  }


  function viewDocuments(main) {
    var docs = ws.documents || [];
    var res = results(), title = function (id) { var r = res.filter(function (x) { return x.id === id; })[0]; return r ? r.inst.title + (r.inst.loc ? ' · ' + r.inst.loc.name : '') : 'General'; };
    main.innerHTML = '<div class="panel panel-pad" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center"><div><h3 style="font-size:20px">Documents</h3><p class="small muted">Certificates, permits, receipts and acknowledgements. Files are private to your team and listed in the dossier.</p></div>' +
      (CAN_EDIT ? '<div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap"><label class="f" for="dInst" style="min-width:240px">Link to<select id="dInst"><option value="">General (not linked)</option>' + res.filter(function (r) { return r.status !== 'na'; }).map(function (r) { return '<option value="' + esc(r.id) + '">' + esc(r.inst.title + (r.inst.loc ? ' · ' + r.inst.loc.name : '')) + '</option>'; }).join('') + '</select></label><label class="btn primary sm" for="dFile" style="cursor:pointer">Upload a file<input type="file" id="dFile" class="sr" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx"></label></div>' : '') + '</div>' +
      (docs.length ? '<div class="panel panel-pad"><div class="tbl-wrap"><table class="t"><thead><tr><th>File</th><th>Linked to</th><th>Size</th><th>Uploaded</th><th><span class="sr">Actions</span></th></tr></thead><tbody>' +
        docs.map(function (d) { return '<tr><td><a href="/api/b/' + BID + '/documents/' + d.id + '" target="_blank" rel="noopener"><b>' + esc(d.filename) + '</b></a></td><td class="small">' + esc(d.inst_id ? title(d.inst_id) : 'General') + '</td><td class="num small">' + fmtSize(d.size) + '</td><td class="num small">' + esc(String(d.created_at).slice(0, 10)) + '</td><td style="text-align:right">' + (CAN_EDIT ? '<button type="button" class="btn sm danger" data-deldoc="' + d.id + '">Delete</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>'
        : '<div class="empty">No documents yet. Upload certificates, permits and payment receipts so they are ready for inspections.</div>');
    var f = $('#dFile', main); if (f) f.addEventListener('change', function () { if (f.files && f.files[0]) upload(f.files[0], $('#dInst', main).value); });
    $$('[data-deldoc]', main).forEach(function (b) { b.addEventListener('click', function () {
      if (b.getAttribute('data-armed') !== '1') { b.setAttribute('data-armed', '1'); b.textContent = 'Confirm delete'; return; }
      api('/api/b/' + BID + '/documents/' + b.getAttribute('data-deldoc'), 'DELETE').then(function (j) { if (!j.ok) return toast(j.error); toast('Document deleted'); reload(); });
    }); });
  }

  function viewTeam(main) {
    main.innerHTML = '<div class="panel panel-pad"><p class="muted small">Loading team…</p></div>';
    api('/api/b/' + BID + '/team').then(function (j) {
      if (!j.ok) { main.innerHTML = '<div class="empty">' + esc(j.error) + '</div>'; return; }
      var roleSel = function (m) { return IS_OWNER && m.id !== META.me.id ? '<select data-role="' + m.id + '" aria-label="Role for ' + esc(m.name) + '"><option value="owner"' + (m.role === 'owner' ? ' selected' : '') + '>Owner</option><option value="editor"' + (m.role === 'editor' ? ' selected' : '') + '>Editor</option><option value="viewer"' + (m.role === 'viewer' ? ' selected' : '') + '>Viewer</option></select>' : '<span class="stp s-ok">' + esc(m.role.charAt(0).toUpperCase() + m.role.slice(1)) + '</span>'; };
      main.innerHTML = '<div class="panel panel-pad"><h3 style="font-size:20px">Team</h3><p class="small muted" style="margin:4px 0 12px">Owners manage the team, billing and the business. Editors record filings and documents. Viewers can see everything but change nothing.</p><div class="tbl-wrap"><table class="t"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th><span class="sr">Actions</span></th></tr></thead><tbody>' +
        j.members.map(function (m) { return '<tr><td><b>' + esc(m.name) + '</b>' + (m.id === META.me.id ? ' <span class="tiny muted">(you)</span>' : '') + '</td><td class="small">' + esc(m.email) + '</td><td>' + roleSel(m) + '</td><td style="text-align:right">' + ((IS_OWNER && m.id !== META.me.id) || m.id === META.me.id ? '<button type="button" class="btn sm danger" data-rm="' + m.id + '">' + (m.id === META.me.id ? 'Leave' : 'Remove') + '</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
        (IS_OWNER ? '<form class="panel panel-pad" id="invForm" novalidate style="display:flex;flex-direction:column;gap:12px"><h3 style="font-size:18px">Invite someone</h3><div class="fgrid"><label class="f" for="invEmail">Email address<input type="email" id="invEmail" required autocomplete="off"></label><label class="f" for="invRole">Role<select id="invRole"><option value="editor">Editor</option><option value="viewer">Viewer</option><option value="owner">Owner</option></select></label></div><p class="err hidden" id="invErr" role="alert"></p><div id="invLink"></div><div><button class="btn primary" type="submit">Send invitation</button></div></form>' +
          (j.invites.length ? '<div class="panel panel-pad"><h3 style="font-size:18px">Pending invitations</h3>' + j.invites.map(function (i) { return '<div class="log-row" style="grid-template-columns:1fr auto"><div><b>' + esc(i.email) + '</b><div class="tiny muted">' + esc(i.role) + ' · expires ' + esc(String(i.expires_at).slice(0, 10)) + '</div></div><button type="button" class="btn sm" data-cancel="' + i.id + '">Cancel</button></div>'; }).join('') + '</div>' : '') : '');
      $$('[data-role]', main).forEach(function (s) { s.addEventListener('change', function () { api('/api/b/' + BID + '/team', 'PATCH', { userId: +s.getAttribute('data-role'), role: s.value }).then(function (r) { toast(r.ok ? 'Role updated' : r.error); viewTeam(main); }); }); });
      $$('[data-rm]', main).forEach(function (b) { b.addEventListener('click', function () {
        if (b.getAttribute('data-armed') !== '1') { b.setAttribute('data-armed', '1'); b.textContent = 'Confirm'; return; }
        var uid = +b.getAttribute('data-rm');
        api('/api/b/' + BID + '/team', 'DELETE', { userId: uid }).then(function (r) { if (!r.ok) return toast(r.error); if (uid === META.me.id) window.location.href = '/app'; else viewTeam(main); });
      }); });
      $$('[data-cancel]', main).forEach(function (b) { b.addEventListener('click', function () { api('/api/b/' + BID + '/team', 'DELETE', { inviteId: +b.getAttribute('data-cancel') }).then(function () { viewTeam(main); }); }); });
      var form = $('#invForm', main);
      if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        api('/api/b/' + BID + '/team', 'POST', { email: $('#invEmail', main).value, role: $('#invRole', main).value }).then(function (r) {
          var er = $('#invErr', main);
          if (!r.ok) { er.textContent = r.error; er.classList.remove('hidden'); return; }
          if (r.link) { $('#invLink', main).innerHTML = '<div class="banner warn"><div><b>Email is not switched on yet.</b> Send this link to the person yourself:<br><input type="text" readonly value="' + esc(r.link) + '" style="margin-top:6px" onclick="this.select()"></div></div>'; }
          else { toast('Invitation sent'); viewTeam(main); }
        });
      });
    });
  }

  function viewBilling(main) {
    main.innerHTML = '<div class="panel panel-pad"><p class="muted small">Loading billing…</p></div>';
    api('/api/b/' + BID + '/billing').then(function (j) {
      if (!j.ok) { main.innerHTML = '<div class="empty">' + esc(j.error) + '</div>'; return; }
      var st = j.state, ksh = function (n) { return 'KSh ' + Number(n).toLocaleString('en-KE'); };
      var html = '<div class="panel panel-pad"><h3 style="font-size:20px">Plan and billing</h3><p style="margin-top:8px">Current plan: <b>' + esc(st.label) + '</b>' + (st.expires ? (st.active ? ' · until ' : ' · ended ') + esc(CS.fmt(CS.fromIso(st.expires))) : '') + '</p>' + (j.mode === 'pilot' ? '<p class="small muted">ComplyScope is in its free pilot: every feature is open and nothing is charged.</p>' : '') + '</div>';
      if (j.mode === 'paid') {
        var plans = ['starter', 'growth'];
        html += '<div class="grid2" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">' + plans.map(function (k) { var p = j.plans[k]; return '<div class="panel panel-pad"><h4 style="font-size:17px">' + esc(p.name) + '</h4><p style="font-size:26px;font-weight:800;margin:6px 0">' + ksh(p.price) + '<span class="small muted" style="font-weight:500"> / month</span></p><p class="small muted">' + esc(p.note) + (j.annualMonths < 12 ? ' · a year costs ' + j.annualMonths + ' months' : '') + '</p></div>'; }).join('') + '</div>';
        var methods = (j.methods.mpesa ? 1 : 0) + (j.methods.manual ? 1 : 0);
        if (!IS_OWNER) html += '<div class="banner"><div class="small">Only the business owner can pay for a plan.</div></div>';
        else if (!methods) html += '<div class="banner"><div class="small">Online payment is being set up. Contact us to activate your plan.</div></div>';
        else {
          var monthOpts = function (k) { return j.quotes[k].map(function (q) { return '<option value="' + k + '|' + q.months + '">' + esc(j.plans[k].name) + ' · ' + (q.months === 12 ? '1 year' : q.months + ' month' + (q.months > 1 ? 's' : '')) + ' · ' + ksh(q.amount) + '</option>'; }).join(''); };
          html += '<form class="panel panel-pad" id="payForm" novalidate style="display:flex;flex-direction:column;gap:12px"><h3 style="font-size:18px">Pay for a plan</h3>' +
            '<label class="f" for="payWhat">Plan and period<select id="payWhat">' + monthOpts('starter') + monthOpts('growth') + '</select></label>' +
            (methods > 1 ? '<fieldset style="border:0;padding:0;margin:0;display:flex;gap:16px;flex-wrap:wrap"><legend class="small" style="font-weight:600;margin-bottom:6px">How do you want to pay?</legend><label style="display:flex;gap:6px;align-items:center"><input type="radio" name="payM" value="mpesa" checked> M-Pesa prompt on my phone</label><label style="display:flex;gap:6px;align-items:center"><input type="radio" name="payM" value="manual"> I will pay and enter the code</label></fieldset>' : '<input type="hidden" name="payM" value="' + (j.methods.mpesa ? 'mpesa' : 'manual') + '">') +
            '<div id="payMpesa" class="fgrid"><label class="f" for="payPhone">M-Pesa number<input type="tel" id="payPhone" placeholder="0712 345 678" autocomplete="tel"></label></div>' +
            '<div id="payManual" class="hidden" style="display:flex;flex-direction:column;gap:10px"><div class="banner"><div class="small" style="white-space:pre-line">' + esc(j.methods.manualInstructions || '') + '</div></div><label class="f" for="payRef">M-Pesa or bank transaction code<input type="text" id="payRef" placeholder="e.g. SKL4ABC123" autocomplete="off"></label></div>' +
            '<p class="err hidden" id="payErr" role="alert"></p><div><button class="btn primary" type="submit">Pay</button></div></form>';
        }
      }
      if (j.payments.length) html += '<div class="panel panel-pad"><h3 style="font-size:18px">Payments</h3><div class="tbl-wrap"><table class="t"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th><th>Receipt</th></tr></thead><tbody>' + j.payments.map(function (p) { var label = { paid: 'Paid', pending: 'Waiting for M-Pesa', review: 'Being confirmed', failed: 'Not completed', rejected: 'Not confirmed', underpaid: 'Underpaid' }[p.status] || p.status; return '<tr><td class="num small">' + esc(String(p.created_at).slice(0, 16)) + '</td><td>' + esc(p.plan) + ' · ' + esc(p.months) + ' mo</td><td class="num">' + ksh(p.amount) + '</td><td class="small">' + (p.method === 'manual' ? 'Code ' + esc(p.reference || '') : 'M-Pesa ' + esc(p.phone)) + '</td><td>' + esc(label) + '</td><td class="small">' + (p.status === 'paid' ? '<a href="/app/b/' + BID + '/receipt/' + p.id + '" target="_blank" rel="noopener">View receipt</a>' : '–') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
      main.innerHTML = html;
      if (META.plan && !META.plan.active) main.insertAdjacentHTML('afterbegin', '<div class="banner warn"><div><b>' + esc(META.plan.label) + '.</b> <span class="small">' + esc(META.plan.message) + '</span></div></div>');
      var f = $('#payForm', main);
      if (!f) return;
      var method = function () { var r = f.querySelector('[name=payM]:checked') || f.querySelector('[name=payM]'); return r.value; };
      var sync = function () { var m = method(); $('#payMpesa', main).classList.toggle('hidden', m !== 'mpesa'); $('#payManual', main).classList.toggle('hidden', m !== 'manual'); };
      $$('[name=payM]', f).forEach(function (r) { r.addEventListener('change', sync); }); sync();
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var parts = $('#payWhat', main).value.split('|'), btn = f.querySelector('button[type=submit]'), er = $('#payErr', main);
        er.classList.add('hidden'); btn.disabled = true; btn.textContent = 'Working…';
        api('/api/b/' + BID + '/billing', 'POST', { plan: parts[0], months: Number(parts[1]), method: method(), phone: $('#payPhone', main).value, reference: $('#payRef', main) ? $('#payRef', main).value : '' }).then(function (r) {
          btn.disabled = false; btn.textContent = 'Pay';
          if (!r.ok) { er.textContent = r.error; er.classList.remove('hidden'); return; }
          if (r.review) { toast('Thanks. We will confirm your payment shortly.'); viewBilling(main); return; }
          toast('Check your phone and enter your M-Pesa PIN');
          setTimeout(function () { reload(); }, 20000);
        });
      });
    });
  }

  function viewDossier(main) {
    main.innerHTML = '<div class="panel panel-pad" style="display:flex;flex-direction:column;gap:14px"><div><h3 style="font-size:20px">Compliance dossier and exports</h3><p class="small muted">A dated report of your profile, every obligation, your filing log and your documents, ready to print or save as PDF for inspectors, lenders and auditors.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn primary" href="/app/b/' + BID + '/dossier" target="_blank" rel="noopener">Open printable dossier</a>' +
      '<a class="btn" href="/api/b/' + BID + '/export?type=obligations">Obligations (.csv)</a><a class="btn" href="/api/b/' + BID + '/export?type=deadlines">Deadlines (.csv)</a><a class="btn" href="/api/b/' + BID + '/export?type=filings">Filing log (.csv)</a></div></div>';
  }

  function calendarPanel() {
    return '<div class="panel panel-pad" style="display:flex;flex-direction:column;gap:10px"><h3 style="font-size:18px">Subscribe in your calendar</h3><p class="small muted">Add this link to Google Calendar (Other calendars → From URL), Outlook or your phone. Your deadlines then appear and update automatically, with an alert two days before each one.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><input type="text" readonly id="calUrl" value="' + esc(META.calendarUrl) + '" style="flex:1;min-width:240px" onclick="this.select()"><button type="button" class="btn sm" id="calCopy">Copy link</button></div><p class="tiny muted">Keep this link private: anyone with it can see your deadlines.</p></div>';
  }


  // ---------------- new business (profile form only) ----------------
  if (!BID) {
    CAN_EDIT = true;
    rootEl.innerHTML = '<div class="appbar"><div class="wrap"><div class="appbar-row"><div><p class="tiny muted" style="font-weight:700;letter-spacing:.1em"><a href="/app" style="color:inherit;text-decoration:none">MY BUSINESSES</a> ›</p><h2 style="font-size:24px;font-weight:800">Add your business</h2><p class="small muted" style="margin-top:4px">Answer what you can. "Not sure" is always allowed, and you can change anything later.</p></div></div></div></div><div class="wrap app-main" id="appMain"></div>';
    viewProfile($('#appMain', rootEl));
    var sb = $('#pf button[type=submit]', rootEl); if (sb) sb.textContent = 'Save and see my obligations';
    return function () {};
  }
  // ---------------- tabs ----------------
  var TABS = [['overview', 'Overview'], ['obligations', 'Obligations'], ['deadlines', 'Deadlines'], ['filings', 'Filing log'], ['documents', 'Documents'], ['profile', 'Business profile'], ['team', 'Team'], ['billing', 'Billing'], ['dossier', 'Dossier']];
  rootEl.innerHTML = '<div class="appbar"><div class="wrap"><div class="appbar-row"><div><p class="tiny muted" style="font-weight:700;letter-spacing:.1em"><a href="/app" style="color:inherit;text-decoration:none">MY BUSINESSES</a> ›</p><h2 id="wsName" style="font-size:24px;font-weight:800">Loading…</h2></div><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="save-state" id="saveState">Saved to your account</span><span class="stp s-info" id="roleBadge"></span></div></div><nav class="tabs" aria-label="Workspace">' +
    TABS.map(function (t) { return '<a href="#' + t[0] + '" data-tab="' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</nav></div></div><div class="wrap app-main" id="appMain"><div class="panel panel-pad"><p class="muted">Loading your workspace…</p></div></div>';
  var lastView = null;
  function route() {
    var h = (location.hash || '').slice(1);
    if (h === 'workspace') h = 'overview';
    if (!TABS.some(function (t) { return t[0] === h; })) h = 'overview';
    $$('.tabs a', rootEl).forEach(function (a) { if (a.getAttribute('data-tab') === h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#wsName', rootEl).textContent = ws.profile ? ws.profile.name : 'Business';
    $('#roleBadge', rootEl).textContent = { owner: 'Owner', editor: 'Editor', viewer: 'View only' }[META.role] || '';
    var old = $('#appMain', rootEl), main = old.cloneNode(false); old.parentNode.replaceChild(main, old);
    var pl = META.plan;
    var planBanner = '';
    if (pl && !pl.active) planBanner = '<div class="banner warn"><div><b>' + esc(pl.label) + '.</b> <span class="small">' + esc(pl.message) + '</span></div>' + (IS_OWNER && h !== 'billing' ? '<a class="btn sm primary" href="#billing">Renew</a>' : '') + '</div>';
    else if (pl && pl.plan === 'trial' && pl.expires) { var dl = Math.max(0, Math.round((CS.fromIso(pl.expires) - TODAY) / 86400000)); planBanner = '<div class="banner"><div><b>Free trial:</b> <span class="small">' + dl + ' day' + (dl === 1 ? '' : 's') + ' left (until ' + esc(CS.fmt(CS.fromIso(pl.expires))) + ').</span></div>' + (IS_OWNER && h !== 'billing' ? '<a class="btn sm" href="#billing">Choose a plan</a>' : '') + '</div>'; }
    if (h === 'profile' && !CAN_EDIT) { main.innerHTML = planBanner + (pl && !pl.active ? '' : '<div class="empty">Only owners and editors can change the business profile.</div>'); if (pl && !pl.active) main.insertAdjacentHTML('beforeend', '<div class="empty">The profile can be changed again once the plan is renewed.</div>'); }
    else { ({ overview: viewOverview, obligations: viewObligations, deadlines: viewDeadlines, filings: viewFilings, documents: viewDocuments, profile: viewProfile, team: viewTeam, billing: viewBilling, dossier: viewDossier })[h](main); if (planBanner) main.insertAdjacentHTML('afterbegin', planBanner); }
    if (h === 'deadlines') { var d = document.createElement('div'); d.innerHTML = calendarPanel(); main.appendChild(d.firstChild); var c = $('#calCopy', main); if (c) c.addEventListener('click', function () { copyText($('#calUrl', main).value); }); }
    if (!CAN_EDIT) $$('[data-del]', main).forEach(function (b) { b.remove(); });
    if (lastView !== h && lastView !== null) window.scrollTo(0, 0);
    lastView = h;
  }
  function onHash() { route(); }
  window.addEventListener('hashchange', onHash);
  reload();
  return function unmount() { window.removeEventListener('hashchange', onHash); };
}
