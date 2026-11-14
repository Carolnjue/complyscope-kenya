import LegalPage from '@/components/LegalPage';
export const metadata = { title: 'Data protection notice' };
const SUPPORT: string = process.env.SUPPORT_EMAIL || 'pentarchsytemssol@gmail.com';
export default function Page() {
  return (
    <LegalPage title="Data protection notice" updated="14 November 2026">
      <p>This notice is given under section 29 of the Data Protection Act, 2019.</p>
      <ul>
        <li><b>Who we are:</b> Pentarch Systems Solutions, Nairobi, Kenya, operator of ComplyScope Kenya.</li>
        <li><b>What we collect and why:</b> account details to give you access; business details to work out your obligations and deadlines; documents you choose to upload as evidence; payment details to process subscriptions.</li>
        <li><b>Legal basis:</b> performance of our contract with you, our legal obligations and our legitimate interest in keeping the service secure.</li>
        <li><b>Third parties:</b> hosting, email, SMS and payment providers acting on our instructions. No sale of data.</li>
        <li><b>Your rights:</b> to be informed, to access, to correct, to delete, to object and to data portability. Contact <a href={'mailto:' + SUPPORT}>{SUPPORT}</a>.</li>
        <li><b>Safeguards:</b> hashed passwords, encrypted connections, access limited to your team, audit logs of every change.</li>
        <li><b>Complaints:</b> Office of the Data Protection Commissioner, odpc.go.ke.</li>
      </ul>
      <p>If your business keeps personal data about customers, pupils, patients or staff, you may need to register with the ODPC as a data controller yourself. ComplyScope tracks this obligation for you when it applies.</p>
    </LegalPage>
  );
}
