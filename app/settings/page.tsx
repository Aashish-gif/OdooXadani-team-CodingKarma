'use client';

import { AppLayout } from '../../components/AppLayout';
import { SettingsPage } from '../../components/SettingsPage';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { currentRole } = useAuth();

  return (
    <AppLayout>
      <SettingsPage role={currentRole} />
    </AppLayout>
  );
}
