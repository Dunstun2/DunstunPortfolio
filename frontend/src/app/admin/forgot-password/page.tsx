'use client';
import { useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage(res.data?.message || 'Check your email for the reset token.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
      setMessage(res.data?.message || 'Password has been reset!');
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h1>

        {message && <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded border border-green-800 text-sm">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded border border-red-800 text-sm">{error}</div>}

        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors">
              Send Reset Token
            </button>
            <Link href="/admin/login" className="block text-center text-sm text-gray-400 hover:text-primary">
              Back to Login
            </Link>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">
              Check the backend console for your reset token. Paste it below.
            </p>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Reset Token</label>
              <input required type="text" value={token} onChange={e => setToken(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary font-mono text-sm" placeholder="Paste token from console" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">New Password</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" minLength={6} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
              <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" minLength={6} />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors">
              Reset Password
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center">
            <p className="text-green-400 mb-6">Your password has been reset successfully!</p>
            <Link href="/admin/login" className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded transition-colors">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
