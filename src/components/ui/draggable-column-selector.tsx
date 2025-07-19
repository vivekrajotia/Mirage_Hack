'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableItem } from './sortable-item';
import { Droppable } from './droppable';
import { Item } from './item';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DraggableColumnSelectorProps {
  allColumns: string[];
  selectedColumns: string[];
  onSelectedColumnsChange: (columns: string[]) => void;
}

export function DraggableColumnSelector({
  allColumns,
  selectedColumns,
  onSelectedColumnsChange,
}: DraggableColumnSelectorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [selectedSearchTerm, setSelectedSearchTerm] = useState('');

  const availableColumns = allColumns.filter(
    (col) => !selectedColumns.includes(col)
  );

  const filteredAvailable = availableSearchTerm
    ? availableColumns.filter((col) =>
        col.toLowerCase().includes(availableSearchTerm.toLowerCase())
      )
    : availableColumns;

  const filteredSelected = selectedSearchTerm
    ? selectedColumns.filter((col) =>
        col.toLowerCase().includes(selectedSearchTerm.toLowerCase())
      )
    : selectedColumns;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeContainer = active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.sortable?.containerId;

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      if (active.id !== over.id) {
        if (activeContainer === 'selected-columns') {
          const oldIndex = selectedColumns.indexOf(active.id as string);
          const newIndex = selectedColumns.indexOf(over.id as string);
          if (oldIndex !== -1 && newIndex !== -1) {
            onSelectedColumnsChange(arrayMove(selectedColumns, oldIndex, newIndex));
          }
        }
      }
    } else {
      if (activeContainer === 'available-columns') {
        onSelectedColumnsChange([...selectedColumns, active.id as string]);
      } else {
        onSelectedColumnsChange(
          selectedColumns.filter((col) => col !== active.id)
        );
      }
    }
  };

  const handleClick = (column: string, list: 'available' | 'selected') => {
    if (list === 'available') {
      onSelectedColumnsChange([...selectedColumns, column]);
    } else {
      onSelectedColumnsChange(selectedColumns.filter((col) => col !== column));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Droppable id="available-columns" label="Available Columns">
          <Input
            placeholder="Search columns..."
            value={availableSearchTerm}
            onChange={(e) => setAvailableSearchTerm(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-72">
            <SortableContext
              items={availableColumns}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredAvailable.map((id) => (
                  <div
                    key={id}
                    onClick={() => handleClick(id, 'available')}
                    className="cursor-pointer"
                  >
                    <SortableItem id={id} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </ScrollArea>
        </Droppable>

        <Droppable id="selected-columns" label="Selected Columns">
          <Input
            placeholder="Search columns..."
            value={selectedSearchTerm}
            onChange={(e) => setSelectedSearchTerm(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-72">
            <SortableContext
              items={selectedColumns}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {filteredSelected.map((id) => (
                  <div
                    key={id}
                    onClick={() => handleClick(id, 'selected')}
                    className="cursor-pointer"
                  >
                    <SortableItem id={id} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </ScrollArea>
        </Droppable>
      </div>
      <DragOverlay>
        {activeId ? <Item id={activeId}>{activeId}</Item> : null}
      </DragOverlay>
    </DndContext>
  );
} 