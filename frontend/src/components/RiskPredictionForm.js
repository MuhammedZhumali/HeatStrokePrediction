import React, { useState, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { createRiskPrediction, getUsers } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RiskPredictionForm = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetch users for admin selection
  const { data: users, isLoading: usersLoading } = useQuery(
    'users',
    getUsers,
    {
      enabled: currentUser?.roleType === 'ADMIN', // Only fetch if admin
    }
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patientId: currentUser?.id || 1,
      temperature: '',
      humidity: '',
      pulse: '',
      dehydrationLevel: '',
      heatIndex: '',
      age: '',
      patientTemperature: '',
      sweating: '',
      hotDrySkin: '',
      notes: '',
    },
  });

  const watchedValues = watch();

  // Update selected user when patientId changes
  useEffect(() => {
    if (users && watchedValues.patientId) {
      const user = users.find(u => u.id === parseInt(watchedValues.patientId));
      setSelectedUser(user);
    }
  }, [watchedValues.patientId, users]);

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
                {/* User Selection (Admin only) */}
                {currentUser?.roleType === 'ADMIN' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Patient Selection
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="patientId"
                        control={control}
                        rules={{ required: 'Please select a patient' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.patientId}>
                            <InputLabel>Select Patient</InputLabel>
                            <Select {...field} label="Select Patient" disabled={usersLoading}>
                              {usersLoading ? (
                                <MenuItem disabled>Loading patients...</MenuItem>
                              ) : (
                                users?.map((user) => (
                                  <MenuItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    {selectedUser && (
                      <Grid item xs={12} sm={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Selected Patient Info
                          </Typography>
                          <Typography variant="body2">
                            <strong>Name:</strong> {selectedUser.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Gender:</strong> {selectedUser.gender === 'M' ? 'Male' : 'Female'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Weight:</strong> {selectedUser.weight ? `${selectedUser.weight} kg` : 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>BMI:</strong> {selectedUser.bmi ? selectedUser.bmi.toFixed(1) : 'N/A'}
                          </Typography>
                        </Card>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  </>
                )}

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

                {/* Additional Model Inputs */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Additional Factors (Optional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These factors help improve prediction accuracy. Leave empty to use default values.
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="age"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Age (years)"
                        type="number"
                        fullWidth
                        error={!!errors.age}
                        helperText={errors.age?.message || "Default: 30 years"}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="patientTemperature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Patient Temperature (°C)"
                        type="number"
                        step="0.1"
                        fullWidth
                        error={!!errors.patientTemperature}
                        helperText={errors.patientTemperature?.message || "Default: Environmental temp + 1°C"}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="sweating"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Sweating Level (0-1)"
                        type="number"
                        step="0.1"
                        fullWidth
                        error={!!errors.sweating}
                        helperText={errors.sweating?.message || "0 = No sweating, 1 = Normal sweating"}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="hotDrySkin"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Hot/Dry Skin (0-1)"
                        type="number"
                        step="0.1"
                        fullWidth
                        error={!!errors.hotDrySkin}
                        helperText={errors.hotDrySkin?.message || "0 = Normal skin, 1 = Hot/dry skin"}
                      />
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
                        ? 'Analyzing with AI Model...'
                        : 'Predict Risk with AI Model'}
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
                      Confidence: {Math.round(predictionResult.predictedProbability * 100)}%
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    🤖 AI Model Prediction
                  </Typography>
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
              🤖 AI Model Information
            </Typography>
            <Typography variant="body2" component="div" sx={{ mb: 2 }}>
              Our AI model analyzes multiple factors to predict heatstroke risk:
              <ul>
                <li>Environmental conditions (temperature, humidity)</li>
                <li>Patient characteristics (age, gender, BMI)</li>
                <li>Physiological factors (pulse, dehydration, skin condition)</li>
                <li>Heat index and patient temperature</li>
              </ul>
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Heat Safety Tips
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

