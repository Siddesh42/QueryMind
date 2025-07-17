'use client';

import { useState } from 'react';
import { Box, Container, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Login } from './Login';
import { SignUp } from './SignUp';

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  const handleSuccess = () => {
    router.push('/chat');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {isLogin ? (
            <Login onToggleAuth={toggleAuth} onSuccess={handleSuccess} />
          ) : (
            <SignUp onToggleAuth={toggleAuth} onSuccess={handleSuccess} />
          )}
        </Paper>
      </Container>
    </Box>
  );
} 