'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { AuthContainer } from '@/components/Auth/AuthContainer';

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthContainer />
    </AuthProvider>
  );
} 