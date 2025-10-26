import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    
    // Add basic auth for admin requests
    if (config.url?.includes('/api/predictions') || config.url?.includes('/user/')) {
      // For now, use hardcoded admin credentials
      // In a real app, you'd get these from the logged-in user
      const adminCredentials = btoa('Muhalek:pass123');
      config.headers.Authorization = `Basic ${adminCredentials}`;
      console.log('Added Basic Auth for admin request');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Response error:', error);
    console.log('Error response:', error.response);
    return Promise.reject(error);
  }
);

// API endpoints
export const createRiskPrediction = async (predictionData) => {
  try {
    const response = await api.post('/api/predictions', predictionData);
    return response.data;
  } catch (error) {
    console.error('Error creating risk prediction:', error);
    throw error;
  }
};

export const getRecentPredictions = async (userId = 1) => {
  try {
    // Get the first page of predictions for the specified user
    const response = await api.get(`/api/predictions/user/${userId}?page=0&size=5`);
    const predictions = response.data.content || [];
    
    return {
      predictions: predictions,
      total: response.data.totalElements || 0,
      highRisk: predictions.filter(p => p.predictedRiskLevel === 'HIGH').length,
      lowRisk: predictions.filter(p => p.predictedRiskLevel === 'LOW').length,
    };
  } catch (error) {
    console.error('Error fetching recent predictions:', error);
    throw error;
  }
};

export const getPredictionHistory = async (page = 0, size = 10, search = '', userId = 1) => {
  try {
    // Get predictions for the specified user
    const response = await api.get(`/api/predictions/user/${userId}?page=${page}&size=${size}`);
    const predictions = response.data.content || [];
    
    return {
      predictions: predictions,
      total: response.data.totalElements || 0,
      highRiskCount: predictions.filter(p => p.predictedRiskLevel === 'HIGH').length,
      mediumRiskCount: predictions.filter(p => p.predictedRiskLevel === 'MEDIUM').length,
      lowRiskCount: predictions.filter(p => p.predictedRiskLevel === 'LOW').length,
    };
  } catch (error) {
    console.error('Error fetching prediction history:', error);
    throw error;
  }
};

export const getAllPredictions = async (page = 0, size = 10) => {
  try {
    const response = await api.get(`/api/predictions/all?page=${page}&size=${size}`);
    const predictions = response.data.content || [];
    
    return {
      predictions: predictions,
      total: response.data.totalElements || 0,
      highRiskCount: predictions.filter(p => p.predictedRiskLevel === 'HIGH').length,
      mediumRiskCount: predictions.filter(p => p.predictedRiskLevel === 'MEDIUM').length,
      lowRiskCount: predictions.filter(p => p.predictedRiskLevel === 'LOW').length,
    };
  } catch (error) {
    console.error('Error fetching all predictions:', error);
    throw error;
  }
};

export const deletePrediction = async (id) => {
  try {
    // Backend doesn't have delete endpoint, so we'll just return success
    console.warn('Delete prediction not implemented in backend');
    return { success: true };
  } catch (error) {
    console.error('Error deleting prediction:', error);
    throw error;
  }
};

// Authentication endpoints - Connected to real backend
export const loginUser = async (credentials) => {
  try {
    // Convert frontend email field to backend username field
    const loginData = {
      username: credentials.email, // Backend expects username, not email
      password: credentials.password
    };
    
    console.log('Attempting login with data:', loginData);
    console.log('API base URL:', api.defaults.baseURL);
    
    const response = await api.post('/auth/login', loginData);
    
    console.log('Login response:', response);
    
    if (response.status === 200) {
      // Use role from backend response
      return {
        user: {
          username: response.data.username,
          email: credentials.email,
          role: response.data.role || 'PATIENT',
          roleType: response.data.role || 'PATIENT'
        }
      };
    }
    
    throw new Error('Login failed');
  } catch (error) {
    console.error('Error logging in:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // Convert frontend data to backend format
    const registrationData = {
      username: userData.name,
      password: userData.password,
      email: userData.email,
      gender: userData.gender || 'M',
      height: userData.height || 170, // Default height if not provided
      weight: userData.weight || 70   // Default weight if not provided
    };
    
    console.log('Attempting registration with data:', registrationData);
    console.log('API base URL:', api.defaults.baseURL);
    
    const response = await api.post('/auth/sign_up', registrationData);
    
    console.log('Registration response:', response);
    
    if (response.status === 201) {
      return {
        id: Date.now(),
        name: response.data.username,
        email: userData.email,
        role: 'PATIENT',
        roleType: 'PATIENT'
      };
    }
    
    throw new Error('Registration failed');
  } catch (error) {
    console.error('Error registering user:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

// Removed getCurrentUser - not needed without tokens

export const logoutUser = async () => {
  try {
    // For now, just return success
    // TODO: Implement proper logout when backend auth is added
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// User management endpoints - Connected to real backend
export const getUsers = async () => {
  try {
    const response = await api.get('/user/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // Calculate BMI if height and weight are provided
    let bmi = null;
    if (userData.height && userData.weight) {
      const heightInMeters = userData.height / 100;
      bmi = userData.weight / (heightInMeters * heightInMeters);
    }
    
    // Transform frontend user data to match backend User model
    const backendUserData = {
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      gender: userData.gender || 'M',
      height: userData.height || null,
      weight: userData.weight || null,
      bmi: bmi,
      roleType: userData.role === 'ADMIN' ? 'ADMIN' : userData.role === 'SUPPORT' ? 'SUPPORT' : 'PATIENT',
      password: userData.password || 'defaultPassword123' // Default password for new users
    };
    
    const response = await api.post('/user/add', backendUserData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    // Calculate BMI if height and weight are provided
    let bmi = null;
    if (userData.height && userData.weight) {
      const heightInMeters = userData.height / 100;
      bmi = userData.weight / (heightInMeters * heightInMeters);
    }
    
    // Transform frontend user data to match backend User model
    const backendUserData = {
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      gender: userData.gender || 'M',
      height: userData.height || null,
      weight: userData.weight || null,
      bmi: bmi,
      roleType: userData.role === 'ADMIN' ? 'ADMIN' : userData.role === 'SUPPORT' ? 'SUPPORT' : 'PATIENT'
    };
    
    const response = await api.put(`/user/update/${id}`, backendUserData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/user/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export default api;

