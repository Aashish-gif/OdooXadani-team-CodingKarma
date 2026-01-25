import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRefreshToken, generateAccessToken, JWTPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Validate refresh token
    const tokenPayload = await validateRefreshToken(refreshToken);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Find user to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (user.status !== 'Active') {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    // Generate new access token
    const newTokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const newAccessToken = generateAccessToken(newTokenPayload);

    return NextResponse.json({
      accessToken: newAccessToken,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Refresh token failed' },
      { status: 500 }
    );
  }
}