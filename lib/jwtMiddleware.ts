import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './auth';

export const verifyTokenFromHeader = (request: NextRequest): JWTPayload | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return verifyAccessToken(token);
};

export const withAuth = (handler: (req: NextRequest, payload: JWTPayload) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    const payload = verifyTokenFromHeader(request);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing token' },
        { status: 401 }
      );
    }

    return handler(request, payload);
  };
};