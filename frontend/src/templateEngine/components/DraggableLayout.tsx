'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSearchParams } from 'next/navigation';
import { TemplateSection } from './TemplateSection';
import { useTemplate } from '../TemplateProvider';
import { AddRecordModal } from './AddRecordModal';

interface SortableItemProps {
  id: string;
  name: string;
  variant?: string;
  isPreview: boolean;
  totalSections: number;
}

function SortableItem({ id, name, variant, isPreview, totalSections }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  if (!isPreview) {
    return <TemplateSection name={name} variant={variant} />;
  }

  const canDrag = totalSections > 1;

  return (
    <div ref={setNodeRef} style={style} className={`relative group my-4 ${isDragging ? 'opacity-50' : ''}`}>
      {/* Drag Handle — only shown when there are multiple sections to reorder */}
      {canDrag && (
        <div
          className="absolute top-4 right-4 z-[60] bg-black/80 text-white px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing opacity-70 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20 shadow-lg hover:bg-black flex items-center gap-2 font-mono text-xs uppercase tracking-wider touch-none"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <i className="fas fa-grip-vertical"></i> Drag
        </div>
      )}
      
      {/* Always-visible dotted border in preview */}
      <div className="absolute inset-0 z-30 pointer-events-none border-2 border-dashed border-primary/40 group-hover:border-primary/80 rounded-xl transition-colors"></div>

      {/* Section name label */}
      <div className="absolute top-0 left-4 z-[60] -translate-y-1/2 bg-primary text-bg-dark text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full pointer-events-none shadow-md">
        {name}
      </div>

      <div className="relative z-10">
        <TemplateSection name={name} variant={variant} />
      </div>
    </div>
  );
}

interface DraggableLayoutProps {
  initialSections: string[];
  pageName: string; // e.g. 'home', 'services', 'about'
  variant?: string;
}

// Ensure the global window interface is extended
declare global {
  interface Window {
    __PREVIEW_LAYOUT__: Record<string, string[]>;
    __PREVIEW_DATA_REORDER__: Record<string, any[]>;
  }
}

const getSingularCapitalized = (pluralName: string) => {
  if (pluralName === 'education') return 'Education Entry';
  if (pluralName === 'experience') return 'Experience Entry';
  if (pluralName === 'testimonials') return 'Testimonial';
  if (pluralName === 'achievements') return 'Achievement';
  if (pluralName === 'skills') return 'Skill';
  if (pluralName === 'events') return 'Event';
  if (pluralName === 'blog') return 'Blog Post';
  if (pluralName.endsWith('s')) return pluralName.slice(0, -1).replace(/^\w/, c => c.toUpperCase());
  return pluralName.replace(/^\w/, c => c.toUpperCase());
};

export function DraggableLayout({ initialSections, pageName, variant }: DraggableLayoutProps) {
  const [sections, setSections] = useState(initialSections);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const searchParams = useSearchParams();
  const previewSlug = searchParams.get('preview_template');
  const isPreview = !!previewSlug;

  const { config, slug } = useTemplate();

  // Sync with initialSections when it changes (like loading from API)
  useEffect(() => {
    if (initialSections && initialSections.length > 0) {
      setSections(initialSections);
    }
  }, [initialSections]);

  // Expose current layout to the global window object so the Save button in the banner can access it
  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__[pageName] = sections;
    }
  }, [sections, isPreview, pageName]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging at least 8px before activation to allow clicks
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Require 250ms press before dragging starts on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id as string);
      const newIndex = sections.indexOf(over.id as string);

      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  if (!isPreview) {
    return (
      <div className="template-page">
        {sections.map((section, idx) => (
          <div key={`${section}-${idx}`}>
             <TemplateSection name={section} variant={variant} />
          </div>
        ))}
      </div>
    );
  }

  const availableToAdd = (config?.supportedSections || [
    'hero', 'about', 'services', 'projects', 'achievements', 
    'education', 'experience', 'skills', 'events', 'blog', 
    'testimonials', 'contact'
  ]).filter((sec) => !sections.includes(sec));

  // Determine what bottom UI to render
  const renderBottomUI = () => {
    if (pageName === 'home') {
      return (
        <div className="max-w-4xl mx-auto mt-12 mb-24 p-6 border-2 border-dashed border-primary/30 rounded-2xl bg-bg-light/30 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-bold font-heading text-text-light">Add a New Section</h3>
          <p className="text-sm text-text-light/70 text-center max-w-md">
            You are in preview mode! Add more sections to this page to build a custom layout.
          </p>
          
          {availableToAdd.length > 0 ? (
            <div className="flex items-center gap-2 mt-2 w-full max-w-sm">
              <select 
                id="add-section-select"
                className="flex-1 bg-bg-dark border border-white/10 rounded-lg px-4 py-2.5 text-text-light focus:outline-none focus:border-primary/50 capitalize"
              >
                {availableToAdd.map(sec => (
                  <option key={sec} value={sec}>{sec.replace(/-/g, ' ')}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById('add-section-select') as HTMLSelectElement;
                  if (select && select.value) {
                    setSections([...sections, select.value]);
                  }
                }}
                className="bg-primary hover:bg-primary-dark text-bg-dark font-bold px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap"
              >
                <i className="fas fa-plus mr-2"></i> Add
              </button>
            </div>
          ) : (
            <p className="text-sm text-green-500 font-bold mt-2">All available sections have been added!</p>
          )}
        </div>
      );
    }

    // Don't show any bottom action UI on about and contact pages
    if (pageName === 'about' || pageName === 'contact') {
      return null;
    }

    // For all other pages, show the dynamic Add Record UI
    const singularName = getSingularCapitalized(pageName);
    return (
      <div className="max-w-4xl mx-auto mt-12 mb-24 p-6 border-2 border-dashed border-primary/30 rounded-2xl bg-bg-light/30 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
        <h3 className="text-lg font-bold font-heading text-text-light">Add New {singularName}</h3>
        <p className="text-sm text-text-light/70 text-center max-w-md">
          You are in preview mode! Add records directly to your {pageName} collection.
        </p>
        
        <button
          onClick={() => setIsAddRecordOpen(true)}
          className="bg-primary hover:bg-primary-dark text-bg-dark font-bold px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add {singularName}
        </button>

        <AddRecordModal
          isOpen={isAddRecordOpen}
          onClose={() => setIsAddRecordOpen(false)}
          pageName={pageName}
          onSuccess={() => {
            // Reload page to reflect new database entry
            window.location.reload();
          }}
        />
      </div>
    );
  };

  return (
    <div className={`template-page relative ${isPreview ? 'pt-12' : ''}`}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={sections}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, idx) => (
            // In DndKit, items must have a unique ID that matches the array elements
            <SortableItem 
              key={`${section}-${idx}`} 
              id={section} 
              name={section} 
              variant={variant}
              isPreview={isPreview}
              totalSections={sections.length}
            />
          ))}
        </SortableContext>
      </DndContext>

      {renderBottomUI()}
    </div>
  );
}
