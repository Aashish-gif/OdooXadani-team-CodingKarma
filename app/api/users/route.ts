import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        // Check if email query parameter is provided
        const email = request.nextUrl.searchParams.get('email');

        if (email) {
            console.log(`API: Fetching user for email: ${email}`);
            // Fetch single user by email
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    location: true,
                    phone: true,
                    profilePicture: true,
                },
            });

            if (!user) {
                console.log(`API: User not found for email: ${email}`);
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            console.log(`API: User found: ${user.email} with role ${user.role}`);
            return NextResponse.json(user);
        }

        // Fetch all users if no email parameter
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                location: true,
                phone: true,
                profilePicture: true,
                // Exclude password
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(users);
    } catch (error: any) {
        console.error('API Error in /api/users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.email || !body.password || !body.name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash the password before storing
        const hashedPassword = await hashPassword(body.password);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword, // Store hashed password
                role: body.role || 'Engineer',
                status: 'Active',
                location: body.location,
                phone: body.phone,
                description: body.description,
                profilePicture: body.profilePicture,
            },
        });

        // Send welcome email asynchronously (don't wait for it to complete)
        setTimeout(async () => {
            try {
                const emailSent = await sendWelcomeEmail(body.email, body.name, body.password);
                if (emailSent) {
                    console.log(`Welcome email sent to ${body.email}`);
                } else {
                    console.error(`Failed to send welcome email to ${body.email}`);
                }
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
            }
        }, 0); // Run in background to not delay the API response

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}