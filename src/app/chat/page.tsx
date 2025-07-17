'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import ChatContent from '@/components/Chat/ChatContent';

export default function ChatPage() {
  return (
    <AuthProvider>
      <ChatContent />
    </AuthProvider>
  );
} 