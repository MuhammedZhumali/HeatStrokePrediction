import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const createRiskPrediction = async (predictionData) => {
  try {
    const response = await api.post('/predictions', predictionData);
    return response.data;
  } catch (error) {
    console.error('Error creating risk prediction:', error);
    throw error;
  }
};

export const getRecentPredictions = async () => {
  try {
    // Since backend doesn't have a /recent endpoint, we'll get the first page of predictions
    const response = await api.get('/predictions/user/1?page=0&size=5');
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
    const response = await api.get(`/predictions/user/1?page=${page}&size=${size}`);
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
    const response = await api.get(`/predictions/${predictionId}/user/${userId}`);
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

// Authentication endpoints - NOTE: Backend doesn't have auth endpoints yet
// These are placeholder implementations for future auth implementation
export const loginUser = async (credentials) => {
  try {
    // Check for admin credentials
    if (credentials.email === 'admin' && credentials.password === 'admin') {
      const adminUser = {
        id: 1,
        name: 'Admin',
        email: 'admin',
        role: 'ADMIN',
        roleType: 'ADMIN'
      };
      const adminToken = 'admin-jwt-token-' + Date.now();
      
      return {
        token: adminToken,
        user: adminUser
      };
    }
    
    // For other users, simulate regular user login
    const regularUser = {
      id: 2,
      name: credentials.email.split('@')[0] || credentials.email,
      email: credentials.email,
      role: 'PATIENT',
      roleType: 'PATIENT'
    };
    const userToken = 'user-jwt-token-' + Date.now();
    
    return {
      token: userToken,
      user: regularUser
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // For now, simulate registration
    // TODO: Implement proper registration when backend auth is added
    return {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      roleType: userData.role
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if admin token is present
    const token = localStorage.getItem('authToken');
    if (token && token.startsWith('admin-jwt-token-')) {
      return {
        id: 1,
        name: 'Admin',
        email: 'admin',
        role: 'ADMIN',
        roleType: 'ADMIN'
      };
    }
    
    // Return regular user for other tokens
    return {
      id: 2,
      name: 'User',
      email: 'user@heatstroke.com',
      role: 'PATIENT',
      roleType: 'PATIENT'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

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

