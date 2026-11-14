import 'server-only';
import { appUrl } from './integrations';
import { integration } from './config';

async function cfg() { const c = await integration('mpesa'); if (!c.on) throw new Error('M-Pesa is not switched on.'); return c; }
function base(c: any) { return c.env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'; }
function stamp() { const d = new Date(Date.now() + 3 * 3600000); const p = (n: number) => String(n).padStart(2, '0'); return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()); }

export async function mpesaToken() {
  const c = await cfg();
  const auth = Buffer.from(c.consumerKey + ':' + c.consumerSecret).toString('base64');
  const r = await fetch(base(c) + '/oauth/v1/generate?grant_type=client_credentials', { headers: { Authorization: 'Basic ' + auth } });
  if (!r.ok) throw new Error('M-Pesa authentication failed (' + r.status + ')');
  return (await r.json()).access_token as string;
}

/** Sends an M-Pesa STK push prompt to the customer's phone. */
export async function stkPush(phone254: string, amount: number, accountRef: string, desc: string) {
  const c = await cfg();
  const t = await mpesaToken();
  const ts = stamp();
  const sc = c.shortcode;
  const password = Buffer.from(sc + c.passkey + ts).toString('base64');
  const r = await fetch(base(c) + '/mpesa/stkpush/v1/processrequest', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ BusinessShortCode: sc, Password: password, Timestamp: ts, TransactionType: c.type === 'till' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
      Amount: Math.round(amount), PartyA: phone254, PartyB: c.till || sc, PhoneNumber: phone254, CallBackURL: appUrl() + '/api/mpesa/callback',
      AccountReference: accountRef.slice(0, 12), TransactionDesc: desc.slice(0, 13) }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.ResponseCode !== '0') throw new Error(j.errorMessage || j.ResponseDescription || 'M-Pesa request was not accepted');
  return j.CheckoutRequestID as string;
}

/** Asks Safaricom for the real status of an STK request (used to confirm callbacks). Returns ResultCode as a string, or null. */
export async function stkQuery(checkoutRequestId: string): Promise<string | null> {
  const c = await cfg();
  const t = await mpesaToken();
  const ts = stamp();
  const password = Buffer.from(c.shortcode + c.passkey + ts).toString('base64');
  const r = await fetch(base(c) + '/mpesa/stkpushquery/v1/query', {
    method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ BusinessShortCode: c.shortcode, Password: password, Timestamp: ts, CheckoutRequestID: checkoutRequestId }),
  });
  const j: any = await r.json().catch(() => ({}));
  return j.ResultCode != null ? String(j.ResultCode) : null;
}
