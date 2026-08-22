'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function AdminLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const token = res.data?.token || res.token;
      const userData = res.data?.user || res.user;
      if (token) {
        localStorage.setItem('token', token);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        document.cookie = `token=${token}; path=/; max-age=86400; Secure; SameSite=Strict`;

        // Check if default admin logs in -> redirect to select-mode setup page
        const isDefaultAdmin = userData?.isDefaultAdmin || userData?.id === 0 || userData?.email === 'admin@example.com';

        if (isDefaultAdmin) {
          router.push('/admin/select-mode');
          return;
        }

        router.push('/admin');
      } else {
        setError('Login failed: No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name || 'Admin User', email, password }),
      });
      if (res.success || res.data) {
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          handleLogin(e);
        }, 1000);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass p-8 rounded-xl w-full max-w-md border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {isRegister ? 'Create Admin Account' : 'Admin Login'}
        </h1>
        
        {error && <p className="text-red-500 mb-4 text-center text-sm bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}
        {successMsg && <p className="text-green-400 mb-4 text-center text-sm bg-green-500/10 border border-green-500/20 p-2 rounded">{successMsg}</p>}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm text-text-light mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                required 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm text-text-light mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-bg-dark border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
              required 
            />
          </div>

          <div>
            <label className="block text-sm text-text-light mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-dark border border-gray-700 rounded p-2 pr-10 text-white focus:outline-none focus:border-primary"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login and Create Account Buttons on the exact same line */}
          <div className="flex gap-3 pt-2">
            <button 
              type={isRegister ? "button" : "submit"} 
              onClick={() => {
                if (isRegister) {
                  setIsRegister(false);
                  setError('');
                }
              }}
              className={`flex-1 font-bold py-2.5 rounded-lg transition-all text-center text-sm shadow-md ${
                !isRegister 
                  ? 'bg-primary hover:bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              Sign In
            </button>
            <button 
              type={isRegister ? "submit" : "button"}
              onClick={() => {
                if (!isRegister) {
                  setIsRegister(true);
                  setError('');
                }
              }}
              className={`flex-1 font-bold py-2.5 rounded-lg transition-all text-center text-sm shadow-md ${
                isRegister 
                  ? 'bg-primary hover:bg-blue-600 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>
        </form>

        {!isRegister && (
          <a href="/admin/forgot-password" className="block text-center text-sm text-gray-400 hover:text-primary mt-4 transition-colors">
            Forgot Password?
          </a>
        )}
      </div>
    </div>
  );
}
