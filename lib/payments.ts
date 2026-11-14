import 'server-only';
import { q, exec } from './db';
import { integration } from './config';
import { stkQuery } from './mpesa';
import { extendPlan } from './billing';
import { audit } from './auth';

/** Checks M-Pesa payments that are still pending (for example when the callback never arrived). */
export async function reconcileMpesa(businessId?: number) {
  if (!(await integration('mpesa')).on) return 0;
  const rows = await q<any>('SELECT * FROM payments WHERE method = "mpesa" AND status = "pending" AND checkout_request_id IS NOT NULL AND created_at < (NOW() - INTERVAL 1 MINUTE) AND created_at > (NOW() - INTERVAL 3 DAY)' + (businessId ? ' AND business_id = ?' : '') + ' ORDER BY id LIMIT 20', businessId ? [businessId] : []);
  let n = 0;
  for (const p of rows) {
    const code = await stkQuery(p.checkout_request_id).catch(() => null);
    if (code === '0') {
      const r = await exec('UPDATE payments SET status = "paid", result_desc = "Confirmed by status check" WHERE id = ? AND status = "pending"', [p.id]);
      if (r.affectedRows) { await extendPlan(p.business_id, p.plan, Number(p.months) || 1); await audit(p.user_id, p.business_id, 'payment_paid', 'status check'); n++; }
    } else if (code && code !== '4999') { // 4999 = still processing
      await exec('UPDATE payments SET status = "failed", result_desc = ? WHERE id = ? AND status = "pending"', ['Not completed (code ' + code + ')', p.id]);
    }
  }
  return n;
}

/** Admin decision on a manual payment. */
export async function reviewManualPayment(paymentId: number, approve: boolean, adminId: number) {
  const p = (await q<any>('SELECT * FROM payments WHERE id = ? AND method = "manual" AND status = "review"', [paymentId]))[0];
  if (!p) return false;
  await exec('UPDATE payments SET status = ?, reviewed_by = ?, receipt = COALESCE(receipt, reference) WHERE id = ?', [approve ? 'paid' : 'rejected', adminId, p.id]);
  if (approve) await extendPlan(p.business_id, p.plan, Number(p.months) || 1);
  await audit(adminId, p.business_id, approve ? 'payment_approved' : 'payment_rejected', p.reference || '');
  return true;
}
