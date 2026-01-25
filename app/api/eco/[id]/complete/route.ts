import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mark ECO as completed by any Approver
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const approverName: string = body.approverName || 'Approver';
    const comment: string | undefined = body.comment;

    const updated = await prisma.eCO.update({
      where: { ecoId: params.id },
      data: {
        status: 'Completed',
        stage: 'Completed',
        approvals: {
          create: {
            role: 'Approver',
            name: approverName,
            status: 'Completed',
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
    console.error('Error marking completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark completed' },
      { status: 500 }
    );
  }
}
