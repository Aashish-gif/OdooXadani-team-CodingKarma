'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/AppLayout';
import { ECOList } from '../../components/ECOList';
import { useAuth } from '../../contexts/AuthContext';

export default function ECOPage() {
  const router = useRouter();
  const { currentRole } = useAuth();

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'eco-detail':
        router.push(`/eco/${page.id}`);
        break;
      case 'eco-create':
        router.push(page.productId ? `/eco/create?productId=${page.productId}` : '/eco/create');
        break;
      default:
        break;
    }
  };

  return (
    <AppLayout>
      <ECOList onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
