'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  isFallback?: boolean;
}

export default function AdminAccount() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Change Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  // Create Admin
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');

  // Delete Admin
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      // Get current user
      const userRes = await fetchApi('/auth/me');
      setCurrentUser(userRes.data?.user);

      // Get all admins
      const adminsRes = await fetchApi('/auth/admins');
      if (adminsRes.success) {
        setAdmins(adminsRes.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwMessage('');
    setPwError('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage('');
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('Password must be at least 6 characters');
      return;
    }

    if (!selectedAdmin) return;

    try {
      // Admin can change any account's password
      const res = await fetchApi('/auth/admin-change-password', {
        method: 'PUT',
        body: JSON.stringify({
          adminId: selectedAdmin.id,
          currentPassword,
          newPassword,
        }),
      });
      setPwMessage(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwMessage('');
      }, 2000);
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  const openCreateModal = () => {
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminMessage('');
    setAdminError('');
    setShowCreateModal(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage('');
    setAdminError('');

    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: adminName, email: adminEmail, password: adminPassword }),
      });
      setAdminMessage(`Admin account created for ${res.data?.email || adminEmail}!`);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setTimeout(() => {
        setShowCreateModal(false);
        loadData();
      }, 2000);
    } catch (err: any) {
      setAdminError(err.message);
    }
  };

  const openDeleteModal = (admin: Admin) => {
    setDeleteAdmin(admin);
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDeleteAdmin = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }

    if (!deleteAdmin) return;

    try {
      // Verify password first
      const verifyRes = await fetchApi('/auth/verify-password', {
        method: 'POST',
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!verifyRes.success) {
        setDeleteError('Incorrect password');
        return;
      }

      // Delete admin
      await fetchApi(`/auth/admin/${deleteAdmin.id}`, {
        method: 'DELETE',
      });

      setShowDeleteModal(false);
      setDeleteAdmin(null);
      setDeletePassword('');
      loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete admin');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Management</h1>
          <p className="text-text-light/70">Manage admin accounts and passwords</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Admin
        </button>
      </div>

      {/* Admin Accounts List */}
      <div className="glass p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold mb-6">Admin Accounts</h2>

        <div className="space-y-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${admin.id === currentUser?.id
                ? 'bg-primary/10 border-primary/30'
                : 'bg-gray-800/50 border-gray-700'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {admin.name?.charAt(0).toUpperCase() || admin.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{admin.name}</h3>
                    {admin.id === currentUser?.id && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                        You
                      </span>
                    )}
                    {admin.isFallback && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-light/60">{admin.email}</p>
                  <p className="text-xs text-text-light/40 mt-1">Role: {admin.role}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openPasswordModal(admin)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Change Password
                </button>
                {!admin.isFallback && (
                  <button
                    onClick={() => openDeleteModal(admin)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              Change Password for {selectedAdmin?.name}
            </h3>

            {pwMessage && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded border border-green-800">
                {pwMessage}
              </div>
            )}
            {pwError && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded border border-red-800">
                {pwError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Current Password (for verification)</label>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-text-light/50 mt-1">
                  Enter your own password to verify you have permission to make this change
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">New Password for {selectedAdmin?.name}</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Create Admin Account</h3>

            {adminMessage && (
              <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded border border-green-800">
                {adminMessage}
              </div>
            )}
            {adminError && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded border border-red-800">
                {adminError}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  required
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  required
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  minLength={6}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-semibold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && deleteAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-heading-light mb-2">Delete Admin Account</h3>
                <p className="text-sm text-text-light/70 mb-1">
                  You are about to delete{' '}
                  <span className="font-semibold text-primary">{deleteAdmin.name}</span> (
                  {deleteAdmin.email})
                </p>
                <p className="text-sm text-text-light/70">Enter your password to confirm this action.</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Your Password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleDeleteAdmin()}
                placeholder="Enter your password"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500"
                autoFocus
              />
              {deleteError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {deleteError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteAdmin(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
