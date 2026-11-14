import './globals.css';
import type { Metadata, Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: { default: 'ComplyScope Kenya — never miss a filing, permit or renewal', template: '%s · ComplyScope Kenya' },
  description: 'ComplyScope Kenya maps the registrations, permits, payroll remittances and tax filings that apply to your Kenyan business in all 47 counties, works out every due date and reminds you before penalties apply.',
  icons: { icon: '/favicon.svg' },
  openGraph: { title: 'ComplyScope Kenya', description: 'Business compliance tracking for Kenya — national and county, branch by branch.', type: 'website' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0d9488' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
