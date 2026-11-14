import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { access } from '@/lib/business';
import { one } from '@/lib/db';
import PrintButton from '@/components/PrintButton';

export const metadata = { title: 'Payment receipt' };
const SELLER = { name: 'Pentarch Systems Solutions', place: 'Nairobi, Kenya', email: process.env.SUPPORT_EMAIL || 'pentarchsytemssol@gmail.com', web: (process.env.APP_URL || '').replace(/^https?:\/\//, '') };

export default async function Page({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id, pid } = await params;
  const user = await requireUser('/app/b/' + id + '/receipt/' + pid);
  const a = await access(user.id, Number(id), 'viewer', !!user.is_admin);
  if (!a) notFound();
  const p = await one<any>('SELECT * FROM payments WHERE id = ? AND business_id = ? AND status = "paid"', [Number(pid), Number(id)]);
  if (!p) notFound();
  const planName = ({ starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' } as any)[p.plan] || p.plan;
  const row = (k: string, v: string) => <tr><td style={{ padding: '8px 0', color: '#64748b', width: 200 }}>{k}</td><td style={{ padding: '8px 0', fontWeight: 600 }}>{v}</td></tr>;
  return (
    <div style={{ background: '#fff', padding: '28px 20px 60px' }}>
      <style>{`@media print{.site-header,footer,.noprint{display:none!important}@page{margin:16mm}}`}</style>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="noprint" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 16 }}><a className="btn sm" href={'/app/b/' + id + '#billing'}>Back to billing</a><PrintButton /></div>
        <p style={{ fontSize: 12, letterSpacing: '.12em', fontWeight: 700, color: '#0f766e' }}>COMPLYSCOPE KENYA · PAYMENT RECEIPT</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 2px' }}>Receipt CS-{String(p.id).padStart(6, '0')}</h1>
        <p style={{ color: '#64748b', fontSize: 13.5, marginBottom: 20 }}>{SELLER.name} · {SELLER.place} · {SELLER.email}{SELLER.web ? ' · ' + SELLER.web : ''}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}><tbody>
          {row('Received from', a.business.name)}
          {row('Date', String(p.updated_at || p.created_at).slice(0, 10))}
          {row('For', 'ComplyScope ' + planName + ' plan, ' + p.months + (p.months === 1 ? ' month' : ' months'))}
          {row('Amount', 'KSh ' + Number(p.amount).toLocaleString('en-KE'))}
          {row('Paid by', p.method === 'manual' ? 'Transfer, confirmed by ComplyScope' : 'M-Pesa' + (p.phone ? ' (' + String(p.phone).replace(/^(\d{6})\d{3}/, '$1***') + ')' : ''))}
          {row('Transaction code', p.receipt || p.reference || '–')}
        </tbody></table>
        <p style={{ marginTop: 28, fontSize: 12.5, color: '#64748b' }}>This receipt confirms payment for a software subscription. It is not a KRA eTIMS tax invoice; ask us if you need one.</p>
      </div>
    </div>
  );
}
