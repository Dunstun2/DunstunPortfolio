'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=86400; Secure; SameSite=Strict`;
        router.push('/admin');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-text-light mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-text-light mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors"
          >
            Sign In
          </button>
        </form>
        <a href="/admin/forgot-password" className="block text-center text-sm text-gray-400 hover:text-primary mt-4">
          Forgot Password?
        </a>
      </div>
    </div>
  );
}
