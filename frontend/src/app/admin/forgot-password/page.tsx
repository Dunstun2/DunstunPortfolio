'use client';
import { useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';

export default function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMessage('A 6-digit reset code has been sent to your email.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword })
      });
      setMessage(res.data?.message || 'Password has been reset!');
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle code input — only allow digits, auto-advance
  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
  };

  const EyeIcon = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
      tabIndex={-1}
    >
      {show ? (
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
  );

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
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" placeholder="your@email.com" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            <Link href="/admin/login" className="block text-center text-sm text-gray-400 hover:text-primary">
              Back to Login
            </Link>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">
              We sent a 6-digit code to <strong className="text-white">{email}</strong>. Check your inbox (and spam folder).
            </p>

            {/* 6-digit code input */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Reset Code</label>
              <input
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-center text-3xl font-mono tracking-[0.5em] focus:outline-none focus:border-primary placeholder:text-gray-600 placeholder:text-lg placeholder:tracking-normal"
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">New Password</label>
              <div className="relative">
                <input required type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 pr-10 text-white focus:outline-none focus:border-primary" minLength={6} placeholder="Min 6 characters" />
                <EyeIcon show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <input required type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 pr-10 text-white focus:outline-none focus:border-primary" minLength={6} placeholder="Repeat password" />
                <EyeIcon show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
            </div>
            <button type="submit" disabled={loading || code.length !== 6} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setStep('request'); setError(''); setMessage(''); }} className="w-full text-sm text-gray-400 hover:text-primary transition-colors">
              Didn't receive the code? Go back
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
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

