import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const a = { color: 'var(--muted)', textDecoration: 'none' } as const;
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div style={{ maxWidth: 360 }}>
            <Link href="/" style={{ textDecoration: 'none' }}><Logo small /></Link>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>Compliance tracking for Kenyan businesses, branch by branch, in all 47 counties. A product of Pentarch Systems Solutions.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" style={{ fontSize: 13 }} aria-label="Footer">
            <Link href="/counties" style={a}>County guide</Link>
            <Link href="/#pricing" style={a}>Pricing</Link>
            <Link href="/privacy" style={a}>Privacy policy</Link>
            <Link href="/terms" style={a}>Terms of use</Link>
            <Link href="/data-protection" style={a}>Data protection notice</Link>
            <Link href="/contact" style={a}>Contact</Link>
          </nav>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.6, marginTop: 18 }}>ComplyScope outputs are advisory only and do not constitute legal, tax or accounting advice. County permit fees and schedules change annually — always verify with the issuing county&apos;s revenue office. © {new Date().getFullYear()} Pentarch Systems Solutions.</p>
      </div>
    </footer>
  );
}
