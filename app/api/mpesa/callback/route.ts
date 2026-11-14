import { one, exec } from '@/lib/db';
import { audit } from '@/lib/auth';

// Safaricom posts the STK result here. Always answer 200 so Safaricom does not retry forever.
export async function POST(req: Request) {
  try {
    const j = await req.json();
    const cb = j?.Body?.stkCallback;
    if (!cb?.CheckoutRequestID) return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const p = await one<any>('SELECT * FROM payments WHERE checkout_request_id = ? AND status = "pending"', [cb.CheckoutRequestID]);
    if (!p) return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    if (cb.ResultCode === 0) {
      const items = cb.CallbackMetadata?.Item || [];
      const get = (n: string) => (items.find((i: any) => i.Name === n) || {}).Value;
      const amount = Number(get('Amount') || 0);
      const receipt = String(get('MpesaReceiptNumber') || '');
      if (amount < p.amount) {
        await exec('UPDATE payments SET status = "underpaid", receipt = ?, result_desc = ? WHERE id = ?', [receipt, 'Paid ' + amount, p.id]);
      } else {
        await exec('UPDATE payments SET status = "paid", receipt = ?, result_desc = ? WHERE id = ?', [receipt, String(cb.ResultDesc || ''), p.id]);
        await exec('UPDATE businesses SET plan = ?, plan_expires_at = DATE_ADD(GREATEST(COALESCE(plan_expires_at, NOW()), NOW()), INTERVAL 30 DAY) WHERE id = ?', [p.plan, p.business_id]);
        await audit(p.user_id, p.business_id, 'payment_paid', receipt);
      }
    } else {
      await exec('UPDATE payments SET status = "failed", result_desc = ? WHERE id = ?', [String(cb.ResultDesc || 'Cancelled').slice(0, 250), p.id]);
    }
  } catch { /* ignore malformed */ }
  return Response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
