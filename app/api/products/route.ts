import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyAllActiveUsers } from '@/lib/notifications'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { productId: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 },
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.sku || !body.productId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                productId: body.productId,
                name: body.name,
                category: body.category,
                sku: body.sku,
                salePrice: body.salePrice,
                costPrice: body.costPrice,
                description: body.description,
                manufacturer: body.manufacturer,
                versions: {
                    create: {
                        version: 'v1.0',
                        changes: 'Initial creation',
                    },
                },
            },
            include: {
                versions: true,
            },
        })

        await notifyAllActiveUsers({
            type: 'product.created',
            message: `Product ${product.productId} (${product.name}) added`,
            entityType: 'product',
            entityId: product.productId,
            link: `/products/${product.productId}`,
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 },
        )
    }
}
