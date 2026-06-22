import axios from 'axios';
import { useAuthStore } from '../store/authStore';

function sanitizeEnvUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  let trimmed = value.trim();
  if (!trimmed) return undefined;

  const isWrappedInDoubleQuotes =
    trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2;
  const isWrappedInSingleQuotes =
    trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2;

  if (isWrappedInDoubleQuotes || isWrappedInSingleQuotes) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return undefined;

  const looksLikeHostWithoutProtocol =
    !trimmed.includes('://') && !trimmed.startsWith('/') && /^[\w.-]+:\d+/.test(trimmed);
  if (looksLikeHostWithoutProtocol) {
    trimmed = `http://${trimmed}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname === '0.0.0.0') {
        parsed.hostname = '127.0.0.1';
        trimmed = parsed.toString().replace(/\/$/, '');
      }
    } catch {
      return undefined;
    }
  }

  return trimmed;
}

const defaultApiBaseUrl = (() => {
  if (typeof window !== 'undefined') {
    const protocol = window.location?.protocol;
    const hostname = window.location?.hostname;
    if (
      (protocol === 'http:' || protocol === 'https:') &&
      typeof hostname === 'string' &&
      hostname.length > 0
    ) {
      return `${protocol}//${hostname}:3008/api`;
    }
  }
  return 'http://localhost:3008/api';
})();

const apiBaseUrl =
  sanitizeEnvUrl(import.meta.env?.VITE_API_URL) ||
  sanitizeEnvUrl(import.meta.env?.VITE_API_BASE_URL) ||
  defaultApiBaseUrl;
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});
// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (!error.response) {
      console.error(
        'Network error: Backend server may not be running at',
        apiBaseUrl,
        error
      );
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
