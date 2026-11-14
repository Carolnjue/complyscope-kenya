import LegalPage from '@/components/LegalPage';
export const metadata = { title: 'Privacy policy' };
const SUPPORT: string = process.env.SUPPORT_EMAIL || 'pentarchsytemssol@gmail.com';
export default function Page() {
  return (
    <LegalPage title="Privacy policy" updated="14 November 2026">
      <p>This policy explains what personal data ComplyScope Kenya collects, why, how long we keep it and the rights you have under the Data Protection Act, 2019 of Kenya. Pentarch Systems Solutions is the data controller for account data and a data processor for the business records you enter.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>Account data:</b> your name, email address, optional mobile number and a securely hashed password.</li>
        <li><b>Business data you enter:</b> business name, legal form, KRA PIN and registration number if you add them, activities, employee count, turnover band, branch names and counties, permit and certificate dates, filing references and documents you upload.</li>
        <li><b>Usage data:</b> sign-in times, actions taken in the workspace (for your audit trail) and technical logs needed to keep the service secure.</li>
        <li><b>Payment data:</b> when paid plans start, the M-Pesa number used, the amount and the M-Pesa receipt. We never see or store your M-Pesa PIN.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul>
        <li>To provide the service: work out which obligations apply, calculate due dates, send reminders and produce your dossier (performance of our contract with you).</li>
        <li>To keep accounts secure and prevent misuse (legitimate interest).</li>
        <li>To process payments and keep tax records (legal obligation).</li>
        <li>To send service emails such as confirmations, reminders and important changes. We do not send marketing without your consent.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>We do not sell personal data. We share it only with service providers that help us run ComplyScope, under contract: our hosting provider, our email provider, Safaricom (for M-Pesa payments) and, if you turn on SMS reminders, our SMS provider. Team members you invite can see the business data of businesses they belong to. We disclose data to authorities only where Kenyan law requires it.</p>
      <h2>Where it is stored</h2>
      <p>Data is stored on servers operated by our hosting provider. Where data is held outside Kenya, we rely on safeguards required by the Data Protection Act and its regulations.</p>
      <h2>How long we keep it</h2>
      <p>We keep account and business data while your account is active. If you delete a business or close your account, we delete or anonymise the data within 90 days, except records we must keep by law (for example payment records, kept for the period required by the Tax Procedures Act).</p>
      <h2>Your rights</h2>
      <p>You may ask to be informed about how your data is used, to access it, to correct it, to delete it, to object to processing and to receive a copy in a portable format. Write to <a href={'mailto:' + SUPPORT}>{SUPPORT}</a>. You may also complain to the Office of the Data Protection Commissioner (odpc.go.ke).</p>
      <h2>Security</h2>
      <p>Passwords are hashed, connections are encrypted, documents are private to your team and every change is logged. No system is perfectly secure; if a breach affects your data we will tell you and the ODPC as the law requires.</p>
      <h2>Contact</h2>
      <p>Pentarch Systems Solutions, Nairobi, Kenya · <a href={'mailto:' + SUPPORT}>{SUPPORT}</a></p>
    </LegalPage>
  );
}
