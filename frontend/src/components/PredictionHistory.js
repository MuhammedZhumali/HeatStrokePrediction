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
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { getPredictionHistory, getAllPredictions, getPredictionStatistics } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PredictionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user: currentUser } = useAuth();

  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['predictionHistory', page, rowsPerPage, searchTerm, currentUser?.roleType, currentUser?.id],
    () => {
      // Use admin endpoint if user is admin, otherwise use user-specific endpoint
      if (currentUser?.roleType === 'ADMIN') {
        return getAllPredictions(page, rowsPerPage);
      } else {
        return getPredictionHistory(page, rowsPerPage, searchTerm, currentUser?.id || 1);
      }
    },
    {
      keepPreviousData: true,
    }
  );

  // Fetch statistics from ALL predictions for accurate counts (admin only)
  const { data: statistics } = useQuery(
    ['predictionStatistics', currentUser?.roleType],
    () => {
      if (currentUser?.roleType === 'ADMIN') {
        return getPredictionStatistics();
      }
      return null;
    },
    {
      enabled: !!currentUser && currentUser?.roleType === 'ADMIN',
      keepPreviousData: true,
    }
  );

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDehydration = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return 'N/A';
    return numeric >= 0.5 ? 'Dehydrated' : 'Not dehydrated';
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Prediction History
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading prediction history. Please try again.
        </Alert>
        <Button variant="contained" onClick={handleRefresh}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Prediction History
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total: {historyData?.total || 0} predictions
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Cards */}
      {(historyData || statistics) && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  High Risk
                </Typography>
                <Typography variant="h4" color="error.main">
                  {(currentUser?.roleType === 'ADMIN' ? statistics?.highRiskCount : historyData?.highRiskCount) || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Medium Risk
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {(currentUser?.roleType === 'ADMIN' ? statistics?.mediumRiskCount : historyData?.mediumRiskCount) || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Low Risk
                </Typography>
                <Typography variant="h4" color="success.main">
                  {(currentUser?.roleType === 'ADMIN' ? statistics?.lowRiskCount : historyData?.lowRiskCount) || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Predictions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                {currentUser?.roleType === 'ADMIN' && <TableCell>User</TableCell>}
                <TableCell>Date</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Humidity</TableCell>
                <TableCell>Pulse</TableCell>
                <TableCell>Dehydration</TableCell>
                <TableCell>Heat Index</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={currentUser?.roleType === 'ADMIN' ? 10 : 9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading predictions...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : historyData?.predictions?.length > 0 ? (
                historyData.predictions.map((prediction) => (
                  <TableRow key={prediction.id} hover>
                    <TableCell>#{prediction.id}</TableCell>
                    {currentUser?.roleType === 'ADMIN' && (
                      <TableCell>User #{prediction.userId}</TableCell>
                    )}
                    <TableCell>
                      {format(new Date(prediction.assessmentTimestamp), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{prediction.temperature}°C</TableCell>
                    <TableCell>{prediction.humidity}%</TableCell>
                    <TableCell>{prediction.pulse}</TableCell>
                    <TableCell>{formatDehydration(prediction.dehydrationLevel)}</TableCell>
                    <TableCell>{prediction.heatIndex || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={prediction.predictedRiskLevel}
                        color={getRiskLevelColor(prediction.predictedRiskLevel)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" title="View Details">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={currentUser?.roleType === 'ADMIN' ? 10 : 9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No predictions found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {historyData && historyData.total > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {page * rowsPerPage + 1} to{' '}
              {Math.min((page + 1) * rowsPerPage, historyData.total)} of {historyData.total} entries
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= Math.ceil(historyData.total / rowsPerPage) - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PredictionHistory;

