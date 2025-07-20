'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  GripVertical,
  Eye,
  EyeOff 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Widget } from '@/lib/widget-config';

interface MetricWidgetProps {
  widget: Widget;
  value: string | number;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  isDragging?: boolean;
  onToggleVisibility?: (widgetId: string, visible: boolean) => void;
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetWidgetId: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'total-pnl':
      return DollarSign;
    case 'profitable-trades':
      return TrendingUp;
    case 'losing-trades':
      return TrendingDown;
    case 'total-trades':
    default:
      return Filter;
  }
};

const getValueColor = (type: string, value: string | number) => {
  if (type === 'total-pnl') {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^-\d.]/g, '')) : value;
    return numValue >= 0 ? 'text-green-600' : 'text-red-600';
  }
  return 'text-foreground';
};

export function MetricWidget({
  widget,
  value,
  subtitle,
  trend,
  isDragging = false,
  onToggleVisibility,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: MetricWidgetProps) {
  const Icon = getIcon(widget.type);
  const valueColor = getValueColor(widget.type, value);

  return (
    <Card 
      draggable
      onDragStart={(e) => onDragStart?.(e, widget.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, widget.id)}
      className={`relative group transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50 rotate-2 scale-105 z-50' : ''
      } ${!widget.visible ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Drag Handle & Controls */}
      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium pr-8">{widget.title}</CardTitle>
        <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-xl font-bold ${valueColor} leading-tight`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-tight">
          {subtitle}
        </p>
        {trend && (
          <div className="mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 inline text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 inline text-red-500" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 