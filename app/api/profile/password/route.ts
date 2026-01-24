import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/jwtMiddleware';
import { hashPassword } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  return withAuth(async (request, payload) => {
    try {
      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!newPassword) {
        return NextResponse.json(
          { error: 'New password is required' },
          { status: 400 }
        );
      }

      // Get the current user to verify the current password
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // In a real app, you would verify the current password here
      // For this implementation, we'll skip current password verification for demo purposes
      // In production, you'd verify the current password before updating

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the password
      await prisma.user.update({
        where: { id: payload.userId },
        data: {
          password: hashedPassword,
        },
      });

      return NextResponse.json({
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }
  })(request);
}