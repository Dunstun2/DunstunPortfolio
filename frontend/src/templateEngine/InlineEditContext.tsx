'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchApi } from '@/utils/api';
import { useSearchParams } from 'next/navigation';

interface InlineEditContextValue {
  isInlineEditing: boolean;
  setIsInlineEditing: (active: boolean) => void;
  draftSettings: Record<string, string>;
  allSettings: Record<string, string>;
  updateSetting: (key: string, value: string) => void;
  updateResourceField: (resource: string, id: string, field: string, value: any) => void;
  getResourceFieldValue: (resource: string, id: string, field: string, defaultValue: any) => any;
  saveAllSettings: () => Promise<boolean>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  getSettingValue: (key: string, defaultValue: string) => string;
}

const InlineEditContext = createContext<InlineEditContextValue>({
  isInlineEditing: false,
  setIsInlineEditing: () => {},
  draftSettings: {},
  allSettings: {},
  updateSetting: () => {},
  updateResourceField: () => {},
  getResourceFieldValue: (_r, _i, _f, defaultValue) => defaultValue,
  saveAllSettings: async () => false,
  hasUnsavedChanges: false,
  isSaving: false,
  getSettingValue: (_key, defaultValue) => defaultValue,
});

export function useInlineEdit() {
  return useContext(InlineEditContext);
}

interface InlineEditProviderProps {
  children: ReactNode;
}

export function InlineEditProvider({ children }: InlineEditProviderProps) {
  const searchParams = useSearchParams();
  const inlineParam = searchParams.get('inline_edit');
  const previewParam = searchParams.get('preview_template');

  // Default to true if inline_edit=true OR if preview_template is present (unless inline_edit=false is explicitly specified)
  const shouldEnableInline = inlineParam === 'false' ? false : (inlineParam === 'true' || !!previewParam);
  const [isInlineEditing, setIsInlineEditing] = useState<boolean>(shouldEnableInline);
  const [allSettings, setAllSettings] = useState<Record<string, string>>({});
  const [draftSettings, setDraftSettings] = useState<Record<string, string>>({});
  const [draftResources, setDraftResources] = useState<Record<string, Record<string, Record<string, any>>>>({});
  const [savedResources, setSavedResources] = useState<Record<string, Record<string, Record<string, any>>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (inlineParam === 'false') {
      setIsInlineEditing(false);
    } else if (inlineParam === 'true' || previewParam) {
      setIsInlineEditing(true);
    }
  }, [inlineParam, previewParam]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetchApi('/settings');
      if (res.data) {
        setAllSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings in InlineEditContext:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback((key: string, value: string) => {
    setDraftSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const updateResourceField = useCallback((resource: string, id: string, field: string, value: any) => {
    setDraftResources(prev => {
      const resourceData = prev[resource] || {};
      const itemData = resourceData[id] || {};
      return {
        ...prev,
        [resource]: {
          ...resourceData,
          [id]: {
            ...itemData,
            [field]: value,
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const getSettingValue = useCallback((key: string, defaultValue: string): string => {
    if (draftSettings[key] !== undefined) {
      return draftSettings[key];
    }
    if (allSettings[key] !== undefined && allSettings[key] !== '') {
      return allSettings[key];
    }
    return defaultValue;
  }, [draftSettings, allSettings]);

  const getResourceFieldValue = useCallback((resource: string, id: string, field: string, defaultValue: any): any => {
    if (draftResources[resource]?.[id]?.[field] !== undefined) {
      return draftResources[resource][id][field];
    }
    if (savedResources[resource]?.[id]?.[field] !== undefined) {
      return savedResources[resource][id][field];
    }
    return defaultValue;
  }, [draftResources, savedResources]);

  const saveAllSettings = useCallback(async (): Promise<boolean> => {
    const hasSettingsToSave = Object.keys(draftSettings).length > 0;
    const hasResourcesToSave = Object.keys(draftResources).length > 0;

    if (!hasSettingsToSave && !hasResourcesToSave) {
      return true;
    }

    setIsSaving(true);
    let success = true;

    try {
      // 1. Save Settings
      if (hasSettingsToSave) {
        const res = await fetchApi('/settings', {
          method: 'PUT',
          body: JSON.stringify(draftSettings),
        });
        if (res.success || res.data) {
          setAllSettings(prev => ({ ...prev, ...draftSettings }));
          setDraftSettings({});
        } else {
          success = false;
        }
      }

      // 2. Save Resource Entity Updates
      if (hasResourcesToSave) {
        for (const [resource, items] of Object.entries(draftResources)) {
          for (const [id, fields] of Object.entries(items)) {
            try {
              if (resource === 'hero') {
                await fetchApi(`/${resource}`, {
                  method: 'POST',
                  body: JSON.stringify(fields),
                });
              } else if (resource === 'about' && id === 'active') {
                await fetchApi('/about/active', {
                  method: 'PUT',
                  body: JSON.stringify(fields),
                });
              } else if (resource === 'skills' && id === 'category') {
                for (const [oldCategory, newCategory] of Object.entries(fields)) {
                  await fetchApi('/skills/category', {
                    method: 'PUT',
                    body: JSON.stringify({ oldCategory, newCategory }),
                  });
                }
              } else {
                await fetchApi(`/${resource}/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify(fields),
                });
              }
            } catch (err) {
              console.error(`Failed to update ${resource} ${id}:`, err);
              success = false;
            }
          }
        }
        setSavedResources(prev => {
          const next = { ...prev };
          for (const [resKey, items] of Object.entries(draftResources)) {
            next[resKey] = { ...(next[resKey] || {}), ...items };
          }
          return next;
        });
        setDraftResources({});
      }

      if (success) {
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Error in saveAllSettings:', err);
      success = false;
    } finally {
      setIsSaving(false);
    }

    return success;
  }, [draftSettings, draftResources]);

  return (
    <InlineEditContext.Provider
      value={{
        isInlineEditing,
        setIsInlineEditing,
        draftSettings,
        allSettings,
        updateSetting,
        updateResourceField,
        getResourceFieldValue,
        saveAllSettings,
        hasUnsavedChanges,
        isSaving,
        getSettingValue,
      }}
    >
      {children}
    </InlineEditContext.Provider>
  );
}
