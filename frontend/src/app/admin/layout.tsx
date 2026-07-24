'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { section: 'Content' },
  { label: 'Hero Section', href: '/admin/hero', icon: '⚡' },
  { label: 'About Section', href: '/admin/about', icon: '👤' },
  { label: 'Services', href: '/admin/services', icon: '💼' },
  { label: 'Projects', href: '/admin/projects', icon: '🚀' },
  { label: 'Events', href: '/admin/events', icon: '📅' },
  { section: 'Resume' },
  { label: 'CV Import', href: '/admin/cv-import', icon: '📄' },
  { label: 'Experience', href: '/admin/experience', icon: '💼' },
  { label: 'Education', href: '/admin/education', icon: '🎓' },
  { label: 'Achievements', href: '/admin/achievements', icon: '🏆' },
  { label: 'Certifications', href: '/admin/certifications', icon: '📜' },
  { label: 'Skills', href: '/admin/skills', icon: '🛠️' },
  { section: 'Blog' },
  { label: 'Blog Posts', href: '/admin/blog', icon: '📝' },
  { label: 'Blog Categories', href: '/admin/blog/categories', icon: '📂' },
  { label: 'Blog Tags', href: '/admin/blog/tags', icon: '🏷️' },
  { label: 'Comments', href: '/admin/blog/comments', icon: '💭' },
  { section: 'Social & Messages' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: '💬' },
  { section: 'Contact' },
  { label: 'Messages & Inbox', href: '/admin/contact/messages', icon: '📬' },
  { label: 'Contact Info', href: '/admin/contact/info', icon: '📞' },
  { label: 'Social Accounts', href: '/admin/contact/social', icon: '🌐' },
  { label: 'Contact Form', href: '/admin/contact/form', icon: '📝' },
  { label: 'Contact Settings', href: '/admin/contact/settings', icon: '⚙️' },
  { section: 'System' },
  { label: 'File Manager', href: '/admin/files', icon: '📁' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Account', href: '/admin/account', icon: '🔒' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      router.push('/admin/login');
    }
  };

  // Don't show header/sidebar on login/forgot-password pages
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/forgot-password';

  if (isAuthPage) {
    return <div className="min-h-screen bg-bg-dark text-text-light">{children}</div>;
  }

  // Get current active section label
  const currentItem = navItems.find(item => item.href === pathname);
  const activeTitle = currentItem?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-bg-dark text-text-light flex flex-col admin-panel">
      {/* Top Header Navbar (Key items & actions across all screens) */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xl font-extrabold text-primary tracking-tight hover:opacity-90 transition-opacity">
            CMS<span className="text-secondary">Admin</span>
          </Link>
        </div>

        {/* Top Navbar Key Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-primary transition-colors bg-gray-800 hover:bg-gray-750 px-3 py-1.5 rounded-lg border border-gray-700"
          >
            <span>View Website</span>
            <span className="text-[10px]">↗</span>
          </Link>

          <ThemeToggle />

          <button
            onClick={handleSignOut}
            className="hidden sm:block text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all"
          >
            Sign Out
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg bg-gray-800 border border-gray-700 focus:outline-none text-base"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Sidebar (Overlays left section of page, leaving right section clearly visible) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Transparent backdrop so right side of page remains clearly visible */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Drawer on left */}
          <div className="relative w-72 max-w-[78vw] bg-gray-900/95 backdrop-blur-xl h-full border-r border-gray-800 p-4 flex flex-col z-50 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
              <span className="text-base font-extrabold text-primary tracking-tight">
                CMS<span className="text-secondary">Menu</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg bg-gray-800 border border-gray-700"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item: any, i) => {
                if ('section' in item) {
                  return (
                    <p key={i} className="text-xs text-primary font-bold uppercase tracking-wider pt-3 pb-1 px-2 border-t border-gray-800/80 first:border-0">
                      {item.section}
                    </p>
                  );
                }
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={i}
                    href={item.href || '#'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/20 text-primary font-bold border-l-4 border-primary' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-gray-800 mt-auto space-y-2">
              <Link
                href="/"
                target="_blank"
                className="block w-full py-2 text-center text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-750 rounded-lg border border-gray-700"
              >
                View Public Website ↗
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full py-2 text-center text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Full Desktop Sidebar */}
        <aside className="w-64 admin-sidebar backdrop-blur-xl border-r border-white/10 hidden md:flex md:flex-col flex-shrink-0">
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item, i) => {
              if ('section' in item) {
                return (
                  <p key={i} className="text-xs text-text-light/75 font-bold uppercase tracking-wider pt-4 pb-1 px-2">
                    {item.section}
                  </p>
                );
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={i}
                  href={item.href || '#'}
                  className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors text-sm ${isActive
                    ? 'bg-primary/20 text-primary font-semibold border-l-4 border-primary'
                    : 'text-text-light/80 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
