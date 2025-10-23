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
    if (config.url?.includes('/api/predictions') && config.method === 'post') {
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

export const getRecentPredictions = async () => {
  try {
    // Since backend doesn't have a /recent endpoint, we'll get the first page of predictions
    const response = await api.get('/api/predictions/user/1?page=0&size=5');
    return {
      predictions: response.data.content || [],
      total: response.data.totalElements || 0,
      highRisk: response.data.content?.filter(p => p.predictedRiskLevel === 'HIGH').length || 0,
      lowRisk: response.data.content?.filter(p => p.predictedRiskLevel === 'LOW').length || 0,
    };
  } catch (error) {
    console.error('Error fetching recent predictions:', error);
    throw error;
  }
};

export const getPredictionHistory = async (page = 0, size = 10, search = '') => {
  try {
    // Backend expects userId in the path, using default user ID 1
    const response = await api.get(`/api/predictions/user/1?page=${page}&size=${size}`);
    return {
      predictions: response.data.content || [],
      total: response.data.totalElements || 0,
      highRiskCount: response.data.content?.filter(p => p.predictedRiskLevel === 'HIGH').length || 0,
      mediumRiskCount: response.data.content?.filter(p => p.predictedRiskLevel === 'MEDIUM').length || 0,
      lowRiskCount: response.data.content?.filter(p => p.predictedRiskLevel === 'LOW').length || 0,
    };
  } catch (error) {
    console.error('Error fetching prediction history:', error);
    throw error;
  }
};

export const getPredictionById = async (userId, predictionId) => {
  try {
    const response = await api.get(`/api/predictions/${predictionId}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching prediction:', error);
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

// User management endpoints - Updated to match backend API
export const getUsers = async () => {
  try {
    // For now, return mock data since backend might not be running
    // TODO: Replace with actual API call when backend is available
    const mockUsers = [
      {
        id: 1,
        name: 'Admin',
        email: 'admin',
        phoneNumber: '+1234567890',
        gender: 'M',
        height: 180,
        weight: 75,
        roleType: 'ADMIN',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567891',
        gender: 'M',
        height: 175,
        weight: 70,
        roleType: 'PATIENT',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+1234567892',
        gender: 'F',
        height: 165,
        weight: 60,
        roleType: 'PATIENT',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 4,
        name: 'Support Agent',
        email: 'support@heatstroke.com',
        phoneNumber: '+1234567893',
        gender: 'F',
        height: 170,
        weight: 65,
        roleType: 'SUPPORT',
        createdAt: new Date(Date.now() - 259200000).toISOString()
      }
    ];
    
    return mockUsers;
    
    // Uncomment when backend is available:
    // const response = await api.get('/user/all');
    // return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // Transform frontend user data to match backend User model
    const backendUserData = {
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      gender: userData.gender || 'M',
      height: userData.height || null,
      weight: userData.weight || null,
      roleType: userData.role === 'ADMIN' ? 'ADMIN' : 'PATIENT'
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
    // Transform frontend user data to match backend User model
    const backendUserData = {
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber || '',
      gender: userData.gender || 'M',
      height: userData.height || null,
      weight: userData.weight || null,
      roleType: userData.role === 'ADMIN' ? 'ADMIN' : 'PATIENT'
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

