'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/AppLayout';
import { ProductsList } from '../../components/ProductsList';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductsPage() {
  const router = useRouter();
  const { currentRole } = useAuth();

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'product-detail':
        router.push(`/products/${page.id}`);
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
      <ProductsList onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
