'use client';

import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '../../../components/AppLayout';
import { BoMDetail } from '../../../components/BoMDetail';
import { useAuth } from '../../../contexts/AuthContext';

export default function BoMDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentRole } = useAuth();
  const bomId = params.id as string;

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'bom-list':
        router.push('/bom');
        break;
      case 'product-detail':
        router.push(`/products/${page.id}`);
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
      <BoMDetail bomId={bomId} onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
