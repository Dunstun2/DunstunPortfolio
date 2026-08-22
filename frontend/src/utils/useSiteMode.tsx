'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from './api';

export type SiteMode = 'corporate' | 'portfolio';

interface SiteModeContextValue {
  siteMode: SiteMode;
  isCorporate: boolean;
  isPortfolio: boolean;
  setSiteModeOverride: (mode: SiteMode | null) => void;
  isLoading: boolean;
}

const SiteModeContext = createContext<SiteModeContextValue>({
  siteMode: 'portfolio',
  isCorporate: false,
  isPortfolio: true,
  setSiteModeOverride: () => {},
  isLoading: false,
});

export function useSiteMode() {
  return useContext(SiteModeContext);
}

const STORAGE_KEY = 'cached_site_mode';
const OVERRIDE_KEY = 'site_mode_override';

function getInitialMode(): SiteMode {
  if (typeof window === 'undefined') return 'portfolio';
  try {
    // Check URL query param first
    const params = new URLSearchParams(window.location.search);
    const paramMode = params.get('mode');
    if (paramMode === 'corporate' || paramMode === 'portfolio') {
      return paramMode as SiteMode;
    }
    // Check manual override in session/localStorage
    const override = localStorage.getItem(OVERRIDE_KEY);
    if (override === 'corporate' || override === 'portfolio') {
      return override as SiteMode;
    }
    // Check cached server setting to prevent 0ms delay
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached === 'corporate' || cached === 'portfolio') {
      return cached as SiteMode;
    }
  } catch {}
  return 'portfolio';
}

export function SiteModeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const urlMode = searchParams?.get('mode');

  const [siteMode, setSiteMode] = useState<SiteMode>(getInitialMode);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync mode whenever URL query param (?mode=...) changes
  useEffect(() => {
    if (urlMode === 'corporate' || urlMode === 'portfolio') {
      setSiteMode(urlMode as SiteMode);
      try {
        localStorage.setItem(STORAGE_KEY, urlMode);
      } catch {}
      setIsLoading(false);
      return;
    }

    // Check local override
    try {
      const override = localStorage.getItem(OVERRIDE_KEY);
      if (override === 'corporate' || override === 'portfolio') {
        setSiteMode(override as SiteMode);
        setIsLoading(false);
        return;
      }
    } catch {}

    // Fetch server setting
    let isMounted = true;
    fetchApi('/settings')
      .then(res => {
        if (!isMounted) return;
        const serverMode = res.data?.site_mode;
        if (serverMode === 'corporate' || serverMode === 'portfolio') {
          // If no active URL query parameter, use server mode
          const currentUrlParam = new URLSearchParams(window.location.search).get('mode');
          if (!currentUrlParam) {
            setSiteMode(serverMode);
            try {
              localStorage.setItem(STORAGE_KEY, serverMode);
            } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [urlMode]);

  const setSiteModeOverride = (mode: SiteMode | null) => {
    if (mode) {
      localStorage.setItem(OVERRIDE_KEY, mode);
      localStorage.setItem(STORAGE_KEY, mode);
      setSiteMode(mode);
    } else {
      localStorage.removeItem(OVERRIDE_KEY);
      // Re-fetch default from server
      fetchApi('/settings').then(res => {
        const serverMode = res.data?.site_mode || 'portfolio';
        setSiteMode(serverMode);
        localStorage.setItem(STORAGE_KEY, serverMode);
      }).catch(() => {});
    }
  };

  const value = useMemo(() => {
    const isCorporate = siteMode === 'corporate';
    const isPortfolio = !isCorporate;
    return {
      siteMode,
      isCorporate,
      isPortfolio,
      setSiteModeOverride,
      isLoading,
    };
  }, [siteMode, isLoading]);

  return (
    <SiteModeContext.Provider value={value}>
      {children}
    </SiteModeContext.Provider>
  );
}
