import LegalPage from '@/components/LegalPage';
export const metadata = { title: 'Terms of use' };
const SUPPORT: string = process.env.SUPPORT_EMAIL || 'pentarchsytemssol@gmail.com';
export default function Page() {
  return (
    <LegalPage title="Terms of use" updated="14 November 2026">
      <p>These terms govern your use of ComplyScope Kenya, provided by Pentarch Systems Solutions. By creating an account you agree to them.</p>
      <h2>1. What ComplyScope does</h2>
      <p>ComplyScope helps Kenyan businesses keep track of registrations, permits, payroll remittances, tax filings and renewals. It lists obligations that may apply based on the information you enter, calculates due dates from published rules and reminds you before they fall due.</p>
      <h2>2. Not professional advice</h2>
      <p>ComplyScope is an information and tracking tool. It is not legal, tax or accounting advice and does not certify compliance. Rules, rates, fees and dates change and may not be reflected immediately. You remain responsible for your filings and payments and should confirm requirements with the relevant authority or a qualified professional.</p>
      <h2>3. Your account</h2>
      <ul><li>Give accurate information and keep your password safe.</li><li>You are responsible for activity under your account and for the people you invite to your businesses.</li><li>Do not use ComplyScope for anything unlawful or to upload malicious files.</li></ul>
      <h2>4. Your data</h2>
      <p>You own the business data and documents you put into ComplyScope. You grant us permission to store and process them only to provide the service. Our <a href="/privacy">privacy policy</a> explains how we handle personal data.</p>
      <h2>5. Pilot, plans and payment</h2>
      <p>During the pilot, ComplyScope is free. When paid plans start, businesses that joined during the pilot keep full access free for at least 30 days, and we will tell owners by email. New businesses then start with a free trial.</p>
      <p>Prices are shown in Kenya shillings on our website and in the Billing tab, and include VAT where applicable. Plans are paid in advance for one, three, six or twelve months, by M-Pesa or by the other payment methods shown in the Billing tab. A plan starts or extends when we receive and confirm payment. Prepaid periods are not refunded except where the law requires it.</p>
      <p>If a trial or plan ends, your business becomes read-only: you can still see, print and export everything you saved, and full access returns as soon as you renew. You can stop using the service at any time.</p>
      <h2>6. Availability</h2>
      <p>We aim to keep ComplyScope available at all times but do not guarantee uninterrupted service. Reminders depend on email and SMS networks outside our control; do not rely on reminders alone.</p>
      <h2>7. Liability</h2>
      <p>To the extent the law allows, we are not liable for penalties, interest, fines or losses arising from missed or late filings, or from reliance on information in ComplyScope. Our total liability is limited to the fees you paid in the three months before the claim.</p>
      <h2>8. Ending your use</h2>
      <p>You may delete a business or ask us to close your account at any time. We may suspend accounts that break these terms.</p>
      <h2>9. Changes and law</h2>
      <p>We may update these terms and will tell you of significant changes. These terms are governed by the laws of Kenya. Questions: <a href={'mailto:' + SUPPORT}>{SUPPORT}</a>.</p>
    </LegalPage>
  );
}
