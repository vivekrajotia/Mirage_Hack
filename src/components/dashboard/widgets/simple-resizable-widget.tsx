'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GripHorizontal } from 'lucide-react';

interface SimpleResizableWidgetProps {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  initialWidth?: string;
}

export function SimpleResizableWidget({
  children,
  minWidth = 200,
  maxWidth = 800,
  className = '',
  initialWidth = 'auto'
}: SimpleResizableWidgetProps) {
  const [width, setWidth] = useState<string>(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = widgetRef.current?.offsetWidth || 0;

    const handleMouseMove = (e: MouseEvent) => {
      const diffX = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + diffX, minWidth), maxWidth);
      setWidth(`${newWidth}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, maxWidth]);

  return (
    <div 
      ref={widgetRef}
      className={`relative group ${className} ${isResizing ? 'select-none' : ''}`}
      style={{ width, minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px` }}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-blue-200 hover:bg-blue-400 dark:bg-blue-800 dark:hover:bg-blue-600"
        onMouseDown={handleMouseDown}
        style={{ zIndex: 10 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <GripHorizontal className="h-4 w-4 text-white rotate-90" />
        </div>
      </div>
    </div>
  );
}

interface SimpleResizableGridProps {
  children: React.ReactNode[];
  className?: string;
  gap?: number;
}

export function SimpleResizableGrid({
  children,
  className = '',
  gap = 16
}: SimpleResizableGridProps) {
  return (
    <div 
      className={`flex flex-wrap ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {children.map((child, index) => (
        <SimpleResizableWidget
          key={index}
          className="flex-grow"
          initialWidth="220px"
          minWidth={180}
          maxWidth={280}
        >
          {child}
        </SimpleResizableWidget>
      ))}
    </div>
  );
} 