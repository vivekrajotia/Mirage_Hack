'use client';

import React from 'react';

export const Item = React.forwardRef<
  HTMLDivElement,
  { id: string; withOpacity?: boolean; isDragging?: boolean; children: React.ReactNode }
>(({ id, withOpacity, isDragging, children, ...props }, ref) => {
  const inlineStyles = {
    opacity: withOpacity ? '0.5' : '1',
    transformOrigin: '50% 50%',
    boxShadow: isDragging
      ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 5px 2px'
      : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={ref}
      style={inlineStyles}
      className="p-2 bg-white rounded-md border w-full"
      {...props}
    >
      {children}
    </div>
  );
});

Item.displayName = 'Item'; 