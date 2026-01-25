import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        
        if (email) {
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
                    // Exclude password
                },
            });
            
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }
            
            return NextResponse.json(user);
        } else {
            // Fetch all users
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
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch users' },
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

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password, // Ideally hash this
                role: body.role || 'Engineer',
                status: 'Active',
                location: body.location,
                phone: body.phone,
                description: body.description,
                profilePicture: body.profilePicture,
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
