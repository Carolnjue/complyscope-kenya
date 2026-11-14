'use client';
import { useEffect, useState } from 'react';

export default function CountyFilter() {
  const [q, setQ] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [shown, setShown] = useState(47);
  useEffect(() => {
    const term = q.trim().toLowerCase();
    let n = 0;
    document.querySelectorAll<HTMLElement>('.county-card').forEach((el) => {
      const ok = (!term || (el.dataset.name || '').includes(term)) && (!onlineOnly || el.dataset.online === '1');
      el.style.display = ok ? '' : 'none';
      if (ok) n++;
    });
    setShown(n);
  }, [q, onlineOnly]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', margin: '0 0 16px' }}>
      <label htmlFor="cq" className="sr-only">Search counties</label>
      <input id="cq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a county or town" autoComplete="off"
        style={{ flex: '1 1 240px', minHeight: 44, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 15, background: '#fff' }} />
      <button type="button" className={'fbtn' + (onlineOnly ? ' active' : '')} aria-pressed={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)}>Online channel only</button>
      <span style={{ color: 'var(--muted)', fontSize: 13.5 }} aria-live="polite">{shown} of 47 shown</span>
    </div>
  );
}
