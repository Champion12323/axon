// src/utils/encrypt.js
import crypto from 'crypto';

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32-byte hex key

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const [iv, encrypted] = text.split(':').map(h => Buffer.from(h, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString();
}