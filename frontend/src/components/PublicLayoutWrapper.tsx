'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { TemplateNavbar, TemplateFooter } from '@/templateEngine';
import SocialFloater from '@/components/layout/SocialFloater';
import ContactCTA from '@/components/layout/ContactCTA';
import BackButton from '@/components/layout/BackButton';

/**
 * Wraps public-facing pages with template chrome (navbar, footer, etc.).
 * Admin routes are rendered as bare children without any public template UI.
 */
export default function PublicLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isProjectDetail = pathname?.startsWith('/projects/') && pathname !== '/projects';

  if (isAdmin) {
    // Render admin content completely bare — admin has its own layout
    return <>{children}</>;
  }

  return (
    <>
      <TemplateNavbar />
      <SocialFloater />
      <BackButton />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      {!isProjectDetail && <ContactCTA />}
      <TemplateFooter />
    </>
  );
}
