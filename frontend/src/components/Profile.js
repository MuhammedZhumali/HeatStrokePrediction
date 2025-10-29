import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Height,
  MonitorWeight,
  Wc,
  Calculate,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getProfileByEmail, getProfileById, updateOwnProfile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gender: 'M',
    height: '',
    weight: '',
    bmi: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user profile
  const { data: profileData, isLoading, error } = useQuery(
    ['userProfile', currentUser?.id, currentUser?.email],
    () => {
      if (currentUser?.id) {
        return getProfileById(currentUser.id);
      } else if (currentUser?.email) {
        return getProfileByEmail(currentUser.email);
      }
      return Promise.resolve(null);
    },
    {
      enabled: !!currentUser,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || 'M',
            height: data.height ? parseFloat(data.height) : '',
            weight: data.weight ? parseFloat(data.weight) : '',
            bmi: data.bmi ? parseFloat(data.bmi).toFixed(2) : '',
          });
        }
      },
    }
  );

  // Update profile mutation
  const updateMutation = useMutation(
    (updatedData) => updateOwnProfile(currentUser?.id, updatedData),
    {
      onSuccess: (data) => {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        queryClient.invalidateQueries(['userProfile']);
        
        // Update AuthContext if name or email changed
        if (currentUser) {
          // Note: You might want to update AuthContext here if needed
        }
        
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        setErrors({ submit: error.response?.data?.message || 'Failed to update profile' });
      },
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Calculate BMI if height or weight changes
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? parseFloat(value) || 0 : formData.height || 0;
      const weight = name === 'weight' ? parseFloat(value) || 0 : formData.weight || 0;
      
      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        setFormData((prev) => ({
          ...prev,
          bmi: bmi.toFixed(2),
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.height && (formData.height < 50 || formData.height > 250)) {
      newErrors.height = 'Height must be between 50 and 250 cm';
    }
    
    if (formData.weight && (formData.weight < 20 || formData.weight > 300)) {
      newErrors.weight = 'Weight must be between 20 and 300 kg';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    updateMutation.mutate({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber || null,
      gender: formData.gender,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
    });
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        gender: profileData.gender || 'M',
        height: profileData.height ? parseFloat(profileData.height) : '',
        weight: profileData.weight ? parseFloat(profileData.weight) : '',
        bmi: profileData.bmi ? parseFloat(profileData.bmi).toFixed(2) : '',
      });
    }
    setIsEditing(false);
    setErrors({});
    setSuccessMessage('');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading profile. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrors({ submit: null })}>
          {errors.submit}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
              <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: 48 }}>
                {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {profileData?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData?.email || ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData?.roleType || 'PATIENT'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Personal Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Wc sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </TextField>
              </Grid>

              <Divider sx={{ width: '100%', my: 2 }} />

              <Typography variant="h6" gutterBottom sx={{ width: '100%', mt: 2 }}>
                Physical Information
              </Typography>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.height}
                  helperText={errors.height || 'Enter height in centimeters'}
                  InputProps={{
                    startAdornment: <Height sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  error={!!errors.weight}
                  helperText={errors.weight || 'Enter weight in kilograms'}
                  InputProps={{
                    startAdornment: <MonitorWeight sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="BMI"
                  name="bmi"
                  value={formData.bmi}
                  disabled
                  InputProps={{
                    startAdornment: <Calculate sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="BMI is automatically calculated from height and weight"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;

