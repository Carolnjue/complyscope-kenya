import 'server-only';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { q, one, exec } from './db';

export const SESSION_COOKIE = 'cs_session';
const SESSION_DAYS = 30;

export type User = { id: number; email: string; name: string; phone: string | null; email_verified_at: string | null; is_admin: number; is_disabled: number; remind_email: number; remind_sms: number; created_at: string };

export function sha256(s: string) { return crypto.createHash('sha256').update(s).digest('hex'); }
export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }

export async function hashPassword(pw: string) { return bcrypt.hash(pw, 11); }
export async function checkPassword(pw: string, hash: string) { return bcrypt.compare(pw, hash); }

export function passwordProblem(pw: string): string | null {
  if (!pw || pw.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use letters and at least one number.';
  return null;
}
export function normEmail(e: string) { return String(e || '').trim().toLowerCase(); }
export function validEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

export function isSuperadminEmail(email: string) {
  return (process.env.SUPERADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}

export async function createSession(userId: number) {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await exec('INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)', [sha256(token), userId, expires]);
  await exec('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires });
}

export async function destroySession() {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (t) await exec('DELETE FROM sessions WHERE id = ?', [sha256(t)]);
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const t = jar.get(SESSION_COOKIE)?.value;
  if (!t) return null;
  const u = await one<User>(
    `SELECT u.id, u.email, u.name, u.phone, u.email_verified_at, u.is_admin, u.is_disabled, u.remind_email, u.remind_sms, u.created_at
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > NOW()`, [sha256(t)]);
  if (!u || u.is_disabled) return null;
  return u;
}

// Simple rate limiting for login and reset requests (per email + IP)
export async function tooManyAttempts(key: string, max = 8, minutes = 15): Promise<boolean> {
  const h = sha256(key);
  const row = await one<{ n: number }>('SELECT COUNT(*) AS n FROM login_attempts WHERE key_hash = ? AND created_at > (NOW() - INTERVAL ? MINUTE)', [h, minutes]);
  return (row?.n || 0) >= max;
}
export async function noteAttempt(key: string) {
  await exec('INSERT INTO login_attempts (key_hash) VALUES (?)', [sha256(key)]);
  await exec('DELETE FROM login_attempts WHERE created_at < (NOW() - INTERVAL 1 DAY)');
}

export async function issueToken(type: 'verify' | 'reset' | 'invite', opts: { userId?: number; email?: string; businessId?: number; role?: string; hours: number }) {
  const token = randomToken();
  await exec('INSERT INTO tokens (token_hash, type, user_id, email, business_id, role, expires_at) VALUES (?,?,?,?,?,?, NOW() + INTERVAL ? HOUR)',
    [sha256(token), type, opts.userId || null, opts.email || null, opts.businessId || null, opts.role || null, opts.hours]);
  return token;
}
export async function readToken(type: string, token: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return one<any>('SELECT * FROM tokens WHERE token_hash = ? AND type = ? AND used_at IS NULL AND expires_at > NOW()', [sha256(token), type]);
}
export async function useToken(id: number) { await exec('UPDATE tokens SET used_at = NOW() WHERE id = ?', [id]); }

export async function audit(userId: number | null, businessId: number | null, action: string, detail = '') {
  try { await exec('INSERT INTO audit_log (user_id, business_id, action, detail) VALUES (?,?,?,?)', [userId, businessId, action, detail.slice(0, 500)]); } catch { /* never block on audit */ }
}

export async function allUsersCount() { const r = await q<{ n: number }>('SELECT COUNT(*) n FROM users'); return r[0]?.n || 0; }
