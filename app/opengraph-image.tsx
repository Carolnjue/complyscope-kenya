import { ImageResponse } from 'next/og';

export const alt = 'ComplyScope Kenya — business compliance tracking for all 47 counties';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: '#f0fdfa', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#0f172a' }}>ComplyScope Kenya</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 64, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>Never miss a filing, permit or renewal.</div>
        <div style={{ marginTop: 28, fontSize: 30, color: '#475569' }}>KRA, payroll, data protection and county permits — tracked for every branch in all 47 counties.</div>
      </div>
    ),
    size
  );
}
