import crypto from 'crypto';

/**
 * Enterprise WeChat message encryption/decryption utility
 * Based on official WeChat Work callback protocol
 */
export class WeChatCrypto {
  private token: string;
  private corpId: string;
  private aesKey: Buffer;
  private iv: Buffer;

  constructor(token: string, encodingAesKey: string, corpId: string) {
    this.token = token;
    this.corpId = corpId;
    // EncodingAESKey is base64 encoded (43 chars + '=' padding = 44 chars)
    this.aesKey = Buffer.from(encodingAesKey + '=', 'base64');
    this.iv = this.aesKey.subarray(0, 16);
  }

  /**
   * Verify message signature
   */
  verifySignature(msgSignature: string, timestamp: string, nonce: string, echostr?: string): boolean {
    const arr = [this.token, timestamp, nonce];
    if (echostr) arr.push(echostr);
    arr.sort();
    const hash = crypto.createHash('sha1').update(arr.join('')).digest('hex');
    return hash === msgSignature;
  }

  /**
   * Generate signature for response
   */
  generateSignature(timestamp: string, nonce: string, encrypt: string): string {
    const arr = [this.token, timestamp, nonce, encrypt];
    arr.sort();
    return crypto.createHash('sha1').update(arr.join('')).digest('hex');
  }

  /**
   * Decrypt encrypted message
   */
  decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.iv);
    decipher.setAutoPadding(false);

    const deciphered = Buffer.concat([
      decipher.update(encrypted, 'base64'),
      decipher.final(),
    ]);

    // Remove PKCS#7 padding
    const pad = deciphered[deciphered.length - 1];
    const content = deciphered.subarray(0, deciphered.length - pad);

    // Format: 16-byte random + 4-byte msg_len + msg + corpId
    const msgLen = content.readUInt32BE(16);
    const msg = content.subarray(20, 20 + msgLen).toString('utf8');
    const fromCorpId = content.subarray(20 + msgLen).toString('utf8');

    if (this.corpId && fromCorpId !== this.corpId) {
      throw new Error(`CorpId mismatch: expected ${this.corpId}, got ${fromCorpId}`);
    }

    return msg;
  }

  /**
   * Encrypt message for response
   */
  encrypt(message: string): string {
    const random = crypto.randomBytes(16);
    const msgBuf = Buffer.from(message, 'utf8');
    const corpIdBuf = Buffer.from(this.corpId, 'utf8');
    const msgLenBuf = Buffer.alloc(4);
    msgLenBuf.writeUInt32BE(msgBuf.length, 0);

    const content = Buffer.concat([random, msgLenBuf, msgBuf, corpIdBuf]);

    // PKCS#7 padding
    const blockSize = 32;
    const padLen = blockSize - (content.length % blockSize);
    const padBuf = Buffer.alloc(padLen, padLen);
    const padded = Buffer.concat([content, padBuf]);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.iv);
    cipher.setAutoPadding(false);

    return Buffer.concat([cipher.update(padded), cipher.final()]).toString('base64');
  }
}
