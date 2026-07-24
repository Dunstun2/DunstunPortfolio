'use client';
import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

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
              <Link href="/about" className="text-nav-text hover:text-primary transition-colors duration-300">About</Link>
              <Link href="/services" className="text-nav-text hover:text-primary transition-colors duration-300">Services</Link>
              <Link href="/projects" className="text-nav-text hover:text-primary transition-colors duration-300">Projects</Link>
              <Link href="/achievements" className="text-nav-text hover:text-primary transition-colors duration-300">Achievements</Link>
              <Link href="/education" className="text-nav-text hover:text-primary transition-colors duration-300">Education</Link>
              <Link href="/experience" className="text-nav-text hover:text-primary transition-colors duration-300">Experience</Link>
              <Link href="/skills" className="text-nav-text hover:text-primary transition-colors duration-300">Skills</Link>
              <Link href="/events" className="text-nav-text hover:text-primary transition-colors duration-300">Events</Link>
              <Link href="/blog" className="text-nav-text hover:text-primary transition-colors duration-300">Blog</Link>
              <Link href="/testimonials" className="text-nav-text hover:text-primary transition-colors duration-300">Testimonials</Link>
              <Link href="/contact" className="text-nav-text hover:text-primary transition-colors duration-300">Contact</Link>
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
            <Link href="/about" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">About</Link>
            <Link href="/services" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Services</Link>
            <Link href="/projects" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Projects</Link>
            <Link href="/achievements" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Achievements</Link>
            <Link href="/education" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Education</Link>
            <Link href="/experience" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Experience</Link>
            <Link href="/skills" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Skills</Link>
            <Link href="/events" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Events</Link>
            <Link href="/blog" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Blog</Link>
            <Link href="/testimonials" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Testimonials</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-nav-text hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 block px-3 py-3 rounded-md text-base font-medium transition-colors">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
