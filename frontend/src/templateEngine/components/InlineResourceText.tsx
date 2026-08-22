'use client';

import React, { useRef, useEffect, useState, type ElementType, type ComponentPropsWithoutRef } from 'react';
import { useInlineEdit } from '../InlineEditContext';

interface InlineResourceTextProps<T extends ElementType = 'span'> {
  resource: string;
  id: string;
  field: string;
  defaultValue?: string;
  as?: T;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

export default function InlineResourceText<T extends ElementType = 'span'>({
  resource,
  id,
  field,
  defaultValue = '',
  as,
  className = '',
  multiline = false,
  placeholder,
  children,
  ...props
}: InlineResourceTextProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof InlineResourceTextProps<T>>) {
  const { isInlineEditing, updateResourceField, getResourceFieldValue } = useInlineEdit();
  const Component = (as || 'span') as ElementType;

  const fallbackText = typeof children === 'string' ? children : defaultValue;
  const currentValue = getResourceFieldValue(resource, id, field, fallbackText);
  const targetText = currentValue || fallbackText || placeholder || '';

  const contentRef = useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize DOM text content only when NOT focused to prevent cursor jumping
  useEffect(() => {
    if (contentRef.current && !isFocused) {
      if (contentRef.current.textContent !== targetText) {
        contentRef.current.textContent = targetText;
      }
    }
  }, [targetText, isFocused]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const text = e.currentTarget.textContent || '';
    updateResourceField(resource, id, field, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Prevent parent handlers from intercepting Space or Enter
    e.stopPropagation();

    if (e.key === 'Enter') {
      const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
      if (isMobile || !multiline) {
        if (!e.shiftKey) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      } else {
        if (e.shiftKey) {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }
    }
  };

  if (!isInlineEditing) {
    return (
      <Component className={className} {...props}>
        {currentValue || fallbackText}
      </Component>
    );
  }

  return (
    <Component
      {...props}
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        setIsFocused(false);
        const text = e.currentTarget.textContent || '';
        updateResourceField(resource, id, field, text);
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
      data-inline-resource={resource}
      data-inline-id={id}
      data-inline-field={field}
      title={`Click to edit ${resource} item field: ${field}`}
      className={`relative group transition-all duration-200 rounded px-1 py-0.5 outline-none cursor-text ${className} ${
        isFocused
          ? 'ring-2 ring-emerald-500 bg-emerald-500/10 shadow-lg text-white'
          : 'hover:ring-2 hover:ring-emerald-400/60 hover:bg-emerald-500/10'
      }`}
    />
  );
}
