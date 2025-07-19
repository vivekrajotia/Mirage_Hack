'use client';

import { 
  GripVertical,
  Eye,
  EyeOff 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Widget } from '@/lib/widget-config';

interface ChartWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  isDragging?: boolean;
  onToggleVisibility?: (widgetId: string, visible: boolean) => void;
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetWidgetId: string) => void;
}

export function ChartWidget({
  widget,
  children,
  isDragging = false,
  onToggleVisibility,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: ChartWidgetProps) {
  return (
    <Card 
      draggable
      onDragStart={(e) => onDragStart?.(e, widget.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, widget.id)}
      className={`relative group transition-all duration-200 hover:shadow-lg ${
        widget.gridCols || ''
      } ${isDragging ? 'opacity-50 rotate-1 scale-105 z-50' : ''} ${
        !widget.visible ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/50"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility?.(widget.id, !widget.visible);
          }}
          title={widget.visible ? 'Hide widget' : 'Show widget'}
        >
          {widget.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/50 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-3 w-3" />
        </Button>
      </div>

      <CardHeader>
        <CardTitle className="text-sm font-medium pr-12">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {children}
      </CardContent>
    </Card>
  );
} 