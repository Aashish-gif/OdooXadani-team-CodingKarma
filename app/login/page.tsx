'use client';

import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  
  // Redirect to the new llogin page
  if (typeof window !== 'undefined') {
    router.replace('/llogin');
  }
  
  return null;
}
