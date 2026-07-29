'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function BackButton() {
  const pathname = usePathname();

  // Do not show on homepage or admin pages
  if (pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  let backPath = '/';
  if (segments.length > 1) {
    // Subpages go back to their parent main page
    backPath = '/' + segments.slice(0, segments.length - 1).join('/');
  }

  return (
    <Link 
      href={backPath} 
      className="fixed top-24 left-4 md:left-8 z-40 flex items-center justify-center w-10 h-10 bg-bg-dark/80 backdrop-blur-md border border-text-light/10 text-text-light rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all shadow-lg group"
      title="Go back"
    >
      <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </Link>
  );
}
