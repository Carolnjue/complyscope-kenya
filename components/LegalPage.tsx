export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="max-w-6xl mx-auto px-5" style={{ padding: '48px 20px 72px' }}>
      <div className="legal" style={{ maxWidth: 780, margin: '0 auto' }}>
        <span className="pill" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>LEGAL</span>
        <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, letterSpacing: '-.02em', margin: '12px 0 6px' }}>{title}</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 24 }}>Last updated {updated}. ComplyScope Kenya is provided by Pentarch Systems Solutions, Nairobi, Kenya.</p>
        <div style={{ fontSize: 15.5, lineHeight: 1.75 }}>{children}</div>
      </div>
      <style>{`.legal h2{font-size:20px;font-weight:800;margin:28px 0 8px}.legal p{margin:0 0 12px}.legal ul{list-style:disc;padding-left:22px;margin:0 0 12px}.legal li{margin:4px 0}.legal a{color:var(--accent)}`}</style>
    </section>
  );
}
