import Link from 'next/link';
import Logo from './Logo';
import NavToggle from './NavToggle';
import { currentUser } from '@/lib/auth';

export default async function Header() {
  let user = null;
  try { user = await currentUser(); } catch { user = null; }
  const linkStyle = { color: 'inherit', textDecoration: 'none' } as const;
  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(246,251,249,.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between" style={{ position: 'relative' }}>
        <Link href="/" aria-label="ComplyScope Kenya home" style={linkStyle}><Logo /></Link>
        <nav id="siteNav" className="hide-sm flex items-center gap-7" style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/#capabilities" style={linkStyle}>Capabilities</Link>
          <Link href="/#dashboard" style={linkStyle}>Live Dashboard</Link>
          <Link href="/counties" style={linkStyle}>Counties</Link>
          <Link href="/#pricing" style={linkStyle}>Pricing</Link>
          {user ? <Link href="/account" style={linkStyle}>Account</Link> : <Link href="/login" style={linkStyle}>Sign in</Link>}
          {user && user.is_admin ? <Link href="/admin" style={linkStyle}>Admin</Link> : null}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavToggle />
          <Link href={user ? '/app' : '/signup'} id="headCta" style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', padding: '0 18px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}><span className="cta-long">{user ? 'My workspace' : 'Add your business'}</span><span className="cta-short">{user ? 'Workspace' : 'Start free'}</span></Link>
        </div>
      </div>
    </header>
  );
}
