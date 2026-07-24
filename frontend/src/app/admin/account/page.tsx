'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function AdminAccount() {
  const router = useRouter();

  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  // Create Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(''); setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    try {
      const res = await fetchApi('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setPwMessage(res.data?.message || 'Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(''); setAdminError('');

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword })
      });
      setAdminMessage(`Admin account created for ${res.data?.email || adminEmail}!`);
      setAdminName(''); setAdminEmail(''); setAdminPassword('');
    } catch (err: any) {
      setAdminError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Account Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Password */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-6">Change Password</h2>

          {pwMessage && <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded border border-green-800">{pwMessage}</div>}
          {pwError && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded border border-red-800">{pwError}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Current Password</label>
              <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" minLength={6} />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm New Password</label>
              <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" minLength={6} />
            </div>
            <button type="submit" className="px-4 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors">
              Update Password
            </button>
          </form>
        </div>

        {/* Create Admin */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-6">Create Admin Account</h2>

          {adminMessage && <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded border border-green-800">{adminMessage}</div>}
          {adminError && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded border border-red-800">{adminError}</div>}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input required type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" minLength={6} />
            </div>
            <button type="submit" className="px-4 py-2 bg-secondary rounded font-bold hover:opacity-90 transition-colors">
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
