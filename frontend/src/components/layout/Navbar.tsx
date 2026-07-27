'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/utils/api';

// All possible nav links — order matters
const ALL_NAV_LINKS = [
  { key: 'about', label: 'About', href: '/about' },
  { key: 'services', label: 'Services', href: '/services' },
  { key: 'projects', label: 'Projects', href: '/projects' },
  { key: 'achievements', label: 'Achievements', href: '/achievements' },
  { key: 'education', label: 'Education', href: '/education' },
  { key: 'experience', label: 'Experience', href: '/experience' },
  { key: 'skills', label: 'Skills', href: '/skills' },
  { key: 'events', label: 'Events', href: '/events' },
  { key: 'blog', label: 'Blog', href: '/blog' },
  { key: 'testimonials', label: 'Testimonials', href: '/testimonials' },
  { key: 'contact', label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [availableSections, setAvailableSections] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetchApi('/sections/available')
      .then(res => setAvailableSections(res.data))
      .catch(() => {
        // If the endpoint fails, show all links as fallback
        const all: Record<string, boolean> = {};
        ALL_NAV_LINKS.forEach(l => { all[l.key] = true; });
        setAvailableSections(all);
      });
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  // Filter to only show links for sections that have published content
  const visibleLinks = availableSections
    ? ALL_NAV_LINKS.filter(link => availableSections[link.key])
    : ALL_NAV_LINKS; // show all while loading to prevent flash

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-bold text-nav-text tracking-wider">
              PORTFOLIO
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {visibleLinks.map(link => (
                <Link key={link.key} href={link.href} className="text-nav-text hover:text-primary transition-colors duration-300">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center ml-auto md:ml-4 gap-4">
            <ThemeToggle />
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-nav-text hover:text-primary focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass border-t border-text-light/10">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            {visibleLinks.map(link => (
              <Link key={link.key} href={link.href} onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
