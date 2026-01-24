'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from '../../components/LoginPage';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();

  const handleLogin = async (userData: any) => {
    await login(userData);
    router.push('/dashboard');
  };

  if (isReady && isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  return <LoginPage onLogin={handleLogin} />;
}
