import { prisma } from './prisma'

export type NotificationInput = {
  type: string
  message: string
  entityType?: string
  entityId?: string
  link?: string
}

export async function notifyUsers(userIds: string[], notification: NotificationInput) {
  if (!userIds.length) return

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      isUnread: true,
      type: notification.type,
      message: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityId,
      link: notification.link,
    })),
  })
}

export async function notifyAllActiveUsers(notification: NotificationInput) {
  const users = await prisma.user.findMany({
    where: { status: 'Active' },
    select: { id: true },
  })

  if (!users.length) return

  await notifyUsers(
    users.map((u) => u.id),
    notification,
  )
}

export async function getOrCreateUserByEmail(email: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing

  const fallbackName = name || email.split('@')[0] || 'User'

  return prisma.user.create({
    data: {
      name: fallbackName,
      email,
      password: 'changeme',
      role: 'Engineer',
      status: 'Active',
    },
  })
}
