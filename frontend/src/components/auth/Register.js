import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LocalHospital } from '@mui/icons-material';

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    // Remove confirmPassword from the data sent to API
    const { confirmPassword, ...userData } = data;

    const result = await register(userData);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in.' } 
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <LocalHospital color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              HeatStroke
            </Typography>
          </Box>
          
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            Create Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join the HeatStroke Risk Prediction System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  autoComplete="name"
                  autoFocus
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="USER">User</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
