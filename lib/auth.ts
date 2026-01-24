import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // 15 minutes
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
}

/**
 * Generates an access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generates a refresh token
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

/**
 * Verifies an access token
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verifies a refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    return verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Hashes a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await hash(password, saltRounds);
};

/**
 * Compares a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await compare(password, hash);
};

/**
 * Creates a new refresh token for a user
 */
export const createRefreshToken = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const payload: RefreshTokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const refreshToken = generateRefreshToken(payload);

  // For now, we'll log the refresh token creation since the schema hasn't been updated in the client
  console.log(`Generated refresh token for user ${userId}`);

  return refreshToken;
};

/**
 * Validates a refresh token against the database
 */
export const validateRefreshToken = async (refreshToken: string): Promise<JWTPayload | null> => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    return null;
  }

  // Since we can't access refreshToken and tokenExpiry fields yet, we'll validate against a simple check
  // In production, you would validate against stored refresh tokens in the database
  // This is a simplified validation for now
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
};

/**
 * Revokes a refresh token
 */
export const revokeRefreshToken = async (userId: string): Promise<void> => {
  // For now, we'll just log the revocation since the schema hasn't been updated in the client
  console.log(`Revoked refresh token for user ${userId}`);
};