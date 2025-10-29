import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getRecentPredictions, getAllPredictions, getPredictionStatistics } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
      {trend && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {trend}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // Fetch recent predictions for display (limited to 5)
  const { data: recentPredictions, isLoading: isLoadingRecent, error: recentError } = useQuery(
    ['dashboardRecentPredictions', currentUser?.roleType, currentUser?.id],
    () => {
      // Use admin endpoint if user is admin, otherwise use user-specific endpoint
      if (currentUser?.roleType === 'ADMIN') {
        return getAllPredictions(0, 5);
      } else {
        return getRecentPredictions(currentUser?.id || 1);
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!currentUser, // Only run query when user is available
    }
  );

  // Fetch statistics from ALL predictions for accurate counts
  const { data: statistics, isLoading: isLoadingStats, error: statsError } = useQuery(
    ['dashboardStatistics', currentUser?.roleType],
    () => {
      // Only fetch statistics for admin users (non-admin users see their own stats via getRecentPredictions)
      if (currentUser?.roleType === 'ADMIN') {
        return getPredictionStatistics();
      } else {
        // For non-admin, we'll calculate from recent predictions data
        return null;
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!currentUser && currentUser?.roleType === 'ADMIN',
    }
  );

  const error = recentError || statsError;
  const isLoading = isLoadingRecent || (currentUser?.roleType === 'ADMIN' && isLoadingStats);

  // Use statistics for admin, or fallback to recentPredictions for non-admin
  const statsData = currentUser?.roleType === 'ADMIN' ? statistics : recentPredictions;

  const stats = [
    {
      title: 'Total Predictions',
      value: statsData?.total || recentPredictions?.total || 0,
      icon: <Assessment color="primary" />,
      color: 'primary.main',
    },
    {
      title: 'High Risk Cases',
      value: statsData?.highRiskCount || recentPredictions?.highRiskCount || recentPredictions?.highRisk || 0,
      icon: <Warning color="error" />,
      color: 'error.main',
    },
    {
      title: 'Medium Risk Cases',
      value: statsData?.mediumRiskCount || recentPredictions?.mediumRiskCount || 0,
      icon: <Warning color="warning" />,
      color: 'warning.main',
    },
    {
      title: 'Low Risk Cases',
      value: statsData?.lowRiskCount || recentPredictions?.lowRiskCount || recentPredictions?.lowRisk || 0,
      icon: <CheckCircle color="success" />,
      color: 'success.main',
    },
  ];

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

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          HeatStroke Risk Prediction Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Monitor and analyze heatstroke risk predictions in real-time
        </Typography>
        <Typography color="error" sx={{ mb: 2 }}>
          Error loading dashboard data: {error.message}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        HeatStroke Risk Prediction Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor and analyze heatstroke risk predictions in real-time
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Predictions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Loading recent predictions...</Typography>
              </Box>
            ) : recentPredictions?.predictions?.length > 0 ? (
              <Box>
                {recentPredictions.predictions.slice(0, 5).map((prediction, index) => (
                  <Box
                    key={prediction.id || index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < 4 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        Prediction #{prediction.id}
                        {currentUser?.roleType === 'ADMIN' && prediction.userId && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            (User #{prediction.userId})
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(prediction.assessmentTimestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={prediction.predictedRiskLevel}
                      color={getRiskLevelColor(prediction.predictedRiskLevel)}
                      size="small"
                    />
                  </Box>
                ))}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/history')}
                    fullWidth
                  >
                    View All Predictions
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">
                No predictions available
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/predict')}
                sx={{ py: 1.5 }}
              >
                New Risk Prediction
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/history')}
                sx={{ py: 1.5 }}
              >
                View History
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

