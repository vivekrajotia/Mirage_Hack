'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable({
  id,
  label,
  children,
}: {
  id: string;
  label?: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  const style = {
    backgroundColor: isOver ? '#f0f0f0' : '#fafafa',
    border: '2px dashed #ccc',
    padding: '16px',
    borderRadius: '8px',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {label && <h3 className="text-lg font-semibold mb-2">{label}</h3>}
      {children}
    </div>
  );
} 