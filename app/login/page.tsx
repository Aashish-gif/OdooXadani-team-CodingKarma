'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from '../../components/LoginPage';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = (role: any, userData: any) => {
    login(role, userData);
    router.push('/dashboard');
  };

  return <LoginPage onLogin={handleLogin} />;
}
