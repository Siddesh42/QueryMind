'use client';

import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Chat } from '@/components/Chat';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

export default function ChatContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      title: 'New Chat',
      timestamp: new Date()
    }
  ]);
  const [currentSession, setCurrentSession] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const clearMessagesRef = useRef<() => void>();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    if (clearMessagesRef.current) {
      clearMessagesRef.current();
    }
  };

  const handleClearAll = () => {
    setSessions([{
      id: 'default',
      title: 'New Chat',
      timestamp: new Date()
    }]);
    setCurrentSession('default');
    if (clearMessagesRef.current) {
      clearMessagesRef.current();
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
    }}>
      <Sidebar
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={setCurrentSession}
        onNewSession={handleNewSession}
        onClearAll={handleClearAll}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
      <Chat 
        isDarkMode={isDarkMode} 
        onClear={(clearFn) => {
          clearMessagesRef.current = clearFn;
        }}
      />
    </Box>
  );
} 