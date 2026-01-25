'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/AppLayout';
import { Dashboard } from '../../components/Dashboard';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { currentRole } = useAuth();

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'products':
        router.push('/products');
        break;
      case 'product-detail':
        router.push(`/products/${page.id}`);
        break;
      case 'bom-list':
        router.push('/bom');
        break;
      case 'bom-create':
        router.push(page.productId ? `/bom/create?productId=${page.productId}` : '/bom/create');
        break;
      case 'bom-detail':
        router.push(`/bom/${page.id}`);
        break;
      case 'eco-list':
        router.push('/eco');
        break;
      case 'eco-create':
        router.push(page.productId ? `/eco/create?productId=${page.productId}` : '/eco/create');
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
      <Dashboard onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
