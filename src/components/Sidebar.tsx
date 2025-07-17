'use client';

import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Button,
  Typography,
  IconButton,
  Avatar,
  Switch
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, extractNameFromEmail } from '@/utils/helpers';

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: string;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  onClearAll: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function Sidebar({ 
  sessions, 
  currentSession, 
  onSessionSelect, 
  onNewSession,
  onClearAll,
  isDarkMode,
  onThemeToggle
}: SidebarProps) {
  const { user } = useAuth();
  const userName = user?.email ? extractNameFromEmail(user.email) : 'User';
  const userInitials = user?.email ? getInitials(user.email) : 'U';

  return (
    <Box
      sx={{
        width: 300,
        height: '100vh',
        bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: `1px solid ${isDarkMode ? '#2D2D2D' : '#E2E8F0'}`
      }}
    >
      {/* Top Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ 
          color: isDarkMode ? '#fff' : '#1a1a1a', 
          mb: 2, 
          fontSize: '1rem',
          fontWeight: 600 
        }}>
          QueryMind
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={onNewSession}
            fullWidth
            sx={{
              bgcolor: '#6366F1',
              color: 'white',
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '1rem',
              '&:hover': {
                bgcolor: '#4F46E5',
              },
            }}
          >
            New chat
          </Button>
          <IconButton
            size="small"
            sx={{
              bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9',
              borderRadius: '0.75rem',
              color: isDarkMode ? '#9CA3AF' : '#64748B',
              '&:hover': {
                bgcolor: isDarkMode ? '#404040' : '#E2E8F0',
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Chat List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: isDarkMode ? '#9CA3AF' : '#64748B',
            px: 1,
            py: 1,
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          Your conversations
        </Typography>
        <List sx={{ mt: 1 }}>
          {sessions.map((session) => (
            <ListItem 
              key={session.id} 
              disablePadding 
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={session.id === currentSession}
                onClick={() => onSessionSelect(session.id)}
                sx={{
                  borderRadius: '1rem',
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9',
                    '&:hover': {
                      bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9',
                    },
                  },
                  '&:hover': {
                    bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9',
                  },
                }}
              >
                <ChatIcon sx={{ fontSize: 18, color: isDarkMode ? '#9CA3AF' : '#64748B', mr: 2 }} />
                <ListItemText 
                  primary={session.title}
                  sx={{
                    m: 0,
                    '& .MuiListItemText-primary': {
                      color: isDarkMode ? '#E5E7EB' : '#1a1a1a',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: `1px solid ${isDarkMode ? '#2D2D2D' : '#E2E8F0'}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                bgcolor: '#6366F1',
                fontSize: '0.875rem',
              }}
            >
              {userInitials}
            </Avatar>
            <Typography 
              sx={{
                fontSize: '0.875rem',
                color: isDarkMode ? '#E5E7EB' : '#1a1a1a',
                fontWeight: 400,
              }}
            >
              {userName}
            </Typography>
          </Box>
          <IconButton 
            onClick={onThemeToggle}
            sx={{ 
              color: isDarkMode ? '#9CA3AF' : '#64748B',
              '&:hover': {
                bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9',
              }
            }}
          >
            {isDarkMode ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
} 