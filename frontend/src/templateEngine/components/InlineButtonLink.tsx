'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInlineEdit } from '../InlineEditContext';

interface InlineButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  badgeLabel?: string;
  onActionClick?: (e: React.MouseEvent) => void;
  isActionOnly?: boolean; // For download/file buttons
}

export function InlineButtonLink({
  href,
  children,
  className = '',
  target,
  badgeLabel,
  onActionClick,
  isActionOnly = false,
  onClick,
  ...props
}: InlineButtonLinkProps) {
  const { isInlineEditing } = useInlineEdit();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const previewSlug = searchParams.get('preview_template');
  const inlineParam = searchParams.get('inline_edit');

  // Compute final destination URL preserving preview and edit params
  const getDestinationUrl = (url: string) => {
    if (!url || url.startsWith('#') || url.startsWith('javascript:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    
    const [pathPart, hashPart] = url.split('#');
    const separator = pathPart.includes('?') ? '&' : '?';
    const params: string[] = [];
    
    if (previewSlug && !pathPart.includes('preview_template')) {
      params.push(`preview_template=${encodeURIComponent(previewSlug)}`);
    }
    if ((inlineParam === 'true' || isInlineEditing) && !pathPart.includes('inline_edit')) {
      params.push('inline_edit=true');
    }

    const queryStr = params.length > 0 ? `${separator}${params.join('&')}` : '';
    const hashStr = hashPart ? `#${hashPart}` : '';
    return `${pathPart}${queryStr}${hashStr}`;
  };

  const finalHref = getDestinationUrl(href);

  // If not in inline edit mode, render standard link
  if (!isInlineEditing) {
    if (isActionOnly && onActionClick) {
      return (
        <button
          type="button"
          onClick={onActionClick}
          className={className}
          {...(props as any)}
        >
          {children}
        </button>
      );
    }

    return (
      <Link
        href={finalHref}
        target={target}
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // --- Inline Edit Mode: Dual Functionality (Edit Text + Follow Link) ---
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
    // If holding Ctrl or Cmd, perform instant navigation
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      if (isActionOnly && onActionClick) {
        onActionClick(e);
      } else if (href.startsWith('http') || target === '_blank') {
        window.open(finalHref, '_blank');
      } else {
        router.push(finalHref);
      }
      return;
    }

    // Otherwise, delegate focus to the inner contenteditable element
    const container = e.currentTarget as HTMLElement;
    const editable = container.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editable) {
      editable.focus();
    }
  };

  // Format a friendly display name for the destination
  const displayTarget = badgeLabel || (
    href === '/' ? 'Home' :
    href.startsWith('/') ? href.replace(/^\//, '').split('?')[0].split('#')[0] || 'Home' :
    href.startsWith('http') ? 'External Link' :
    href
  );

  return (
    <div
      className="relative inline-flex group/btn-wrapper items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Action Pill on Hover */}
      <div
        className={`absolute -top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-200 pointer-events-none ${
          isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        {isActionOnly && onActionClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(e);
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/95 text-indigo-300 border border-indigo-500/60 shadow-2xl backdrop-blur-md hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap shadow-indigo-500/20"
            title="Execute button action"
          >
            <i className="fas fa-play text-[8px]"></i>
            <span>Test Action</span>
          </button>
        ) : (
          <a
            href={finalHref}
            target={target === '_blank' || href.startsWith('http') ? '_blank' : '_self'}
            onClick={(e) => {
              e.stopPropagation();
              if (!href.startsWith('http') && target !== '_blank') {
                e.preventDefault();
                router.push(finalHref);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/95 text-emerald-300 border border-emerald-500/60 shadow-2xl backdrop-blur-md hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap shadow-emerald-500/20"
            title={`Follow link to ${finalHref} (or Ctrl+Click button)`}
          >
            <span>Visit {displayTarget}</span>
            <i className="fas fa-arrow-up-right-from-square text-[8px]"></i>
          </a>
        )}
      </div>

      {/* The Button Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleContainerClick}
        title={`Click text to rename • Ctrl+Click or click pill above to visit ${displayTarget}`}
        className={`${className} cursor-text select-text`}
      >
        {children}
      </div>
    </div>
  );
}

export default InlineButtonLink;
