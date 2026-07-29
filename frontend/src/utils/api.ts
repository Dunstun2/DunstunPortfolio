import { API_BASE_URL } from './urls';

// Endpoints that should never send an Authorization header
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // ms

async function fetchWithRetry(url: string, options: RequestInit, retries = 0): Promise<Response> {
  try {
    return await fetch(url, {
      cache: 'no-store',
      ...options,
    });
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Don't attach a stale token to public/auth endpoints — it causes 401s
  const isPublic = PUBLIC_ENDPOINTS.some((e) => endpoint.startsWith(e));
  let token = null;
  if (!isPublic && typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetchWithRetry(url, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
