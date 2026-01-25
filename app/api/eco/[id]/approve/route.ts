import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Approve an ECO: any ECO Manager can approve. Records approver name/role and comment.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const approverName: string = body.approverName || 'ECO Manager';
    const comment: string | undefined = body.comment;

    const updated = await prisma.eCO.update({
      where: { ecoId: params.id },
      data: {
        status: 'Approved',
        stage: 'Implementation',
        approvals: {
          create: {
            role: 'MCO Managnager',
            name: approverName,
            status: 'Approved',
            date: new Date(),
            comment: comment,
          },
        },
      },
      include: {
        product: true,
        changes: true,
        approvals: true,
        auditLog: {
          orderBy: { date: 'desc' },
        },
      },
    });

    // Align response shape with GET /api/eco/[id]
    const formatted = {
      ...updated,
      product: updated.product.name,
      productId: updated.product.productId,
      createdDate: updated.createdAt.toISOString().split('T')[0],
      effectiveDate: updated.effectiveDate.toISOString().split('T')[0],
      proposedChanges: {
        type: updated.type.toLowerCase(),
        changes: updated.changes,
      },
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error approving ECO:', error);
    return NextResponse.json(
      { error: 'Failed to approve ECO' },
      { status: 500 }
    );
  }
}
