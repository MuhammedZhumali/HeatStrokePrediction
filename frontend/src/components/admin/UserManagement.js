import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Person,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gender: 'M',
    height: '',
    weight: '',
    role: 'PATIENT',
    password: '',
  });
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery('users', getUsers);

  const createUserMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      handleCloseDialog();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation(
    ({ id, userData }) => updateUser(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        handleCloseDialog();
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Failed to update user');
      },
    }
  );

  const deleteUserMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || 'M',
        height: user.height || '',
        weight: user.weight || '',
        role: user.roleType === 'ADMIN' ? 'ADMIN' : user.roleType === 'SUPPORT' ? 'SUPPORT' : 'PATIENT',
        password: '', // Don't show password when editing
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        gender: 'M',
        height: '',
        weight: '',
        role: 'PATIENT',
        password: '',
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      gender: 'M',
      height: '',
      weight: '',
      role: 'PATIENT',
      password: '',
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        userData: formData,
      });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (roleType) => {
    switch (roleType) {
      case 'ADMIN':
        return 'error';
      case 'PATIENT':
        return 'primary';
      case 'SUPPORT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (roleType) => {
    switch (roleType) {
      case 'ADMIN':
        return <AdminPanelSettings />;
      case 'PATIENT':
        return <Person />;
      case 'SUPPORT':
        return <Person />;
      default:
        return <Person />;
    }
  };

  if (fetchError) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading users. Please try again.
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      {users && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Administrators
                </Typography>
                <Typography variant="h4" color="error.main">
                  {users.filter(u => u.roleType === 'ADMIN').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Patients
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {users.filter(u => u.roleType === 'PATIENT').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Height</TableCell>
                <TableCell>Weight</TableCell>
                <TableCell>BMI</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : users?.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>#{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>{user.gender === 'M' ? 'Male' : 'Female'}</TableCell>
                    <TableCell>{user.height ? `${user.height} cm` : 'N/A'}</TableCell>
                    <TableCell>{user.weight ? `${user.weight} kg` : 'N/A'}</TableCell>
                    <TableCell>{user.bmi ? user.bmi.toFixed(1) : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.roleType)}
                        label={user.roleType}
                        color={getRoleColor(user.roleType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        title="Edit User"
                      >
                        <Edit />
                      </IconButton>
                      {user.id !== currentUser?.id && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            
            {!editingUser && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
                helperText="Default password will be used if not provided"
              />
            )}
            
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                label="Gender"
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Height (cm)"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="SUPPORT">Support</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
            >
              {createUserMutation.isLoading || updateUserMutation.isLoading
                ? 'Saving...'
                : editingUser
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
