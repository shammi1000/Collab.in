// API Configuration
export const API_URL = 'http://192.168.6.29:5000'; // Development URL

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    CAMPAIGNS: '/api/admin/campaigns',
    INFLUENCERS: '/api/influencers',
  },
  CAMPAIGNS: {
    BASE: '/api/campaigns',
    CREATE: '/api/campaigns/create',
    UPDATE: '/api/campaigns/update',
    DELETE: '/api/campaigns/delete',
  },
  INFLUENCERS: {
    BASE: '/api/influencers',
    SEARCH: '/api/influencers/search',
    APPLY: '/api/influencers/apply',
  },
};

// API Headers
export const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
}; 