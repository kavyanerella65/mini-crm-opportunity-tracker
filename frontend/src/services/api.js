import axios from 'axios';

export const TOKEN_KEY = 'mini_crm_token';
export const USER_KEY = 'mini_crm_user';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Listeners the AuthContext registers to react to a forced logout
// (expired/invalid token) triggered from anywhere an API call is made.
let onUnauthorized = null;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/**
 * Pulls a human-readable message out of a backend error response,
 * preferring field-level validation errors when present.
 */
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(' ');
  }
  if (data?.message) return data.message;
  if (error?.message === 'Network Error') return 'Could not reach the server. Please check your connection and try again.';
  return 'Something went wrong. Please try again.';
};

export default api;
