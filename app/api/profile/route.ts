import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the authenticated session/token
    // For now, we'll simulate getting the current user's profile
    const url = new URL(request.url);
    const userId = url.searchParams.get('id'); // This would come from auth in production
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Profile update request received:', body);
    
    // In a real app, you'd get the user ID from the authenticated session/token
    // For now, we'll simulate updating a specific user based on ID in the request body
    // This is a temporary solution for demo purposes
    if (!body.id) {
      console.error('User ID is required to identify user');
      return NextResponse.json({ error: 'User ID is required to identify user' }, { status: 400 });
    }

    // Only allow updating specific profile fields
    const updatedUser = await prisma.user.update({
      where: { id: body.id }, // Find user by ID
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
}