'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Droppable } from '@/components/ui/droppable';
import { SortableItem } from '@/components/ui/sortable-item';
import { Item } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutGrid, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ToastBanner from '@/components/toast-banner';

interface Widget {
  id: number;
  name: string;
  type: string;
}

const DashboardGenerator = () => {
  const [dashboardName, setDashboardName] = useState('New Dashboard');
  const [widgets, setWidgets] = useState<{ available: Widget[]; selected: Widget[] }>({
    available: [],
    selected: [],
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const { toast } = useToast();
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const response = await fetch('/api/widgets');
        const data = await response.json();
        setWidgets({ available: data.widgets || [], selected: [] });
      } catch (error) {
        console.error('Failed to fetch widgets:', error);
      }
    };
    fetchWidgets();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const findContainer = (id: string | number) => {
    const stringId = String(id);
    if (widgets.selected.some(w => String(w.id) === stringId)) {
      return 'selected';
    }
    return 'available';
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!over) return;
  
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(activeId);
    const overContainer = over.id === 'dashboard-drop' ? 'selected' : findContainer(overId);
  
    if (activeContainer === overContainer) {
      if (activeContainer === 'selected') {
        setWidgets(prev => {
          const oldIndex = prev.selected.findIndex(w => String(w.id) === activeId);
          const newIndex = prev.selected.findIndex(w => String(w.id) === overId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            return {
              ...prev,
              selected: arrayMove(prev.selected, oldIndex, newIndex),
            };
          }
          return prev;
        });
      }
    } else {
      const widget = [...widgets.available, ...widgets.selected].find(w => String(w.id) === activeId);
      if (!widget) return;
  
      setWidgets(prev => {
        const newAvailable = prev.available.filter(w => String(w.id) !== activeId);
        const newSelected = prev.selected.filter(w => String(w.id) !== activeId);
  
        if (overContainer === 'selected') {
          newSelected.push(widget);
        } else {
          newAvailable.push(widget);
        }
  
        return { available: newAvailable, selected: newSelected };
      });
    }
  };

  const handleClick = (widget: Widget, list: 'available' | 'selected') => {
    setWidgets(prev => {
      const newAvailable = prev.available.filter(w => w.id !== widget.id);
      const newSelected = prev.selected.filter(w => w.id !== widget.id);
      if (list === 'available') {
        newSelected.push(widget);
      } else {
        newAvailable.push(widget);
      }
      return { available: newAvailable, selected: newSelected };
    });
  };
  
  const handleSaveDashboard = async () => {
    try {
      console.log('Saving dashboard:', {
        name: dashboardName,
        widgetIds: widgets.selected.map(w => w.id),
      });
      setBanner({ type: 'success', message: 'Dashboard saved! (Check console for output)' });
    } catch (error) {
      console.error('Error saving dashboard:', error);
      setBanner({ type: 'error', message: 'Failed to save dashboard' });
    }
  };

  const handlePreview = () => {
    const widgetIds = widgets.selected.map(w => w.id);
    const url = `/dashboard-preview?widgets=${JSON.stringify(widgetIds)}`;
    window.open(url, '_blank');
  };

  const filteredAvailable = widgets.available.filter(w => w.name.toLowerCase().includes(availableSearch.toLowerCase()));
  const filteredSelected = widgets.selected.filter(w => w.name.toLowerCase().includes(selectedSearch.toLowerCase()));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Generator</h1>
            <p className="text-gray-500">Drag, drop, and click to build your perfect dashboard.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePreview} size="lg" variant="outline">Preview & Arrange</Button>
            <Button onClick={handleSaveDashboard} size="lg">Save Dashboard</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Available Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search widgets..."
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Droppable id="available-drop">
                <ScrollArea className="h-96">
                  <SortableContext items={widgets.available.map(w => String(w.id))} strategy={rectSortingStrategy}>
                    <div className="space-y-3 p-1">
                      {filteredAvailable.map((widget) => (
                        <div key={widget.id} onClick={() => handleClick(widget, 'available')}>
                          <SortableItem id={String(widget.id)}>
                            {widget.name}
                          </SortableItem>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </Droppable>
            </CardContent>
          </Card>
          <Card className="col-span-3 shadow-lg">
            <CardHeader>
              <Input
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="text-2xl font-bold border-0 ring-0 focus:ring-0 focus:border-0 p-0"
                placeholder="Enter Dashboard Name"
              />
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dashboard widgets..."
                  value={selectedSearch}
                  onChange={(e) => setSelectedSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Droppable id="dashboard-drop">
                <ScrollArea className="h-[32rem] bg-gray-100/50 rounded-lg p-4 border-2 border-dashed">
                  {widgets.selected.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <SortableContext items={widgets.selected.map(w => String(w.id))} strategy={rectSortingStrategy}>
                        {filteredSelected.map((widget) => (
                          <div key={widget.id} onClick={() => handleClick(widget, 'selected')}>
                            <SortableItem id={String(widget.id)}>
                              <Card className="hover:shadow-lg transition-shadow bg-white">
                                <CardHeader>
                                  <CardTitle className="text-base">{widget.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-500">{widget.type}</p>
                                </CardContent>
                              </Card>
                            </SortableItem>
                          </div>
                        ))}
                      </SortableContext>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                      <LayoutGrid className="w-16 h-16 mb-4" />
                      <h3 className="text-xl font-semibold">Empty Dashboard</h3>
                      <p>Drag or click widgets from the left to add them here.</p>
                    </div>
                  )}
                </ScrollArea>
              </Droppable>
            </CardContent>
          </Card>
        </div>
      </div>
      <DragOverlay>
        {activeId ? (
          <Item id={activeId}>
            {[...widgets.available, ...widgets.selected].find(w => String(w.id) === activeId)?.name}
          </Item>
        ) : null}
      </DragOverlay>
      {banner && (
        <ToastBanner
          type={banner.type}
          message={banner.message}
          onClose={() => setBanner(null)}
          duration={3000}
        />
      )}
    </DndContext>
  );
};

export default DashboardGenerator; 