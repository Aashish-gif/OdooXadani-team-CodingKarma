'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from '../../components/LoginPage';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isReady, isAuthenticated, router]);

  const handleLogin = (userData: any) => {
    login(userData);
    router.push('/dashboard');
  };

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginPage onLogin={handleLogin} />;
}
