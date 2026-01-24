import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const reportType = searchParams.get('type');
        const timePeriod = searchParams.get('timePeriod') || '6months';

        if (reportType === 'approval-time') {
            // Calculate average approval time per month
            const monthsBack = timePeriod === '3months' ? 3 : timePeriod === '1year' ? 12 : 6;
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - monthsBack);

            const ecos = await prisma.eCO.findMany({
                where: {
                    createdAt: { gte: startDate },
                    status: { in: ['Approved', 'Completed'] }
                },
                select: {
                    createdAt: true,
                    updatedAt: true,
                }
            });

            // Group by month and calculate average days
            const monthBuckets: Record<string, { total: number; count: number; month: string }> = {};
            
            for (let i = monthsBack - 1; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                monthBuckets[key] = {
                    month: d.toLocaleString('en', { month: 'short' }) + (monthsBack > 6 ? ` ${d.getFullYear().toString().slice(2)}` : ''),
                    total: 0,
                    count: 0
                };
            }

            ecos.forEach(eco => {
                const created = new Date(eco.createdAt);
                const updated = new Date(eco.updatedAt);
                const days = Math.max(0, Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
                
                const key = `${created.getFullYear()}-${created.getMonth()}`;
                if (monthBuckets[key]) {
                    monthBuckets[key].total += days;
                    monthBuckets[key].count += 1;
                }
            });

            const approvalTimeData = Object.values(monthBuckets).map(bucket => ({
                month: bucket.month,
                avgDays: bucket.count > 0 ? parseFloat((bucket.total / bucket.count).toFixed(1)) : 0
            }));

            return NextResponse.json(approvalTimeData);
        }

        if (reportType === 'eco') {
            const whereClause: any = {};
            
            // Apply time filter if not "all"
            if (timePeriod !== 'all') {
                const startDate = new Date();
                if (timePeriod === '1month') {
                    startDate.setMonth(startDate.getMonth() - 1);
                } else if (timePeriod === '3months') {
                    startDate.setMonth(startDate.getMonth() - 3);
                } else if (timePeriod === '6months') {
                    startDate.setMonth(startDate.getMonth() - 6);
                }
                whereClause.createdAt = { gte: startDate };
            }
            
            const data = await prisma.eCO.findMany({
                where: whereClause,
                include: { product: { select: { name: true } } },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(data);
        }

        if (reportType === 'product-version') {
            const whereClause: any = {};
            
            // Apply time filter if not "all"
            if (timePeriod !== 'all') {
                const startDate = new Date();
                if (timePeriod === '1month') {
                    startDate.setMonth(startDate.getMonth() - 1);
                } else if (timePeriod === '3months') {
                    startDate.setMonth(startDate.getMonth() - 3);
                } else if (timePeriod === '6months') {
                    startDate.setMonth(startDate.getMonth() - 6);
                }
                whereClause.date = { gte: startDate };
            }
            
            const data = await prisma.productVersion.findMany({
                where: whereClause,
                include: { product: { select: { name: true } } },
                orderBy: { date: 'desc' }
            });
            return NextResponse.json(data);
        }

        if (reportType === 'bom-changes') {
            const whereClause: any = {};
            
            // Apply time filter if not "all"
            if (timePeriod !== 'all') {
                const startDate = new Date();
                if (timePeriod === '1month') {
                    startDate.setMonth(startDate.getMonth() - 1);
                } else if (timePeriod === '3months') {
                    startDate.setMonth(startDate.getMonth() - 3);
                } else if (timePeriod === '6months') {
                    startDate.setMonth(startDate.getMonth() - 6);
                }
                whereClause.updatedAt = { gte: startDate };
            }
            
            const data = await prisma.boM.findMany({
                where: whereClause,
                include: { product: { select: { name: true } } },
                orderBy: { updatedAt: 'desc' },
                take: 100
            });
            return NextResponse.json(data);
        }

        if (reportType === 'archived') {
            const whereClause: any = { status: 'Archived' };
            
            // For archived products, we can filter by when they were archived (updatedAt)
            if (timePeriod !== 'all') {
                const startDate = new Date();
                if (timePeriod === '1month') {
                    startDate.setMonth(startDate.getMonth() - 1);
                } else if (timePeriod === '3months') {
                    startDate.setMonth(startDate.getMonth() - 3);
                } else if (timePeriod === '6months') {
                    startDate.setMonth(startDate.getMonth() - 6);
                }
                whereClause.updatedAt = { gte: startDate };
            }
            
            const data = await prisma.product.findMany({
                where: whereClause,
                include: { versions: { take: 1, orderBy: { date: 'desc' } } }
            });
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch report data' },
            { status: 500 }
        );
    }
}
