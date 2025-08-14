import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

// The props for each individual sortable item
interface SortableItemProps<T extends { id: string | number }> {
  id: string | number;
  item: T;
  renderItem: (item: T, listeners: any) => React.ReactNode;
}

// The component that will be made draggable
function SortableItem<T extends { id: string | number }>({
  id,
  item,
  renderItem,
}: SortableItemProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'white',
    margin: '5px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {renderItem(item, listeners)}
    </div>
  );
}

// The props for the main grid component
interface CustomizableDragDropProps<T extends { id: string | number }> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  renderItem: (item: T, listeners: any) => React.ReactNode;
  columns?: number;
}

// The main grid component
export default function CustomizableDragDrop<
  T extends { id: string | number },
>({
  items,
  onItemsChange,
  renderItem,
  columns = 3, // Default to 3 columns
}: CustomizableDragDropProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Require 10px movement to start a drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onItemsChange(newItems);
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '10px',
    padding: '10px',
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div style={gridStyle}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              renderItem={renderItem}
              item={item}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
