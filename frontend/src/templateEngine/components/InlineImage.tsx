'use client';

import React, { useRef, useState } from 'react';
import { useInlineEdit } from '../InlineEditContext';
import { API_BASE_URL } from '@/utils/urls';

interface InlineImageProps {
  settingKey: string;
  currentSrc?: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  iconSize?: 'sm' | 'lg';
  children?: React.ReactNode;
}

/**
 * InlineImage — wraps a settings-keyed image.
 * In edit mode: clicking opens file picker, uploads image, saves URL to settings draft.
 * In view mode: renders children (or the img if no children).
 */
export default function InlineImage({
  settingKey,
  currentSrc,
  alt = '',
  className = '',
  wrapperClassName = '',
  iconSize = 'lg',
  children,
}: InlineImageProps) {
  const { isInlineEditing, updateSetting, getSettingValue } = useInlineEdit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displaySrc = preview ?? getSettingValue(settingKey, currentSrc || '');

  const handleClick = (e: React.MouseEvent) => {
    if (!isInlineEditing) return;
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/media`, { method: 'POST', headers, body: fd });
      const json = await res.json();
      const uploadedUrl = json?.data?.url || json?.data?.file_path;
      if (uploadedUrl) {
        setPreview(uploadedUrl);
        updateSetting(settingKey, uploadedUrl);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isInlineEditing) {
    return children ? <>{children}</> : (displaySrc ? <img src={displaySrc} alt={alt} className={className} /> : null);
  }

  return (
    <div
      className={`relative group cursor-pointer ${wrapperClassName}`}
      onClick={handleClick}
      title="Click to change image"
    >
      {children ?? (displaySrc ? <img src={displaySrc} alt={alt} className={className} /> : (
        <div className={`bg-white/5 border-2 border-dashed border-emerald-400/50 rounded-lg flex items-center justify-center ${className}`}>
          <span className="text-emerald-400 text-xs font-medium">Click to add image</span>
        </div>
      ))}

      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[inherit] flex items-center justify-center z-20 pointer-events-none">
        {uploading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <svg className={`${iconSize === 'sm' ? 'w-6 h-6' : 'w-10 h-10'} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {iconSize === 'lg' && <span className="text-white text-xs font-semibold">Change Image</span>}
          </div>
        )}
      </div>

      <div className="absolute top-1 right-1 z-30 pointer-events-none">
        <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          EDIT
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
