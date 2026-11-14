import LegalPage from '@/components/LegalPage';
export const metadata = { title: 'Contact' };
const SUPPORT: string = process.env.SUPPORT_EMAIL || 'pentarchsytemssol@gmail.com';
export default function Page() {
  return (
    <LegalPage title="Contact us" updated="14 November 2026">
      <p>For help with your account, a question about an obligation, a county you would like covered in more detail, or a data protection request, email us and we will reply within one working day.</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}><a href={'mailto:' + SUPPORT}>{SUPPORT}</a></p>
      <p>Pentarch Systems Solutions · Nairobi, Kenya</p>
    </LegalPage>
  );
}
