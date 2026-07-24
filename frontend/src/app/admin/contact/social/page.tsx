'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { getSocialIcon } from '@/utils/socialIcons';

export default function AdminSocialAccounts() {
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [showFloater, setShowFloater] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchApi('/social');
      if (res.success) {
        setSocialAccounts(res.data || []);
      }

      // Load social floater setting
      const settingsRes = await fetchApi('/settings');
      if (settingsRes.data) {
        setShowFloater(settingsRes.data.show_social_floater !== false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFloater = async (enabled: boolean) => {
    setShowFloater(enabled);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({ show_social_floater: enabled }),
      });
      setMessage(enabled ? 'Floating sidebar enabled' : 'Floating sidebar disabled');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const isWhatsApp = (platform: string) => {
    return platform && platform.toLowerCase().includes('whatsapp');
  };

  const buildWhatsAppUrl = (phone: string) => {
    let cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    return cleaned ? `https://wa.me/${cleaned}` : '';
  };

  const addAccount = () => {
    setSocialAccounts([
      ...socialAccounts,
      {
        id: 'new-' + Date.now(),
        platform_name: '',
        url: '',
        icon_class: 'fas fa-link',
        is_favorite: false,
        isNew: true,
      },
    ]);
  };

  const updateField = (index: number, field: string, value: any) => {
    const updated = [...socialAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setSocialAccounts(updated);
  };

  const saveAccount = async (index: number) => {
    const account = { ...socialAccounts[index] };

    // For WhatsApp, auto-build the wa.me URL from the entered phone number
    if (isWhatsApp(account.platform_name)) {
      const cleaned = account.url?.replace(/[^\d]/g, '');
      if (!account.platform_name || !cleaned) {
        setMessage('Platform name and phone number are required.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      account.url = buildWhatsAppUrl(cleaned);
    } else {
      if (!account.platform_name || !account.url) {
        setMessage('Platform name and URL are required.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }

    setMessage('Saving...');
    try {
      if (account.isNew) {
        const { isNew, ...payload } = account;
        const res = await fetchApi('/social', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.success) {
          const updated = [...socialAccounts];
          updated[index] = res.data;
          setSocialAccounts(updated);
          setMessage('Social account created!');
        }
      } else {
        await fetchApi(`/social/${account.id}`, {
          method: 'PUT',
          body: JSON.stringify(account),
        });
        const updated = [...socialAccounts];
        updated[index] = { ...updated[index], url: account.url };
        setSocialAccounts(updated);
        setMessage('Social account updated!');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const deleteAccount = async (index: number) => {
    const account = socialAccounts[index];
    if (account.isNew) {
      const updated = [...socialAccounts];
      updated.splice(index, 1);
      setSocialAccounts(updated);
      return;
    }
    if (!confirm('Delete this social link?')) return;
    setMessage('Deleting...');
    try {
      await fetchApi(`/social/${account.id}`, { method: 'DELETE' });
      const updated = [...socialAccounts];
      updated.splice(index, 1);
      setSocialAccounts(updated);
      setMessage('Deleted!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Accounts</h1>
        <p className="text-text-light/70">
          Manage your social media profiles. These links appear in Hero, Footer, and Contact sections.
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-6 p-4 bg-blue-900/50 text-blue-200 rounded-lg border border-blue-800 flex items-center animate-fade-in">
          <svg
            className="w-5 h-5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {message}
        </div>
      )}

      {/* Floating Sidebar Toggle */}
      <div className="glass p-6 rounded-2xl border border-white/10 mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold mb-1">Floating Social Sidebar</h3>
          <p className="text-sm text-text-light/60">
            Display a sticky sidebar with all your social icons on the left side of the screen
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showFloater}
            onChange={(e) => handleToggleFloater(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {/* Add Account Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Social Links</h2>
        <button
          onClick={addAccount}
          className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Social Account
        </button>
      </div>

      {/* Social Accounts List */}
      <div className="space-y-4">
        {socialAccounts.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-gray-700 rounded-xl text-center glass">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No social accounts configured
            </h3>
            <p className="text-gray-500 mb-4">
              Add your social media profiles to connect with visitors
            </p>
            <button
              onClick={addAccount}
              className="px-6 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition font-semibold"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          socialAccounts.map((account, index) => (
            <div
              key={account.id}
              className={`glass p-6 rounded-2xl border transition-all ${account.isNew
                  ? 'border-primary/50 ring-1 ring-primary/20'
                  : 'border-white/10'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {account.platform_name || 'New Social Account'}
                  {account.is_favorite && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-semibold">
                      ⭐ Favorite
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveAccount(index)}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition font-semibold text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={() => deleteAccount(index)}
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
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Platform Name *
                  </label>
                  <input
                    type="text"
                    value={account.platform_name}
                    onChange={(e) =>
                      updateField(index, 'platform_name', e.target.value)
                    }
                    placeholder="e.g., GitHub, LinkedIn, Twitter"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-light/50 mt-1">
                    Include "WhatsApp" in the name to enable phone number input
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {isWhatsApp(account.platform_name)
                      ? 'Phone Number *'
                      : 'Profile URL *'}
                  </label>
                  <input
                    type="text"
                    value={account.url}
                    onChange={(e) => updateField(index, 'url', e.target.value)}
                    placeholder={
                      isWhatsApp(account.platform_name)
                        ? 'e.g., 0712345678 or +254712345678'
                        : 'e.g., https://github.com/username'
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                  {isWhatsApp(account.platform_name) && (
                    <p className="text-xs text-green-400 mt-1">
                      WhatsApp link will be auto-generated
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Icon Class (Optional)
                  </label>
                  <input
                    type="text"
                    value={account.icon_class}
                    onChange={(e) =>
                      updateField(index, 'icon_class', e.target.value)
                    }
                    placeholder="e.g., fab fa-github"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-text-light/50 mt-1">
                    FontAwesome or custom icon class
                  </p>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={account.is_favorite}
                      onChange={(e) =>
                        updateField(index, 'is_favorite', e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">
                      Mark as Favorite (Priority Display)
                    </span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {account.url && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-semibold text-text-light/70 mb-2">
                    Preview:
                  </p>
                  <a
                    href={
                      isWhatsApp(account.platform_name)
                        ? buildWhatsAppUrl(account.url)
                        : account.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm font-medium"
                  >
                    {getSocialIcon(account.platform_name)}
                    <span>{account.platform_name}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="mt-8 glass p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Where do social accounts appear?
        </h3>
        <ul className="space-y-2 text-sm text-text-light/70">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Hero Section:</strong> Displayed prominently on the homepage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Contact Page:</strong> Listed as ways to connect with you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Footer:</strong> Available on every page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span><strong>Floating Sidebar:</strong> When enabled, shows on the left side of all pages</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
