import crypto from 'crypto';

const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export function encryptData(plainText: string) {
  const iv = crypto.randomBytes(12); // AES-GCM ต้องใช้ IV (nonce)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

export function decryptData(encryptedBase64: string, ivBase64: string, tagBase64: string) {
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
