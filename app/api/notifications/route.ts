import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUserByEmail } from '@/lib/notifications'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')
        const userEmail = searchParams.get('userEmail')
        const userName = searchParams.get('userName') || undefined

        let resolvedUserId = userId || undefined

        if (!resolvedUserId && userEmail) {
            const user = await getOrCreateUserByEmail(userEmail, userName)
            resolvedUserId = user.id
        }

        if (!resolvedUserId) {
            return NextResponse.json({ error: 'User identifier required' }, { status: 400 })
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: resolvedUserId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        const unreadCount = notifications.filter((n) => n.isUnread).length

        return NextResponse.json({ notifications, unreadCount, userId: resolvedUserId })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, notificationId, userId, userEmail, userName, message, type, entityType, entityId, link } = body

        let targetUserId = userId || undefined

        if (!targetUserId && userEmail) {
            const user = await getOrCreateUserByEmail(userEmail, userName)
            targetUserId = user.id
        }

        if (action === 'mark-read' && notificationId) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { isUnread: false },
            })
            return NextResponse.json({ success: true })
        }

        if (action === 'mark-all-read' && targetUserId) {
            await prisma.notification.updateMany({
                where: { userId: targetUserId },
                data: { isUnread: false },
            })
            return NextResponse.json({ success: true })
        }

        if (targetUserId && message && type) {
            const notification = await prisma.notification.create({
                data: {
                    userId: targetUserId,
                    message,
                    type,
                    entityType,
                    entityId,
                    link,
                    isUnread: true,
                },
            })
            return NextResponse.json(notification, { status: 201 })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to process notification' },
            { status: 500 }
        );
    }
}
