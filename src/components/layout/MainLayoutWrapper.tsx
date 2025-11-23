'use client';

import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from './MainLayout';

interface MainLayoutWrapperProps {
  children: React.ReactNode;
}

export function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const { userRole } = useAuth();

  return (
    <MainLayout userRole={userRole || undefined}>
      {children}
    </MainLayout>
  );
}
