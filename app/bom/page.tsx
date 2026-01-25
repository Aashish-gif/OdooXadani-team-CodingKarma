'use client';

import { useRouter } from 'next/navigation';
import { AppLayout } from '../../components/AppLayout';
import { BoMList } from '../../components/BoMList';

export default function BoMPage() {
  const router = useRouter();

  const handleNavigate = (page: any) => {
    switch (page.name) {
      case 'bom-create':
        router.push(page.productId ? `/bom/create?productId=${page.productId}` : '/bom/create');
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
      <BoMList onNavigate={handleNavigate} />
    </AppLayout>
  );
}
