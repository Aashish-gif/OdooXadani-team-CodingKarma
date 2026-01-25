'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation';
import { Home, Package, Layers, FileEdit, BarChart3, Settings, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VoiceAssistant } from './VoiceAssistant';

interface NotificationItem {
  id: string
  type: string
  message: string
  entityType?: string | null
  entityId?: string | null
  link?: string | null
  isUnread: boolean
  createdAt: string
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isReady, currentRole, currentUser, setRole } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isReady, router]);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.email) return;

    setIsLoadingNotifications(true);
    try {
      const response = await fetch(
        `/api/notifications?userEmail=${encodeURIComponent(currentUser.email)}&userName=${encodeURIComponent(currentUser.name)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) return;

      const data = await response.json();
      const payload = Array.isArray(data) ? data : data.notifications;

      if (Array.isArray(payload)) {
        setNotifications(payload);
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [currentUser.email, currentUser.name]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated, isReady]);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Bills of Materials', icon: Layers, path: '/bom' },
    { name: 'ECOs', icon: FileEdit, path: '/eco' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllAsRead = async () => {
    if (!notifications.length) return;

    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'mark-all-read', userEmail: currentUser.email, userName: currentUser.name }),
    });

    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.isUnread) {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark-read', notificationId: notification.id }),
      });

      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isUnread: false } : n));
    }

    const destination = notification.link
      || (notification.entityType === 'product' && notification.entityId ? `/products/${notification.entityId}` : null)
      || (notification.entityType === 'eco' && notification.entityId ? `/eco/${notification.entityId}` : null)
      || (notification.type.toLowerCase().includes('eco') ? '/eco' : '/products');

    router.push(destination);
    setShowNotifications(false);
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: string[] = [];

    if (segments[0] === 'dashboard') {
      breadcrumbs.push('Dashboard');
    } else if (segments[0] === 'products') {
      breadcrumbs.push('Products');
      if (segments[1]) breadcrumbs.push(`Product ${segments[1]}`);
    } else if (segments[0] === 'bom') {
      breadcrumbs.push('Bills of Materials');
      if (segments[1]) breadcrumbs.push(`BoM ${segments[1]}`);
    } else if (segments[0] === 'eco') {
      breadcrumbs.push('ECOs');
      if (segments[1] === 'create') breadcrumbs.push('Create ECO');
      else if (segments[1]) breadcrumbs.push(`ECO-${segments[1]}`);
    } else if (segments[0] === 'reports') {
      breadcrumbs.push('Reports');
    } else if (segments[0] === 'settings') {
      breadcrumbs.push('Settings');
    } else if (segments[0] === 'profile') {
      breadcrumbs.push('Profile');
    }

    return breadcrumbs.length > 0 ? breadcrumbs : ['Dashboard'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-semibold">ECOSetu</h1>
          <p className="text-sm text-slate-400 mt-1">Enterprise Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.path);

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    <span className={index === breadcrumbs.length - 1 ? 'text-slate-900 font-medium' : ''}>
                      {crumb}
                    </span>
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">{breadcrumbs[breadcrumbs.length - 1]}</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      <div className="flex items-center gap-3">
                        {isLoadingNotifications && (
                          <span className="text-xs text-slate-500">Refreshing...</span>
                        )}
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${notification.isUnread ? 'bg-blue-50/50' : ''
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-blue-600">
                                    {notification.type}
                                  </span>
                                  {notification.isUnread && (
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-900 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-slate-200 text-center text-xs text-slate-500">
                      You are up to date
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right mr-3">
                  <div className="text-sm font-medium text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentRole}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
      <VoiceAssistant />
    </div>
  );
}
