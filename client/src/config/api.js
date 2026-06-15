// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — API Client Configuration
// Axios instance with JWT interceptor + error handling
// ═══════════════════════════════════════════════════════════

import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor — attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach branch header for Super Admin branch switching
    const activeBranch = localStorage.getItem('activeBranchId');
    if (activeBranch) {
      config.headers['X-Branch-Id'] = activeBranch;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle token expiry + errors ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired — attempt refresh
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Force logout response (SOP §11: Live Access Revocation)
    if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_INACTIVE') {
      localStorage.clear();
      window.location.href = '/login?reason=account_inactive';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
