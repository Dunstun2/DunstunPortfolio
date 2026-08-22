'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, Suspense } from 'react';
import { fetchApi } from '@/utils/api';
import { useTheme } from 'next-themes';
import { usePathname, useSearchParams } from 'next/navigation';
import type { TemplateContextValue, TemplateRecord, TemplateConfig } from './types';
import { applyDesignTokens, loadTemplateFonts } from './applyTokens';
import { getTemplateComponents } from './templateRegistry';
import { InlineEditProvider, useInlineEdit } from './InlineEditContext';

const TemplateContext = createContext<TemplateContextValue>({
  template: null,
  config: null,
  components: null,
  isLoading: true,
  slug: 'obsidian',
});

export function useTemplate() {
  return useContext(TemplateContext);
}

interface TemplateProviderProps {
  children: ReactNode;
}

function PreviewToolbar({ template, handleSaveLayout }: { template: TemplateRecord | null; handleSaveLayout: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previewSlug = searchParams.get('preview_template');
  const { isInlineEditing, setIsInlineEditing, saveAllSettings, hasUnsavedChanges, isSaving } = useInlineEdit();
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!previewSlug || pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSaveAllContent = async () => {
    const success = await saveAllSettings();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 shadow-2xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-300">
              Preview Mode — <span className="capitalize text-white">{template?.name || previewSlug}</span>
            </span>
          </div>

          {/* Inline Edit Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full text-xs font-semibold transition-all">
            <input
              type="checkbox"
              checked={isInlineEditing}
              onChange={e => setIsInlineEditing(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 relative"></div>
            <span>✏️ Live Inline Edit</span>
          </label>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save Inline Content Settings */}
          <button
            onClick={handleSaveAllContent}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${
              saveSuccess
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-600 border-amber-400 text-slate-950 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
            }`}
          >
            <i className={`fas ${saveSuccess ? 'fa-check' : isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
            {saveSuccess ? 'Content Saved!' : hasUnsavedChanges ? 'Save Content*' : 'Save Content'}
          </button>

          {/* Save Template Layout */}
          <button
            onClick={handleSaveLayout}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <i className="fas fa-layer-group"></i> Save Layout
          </button>

          <a
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to Admin
          </a>
          <button
            onClick={() => window.close()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <i className="fas fa-times"></i> Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateInnerProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get('preview_template');

  useEffect(() => {
    const endpoint = previewSlug ? `/templates/${previewSlug}` : '/templates/active';
    fetchApi(endpoint)
      .then(res => {
        if (res.data) {
          const tmpl = res.data;
          if (typeof tmpl.config === 'string') {
            try {
              tmpl.config = JSON.parse(tmpl.config);
            } catch {
              tmpl.config = {};
            }
          }
          setTemplate(tmpl);
        }
      })
      .catch(err => {
        console.error('Failed to load template:', err);
      })
      .finally(() => setIsLoading(false));
  }, [previewSlug]);

  useEffect(() => {
    if (!template?.config) return;
    if (pathname?.startsWith('/admin')) return;

    const config = template.config as TemplateConfig;
    const currentTheme = (theme === 'light' ? 'light' : 'dark') as 'dark' | 'light';

    applyDesignTokens(config, currentTheme);
    loadTemplateFonts(config);
  }, [template, theme, pathname]);

  const config = template?.config as TemplateConfig | null;
  const slug = template?.slug || 'obsidian';
  const components = getTemplateComponents(slug);

  const handleSaveLayout = async () => {
    if (!template || !window.__PREVIEW_LAYOUT__) return;

    const newConfig = JSON.parse(JSON.stringify(config));
    let hasChanges = false;

    for (const [page, sections] of Object.entries(window.__PREVIEW_LAYOUT__)) {
      if (page === 'home') {
        newConfig.homepageSections = sections as string[];
        hasChanges = true;
      } else if (page.startsWith('elementOrder_')) {
        const key = page.replace('elementOrder_', '');
        if (!newConfig.elementOrder) newConfig.elementOrder = {};
        newConfig.elementOrder[key] = sections as string[];
        hasChanges = true;
      } else {
        if (!newConfig.pageSections) newConfig.pageSections = {};
        newConfig.pageSections[page] = sections as string[];
        hasChanges = true;
      }
    }

    let dataReordered = false;
    if (window.__PREVIEW_DATA_REORDER__) {
      for (const [resource, itemIds] of Object.entries(window.__PREVIEW_DATA_REORDER__)) {
        const items = itemIds.map((id: any, index: number) => ({ id, sort_order: index }));
        try {
          await fetchApi(`/${resource}/reorder`, {
            method: 'PUT',
            body: JSON.stringify({ items }),
          });
          dataReordered = true;
        } catch (err) {
          console.error(`Failed to reorder ${resource}:`, err);
        }
      }
    }

    if (!hasChanges && !dataReordered) {
      alert('No layout changes to save.');
      return;
    }

    try {
      const res = await fetchApi(`/templates/${template.id}`, {
        method: 'PUT',
        body: JSON.stringify({ config: newConfig }),
      });
      
      if (res.success) {
        alert('Layout saved successfully! It will now be used as the default for this template.');
        setTemplate(prev => prev ? { ...prev, config: newConfig } : null);
      } else {
        alert('Failed to save layout: ' + res.message);
      }
    } catch (err: any) {
      alert('Error saving layout: ' + err.message);
    }
  };

  return (
    <TemplateContext.Provider value={{ template, config, components, isLoading, slug }}>
      <PreviewToolbar template={template} handleSaveLayout={handleSaveLayout} />
      <FloatingInlineEditBar />
      {children}
    </TemplateContext.Provider>
  );
}

function FloatingInlineEditBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previewSlug = searchParams.get('preview_template');
  const { isInlineEditing, setIsInlineEditing, saveAllSettings, hasUnsavedChanges, isSaving } = useInlineEdit();
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (previewSlug || !isInlineEditing || pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSave = async () => {
    const success = await saveAllSettings();
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-slate-900/90 text-white p-3 rounded-2xl border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-slide-up">
      <div className="flex items-center gap-2 pl-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Inline Edit Active</span>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all border ${
          saveSuccess
            ? 'bg-emerald-600 border-emerald-400 text-white'
            : hasUnsavedChanges
            ? 'bg-amber-500 hover:bg-amber-600 border-amber-400 text-slate-950 animate-pulse shadow-lg'
            : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white'
        }`}
      >
        <i className={`fas ${saveSuccess ? 'fa-check' : isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
        {saveSuccess ? 'Changes Saved!' : hasUnsavedChanges ? 'Save Changes*' : 'Save Changes'}
      </button>

      <button
        onClick={() => setIsInlineEditing(false)}
        className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-xl transition-colors"
      >
        Done
      </button>
    </div>
  );
}

export default function TemplateProvider({ children }: TemplateProviderProps) {
  return (
    <Suspense fallback={null}>
      <InlineEditProvider>
        <TemplateInnerProvider>{children}</TemplateInnerProvider>
      </InlineEditProvider>
    </Suspense>
  );
}
