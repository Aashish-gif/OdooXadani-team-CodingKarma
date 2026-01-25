import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyAllActiveUsers } from '@/lib/notifications'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const stage = searchParams.get('stage');
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        const where: any = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { ecoId: { contains: search, mode: 'insensitive' } },
                { product: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (stage && stage !== 'all') where.stage = stage;
        if (type && type !== 'all') where.type = type;
        if (status && status !== 'all') where.status = status;

        const ecos = await prisma.eCO.findMany({
            where,
            include: {
                product: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        const formattedECOs = ecos.map(eco => ({
            id: eco.ecoId,
            title: eco.title,
            type: eco.type,
            product: eco.product.name,
            stage: eco.stage,
            effectiveDate: eco.effectiveDate.toISOString().split('T')[0],
            status: eco.status,
        }))

        return NextResponse.json(formattedECOs)
    } catch (error) {
        console.error('Error fetching ECOs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch ECOs' },
            { status: 500 },
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const eco = await prisma.eCO.create({
            data: {
                ecoId: body.ecoId,
                title: body.title,
                type: body.type,
                status: body.status && typeof body.status === 'string' ? body.status : 'Draft',
                stage: body.status === 'Pending Approval' ? 'Approval' : 'Draft',
                currentVersion: body.currentVersion,
                proposedVersion: body.proposedVersion,
                effectiveDate: new Date(body.effectiveDate),
                createdBy: body.createdBy,
                description: body.description,
                productId: body.productId,
                changes: {
                    create: body.changes?.map((c: any) => ({
                        component: c.component,
                        field: c.field,
                        oldValue: c.oldValue,
                        newValue: c.newValue,
                        highlight: c.highlight,
                    })),
                },
            },
            include: {
                product: {
                    select: { productId: true, name: true },
                },
            },
        })

        if (eco.stage === 'Approval' || eco.status === 'Pending Approval') {
            const productLabel = eco.product ? `${eco.product.productId} (${eco.product.name})` : 'product'

            await notifyAllActiveUsers({
                type: 'eco.approval',
                message: `ECO ${eco.ecoId} for ${productLabel} awaits approval`,
                entityType: 'eco',
                entityId: eco.ecoId,
                link: `/eco/${eco.ecoId}`,
            })
        }

        return NextResponse.json(eco, { status: 201 })
    } catch (error) {
        console.error('Error creating ECO:', error)
        return NextResponse.json(
            { error: 'Failed to create ECO' },
            { status: 500 },
        )
    }
}
