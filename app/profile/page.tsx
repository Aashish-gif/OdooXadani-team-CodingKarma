'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/AppLayout';
import { ProfilePage } from '../../components/ProfilePage';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { currentUser, currentRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppLayout>
      <ProfilePage user={currentUser} role={currentRole} onLogout={handleLogout} />
    </AppLayout>
  );
}
