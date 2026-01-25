'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '../../../components/AppLayout';
import { BoMCreate } from '../../../components/BoMCreate';

export default function BoMCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '';

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'bom-list':
        router.push('/bom');
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
      <BoMCreate onNavigate={handleNavigate} productId={productId} />
    </AppLayout>
  );
}
