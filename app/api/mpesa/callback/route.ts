import { one, exec } from '@/lib/db';
import { audit } from '@/lib/auth';
import { extendPlan } from '@/lib/billing';
import { stkQuery } from '@/lib/mpesa';

// Safaricom posts the STK result here. Always answer 200 so Safaricom does not retry forever.
export async function POST(req: Request) {
  try {
    const j = await req.json();
    const cb = j?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const p = await one<any>('SELECT * FROM payments WHERE checkout_request_id = ? AND status = "pending"', [cb.CheckoutRequestID]);
    if (!p) return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    if (cb.ResultCode === 0) {
      // Confirm with Safaricom before activating anything, so a forged callback cannot unlock a plan.
      const confirmed = await stkQuery(cb.CheckoutRequestID).catch(() => null);
      if (confirmed !== '0') { await exec('UPDATE payments SET result_desc = ? WHERE id = ?', ['Callback received; awaiting Safaricom confirmation', p.id]); return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' }); }
      const items = cb.CallbackMetadata?.Item || [];
      const get = (n: string) => (items.find((i: any) => i.Name === n) || {}).Value;
      const amount = Number(get('Amount') || 0);
      const receipt = String(get('MpesaReceiptNumber') || '');
      if (amount < p.amount) {
        await exec('UPDATE payments SET status = "underpaid", receipt = ?, result_desc = ? WHERE id = ?', [receipt, 'Paid ' + amount, p.id]);
      } else {
        await exec('UPDATE payments SET status = "paid", receipt = ?, result_desc = ? WHERE id = ?', [receipt, String(cb.ResultDesc || ''), p.id]);
        await extendPlan(p.business_id, p.plan, Number(p.months) || 1);
        await audit(p.user_id, p.business_id, 'payment_paid', receipt);
      }
    } else {
      await exec('UPDATE payments SET status = "failed", result_desc = ? WHERE id = ?', [String(cb.ResultDesc || 'Cancelled').slice(0, 250), p.id]);
    }
  } catch { /* ignore malformed */ }
  return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
