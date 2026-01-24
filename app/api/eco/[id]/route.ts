import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Note: Next.js 15+ passes params as a Promise
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const eco = await prisma.eCO.findUnique({
            where: { ecoId: params.id },
            include: {
                product: true,
                changes: true,
                approvals: true,
                auditLog: {
                    orderBy: { date: 'desc' }
                }
            },
        });

        if (!eco) {
            return NextResponse.json(
                { error: 'ECO not found' },
                { status: 404 }
            );
        }

        const formattedECO = {
            ...eco,
            product: eco.product.name,
            productId: eco.product.productId,
            createdDate: eco.createdAt.toISOString().split('T')[0],
            effectiveDate: eco.effectiveDate.toISOString().split('T')[0],
            proposedChanges: {
                type: eco.type.toLowerCase(),
                changes: eco.changes
            }
        };

        return NextResponse.json(formattedECO);
    } catch (error) {
        console.error('Error fetching ECO:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ECO' },
            { status: 500 }
        );
    }
}

// Note: Next.js 15+ passes params as a Promise
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const body = await request.json();
        const eco = await prisma.eCO.update({
            where: { ecoId: params.id },
            data: body,
        });

        return NextResponse.json(eco);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update ECO' },
            { status: 500 }
        );
    }
}
