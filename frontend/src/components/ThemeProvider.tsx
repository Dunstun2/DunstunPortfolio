'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';

function ThemeVariableSync() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetchApi('/settings');
        if (res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load theme settings', err);
      }
    };
    
    loadTheme();
  }, []);

  useEffect(() => {
    if (!settings) return;

    const { 
      primary_color, 
      secondary_color, 
      background_dark_color, 
      background_light_color, 
      heading_color, 
      text_color, 
      muted_color, 
      nav_text_color, 
      subheading_color, 
      button_text_color 
    } = settings;
    
    const root = document.documentElement;

    if (primary_color) {
      root.style.setProperty('--color-primary-rgb', primary_color);
    }
    if (secondary_color) {
      root.style.setProperty('--color-secondary-rgb', secondary_color);
    }

    // Skip custom text/background variables on admin pages
    if (pathname?.startsWith('/admin')) {
      root.style.removeProperty('--color-bg-dark-rgb');
      root.style.removeProperty('--color-bg-light-rgb');
      root.style.removeProperty('--color-heading-light-rgb');
      root.style.removeProperty('--color-text-light-rgb');
      root.style.removeProperty('--color-muted-light-rgb');
      root.style.removeProperty('--color-nav-text-rgb');
      root.style.removeProperty('--color-subheading-rgb');
      root.style.removeProperty('--color-button-text-rgb');
      root.style.removeProperty('--glass-bg');
      root.style.removeProperty('--glass-border');
      return;
    }

    if (theme === 'light') {
      const bgLight = background_light_color || '241 245 249'; // Slate 100
      root.style.setProperty('--color-bg-dark-rgb', bgLight);
      
      // Light theme default text/headings (dark slate)
      root.style.setProperty('--color-heading-light-rgb', '15 23 42'); // Slate 900
      root.style.setProperty('--color-text-light-rgb', '30 41 59'); // Slate 800
      root.style.setProperty('--color-muted-light-rgb', '71 85 105'); // Slate 600
      root.style.setProperty('--color-nav-text-rgb', '15 23 42'); // Slate 900
      root.style.setProperty('--color-subheading-rgb', '71 85 105'); // Slate 600
      root.style.setProperty('--color-button-text-rgb', button_text_color || '255 255 255');
      
      const [r, g, b] = bgLight.split(' ').map(Number);
      const glassR = isNaN(r) ? 255 : r;
      const glassG = isNaN(g) ? 255 : g;
      const glassB = isNaN(b) ? 255 : b;
      root.style.setProperty('--glass-bg', `rgba(${glassR}, ${glassG}, ${glassB}, 0.7)`);
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
    } else {
      const bgDark = background_dark_color || '15 23 42'; // Slate 900
      root.style.setProperty('--color-bg-dark-rgb', bgDark);
      
      root.style.setProperty('--color-heading-light-rgb', heading_color || '255 255 255');
      root.style.setProperty('--color-text-light-rgb', text_color || '241 245 249');
      root.style.setProperty('--color-muted-light-rgb', muted_color || '148 163 184');
      root.style.setProperty('--color-nav-text-rgb', nav_text_color || '255 255 255');
      root.style.setProperty('--color-subheading-rgb', subheading_color || '148 163 184');
      root.style.setProperty('--color-button-text-rgb', button_text_color || '255 255 255');
      
      const [r, g, b] = bgDark.split(' ').map(Number);
      const glassR = isNaN(r) ? 15 : r;
      const glassG = isNaN(g) ? 23 : g;
      const glassB = isNaN(b) ? 42 : b;
      root.style.setProperty('--glass-bg', `rgba(${glassR}, ${glassG}, ${glassB}, 0.7)`);
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
    }
  }, [theme, settings, pathname]);

  return null;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeVariableSync />
      {children}
    </NextThemesProvider>
  );
}
