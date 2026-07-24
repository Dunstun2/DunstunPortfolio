'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, messages: 0 });
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/admin/login');
      return;
    }

    // Fetch quick stats & analytics
    Promise.all([
      fetchApi('/projects').catch(() => ({ data: [] })),
      fetchApi('/contact').catch(() => ({ data: [] })),
      fetchApi('/analytics/stats').catch(() => ({ data: null }))
    ]).then(([projRes, msgRes, analyticsRes]) => {
      setStats({
        projects: projRes.data?.length || 0,
        messages: msgRes.data?.filter((m: any) => m.status === 'unread').length || 0
      });
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    });
  }, [router]);

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Dashboard Overview</h1>

      {/* Analytics Overview Grid */}
      {analytics && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Traffic (Last 30 Days)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 font-medium mb-2">Total Page Views</h3>
              <p className="text-4xl font-bold text-white">{analytics.recentViews}</p>
              <p className="text-xs text-gray-500 mt-2">All time: {analytics.totalViews}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 font-medium mb-2">Unique Visitors</h3>
              <p className="text-4xl font-bold text-primary">{analytics.uniqueVisitors}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 font-medium mb-2">Top Device</h3>
              <p className="text-2xl font-bold text-white">
                {analytics.devices && analytics.devices.length > 0
                  ? analytics.devices.sort((a: any, b: any) => b.count - a.count)[0].device_type
                  : 'N/A'
                }
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-gray-400 font-medium mb-2">Top Custom Action</h3>
              <p className="text-2xl font-bold text-secondary">
                {analytics.topActions && analytics.topActions.length > 0
                  ? analytics.topActions[0].action_name
                  : 'None yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Lists */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Top Pages Visited</h3>
            {analytics.topPaths && analytics.topPaths.length > 0 ? (
              <ul className="space-y-3">
                {analytics.topPaths.map((path: any, i: number) => (
                  <li key={i} className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300 truncate mr-4">{path.path}</span>
                    <span className="text-primary font-bold bg-primary/10 px-2 py-1 rounded text-sm">{path.views} views</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No traffic data yet.</p>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Device Breakdown</h3>
            {analytics.devices && analytics.devices.length > 0 ? (
              <div className="space-y-4 mt-6">
                {analytics.devices.map((device: any, i: number) => {
                  const total = analytics.devices.reduce((acc: number, d: any) => acc + Number(d.count), 0);
                  const percentage = Math.round((Number(device.count) / total) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 capitalize">{device.device_type}</span>
                        <span className="text-sm font-bold">{percentage}% ({device.count})</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No device data yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Legacy Stats & Quick Links */}
      <h2 className="text-xl font-bold mb-4">Content Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 font-medium mb-2">Total Projects</h3>
          <p className="text-4xl font-bold text-white">{stats.projects}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 font-medium mb-2">Unread Messages</h3>
          <p className="text-4xl font-bold text-primary">{stats.messages}</p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/admin/hero" className="p-4 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors">
            <h4 className="font-bold text-primary">Edit Hero Section &rarr;</h4>
            <p className="text-sm text-gray-400 mt-1">Update your main headline and call to action.</p>
          </a>
          <a href="/admin/services" className="p-4 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors">
            <h4 className="font-bold text-primary">Manage Services &rarr;</h4>
            <p className="text-sm text-gray-400 mt-1">Add and edit your service offerings.</p>
          </a>
          <a href="/admin/projects" className="p-4 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors">
            <h4 className="font-bold text-primary">Manage Projects &rarr;</h4>
            <p className="text-sm text-gray-400 mt-1">Add new portfolio case studies.</p>
          </a>
          <a href="/admin/settings" className="p-4 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors">
            <h4 className="font-bold text-primary">Theme Settings &rarr;</h4>
            <p className="text-sm text-gray-400 mt-1">Change the global colors of the site.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
