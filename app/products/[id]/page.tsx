'use client';

import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '../../../components/AppLayout';
import { ProductDetail } from '../../../components/ProductDetail';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentRole } = useAuth();
  const productId = params.id as string;

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'products':
        router.push('/products');
        break;
      case 'bom-detail':
        router.push(`/bom/${page.id}`);
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
      <ProductDetail productId={productId} onNavigate={handleNavigate} role={currentRole} />
    </AppLayout>
  );
}
