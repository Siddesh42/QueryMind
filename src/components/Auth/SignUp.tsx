'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

interface SignUpProps {
  onToggleAuth: () => void;
  onSuccess: () => void;
}

export function SignUp({ onToggleAuth, onSuccess }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      setSuccess(true);
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          Check Your Email
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          We've sent you an email with a link to confirm your account.
        </Typography>
        <Button
          variant="outlined"
          onClick={onToggleAuth}
          sx={{ 
            borderRadius: 2,
            py: 1.5,
            px: 4,
            borderColor: '#6366F1',
            color: '#6366F1',
            '&:hover': {
              borderColor: '#4F46E5',
              color: '#4F46E5',
            }
          }}
        >
          Back to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Create Account
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          autoComplete="new-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 4, 
            mb: 2,
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #DB2777 100%)',
            }
          }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onToggleAuth}
              sx={{ 
                textDecoration: 'none',
                color: '#6366F1',
                '&:hover': {
                  color: '#4F46E5'
                }
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
} 