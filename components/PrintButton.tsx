'use client';
export default function PrintButton() { return <button type="button" onClick={() => window.print()} style={{ background: 'var(--accent)', color: '#fff', border: 0, borderRadius: 8, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Print or save as PDF</button>; }
