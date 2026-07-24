const API_BASE_URL = 'http://localhost:5000/api';

// Endpoints that should never send an Authorization header
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

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

  const response = await fetch(url, { 
    cache: 'no-store',
    ...options, 
    headers 
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
