const crypto = require('crypto');

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'hipsage-super-secret-key';

function generateId() {
  return crypto.randomUUID();
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, originalHash] = String(storedHash || '').split(':');
    if (!salt || !originalHash) {
      resolve(false);
      return;
    }

    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(derivedKey.toString('hex'), 'hex')));
    });
  });
}

function createToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [encodedPayload, signature] = String(token || '').split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.exp || payload.exp < Date.now()) return null;

    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateId,
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
};
