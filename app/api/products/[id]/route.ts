import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyAllActiveUsers } from '@/lib/notifications'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        console.log('[API] Searching for product with ID:', params.id);
        
        const product = await prisma.product.findUnique({
            where: { productId: params.id },
            include: {
                versions: {
                    orderBy: { date: 'desc' },
                },
                boms: true,
                ecos: true,
            },
        });

        console.log('[API] Product found by productId:', product ? 'YES' : 'NO');

        if (!product) {
            // Fallback to internal ID if not found
            console.log('[API] Trying fallback with internal id');
            const productById = await prisma.product.findUnique({
                where: { id: params.id },
                include: {
                    versions: {
                        orderBy: { date: 'desc' },
                    },
                    boms: true,
                    ecos: true,
                },
            });

            console.log('[API] Product found by id:', productById ? 'YES' : 'NO');

            if (!productById) {
                console.log('[API] Product not found - returning 404');
                return NextResponse.json(
                    { error: 'Product not found' },
                    { status: 404 }
                );
            }
            console.log('[API] Returning product from fallback');
            return NextResponse.json(productById);
        }

        console.log('[API] Returning product from first query');
        return NextResponse.json(product);
    } catch (error) {
        console.error('[API] Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params
    try {
        const body = await request.json()

        const existing = await prisma.product.findUnique({
            where: { productId: params.id },
            select: { id: true, productId: true, name: true, currentVersion: true },
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 },
            )
        }

        const product = await prisma.product.update({
            where: { productId: params.id },
            data: body,
        })

        const versionChanged = body.currentVersion && body.currentVersion !== existing.currentVersion

        if (versionChanged) {
            await prisma.productVersion.create({
                data: {
                    productId: existing.id,
                    version: body.currentVersion,
                    changes: body.versionChanges || body.description || 'Version updated',
                },
            })

            await notifyAllActiveUsers({
                type: 'product.version',
                message: `Product ${existing.productId} updated to ${body.currentVersion}`,
                entityType: 'product',
                entityId: existing.productId,
                link: `/products/${existing.productId}`,
            })
        }

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 },
        )
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        await prisma.product.delete({
            where: { productId: params.id },
        });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
