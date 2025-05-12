import { randomBytes, createCipheriv } from "crypto";

export function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, 'utf8');
  const rand = randomBytes(12);

  const cipher = createCipheriv('aes-256-gcm', keyBuffer, rand);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([rand, tag, encrypted]).toString('base64');
  return payload;
}