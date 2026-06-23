import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = crypto.randomBytes(32);

/** @type {{ iv: Buffer, authTag: Buffer, data: Buffer } | null} */
let encrypted = null;

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv, authTag, data };
}

function decrypt(payload) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, payload.iv);
  decipher.setAuthTag(payload.authTag);
  return Buffer.concat([decipher.update(payload.data), decipher.final()]).toString('utf8');
}

export function setText(text) {
  encrypted = encrypt(text);
}

export function getPreview() {
  if (!encrypted) return null;
  const text = decrypt(encrypted);
  if (text.length === 0) return null;
  const prefix = text.slice(0, 3);
  return `${prefix}${'*'.repeat(10)}`;
}

export function takeText() {
  if (!encrypted) return null;
  const text = decrypt(encrypted);
  encrypted = null;
  return text;
}

export function hasText() {
  return encrypted !== null;
}
