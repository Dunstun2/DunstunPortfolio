'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { fetchApi } from '@/utils/api';

interface RecordSortableItemProps {
  id: string;
  children: React.ReactNode;
  isPreview: boolean;
}

/** Wraps a single record card with a drag handle in preview mode */
export function RecordSortableItem({ id, children, isPreview }: RecordSortableItemProps) {
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
    zIndex: isDragging ? 999 : 'auto',
  };

  if (!isPreview) return <>{children}</>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/rec transition-all duration-200 ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      {/* Drag handle — appears on hover */}
      <div
        className="absolute top-2 right-2 z-[70] bg-primary/90 text-bg-dark px-2 py-1 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover/rec:opacity-100 transition-all duration-200 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider shadow-lg touch-none border border-primary/20 hover:bg-primary select-none"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        <i className="fas fa-grip-vertical text-[10px]"></i>
        Drag
      </div>

      {/* Subtle hover ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover/rec:ring-primary/40 transition-all duration-200 pointer-events-none z-[60]" />

      {children}
    </div>
  );
}

interface RecordSortableGridProps {
  /** The list of records from the API (must have an `id` field) */
  records: any[];
  /** CSS class for the grid wrapper (e.g. "grid grid-cols-1 md:grid-cols-3 gap-6") */
  gridClassName?: string;
  /** Whether we're in preview mode — only enables DnD in preview */
  isPreview: boolean;
  /** API resource endpoint prefix, e.g. "achievements", "projects", "events" */
  resource: string;
  /** Render function for each record */
  renderRecord: (record: any) => React.ReactNode;
  /** Called after reorder so the parent can update its local state */
  onReorder?: (newRecords: any[]) => void;
}

/**
 * RecordSortableGrid
 *
 * Wraps a grid of data record cards with drag-and-drop reordering.
 * In preview mode, each card gets a hover drag handle.
 * On drop, it persists the new order via PUT /{resource}/:id with { order: index }.
 * In non-preview mode it renders just the plain grid with no overhead.
 */
export function RecordSortableGrid({
  records,
  gridClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  isPreview,
  resource,
  renderRecord,
  onReorder,
}: RecordSortableGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!isPreview) {
    // Plain grid — no DnD overhead
    return (
      <div className={gridClassName}>
        {records.map((record) => (
          <React.Fragment key={record.id}>
            {renderRecord(record)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const ids = records.map((r) => r.id);
  const activeRecord = records.find((r) => r.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = records.findIndex((r) => r.id === active.id);
    const newIndex = records.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(records, oldIndex, newIndex);

    // Optimistic update
    onReorder?.(reordered);

    // Persist new order to backend
    setIsSaving(true);
    try {
      await Promise.all(
        reordered.map((record, index) =>
          fetchApi(`/${resource}/${record.id}`, {
            method: 'PUT',
            body: JSON.stringify({ order: index }),
          }).catch(() => {}) // best-effort — don't block the UI
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative">
      {/* Preview mode hint + saving indicator */}
      <div className="absolute -top-8 right-0 flex items-center gap-2 z-10">
        {isSaving ? (
          <span className="text-[10px] text-primary/70 font-mono flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Saving order…
          </span>
        ) : (
          <span className="text-[10px] text-text-light/30 font-mono">
            ⠿ Hover a card to drag &amp; reorder
          </span>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className={gridClassName}>
            {records.map((record) => (
              <RecordSortableItem
                key={record.id}
                id={record.id}
                isPreview={isPreview}
              >
                {renderRecord(record)}
              </RecordSortableItem>
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay — shows a ghost of the card being dragged */}
        <DragOverlay>
          {activeRecord ? (
            <div className="opacity-90 rotate-1 scale-105 shadow-2xl rounded-2xl ring-2 ring-primary/60">
              {renderRecord(activeRecord)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
