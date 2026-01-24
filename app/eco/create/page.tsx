'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '../../../components/AppLayout';
import { ECOCreate } from '../../../components/ECOCreate';
import { useAuth } from '../../../contexts/AuthContext';

export default function ECOCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentRole } = useAuth();
  const productId = searchParams.get('productId') || undefined;

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'eco-list':
        router.push('/eco');
        break;
      case 'eco-detail':
        router.push(`/eco/${page.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <AppLayout>
      <ECOCreate onNavigate={handleNavigate} productId={productId} role={currentRole} />
    </AppLayout>
  );
}
