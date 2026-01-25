import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/jwtMiddleware';
import { hashPassword, comparePassword } from '@/lib/auth';

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

      // Verify the current password
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        );
      }
      
      // Compare the provided current password with the stored password
      // Handle both plain text and hashed passwords
      let isValidCurrentPassword = false;
      
      // First try direct comparison (for plain text passwords)
      if (user.password === currentPassword) {
        isValidCurrentPassword = true;
      } else {
        // If that fails, try bcrypt comparison (for hashed passwords)
      try {
        isValidCurrentPassword = await comparePassword(currentPassword, user.password);
      } catch (error) {
        // If bcrypt fails, password is definitely invalid
        isValidCurrentPassword = false;
      }
      }
      
      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

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