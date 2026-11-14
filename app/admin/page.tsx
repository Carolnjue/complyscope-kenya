import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { q } from '@/lib/db';
import { integrationStatus, getSetting } from '@/lib/integrations';
import { INTEGRATIONS, publicConfig } from '@/lib/config';
import { billingSettings } from '@/lib/billing';
import AdminConsole from './AdminConsole';

export const metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const u = await requireUser('/admin');
  if (!u.is_admin) notFound();
  const [users, businesses, payments, outbox, auditLog, counts] = await Promise.all([
    q<any>('SELECT u.id, u.name, u.email, u.phone, u.is_admin, u.is_disabled, u.email_verified_at, u.created_at, u.last_login_at, (SELECT COUNT(*) FROM memberships m WHERE m.user_id = u.id) AS biz FROM users u ORDER BY u.id DESC LIMIT 500'),
    q<any>('SELECT b.id, b.name, b.plan, b.plan_expires_at, b.created_at, b.updated_at, u.email AS owner, JSON_LENGTH(b.profile, "$.locations") AS locs, (SELECT COUNT(*) FROM filings f WHERE f.business_id = b.id) AS filings FROM businesses b JOIN users u ON u.id = b.owner_id WHERE b.deleted_at IS NULL ORDER BY b.id DESC LIMIT 500'),
    q<any>('SELECT p.id, p.plan, p.amount, p.status, p.receipt, p.reference, p.method, p.months, p.created_at, b.name, b.id AS business_id FROM payments p JOIN businesses b ON b.id = p.business_id ORDER BY (p.status = "review") DESC, p.id DESC LIMIT 200'),
    q<any>('SELECT id, to_email, subject, status, error, created_at FROM email_outbox ORDER BY id DESC LIMIT 50'),
    q<any>('SELECT a.created_at, a.action, a.detail, u.email FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 80'),
    q<any>('SELECT (SELECT COUNT(*) FROM users) users, (SELECT COUNT(*) FROM businesses WHERE deleted_at IS NULL) businesses, (SELECT COUNT(*) FROM filings) filings, (SELECT COUNT(*) FROM documents) documents, (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status="paid") revenue'),
  ]);
  const settings = { review_status: await getSetting('review_status', 'pending'), review_note: await getSetting('review_note', ''), last_cron_run: await getSetting('last_cron_run', 'Never') };
  return <AdminConsole me={u.id} data={JSON.parse(JSON.stringify({ users, businesses, payments, outbox, auditLog, counts: counts[0], settings, integrations: (await integrationStatus()), intConfig: await publicConfig(), intDefs: INTEGRATIONS, billing: await billingSettings() }))} />;
}
