'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BackToAbout() {
  const [fromAbout, setFromAbout] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFromAbout(params.get('from') === 'about');
    }
  }, []);

  if (!fromAbout) return null;

  return (
    <Link 
      href="/about#explore-more" 
      className="absolute top-4 md:top-8 left-4 md:left-8 z-40 inline-flex items-center gap-2 text-sm font-semibold text-text-light/70 hover:text-primary transition-all bg-bg-dark/80 backdrop-blur-md hover:bg-primary/10 px-4 py-2.5 rounded-full border border-white/10 hover:border-primary/50 shadow-lg group"
    >
      <span className="text-lg leading-none transition-transform group-hover:-translate-x-1">&larr;</span> Back to About
    </Link>
  );
}
