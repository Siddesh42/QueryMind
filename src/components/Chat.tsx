'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { StreamingText } from './Chat/StreamingText';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isComplete?: boolean;
}

// Function to convert markdown-style formatting to JSX
const renderMessageContent = (content: string) => {
  // Split by headers first
  const parts = content.split(/(###\s.*$)/gm);
  
  return parts.map((part, index) => {
    // Handle headers
    if (part.startsWith('###')) {
      return (
        <Typography
          key={index}
          variant="h6"
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            mt: 2,
            mb: 1
          }}
        >
          {part.replace('###', '').trim()}
        </Typography>
      );
    }
    
    // Handle bold text
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return (
          <Box
            component="span"
            key={`${index}-${boldIndex}`}
            sx={{ fontWeight: 600 }}
          >
            {boldPart.slice(2, -2)}
          </Box>
        );
      }
      return boldPart;
    });
  });
};

interface ChatProps {
  isDarkMode: boolean;
  onClear?: () => void;
}

// Animated loading dots component
const LoadingDots = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="body1" sx={{ color: '#6366F1', fontWeight: 500 }}>
        loading
      </Typography>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component="span"
          sx={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            bgcolor: '#6366F1',
            animation: 'wave 1.5s infinite ease-in-out',
            animationDelay: `${i * 0.2}s`,
            '@keyframes wave': {
              '0%, 60%, 100%': {
                transform: 'translateY(0)',
              },
              '30%': {
                transform: 'translateY(-4px)',
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export function Chat({ isDarkMode, onClear }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [messageReactions, setMessageReactions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      setError('Failed to logout');
    }
    handleProfileClose();
  };

  // Handle copy message
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess('Message copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      setError('Failed to copy message');
    }
  };

  // Handle message reaction
  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: prev[messageId] === reaction ? null : reaction
    }));
  };

  // Handle regenerate response
  const handleRegenerate = async (messageId: string) => {
    // Find the message and its corresponding user message
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get the user message that triggered this response
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = messages[userMessageIndex];
    
    // Remove the old assistant message
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    // Create new assistant message
    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isComplete: false
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    try {
      // Prepare messages in OpenRouter format
      const messageHistory = messages
        .slice(0, userMessageIndex + 1)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messageHistory })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a moment before trying again.');
        }
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response stream');

      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        accumulatedContent += text;
        
        if (!isStreaming && accumulatedContent.length > 0) {
          setIsStreaming(true);
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      // Mark message as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isComplete: true }
          : msg
      ));

      setRetryCount(0);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI';
      setError(errorMessage);
      
      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Add a warning message if we're getting close to rate limits
  const getRateLimitWarning = () => {
    if (retryCount >= 2) {
      return "You're sending messages too quickly. Please wait a moment between messages.";
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isComplete: false
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    try {
      // Prepare messages in OpenRouter format
      const messageHistory = messages.concat(userMessage).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messageHistory })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit reached. Please wait a moment before trying again.');
        }
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response stream');

      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        accumulatedContent += text;
        
        if (!isStreaming && accumulatedContent.length > 0) {
          setIsStreaming(true);
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      // Mark message as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isComplete: true }
          : msg
      ));

      setRetryCount(0);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI';
      setError(errorMessage);
      
      if (errorMessage.includes('rate limit')) {
        setRetryCount(prev => prev + 1);
      }

      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Add clear messages handler
  const clearMessages = () => {
    setMessages([]);
    if (onClear) {
      onClear();
    }
  };

  // Expose clearMessages to parent
  useEffect(() => {
    if (onClear) {
      onClear = clearMessages;
    }
  }, [onClear]);

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
      ml: '300px',
      flex: 1,
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Clear conversation">
            <IconButton
              onClick={clearMessages}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography 
          sx={{ 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#ffffff',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          QueryMind
        </Typography>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleProfileClick}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar 
              sx={{ 
                width: 32,
                height: 32,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {user?.email ? getInitials(user.email) : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileClose}
            onClick={handleProfileClose}
            PaperProps={{
              sx: {
                bgcolor: isDarkMode ? '#2D2D2D' : '#ffffff',
                color: isDarkMode ? '#E5E7EB' : '#334155',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                mt: 1,
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Messages Container */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        py: 4,
        px: 4,
        bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: isDarkMode ? '#9CA3AF' : '#64748B'
          }}>
            <Typography variant="body1">
              Start a conversation by typing a message below
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: '1000px' }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  mb: 6,
                  display: 'flex',
                  gap: 3,
                  alignItems: 'flex-start',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  justifyContent: message.role === 'user' ? 'flex-start' : 'flex-start',
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: message.role === 'assistant' ? '#6366F1' : '#9333EA',
                    width: 28,
                    height: 28,
                    fontSize: '0.875rem'
                  }}
                >
                  {message.role === 'assistant' ? 'QM' : user?.email ? getInitials(user.email) : 'U'}
                </Avatar>
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  <Box sx={{
                    bgcolor: message.role === 'assistant' 
                      ? isDarkMode ? '#2D2D2D' : '#F1F5F9'
                      : 'transparent',
                    borderRadius: '1rem',
                    p: message.role === 'assistant' ? 2 : 0,
                    maxWidth: '80%',
                  }}>
                    {message.role === 'assistant' ? (
                      <>
                        {isLoading && !isStreaming && message.content === '' ? (
                          <LoadingDots />
                        ) : (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: isDarkMode ? '#E5E7EB' : '#334155',
                              lineHeight: 1.7,
                              whiteSpace: 'pre-wrap',
                              fontSize: '0.875rem',
                            }}
                          >
                            {renderMessageContent(message.content)}
                            {!message.isComplete && (
                              <span className="cursor" style={{ opacity: 0.7, marginLeft: 2 }}>▋</span>
                            )}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: isDarkMode ? '#E5E7EB' : '#334155',
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.875rem',
                        }}
                      >
                        {renderMessageContent(message.content)}
                      </Typography>
                    )}
                  </Box>
                  {message.role === 'assistant' && message.isComplete && (
                    <Box sx={{ 
                      mt: 2, 
                      display: 'flex', 
                      gap: 1,
                      alignItems: 'center'
                    }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleReaction(message.id, 'like')}
                        sx={{ 
                          color: messageReactions[message.id] === 'like' 
                            ? '#10B981' 
                            : isDarkMode ? '#9CA3AF' : '#94A3B8',
                          p: 0.5,
                          '&:hover': {
                            bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9'
                          }
                        }}
                      >
                        <ThumbUpIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleReaction(message.id, 'dislike')}
                        sx={{ 
                          color: messageReactions[message.id] === 'dislike' 
                            ? '#EF4444' 
                            : isDarkMode ? '#9CA3AF' : '#94A3B8',
                          p: 0.5,
                          '&:hover': {
                            bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9'
                          }
                        }}
                      >
                        <ThumbDownIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleCopyMessage(message.content)}
                        sx={{ 
                          color: isDarkMode ? '#9CA3AF' : '#94A3B8',
                          p: 0.5,
                          '&:hover': {
                            bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9'
                          }
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Box sx={{ flex: 1 }} />
                      <Button
                        size="small"
                        onClick={() => handleRegenerate(message.id)}
                        startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          color: isDarkMode ? '#9CA3AF' : '#94A3B8',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          '&:hover': {
                            bgcolor: isDarkMode ? '#2D2D2D' : '#F1F5F9'
                          }
                        }}
                      >
                        Regenerate
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Container */}
      <Box sx={{ 
        p: 4,
        borderTop: `1px solid ${isDarkMode ? '#2D2D2D' : '#E2E8F0'}`,
        bgcolor: isDarkMode ? '#1a1a1a' : '#ffffff',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '1000px',
            bgcolor: isDarkMode ? '#2D2D2D' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#404040' : '#E2E8F0'}`,
            borderRadius: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, p: 1.5 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="What's in your mind?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              multiline
              maxRows={4}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'transparent',
                  fontSize: '0.875rem',
                  color: isDarkMode ? '#E5E7EB' : '#334155',
                  '& fieldset': {
                    border: 'none'
                  },
                  '&:hover fieldset': {
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none'
                  },
                  '& input::placeholder': {
                    color: isDarkMode ? '#9CA3AF' : '#94A3B8'
                  }
                }
              }}
            />
            <IconButton 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{ 
                bgcolor: '#6366F1',
                color: 'white',
                width: 36,
                height: 36,
                borderRadius: '1rem',
                '&:hover': {
                  bgcolor: '#4F46E5',
                },
                '&.Mui-disabled': {
                  bgcolor: isDarkMode ? '#404040' : '#E2E8F0',
                  color: isDarkMode ? '#9CA3AF' : '#94A3B8',
                }
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Copy success message */}
      <Snackbar 
        open={!!copySuccess} 
        autoHideDuration={2000} 
        onClose={() => setCopySuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setCopySuccess(null)}
          sx={{
            bgcolor: isDarkMode ? '#2D2D2D' : '#ffffff',
            color: isDarkMode ? '#E5E7EB' : '#334155',
          }}
        >
          {copySuccess}
        </Alert>
      </Snackbar>

      {/* Error message */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{
            bgcolor: isDarkMode ? '#2D2D2D' : '#ffffff',
            color: isDarkMode ? '#E5E7EB' : '#334155',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 