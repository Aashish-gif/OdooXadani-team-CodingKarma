import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/jwtMiddleware';

export async function GET(request: NextRequest) {
  return withAuth(async (request, payload) => {
    try {
      // Use the user ID from the JWT payload instead of query param
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }
  })(request);
}

export async function PUT(request: NextRequest) {
  return withAuth(async (request, payload) => {
    try {
      const body = await request.json();
      
      console.log('Profile update request received:', body);
      
      // Use the user ID from the JWT payload instead of the request body
      // This ensures users can only update their own profiles
      const updatedUser = await prisma.user.update({
        where: { id: payload.userId }, // Find user by authenticated user ID
        data: {
          name: body.name,
          email: body.email, // Allow email update if needed
          location: body.location,
          phone: body.phone,
          description: body.description,
          profilePicture: body.profilePicture,
        },
      });

      console.log('User updated successfully:', updatedUser.id);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }
  })(request);
}