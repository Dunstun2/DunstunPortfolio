'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectableSortableItemProps {
  id: string;
  children: React.ReactNode;
  isPreview: boolean;
}

export function SelectableSortableItem({ id, children, isPreview }: SelectableSortableItemProps) {
  const [isSelected, setIsSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  useEffect(() => {
    if (!isPreview) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPreview]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  if (!isPreview) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore
        containerRef.current = node;
      }} 
      style={style} 
      className={`relative transition-all duration-200 ${isDragging ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-red-500 rounded-lg p-2 bg-red-500/5' : 'hover:ring-1 hover:ring-red-500/30 hover:rounded-lg'}`}
      onClick={(e) => {
        // Prevent click from propagating if we just want to select
        e.stopPropagation();
        setIsSelected(true);
      }}
    >
      {/* Drag Handle (only visible when selected) */}
      {isSelected && (
        <div
          className="absolute top-2 right-2 z-[60] bg-red-500/90 text-white px-2 py-1 rounded cursor-grab active:cursor-grabbing hover:bg-red-600 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider shadow-lg touch-none"
          {...attributes}
          {...listeners}
          title="Drag to reorder this item"
        >
          <i className="fas fa-grip-vertical"></i> Drag
        </div>
      )}
      
      {children}
    </div>
  );
}
