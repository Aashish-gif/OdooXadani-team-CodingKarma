'use client';

import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '../../../components/AppLayout';
import { ECODetail } from '../../../components/ECODetail';
import { useAuth } from '../../../contexts/AuthContext';

export default function ECODetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentRole } = useAuth();
  const ecoId = params.id as string;

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'eco-list':
        router.push('/eco');
        break;
      case 'product-detail':
        router.push(`/products/${page.id}`);
        break;
      case 'bom-detail':
        router.push(`/bom/${page.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <AppLayout>
      <ECODetail ecoId={ecoId} onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
