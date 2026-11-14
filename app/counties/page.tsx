import COUNTY_DATA, { COUNTY_GENERAL } from '@/lib/counties';
import CountyFilter from './CountyFilter';

export const metadata = { title: 'County business permit guide — all 47 counties', description: 'Permit name, where to apply and pay, validity rules and notes for every Kenyan county.' };

const VALIDITY: Record<string, string> = {
  issue: '12 months from the date of issue',
  calendar: 'Calendar year (ends 31 December)',
};

export default function Page() {
  const online = COUNTY_DATA.filter((c: any) => c.portal).length;
  return (
    <section className="max-w-6xl mx-auto px-5" style={{ padding: '48px 20px 72px' }}>
      <div style={{ maxWidth: 820 }}>
        <span className="pill" style={{ background: 'var(--accent2-soft)', color: 'var(--accent2)' }}>COUNTY GUIDE</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-.02em', margin: '12px 0 8px' }}>County business permits in all 47 counties</h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.65, margin: '0 0 6px' }}>
          What each county calls its permit, where to apply and pay, and how long it lasts. {online} counties have an online channel we could confirm; for the rest, apply at the county or sub-county revenue office.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: 0 }}>Checked November 2026. Fees change every year with each county Finance Act, so always use the amount on your county invoice.</p>
      </div>

      <div className="rounded-2xl" style={{ background: '#fff', border: '1px solid var(--border)', padding: '20px 22px', margin: '28px 0' }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 10px' }}>Rules that apply in every county</h2>
        <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0, fontSize: 15, lineHeight: 1.7 }}>
          {COUNTY_GENERAL.map((g: string) => <li key={g}>{g}</li>)}
        </ul>
      </div>

      <CountyFilter />

      <div id="countyList" style={{ display: 'grid', gap: 14 }}>
        {COUNTY_DATA.map((c: any) => (
          <article key={c.code} id={c.slug} data-name={(c.name + ' ' + c.hq).toLowerCase()} data-online={c.portal ? '1' : '0'} className="county-card rounded-2xl" style={{ background: '#fff', border: '1px solid var(--border)', padding: '18px 22px', scrollMarginTop: 90 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px 14px', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13, marginRight: 8 }}>{String(c.code).padStart(3, '0')}</span>{c.name}
              </h2>
              <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>HQ: {c.hq}</span>
            </div>
            <dl className="cdl">
              <dt>Permit</dt><dd>{c.permit}</dd>
              <dt>Apply and pay</dt>
              <dd>
                {c.portal ? (c.portal.url ? <a href={c.portal.url} target="_blank" rel="noopener">{c.portal.label}</a> : c.portal.label) : 'County or sub-county revenue office'}
                {c.portal2 ? <> · <a href={c.portal2.url} target="_blank" rel="noopener">{c.portal2.label}</a></> : null}
                {c.ussd ? <> · USSD <b>{c.ussd}</b></> : null}
              </dd>
              <dt>Valid for</dt><dd>{c.validity ? VALIDITY[c.validity] : 'Use the expiry printed on your permit'}{c.renewBy ? ' · renew by ' + c.renewBy : ''}</dd>
              {c.bundles ? <><dt>Included</dt><dd>Business, fire, food and health, and advertising approvals in one permit</dd></> : null}
              <dt>County website</dt><dd><a href={c.site} target="_blank" rel="noopener">{c.site.replace(/^https?:\/\/(www\.)?/, '')}</a></dd>
            </dl>
            {c.notes.length ? <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: '10px 0 0', fontSize: 14.5, lineHeight: 1.65 }}>{c.notes.map((n: string) => <li key={n}>{n}</li>)}</ul> : null}
            {c.sources.length ? <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '10px 0 0' }}>Sources: {c.sources.map((s: any, i: number) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noopener" style={{ color: 'var(--muted)' }}>{s.label}</a></span>)}</p> : null}
          </article>
        ))}
      </div>

      <div className="rounded-2xl" style={{ background: 'var(--accent-soft)', padding: '20px 22px', marginTop: 28 }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65 }}>
          Have a newer portal link, a renewal deadline or a correction for your county? <a href="/contact" style={{ color: 'var(--accent)', fontWeight: 600 }}>Tell us</a> and we will update the guide. <a href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Add your business</a> to track each branch’s permit expiry and get reminders.
        </p>
      </div>
      <style>{`.cdl{display:grid;grid-template-columns:150px 1fr;gap:6px 14px;margin:12px 0 0;font-size:14.5px}.cdl dt{color:var(--muted);font-weight:600}.cdl dd{margin:0}.cdl a,.county-card a{color:var(--accent)}@media(max-width:560px){.cdl{grid-template-columns:1fr;gap:2px}.cdl dd{margin-bottom:8px}}`}</style>
    </section>
  );
}
