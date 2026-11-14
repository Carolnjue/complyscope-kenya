export const LANDING_HTML = String.raw`<!-- HERO -->
<section id="top" class="max-w-6xl mx-auto px-5 pt-14 pb-8">
  <div class="reveal" style="text-align:center;max-width:780px;margin:0 auto">
    <span class="pill" style="background:var(--accent-soft);color:var(--accent);margin-bottom:18px"><span class="dot" style="background:var(--accent)"></span>FREE DURING PILOT · ALL 47 COUNTIES</span>
    <h1 style="font-size:clamp(30px,5vw,52px);font-weight:800;line-height:1.1;letter-spacing:-.03em;margin:0 0 18px">Never miss a filing, permit, or renewal in Kenya.</h1>
    <p style="color:var(--muted);font-size:17px;line-height:1.65;max-width:620px;margin:0 auto 28px">ComplyScope maps the registrations, permits, payroll remittances and tax filings that apply to your Kenyan business — national <b>and</b> county-level — works out every due date, flags gaps before they become penalties, and prepares your compliance dossier on demand.</p>
    <div class="flex flex-wrap gap-3 justify-center">
      <a href="/signup" style="min-height:48px;display:inline-flex;align-items:center;padding:0 26px;border-radius:12px;background:var(--accent);color:#fff;font-weight:600;font-size:15px;text-decoration:none">Add your business — free</a>
      <a href="#dashboard" style="min-height:48px;display:inline-flex;align-items:center;padding:0 26px;border-radius:12px;background:#fff;color:var(--text);font-weight:600;font-size:15px;text-decoration:none;border:1px solid var(--border)">Try the live dashboard</a>
    </div>
    <p style="font-size:12px;color:var(--muted);margin-top:16px">Advisory tracking only — not legal or tax advice. You stay in control of every filing.</p>
  </div>
</section>

<!-- CAPABILITIES -->
<section id="capabilities" class="max-w-6xl mx-auto px-5 py-10">
  <div class="reveal mb-9" style="text-align:center">
    <h2 style="font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-.02em;margin:0 0 10px">Six modules, one compliance view</h2>
    <p style="color:var(--muted);margin:0;font-size:15px">From KRA iTax to your county permit office — every layer in one place.</p>
  </div>
  <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Business profiler</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">A ten-minute intake maps your legal form, branches and counties, headcount, turnover band, sector and data use to the obligations that apply.</p></div>
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Obligation mapping</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">National (BRS, KRA, SHA, NSSF, NITA, ODPC, DOSH) + county permits + sector licences (TRA, PPB, KMPDC, NCA, KEBS, PCPB, NEMA) — each showing why it applies and its official source.</p></div>
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M8 11h6"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Gap analysis &amp; scoring</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Every obligation marked compliant, due soon, overdue or not started — with the next step and the date it is due.</p></div>
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Deadline tracking</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Every filing, remittance and renewal dated from the rules, adjusted for weekends and public holidays, with countdowns and calendar links.</p></div>
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Filing log</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Record each filing, payment and renewal with its iTax acknowledgement or M-Pesa reference. Overdue items clear as soon as you log them.</p></div>
    <div class="mc reveal rounded-2xl p-5" style="background:var(--card);border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:10px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent);margin-bottom:12px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg></div><h3 style="font-weight:700;font-size:16px;margin:0 0 6px">Audit dossier on demand</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">When KRA, BRS or a county inspector calls, one click exports a dated dossier of your profile, obligations and filing references.</p></div>
  </div>
</section>

<!-- DASHBOARD -->
<section id="dashboard" class="py-12" style="background:#eef5f3">
  <div class="max-w-6xl mx-auto px-5">
    <div class="mb-8" style="text-align:center">
      <span class="pill" style="background:var(--accent2-soft);color:var(--accent2);margin-bottom:14px"><span class="dot" style="background:var(--accent2)"></span>INTERACTIVE DEMO — SAMPLE BUSINESS PROFILE</span>
      <h2 style="font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-.02em;margin:0 0 10px">The ComplyScope monitoring dashboard</h2>
      <p style="color:var(--muted);margin:0;font-size:15px">Switch county to see national and county obligations for a sample business, with due dates worked out from today. <a href="/signup" style="color:var(--accent);font-weight:600">Add your own business</a> to see yours.</p>
    </div>

    <div class="rounded-2xl p-5 sm:p-7" style="background:var(--card);border:1px solid var(--border);box-shadow:0 4px 24px rgba(15,23,42,.06)">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-2">
          <button class="jbtn active" data-cnty="Nairobi City">Nairobi</button>
          <button class="jbtn" data-cnty="Mombasa">Mombasa</button>
          <button class="jbtn" data-cnty="Kiambu">Kiambu</button>
          <label for="cntySel" class="sr-only">Any county</label>
          <select id="cntySel" class="jbtn" style="padding-right:10px;max-width:190px"><option value="">All 47 counties…</option></select>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <div class="flex flex-wrap gap-2">
            <button class="fbtn active" data-filter="all">All</button>
            <button class="fbtn" data-filter="national">National</button>
            <button class="fbtn" data-filter="county">County</button>
            <button class="fbtn" data-filter="action">Action needed</button>
          </div>
          <button id="scanBtn" style="min-height:40px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;background:var(--text);color:#fff;border:none;cursor:pointer">Run scan</button>
        </div>
      </div>
      <div id="scanBar" style="display:none" class="scanline rounded-full mb-4"></div>

      <!-- County info card -->
      <div id="countyInfo" class="rounded-xl p-4 mb-5" style="background:#f0faf8;border:1px solid var(--border);font-size:13px"></div>

      <!-- Score + KPIs -->
      <div class="flex flex-wrap gap-4 items-stretch mb-6">
        <div class="rounded-xl p-5 flex items-center gap-5" style="background:#fbfdfc;border:1px solid var(--border);flex:1 1 260px;min-width:240px">
          <div style="position:relative;width:110px;height:110px;flex-shrink:0">
            <svg width="110" height="110" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(13,148,136,.15)" stroke-width="10"/>
              <circle id="gaugeCircle" class="gauge-circle" cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="80" transform="rotate(-90 60 60)"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <span id="scoreNum" style="font-size:30px;font-weight:800;line-height:1">—</span>
              <span style="font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.05em">SCORE</span>
            </div>
          </div>
          <div>
            <p id="scoreLabel" style="font-weight:700;font-size:15px;margin:0 0 4px">—</p>
            <p id="scoreSub" style="font-size:12.5px;color:var(--muted);line-height:1.5;margin:0">—</p>
          </div>
        </div>
        <div id="kpiRow" class="flex flex-wrap gap-3" style="flex:2 1 400px;min-width:260px"></div>
      </div>

      <!-- Obligations table -->
      <div style="overflow-x:auto;border:1px solid var(--border);border-radius:12px;margin-bottom:6px" tabindex="0" role="region" aria-label="Sample obligations table">
        <table class="w-full text-sm" style="min-width:680px">
          <thead>
            <tr style="background:#f8faf9;color:var(--muted)" class="text-xs uppercase tracking-wide">
              <th class="text-left py-3 px-4 font-semibold">Obligation</th>
              <th class="text-left py-3 px-4 font-semibold hide-sm">Authority</th>
              <th class="text-left py-3 px-4 font-semibold">Layer</th>
              <th class="text-left py-3 px-4 font-semibold">Status</th>
              <th class="text-left py-3 px-4 font-semibold">Next deadline</th>
              <th class="text-right py-3 px-4 font-semibold">Days left</th>
            </tr>
          </thead>
          <tbody id="obligationBody" style="color:var(--text)"></tbody>
        </table>
      </div>
      <p id="tableNote" style="font-size:11.5px;color:var(--muted);margin:6px 2px 0"></p>

      <div class="grid gap-4 mt-6" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
        <div class="rounded-xl p-5" style="border:1px solid var(--border);background:#fbfdfc">
          <h4 style="font-weight:700;font-size:14px;margin:0 0 12px;display:flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Next 90 days</h4>
          <div id="deadlineList" style="font-size:13px"></div>
        </div>
        <div class="rounded-xl p-5" style="border:1px solid var(--border);background:#fbfdfc">
          <h4 style="font-weight:700;font-size:14px;margin:0 0 12px;display:flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>Rule notes</h4>
          <div id="alertsList" style="font-size:12.5px"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- COUNTIES -->
<section id="counties" class="max-w-6xl mx-auto px-5 py-14">
  <div class="mb-9" style="text-align:center">
    <span class="pill" style="background:var(--accent-soft);color:var(--accent);margin-bottom:14px">COVERAGE</span>
    <h2 style="font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-.02em;margin:0 0 10px">Permits tracked in all 47 counties</h2>
    <p style="color:var(--muted);margin:0;font-size:15px">Add each branch with its county and ComplyScope tracks its permit and renewal. Our <a href="/counties" style="color:var(--accent);font-weight:600">county guide</a> shows the permit name, where to apply and pay, and how long it lasts for every county.</p>
  </div>
  <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
    <div class="mc rounded-2xl p-6" style="background:var(--card);border:2px solid var(--accent)">
      <span class="pill" style="background:var(--accent);color:#fff;margin-bottom:12px">LIVE</span>
      <h3 style="font-weight:800;font-size:20px;margin:0 0 8px">Nairobi City County</h3>
      <p style="color:var(--muted);font-size:13.5px;line-height:1.7;margin:0 0 12px"><b>Unified Business Permit (UBP)</b> — bundles the trade licence with fire, health, food hygiene and advertising approvals according to your activity and premises. Fees follow the County Finance Act, 2026. Apply via nairobiservices.go.ke or *647#.</p>
      <p style="font-size:12.5px;color:var(--accent);font-weight:600;margin:0">Valid 12 months from issue · pay yearly, half-yearly or quarterly</p>
    </div>
    <div class="mc rounded-2xl p-6" style="background:var(--card);border:2px solid var(--accent)">
      <span class="pill" style="background:var(--accent);color:#fff;margin-bottom:12px">LIVE</span>
      <h3 style="font-weight:800;font-size:20px;margin:0 0 8px">Mombasa County</h3>
      <p style="color:var(--muted);font-size:13.5px;line-height:1.7;margin:0 0 12px"><b>Single Business Permit</b> — fees by business type and size under the County Finance Act. Add-ons: fire certificate, public health permit, weights &amp; measures. Apply via eportal.mombasa.go.ke.</p>
      <p style="font-size:12.5px;color:var(--accent);font-weight:600;margin:0">Calendar-year permit · provisional permit issued on payment</p>
    </div>
    <div class="mc rounded-2xl p-6" style="background:var(--card);border:2px solid var(--accent)">
      <span class="pill" style="background:var(--accent);color:#fff;margin-bottom:12px">LIVE</span>
      <h3 style="font-weight:800;font-size:20px;margin:0 0 8px">Kiambu County</h3>
      <p style="color:var(--muted);font-size:13.5px;line-height:1.7;margin:0 0 12px"><b>Single Business Permit</b> — fees by business type and size under the County Finance Act. Add-ons: fire inspection, public health (food) and signage approval are billed separately.</p>
      <p style="font-size:12.5px;color:var(--accent);font-weight:600;margin:0">Valid 12 months from the date of issue</p>
    </div>
    <div class="rounded-2xl p-6" style="background:#f1f5f4;border:1px dashed var(--border)">
      <span class="pill" style="background:var(--accent2-soft);color:var(--accent2);margin-bottom:12px">ALL OTHER COUNTIES</span>
      <h3 style="font-weight:800;font-size:20px;margin:0 0 8px">Nakuru · Kisumu · Machakos · and 41 more</h3>
      <p style="color:var(--muted);font-size:13.5px;line-height:1.7;margin:0 0 12px">Add a branch in any county and its permit, fire certificate and signage permit are tracked from the expiry dates you enter. Multi-county businesses get one permit per county — we track all of them.</p>
      <a href="/counties" style="font-size:12.5px;color:var(--accent);font-weight:600;margin:0;text-decoration:none">Open the county guide →</a>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="py-12" style="background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
  <div class="max-w-6xl mx-auto px-5">
    <div class="mb-9" style="text-align:center"><h2 style="font-size:clamp(24px,3.5vw,30px);font-weight:800;margin:0 0 10px">How it works</h2><p style="color:var(--muted);margin:0;font-size:15px">From onboarding to audit-ready in four steps.</p></div>
    <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <div class="rounded-2xl p-6" style="background:var(--bg);border:1px solid var(--border)"><span style="font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.1em">STEP 01</span><h3 style="font-weight:700;font-size:17px;margin:10px 0 8px">Profile your business</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Ten-minute intake: legal form, branches and counties, headcount, turnover, sector, data use.</p></div>
      <div class="rounded-2xl p-6" style="background:var(--bg);border:1px solid var(--border)"><span style="font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.1em">STEP 02</span><h3 style="font-weight:700;font-size:17px;margin:10px 0 8px">Get your gap report</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Every obligation scored with status, deadline, and a concrete fix. National + county.</p></div>
      <div class="rounded-2xl p-6" style="background:var(--bg);border:1px solid var(--border)"><span style="font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.1em">STEP 03</span><h3 style="font-weight:700;font-size:17px;margin:10px 0 8px">Stay ahead of every date</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">Mark filings with their references, add dates to your calendar, and see what is overdue at a glance.</p></div>
      <div class="rounded-2xl p-6" style="background:var(--bg);border:1px solid var(--border)"><span style="font-size:13px;font-weight:800;color:var(--accent);letter-spacing:.1em">STEP 04</span><h3 style="font-weight:700;font-size:17px;margin:10px 0 8px">Be audit-ready always</h3><p style="color:var(--muted);font-size:13.5px;line-height:1.6;margin:0">One click exports a dated dossier of your profile, obligations and filing references.</p></div>
    </div>
  </div>
</section>

<!-- GUARDRAILS -->
<section class="py-12" style="background:#0f2e2a;color:#e6f4f1">
  <div class="max-w-6xl mx-auto px-5">
    <div class="mb-8" style="text-align:center"><h2 style="font-size:clamp(24px,3.5vw,30px);font-weight:800;margin:0 0 10px;color:#fff">Guardrails, not blind autonomy</h2><p style="color:#8fc7bd;margin:0;font-size:15px">ComplyScope tracks and reminds. You, or your accountant, decide and file.</p></div>
    <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
      <div class="rounded-xl p-5" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)"><p style="font-weight:700;font-size:15px;margin:0 0 6px;color:#fff">Never files on your behalf</p><p style="color:#8fc7bd;font-size:13px;line-height:1.6;margin:0">Nothing is submitted to KRA, BRS, SHA, NSSF or any county portal. You file, then record the reference.</p></div>
      <div class="rounded-xl p-5" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)"><p style="font-weight:700;font-size:15px;margin:0 0 6px;color:#fff">Every item cites its source</p><p style="color:#8fc7bd;font-size:13px;line-height:1.6;margin:0">Each obligation shows why it applies, the authority and a link to the law or official portal.</p></div>
      <div class="rounded-xl p-5" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)"><p style="font-weight:700;font-size:15px;margin:0 0 6px;color:#fff">Nothing assumed compliant</p><p style="color:#8fc7bd;font-size:13px;line-height:1.6;margin:0">Anything without a record or a date is flagged and lowers the score until you confirm it.</p></div>
      <div class="rounded-xl p-5" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)"><p style="font-weight:700;font-size:15px;margin:0 0 6px;color:#fff">Your own audit trail</p><p style="color:#8fc7bd;font-size:13px;line-height:1.6;margin:0">Every filing and renewal you record keeps its date and reference, ready for the dossier.</p></div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" class="max-w-6xl mx-auto px-5 py-14">
  <div class="mb-9" style="text-align:center"><h2 style="font-size:clamp(24px,3.5vw,32px);font-weight:800;letter-spacing:-.02em;margin:0 0 10px">Simple pricing, in KSh</h2><p style="color:var(--muted);margin:0;font-size:15px">Free during the pilot. Scale with your compliance burden; multi-county businesses from Growth up.</p></div>
  <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
    <div class="rounded-2xl p-6" style="background:var(--card);border:1px solid var(--border)"><p style="font-weight:700;font-size:16px;margin:0 0 4px">Starter</p><p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">Solo founder · 1 county</p><p style="font-size:32px;font-weight:800;margin:0 0 16px">KSh 4,999<span style="font-size:14px;font-weight:500;color:var(--muted)">/mo</span></p><ul style="list-style:none;padding:0;margin:0;font-size:13.5px;line-height:2.1"><li><span style="color:var(--ok);font-weight:700">✓</span> 1 entity, 1 county</li><li><span style="color:var(--ok);font-weight:700">✓</span> Deadline monitoring</li><li><span style="color:var(--ok);font-weight:700">✓</span> Live gap report</li><li><span style="color:var(--ok);font-weight:700">✓</span> Filing log &amp; dossier export</li></ul></div>
    <div class="rounded-2xl p-6" style="background:var(--card);border:2px solid var(--accent);box-shadow:0 8px 30px rgba(13,148,136,.15);position:relative"><span class="pill" style="background:var(--accent);color:#fff;position:absolute;top:-11px;left:24px">MOST POPULAR</span><p style="font-weight:700;font-size:16px;margin:0 0 4px">Growth</p><p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">Growing team · multi-county</p><p style="font-size:32px;font-weight:800;margin:0 0 16px">KSh 14,999<span style="font-size:14px;font-weight:500;color:var(--muted)">/mo</span></p><ul style="list-style:none;padding:0;margin:0;font-size:13.5px;line-height:2.1"><li><span style="color:var(--ok);font-weight:700">✓</span> Multiple counties and branches</li><li><span style="color:var(--ok);font-weight:700">✓</span> Payroll statutory deduction tracking</li><li><span style="color:var(--ok);font-weight:700">✓</span> Calendar links &amp; CSV exports</li><li><span style="color:var(--ok);font-weight:700">✓</span> Audit dossier export</li></ul></div>
    <div class="rounded-2xl p-6" style="background:var(--card);border:1px solid var(--border)"><p style="font-weight:700;font-size:16px;margin:0 0 4px">Enterprise</p><p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">Groups · many entities · all counties</p><p style="font-size:32px;font-weight:800;margin:0 0 16px">Custom</p><ul style="list-style:none;padding:0;margin:0;font-size:13.5px;line-height:2.1"><li><span style="color:var(--ok);font-weight:700">✓</span> Unlimited counties &amp; entities</li><li><span style="color:var(--ok);font-weight:700">✓</span> Team access with owner, editor and viewer roles</li><li><span style="color:var(--ok);font-weight:700">✓</span> Calendar feeds &amp; exports for every entity</li><li><span style="color:var(--ok);font-weight:700">✓</span> Guided onboarding of all your branches</li></ul></div>
  </div>
</section>

<!-- CTA -->
<section id="cta" class="max-w-6xl mx-auto px-5 pb-14">
  <div class="rounded-2xl p-8 sm:p-12" style="background:linear-gradient(135deg,#0f766e,#115e59);text-align:center;color:#fff">
    <h2 style="font-size:clamp(22px,3.5vw,30px);font-weight:800;margin:0 0 12px">Know your compliance score today — free.</h2>
    <p style="color:#c9e9e4;font-size:15px;margin:0 auto 26px;max-width:520px">Run a ten-minute gap analysis for your business in any county. No card or M-Pesa needed. You'll leave with a prioritised fix list — and the deadlines.</p>
    <a href="/signup" style="min-height:48px;display:inline-flex;align-items:center;padding:0 28px;border-radius:12px;background:#fff;color:var(--accent);font-weight:700;font-size:15px;text-decoration:none">Add your business — free</a>
  </div>
</section>

`;
