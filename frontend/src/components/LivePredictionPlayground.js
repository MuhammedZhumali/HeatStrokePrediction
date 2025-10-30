import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { createRiskPrediction, getProfileByEmail } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const LivePredictionPlayground = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    temperature: 36,
    humidity: 0.5,
    pulse: 80,
    dehydrationLevel: 0,
    heatIndex: 36,
    patientTemperature: '',
    sweating: '',
    hotDrySkin: '',
  });
  const [patientId, setPatientId] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const latestFormRef = useRef(form);
  const latestPatientIdRef = useRef('');

  const canSubmit = useMemo(() => {
    return form.temperature !== '' && form.humidity !== '' && form.pulse !== '' && patientId !== '';
  }, [form, patientId]);

  const riskColor = (risk) => {
    switch (risk) {
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

  const submitOnce = async () => {
    try {
      setError(null);
      const f = latestFormRef.current;
      const pid = latestPatientIdRef.current;
      const payload = {
        patientId: Number(pid),
        temperature: Number(f.temperature),
        humidity: Number(f.humidity),
        pulse: Number(f.pulse),
        dehydrationLevel: f.dehydrationLevel === '' ? null : Number(f.dehydrationLevel),
        heatIndex: f.heatIndex === '' ? null : Number(f.heatIndex),
        notes: 'Live playground auto-refresh',
      };
      if (f.patientTemperature !== '') payload.patientTemperature = Number(f.patientTemperature);
      if (f.sweating !== '') payload.sweating = Number(f.sweating);
      if (f.hotDrySkin !== '') payload.hotDrySkin = Number(f.hotDrySkin);
      const res = await createRiskPrediction(payload);
      setLastResult({
        id: res.id,
        predictedRiskLevel: res.predictedRiskLevel,
        predictedProbability: res.predictedProbability,
        at: new Date(),
      });
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to get prediction');
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    submitOnce();
    timerRef.current = setInterval(submitOnce, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    latestFormRef.current = form;
  }, [form]);

  useEffect(() => {
    latestPatientIdRef.current = patientId;
  }, [patientId]);

  useEffect(() => {
    const resolvePatientId = async () => {
      if (user?.id) {
        setPatientId(String(user.id));
        return;
      }
      if (user?.email) {
        try {
          const profile = await getProfileByEmail(user.email);
          if (profile?.id) setPatientId(String(profile.id));
        } catch {
          // allow manual entry if lookup fails
        }
      }
    };
    resolvePatientId();
  }, [user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggle = () => {
    setIsRunning((v) => !v);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Live Prediction Playground
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Patient ID"
              type="number"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              fullWidth
              helperText={patientId === '' ? 'Required' : ' '}
              error={patientId === ''}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Temperature (°C)"
              type="number"
              value={form.temperature}
              onChange={handleChange('temperature')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Humidity (%)"
              type="number"
              value={form.humidity}
              onChange={handleChange('humidity')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Pulse (BPM)"
              type="number"
              value={form.pulse}
              onChange={handleChange('pulse')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Dehydration (0-1)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 1 }}
              value={form.dehydrationLevel}
              onChange={handleChange('dehydrationLevel')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Heat Index"
              type="number"
              value={form.heatIndex}
              onChange={handleChange('heatIndex')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Patient Temperature (°C)"
              type="number"
              value={form.patientTemperature}
              onChange={handleChange('patientTemperature')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Sweating (0-1)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 1 }}
              value={form.sweating}
              onChange={handleChange('sweating')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Hot/Dry Skin (0-1)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 1 }}
              value={form.hotDrySkin}
              onChange={handleChange('hotDrySkin')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={9} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant={isRunning ? 'outlined' : 'contained'} onClick={toggle} disabled={!canSubmit}>
              {isRunning ? 'Stop' : 'Start live prediction'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {isRunning ? 'Auto-refreshing every 5 seconds' : 'Idle'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Current result
          </Typography>
          {lastResult ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={lastResult.predictedRiskLevel}
                color={riskColor(lastResult.predictedRiskLevel)}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary">
                {lastResult.predictedProbability ? `p≈${Number(lastResult.predictedProbability).toFixed(2)}` : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastResult.at.toLocaleTimeString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{lastResult.id}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No result yet. Click Start to begin.
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LivePredictionPlayground;


