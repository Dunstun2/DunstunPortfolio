'use client';

import React from 'react';
import { useInlineEdit } from '../InlineEditContext';
import InlineResourceText from './InlineResourceText';

interface InlineEditableListProps {
  resource: string;
  id: string;
  field: string;
  items: string[];
  /** Render each item. Provides item text and index. */
  renderItem: (text: string | React.ReactNode, index: number) => React.ReactNode;
  /** Placeholder text for new items */
  placeholder?: string;
  /** Extra class on the add button row */
  addButtonClassName?: string;
}

/**
 * InlineEditableList — renders a string[] array field.
 * In edit mode: each item is editable inline, with add (+) and remove (×) controls.
 * On change the entire array is pushed via updateResourceField.
 */
export default function InlineEditableList({
  resource,
  id,
  field,
  items,
  renderItem,
  placeholder = 'Add item...',
  addButtonClassName = '',
}: InlineEditableListProps) {
  const { isInlineEditing, updateResourceField, getResourceFieldValue } = useInlineEdit();

  // Use draft value if present, otherwise fall back to items prop
  const draftItems: string[] = getResourceFieldValue(resource, id, field, items) ?? items ?? [];

  const handleUpdate = (newItems: string[]) => {
    updateResourceField(resource, id, field, newItems);
  };

  const handleItemChange = (index: number, value: string) => {
    const next = [...draftItems];
    next[index] = value;
    handleUpdate(next);
  };

  const handleRemove = (index: number) => {
    const next = draftItems.filter((_, i) => i !== index);
    handleUpdate(next);
  };

  const handleAdd = () => {
    handleUpdate([...draftItems, '']);
  };

  if (!isInlineEditing) {
    return (
      <>
        {items.map((item, i) => (
          <React.Fragment key={i}>{renderItem(item, i)}</React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      {draftItems.map((item, i) => (
        <div key={i} className="relative group/listitem flex items-start gap-1">
          <div className="flex-1">
            {renderItem(
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none cursor-text px-1 rounded hover:ring-1 hover:ring-emerald-400/60 hover:bg-emerald-500/10 focus:ring-2 focus:ring-emerald-500 focus:bg-emerald-500/10 transition-all"
                onBlur={(e) => handleItemChange(i, e.currentTarget.textContent || '')}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
                    if (isMobile) {
                      if (!e.shiftKey) { e.preventDefault(); (e.target as HTMLElement).blur(); }
                    } else {
                      if (e.shiftKey) { e.preventDefault(); (e.target as HTMLElement).blur(); }
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ __html: item }}
              />,
              i
            )}
          </div>
          {/* Remove button */}
          <button
            onClick={() => handleRemove(i)}
            className="opacity-0 group-hover/listitem:opacity-100 transition-opacity flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold leading-none"
            title="Remove item"
          >
            ×
          </button>
        </div>
      ))}
      {/* Add new item button */}
      <button
        onClick={handleAdd}
        className={`mt-2 flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors border border-dashed border-emerald-400/40 hover:border-emerald-400/70 rounded px-2 py-1 ${addButtonClassName}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        {placeholder}
      </button>
    </>
  );
}
