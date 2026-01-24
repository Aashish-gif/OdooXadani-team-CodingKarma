import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Note: Next.js 15+ passes params as a Promise
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const bom = await prisma.boM.findUnique({
            where: { bomId: params.id },
            include: {
                product: true,
                components: true,
                operations: true,
            },
        });

        if (!bom) {
            return NextResponse.json(
                { error: 'BoM not found' },
                { status: 404 }
            );
        }

        // Transform to match frontend expected format if needed
        const formattedBoM = {
            ...bom,
            productName: bom.product.name,
            productId: bom.product.productId,
        };

        return NextResponse.json(formattedBoM);
    } catch (error) {
        console.error('Error fetching BoM:', error);
        return NextResponse.json(
            { error: 'Failed to fetch BoM' },
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
        const bom = await prisma.boM.update({
            where: { bomId: params.id },
            data: {
                status: body.status,
                version: body.version,
                componentsCount: body.components?.length,
                // For complex updates usually use a transaction or specific logic for nested updates
                // Here simplified
            },
        });

        return NextResponse.json(bom);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update BoM' },
            { status: 500 }
        );
    }
}
