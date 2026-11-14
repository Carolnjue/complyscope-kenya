import 'server-only';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const MAX_UPLOAD = 10 * 1024 * 1024;
export const ALLOWED: Record<string, string> = {
  'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};
export function uploadDir() { return process.env.UPLOAD_DIR || path.join(process.cwd(), '..', 'complyscope_uploads'); }

export async function saveUpload(businessId: number, buf: Buffer, mime: string) {
  const dir = path.join(uploadDir(), String(businessId));
  await fs.mkdir(dir, { recursive: true });
  const name = crypto.randomBytes(16).toString('hex') + (ALLOWED[mime] || '');
  await fs.writeFile(path.join(dir, name), buf);
  return name;
}
export async function readUpload(businessId: number, stored: string) {
  if (!/^[a-f0-9]{32}\.[a-z]{3,4}$/.test(stored)) throw new Error('bad name');
  return fs.readFile(path.join(uploadDir(), String(businessId), stored));
}
export async function removeUpload(businessId: number, stored: string) {
  if (!/^[a-f0-9]{32}\.[a-z]{3,4}$/.test(stored)) return;
  await fs.rm(path.join(uploadDir(), String(businessId), stored), { force: true });
}
// Check the file's real type from its first bytes so a renamed file cannot slip through.
export function sniff(buf: Buffer): string | null {
  if (buf.slice(0, 4).toString() === '%PDF') return 'application/pdf';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  if (buf[0] === 0x50 && buf[1] === 0x4b) return 'zip';
  return null;
}
