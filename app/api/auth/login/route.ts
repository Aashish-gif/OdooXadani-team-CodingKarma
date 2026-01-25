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

<<<<<<< HEAD
        // Verify password - handle both plain text and hashed passwords
        let isValidPassword = false;
        
        // First try direct comparison (for plain text passwords)
        if (user.password === password) {
            isValidPassword = true;
        } else {
            // If that fails, try bcrypt comparison (for hashed passwords)
            try {
                isValidPassword = await comparePassword(password, user.password);
            } catch (error) {
                // If bcrypt fails, password is definitely invalid
                isValidPassword = false;
            }
        }
        
        if (!isValidPassword) {
=======
        // Verify password using bcrypt, with a plaintext fallback for seeded/demo users
        const isValidPassword = await comparePassword(password, user.password).catch(() => false);
        const isValidPlaintext = password === user.password;

        if (!isValidPassword && !isValidPlaintext) {
>>>>>>> 95fe15cc61cac0666a82a28cbd412c00b2566600
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
