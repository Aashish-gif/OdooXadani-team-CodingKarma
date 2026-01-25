'use client';

import { useRouter } from 'next/navigation';
<<<<<<< HEAD

export default function Login() {
  const router = useRouter();
  
  // Redirect to the new llogin page
  if (typeof window !== 'undefined') {
    router.replace('/llogin');
=======
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from '../../components/LoginPage';

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();

  const handleLogin = async (userData: any) => {
    await login(userData);
    router.push('/dashboard');
  };

  if (!isReady) {
    return null;
  }

  if (isAuthenticated) {
    return null;
>>>>>>> 95fe15cc61cac0666a82a28cbd412c00b2566600
  }
  
  return null;
}
