'use client';

import { useState } from 'react';
import { 
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Widget, DEFAULT_WIDGETS } from '@/lib/widget-config';

interface WidgetSettingsProps {
  widgets: Widget[];
  onWidgetVisibilityChange: (widgetId: string, visible: boolean) => void;
  onResetToDefault: () => void;
  onForceAddNewWidgets: () => void;
}

export function WidgetSettings({
  widgets,
  onWidgetVisibilityChange,
  onResetToDefault,
  onForceAddNewWidgets
}: WidgetSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleCount = widgets.filter(w => w.visible).length;
  const totalCount = widgets.length;

  const metricWidgets = widgets.filter(w => w.component === 'metric');
  const chartWidgets = widgets.filter(w => w.component === 'chart');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-muted/50"
        >
          <Settings className="h-4 w-4" />
          Widget Settings
          <span className="text-xs text-muted-foreground">
            ({visibleCount}/{totalCount})
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Widget Settings
          </DialogTitle>
          <DialogDescription>
            Control which widgets are visible on your dashboard. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                <span className="font-medium">{visibleCount} visible</span> of {totalCount} widgets
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onForceAddNewWidgets}
                className="text-xs gap-1 flex-1"
              >
                <Plus className="h-3 w-3" />
                Add New Widgets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetToDefault}
                className="text-xs gap-1 flex-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </Button>
            </div>
          </div>

          {/* Metric Widgets */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              Metric Cards ({metricWidgets.filter(w => w.visible).length}/{metricWidgets.length})
            </h4>
            <div className="space-y-3">
              {metricWidgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between">
                  <Label 
                    htmlFor={widget.id}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    {widget.visible ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    {widget.title}
                  </Label>
                  <Switch
                    id={widget.id}
                    checked={widget.visible}
                    onCheckedChange={(checked) => 
                      onWidgetVisibilityChange(widget.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Chart Widgets */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              Chart Widgets ({chartWidgets.filter(w => w.visible).length}/{chartWidgets.length})
            </h4>
            <div className="space-y-3">
              {chartWidgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between">
                  <Label 
                    htmlFor={widget.id}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    {widget.visible ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    {widget.title}
                  </Label>
                  <Switch
                    id={widget.id}
                    checked={widget.visible}
                    onCheckedChange={(checked) => 
                      onWidgetVisibilityChange(widget.id, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Drag widgets on the dashboard to reorder them. Your layout will be saved automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 