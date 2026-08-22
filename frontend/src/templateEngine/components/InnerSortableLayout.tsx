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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SelectableSortableItem } from './SelectableSortableItem';

interface InnerSortableLayoutProps {
  items: string[];
  onReorder: (newItems: string[]) => void;
  renderItem: (item: string) => React.ReactNode;
  isPreview: boolean;
  className?: string;
  horizontal?: boolean;
}

export function InnerSortableLayout({ 
  items, 
  onReorder, 
  renderItem, 
  isPreview,
  className = "",
  horizontal = false
}: InnerSortableLayoutProps) {
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
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
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  if (!isPreview) {
    return (
      <div className={className}>
        {items.map((item) => (
          <React.Fragment key={item}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={items}
          strategy={horizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SelectableSortableItem 
              key={item} 
              id={item}
              isPreview={isPreview}
            >
              {renderItem(item)}
            </SelectableSortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
