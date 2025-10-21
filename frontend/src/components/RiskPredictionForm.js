import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { createRiskPrediction } from '../services/api';

const RiskPredictionForm = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patientId: 1, // Default patient ID
      temperature: '',
      humidity: '',
      pulse: '',
      dehydrationLevel: '',
      heatIndex: '',
      predictedProbability: '',
      predictedRiskLevel: '',
      notes: '',
    },
  });

  const createPredictionMutation = useMutation(createRiskPrediction, {
    onSuccess: (data) => {
      setPredictionResult(data);
      queryClient.invalidateQueries('recentPredictions');
    },
    onError: (error) => {
      console.error('Error creating prediction:', error);
    },
  });

  const onSubmit = (data) => {
    createPredictionMutation.mutate(data);
  };

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

  const getRiskLevelMessage = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH':
        return 'High risk of heatstroke. Take immediate precautions!';
      case 'MEDIUM':
        return 'Moderate risk. Monitor conditions and stay hydrated.';
      case 'LOW':
        return 'Low risk. Continue normal activities with basic precautions.';
      default:
        return 'Risk assessment completed.';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        HeatStroke Risk Prediction
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Enter the environmental and personal factors to assess heatstroke risk
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Environmental Factors */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Environmental Factors
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="temperature"
                    control={control}
                    rules={{ required: 'Temperature is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Temperature (°C)"
                        type="number"
                        fullWidth
                        error={!!errors.temperature}
                        helperText={errors.temperature?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="humidity"
                    control={control}
                    rules={{ required: 'Humidity is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Humidity (%)"
                        type="number"
                        fullWidth
                        error={!!errors.humidity}
                        helperText={errors.humidity?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Additional Factors */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Additional Factors
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="pulse"
                    control={control}
                    rules={{ required: 'Pulse is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pulse (BPM)"
                        type="number"
                        fullWidth
                        error={!!errors.pulse}
                        helperText={errors.pulse?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dehydrationLevel"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dehydration Level (0-1)"
                        type="number"
                        step="0.1"
                        fullWidth
                        error={!!errors.dehydrationLevel}
                        helperText={errors.dehydrationLevel?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="heatIndex"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Heat Index"
                        type="number"
                        fullWidth
                        error={!!errors.heatIndex}
                        helperText={errors.heatIndex?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="predictedProbability"
                    control={control}
                    rules={{ required: 'Predicted probability is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Predicted Probability (0-1)"
                        type="number"
                        step="0.01"
                        fullWidth
                        error={!!errors.predictedProbability}
                        helperText={errors.predictedProbability?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="predictedRiskLevel"
                    control={control}
                    rules={{ required: 'Predicted risk level is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.predictedRiskLevel}>
                        <InputLabel>Predicted Risk Level</InputLabel>
                        <Select {...field} label="Predicted Risk Level">
                          <MenuItem value="LOW">Low</MenuItem>
                          <MenuItem value="MEDIUM">Medium</MenuItem>
                          <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notes"
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={createPredictionMutation.isLoading}
                      startIcon={
                        createPredictionMutation.isLoading ? (
                          <CircularProgress size={20} />
                        ) : null
                      }
                    >
                      {createPredictionMutation.isLoading
                        ? 'Analyzing...'
                        : 'Predict Risk'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        reset();
                        setPredictionResult(null);
                      }}
                    >
                      Reset Form
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Prediction Result */}
        <Grid item xs={12} md={4}>
          {predictionResult && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Prediction Result
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Chip
                    label={predictionResult.predictedRiskLevel}
                    color={getRiskLevelColor(predictionResult.predictedRiskLevel)}
                    size="large"
                    sx={{ mb: 2, fontSize: '1.1rem' }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {getRiskLevelMessage(predictionResult.predictedRiskLevel)}
                  </Typography>
                  {predictionResult.predictedProbability && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Probability: {Math.round(predictionResult.predictedProbability * 100)}%
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {createPredictionMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Error creating prediction. Please try again.
            </Alert>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tips for Heat Safety
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Stay hydrated with water or sports drinks</li>
                <li>Wear light, loose-fitting clothing</li>
                <li>Take breaks in shaded or air-conditioned areas</li>
                <li>Monitor for signs of heat exhaustion</li>
                <li>Avoid alcohol and caffeine in hot weather</li>
              </ul>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskPredictionForm;

