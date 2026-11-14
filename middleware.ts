import { NextResponse, NextRequest } from 'next/server';

// Reject cross-site state-changing API requests (CSRF protection). Webhooks are exempt.
export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  // Send visitors to HTTPS. Only when the proxy explicitly reports plain http (never loops), and never for the cron job.
  const proto = (req.headers.get('x-forwarded-proto') || '').split(',')[0].trim();
  const hostname = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(':')[0];
  if (proto === 'http' && (req.method === 'GET' || req.method === 'HEAD') && !p.startsWith('/api/') && hostname.includes('.') && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return NextResponse.redirect('https://' + hostname + req.nextUrl.pathname + req.nextUrl.search, 301);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && p.startsWith('/api/') && !p.startsWith('/api/mpesa/callback') && !p.startsWith('/api/cron')) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (origin) {
      try { if (new URL(origin).host !== host) return NextResponse.json({ ok: false, error: 'Cross-site request blocked.' }, { status: 403 }); }
      catch { return NextResponse.json({ ok: false, error: 'Bad origin.' }, { status: 403 }); }
    }
  }
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon).*)'] };
