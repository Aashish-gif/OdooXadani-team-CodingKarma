import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyAllActiveUsers } from '@/lib/notifications'

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
        const params = await context.params
        const body = await request.json()

        const existing = await prisma.eCO.findUnique({
            where: { ecoId: params.id },
            include: {
                product: {
                    select: { productId: true, name: true },
                },
            },
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'ECO not found' },
                { status: 404 },
            )
        }

        const eco = await prisma.eCO.update({
            where: { ecoId: params.id },
            data: body,
        })

        const nextStage = body.stage || existing.stage
        const nextStatus = body.status || existing.status
        const stageChanged = body.stage && body.stage !== existing.stage
        const statusChanged = body.status && body.status !== existing.status

        if (stageChanged || statusChanged) {
            let type: string | null = null

            if (nextStage === 'Approval' || nextStatus === 'Pending Approval') {
                type = 'eco.approval'
            } else if (nextStage === 'Implementation' || (nextStatus && nextStatus.includes('Implementation'))) {
                type = 'eco.implementation'
            } else if (nextStage === 'Completed' || nextStatus === 'Completed') {
                type = 'eco.completed'
            }

            if (type) {
                const productLabel = existing.product
                    ? `${existing.product.productId} (${existing.product.name})`
                    : 'product'

                await notifyAllActiveUsers({
                    type,
                    message: `ECO ${existing.ecoId} for ${productLabel} moved to ${nextStage || nextStatus}`,
                    entityType: 'eco',
                    entityId: existing.ecoId,
                    link: `/eco/${existing.ecoId}`,
                })
            }
        }

        return NextResponse.json(eco)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update ECO' },
            { status: 500 },
        )
    }
}
