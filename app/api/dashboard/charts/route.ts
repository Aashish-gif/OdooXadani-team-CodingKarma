import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // ECO Status Distribution
        const ecoStatusGroups = await prisma.eCO.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });

        const ecoStatusData = ecoStatusGroups.map((g: { status: string; _count: { status: number } }) => ({
            name: g.status,
            value: g._count.status,
        }));

        // Product Categories
        const productCategoryGroups = await prisma.product.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
        });

        const productCategoryData = productCategoryGroups.map((g: { category: string; _count: { category: number } }) => ({
            category: g.category,
            count: g._count.category,
        }));

        // ECO Trend (last 6 months, created vs. approved vs. rejected)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // include current month + previous 5

        const recentECOs = await prisma.eCO.findMany({
            where: { createdAt: { gte: sixMonthsAgo } },
            select: { createdAt: true, updatedAt: true, status: true },
        });

        // Build month buckets
        const buckets: Record<string, { month: string; created: number; approved: number; rejected: number }> = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            d.setDate(1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            buckets[key] = {
                month: d.toLocaleString('en', { month: 'short' }),
                created: 0,
                approved: 0,
                rejected: 0,
            };
        }

        const getKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

        recentECOs.forEach((eco: { createdAt: Date; updatedAt: Date | null; status: string }) => {
            const createdKey = getKey(new Date(eco.createdAt));
            if (buckets[createdKey]) {
                buckets[createdKey].created += 1;
            }

            const statusLower = eco.status.toLowerCase();
            const statusKeyDate = new Date(eco.updatedAt || eco.createdAt);
            const statusKey = getKey(statusKeyDate);

            if (buckets[statusKey]) {
                if (statusLower.includes('approve')) {
                    buckets[statusKey].approved += 1;
                } else if (statusLower.includes('reject')) {
                    buckets[statusKey].rejected += 1;
                }
            }
        });

        const ecoTrendData = Object.values(buckets);

        return NextResponse.json({
            ecoStatusData,
            productCategoryData,
            ecoTrendData,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
    }
}
