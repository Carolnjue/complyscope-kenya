export default function Logo({ small = false }: { small?: boolean }) {
  const s = small ? 28 : 36;
  return (
    <span className="flex items-center gap-2.5">
      <span style={{ width: s, height: s, borderRadius: small ? 8 : 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
        <svg width={small ? 14 : 18} height={small ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
      </span>
      <span><span style={{ fontWeight: 800, fontSize: small ? 15 : 18, letterSpacing: '-.02em', color: 'var(--text)' }}>ComplyScope</span><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', marginLeft: 6 }}>KENYA</span></span>
    </span>
  );
}
