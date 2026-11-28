import crypto from 'crypto';

const AUTH_SECRET = process.env.JWT_SECRET || 'careorbit-enterprise-auth-secret-2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || !password) return false;
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const derived = crypto.scryptSync(password, salt, 64);
    const originalBuf = Buffer.from(originalHash, 'hex');
    if (derived.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(derived, originalBuf);
  }
  return false;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  fullName: string;
  exp: number;
}

export function signToken(payload: Omit<AuthTokenPayload, 'exp'>, ttlHours = 24 * 7): string {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Date.now() + ttlHours * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string | undefined | null): AuthTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AuthTokenPayload;
    if (!decoded.exp || Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}
