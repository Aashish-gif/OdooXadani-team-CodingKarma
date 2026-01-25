'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </AuthProvider>
  );
}
