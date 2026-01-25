import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateAccessToken, generateRefreshToken, createRefreshToken, JWTPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password using bcrypt
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        if (user.status !== 'Active') {
            return NextResponse.json(
                { error: 'Account is inactive' },
                { status: 403 }
            );
        }

        // Generate JWT tokens
        const tokenPayload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = await createRefreshToken(user.id);

        // Return user info with JWT tokens (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            ...userWithoutPassword,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
