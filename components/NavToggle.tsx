'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavToggle() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const n = document.getElementById('siteNav');
    if (n) n.classList.toggle('open', open);
    const close = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('#siteNav a')) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  return <button type="button" className="show-sm" aria-expanded={open} aria-controls="siteNav" onClick={() => setOpen(!open)} style={{ minHeight: 40, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}>{open ? 'Close' : 'Menu'}</button>;
}
