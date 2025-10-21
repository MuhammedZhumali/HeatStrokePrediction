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
import { getRecentPredictions } from '../services/api';

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
  
  const { data: recentPredictions, isLoading } = useQuery(
    'recentPredictions',
    getRecentPredictions,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const stats = [
    {
      title: 'Total Predictions',
      value: recentPredictions?.total || 0,
      icon: <Assessment color="primary" />,
      color: 'primary.main',
    },
    {
      title: 'High Risk Cases',
      value: recentPredictions?.highRisk || 0,
      icon: <Warning color="error" />,
      color: 'error.main',
    },
    {
      title: 'Low Risk Cases',
      value: recentPredictions?.lowRisk || 0,
      icon: <CheckCircle color="success" />,
      color: 'success.main',
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      icon: <TrendingUp color="info" />,
      color: 'info.main',
      trend: '+2.1% from last month',
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
              <Typography>Loading recent predictions...</Typography>
            ) : recentPredictions?.predictions?.length > 0 ? (
              <Box>
                {recentPredictions.predictions.slice(0, 5).map((prediction, index) => (
                  <Box
                    key={index}
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

