'use client';

import React, { useState, useEffect } from 'react';
import './../../components/ai-canvas-button.css';
import './../../components/enhanced-sidebar.css';
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BarChart2,
  Settings,
  CircleHelp,
  Bot,
  Sparkles,
  FileText,
  TrendingUp,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AICanvas } from '@/components/ai-canvas';
import Link from 'next/link';

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
  const [isAICanvasOpen, setIsAICanvasOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard-generator');

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
    console.log('Saving dashboard:', {
      name: dashboardName,
      widgetIds: widgets.selected.map(w => w.id),
    });
    alert('Dashboard saved! (Check console for output)');
  };

  const handlePreview = () => {
    const widgetIds = widgets.selected.map(w => w.id);
    const url = `/dashboard-preview?widgets=${JSON.stringify(widgetIds)}`;
    window.open(url, '_blank');
  };

  const filteredAvailable = widgets.available.filter(w => w.name.toLowerCase().includes(availableSearch.toLowerCase()));
  const filteredSelected = widgets.selected.filter(w => w.name.toLowerCase().includes(selectedSearch.toLowerCase()));

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar className="border-r-0 shadow-lg sidebar-enhanced">
          <SidebarHeader className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 sidebar-header-enhanced">
            <div className="flex h-12 items-center gap-3">
              <div className="relative logo-container-enhanced">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <TrendingUp className="size-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  TradeVision
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Trading Analytics Platform
                </span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="overflow-hidden flex flex-col">
            <SidebarGroup className="px-3 py-2">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-label-enhanced">
                Main Navigation
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton 
                      isActive={activeItem === 'dashboard'}
                      tooltip="Dashboard Overview"
                      className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:shadow-md data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-cyan-100 dark:data-[active=true]:from-blue-900/30 dark:data-[active=true]:to-cyan-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-blue-200/50 dark:data-[active=true]:border-blue-700/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <LayoutDashboard className="h-5 w-5 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        <span className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          Dashboard
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="AI Canvas - Intelligent Data Analysis"
                    onClick={() => setIsAICanvasOpen(true)}
                    className="group relative overflow-hidden ai-canvas-button text-white border-0 w-full h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 relative z-10 w-full">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                        <Bot className="h-5 w-5 bot-icon relative text-white" />
                        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 sparkle-icon text-yellow-300" />
                      </div>
                      <div className="flex flex-col items-start flex-grow">
                        <span className="button-text font-bold text-sm">AI CANVAS</span>
                        <span className="text-xs text-white/80 font-medium">Powered by AI</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarSeparator className="my-2" />

                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton 
                      isActive={activeItem === 'analytics'}
                      tooltip="Advanced Analytics"
                      className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-100 data-[active=true]:to-teal-100 dark:data-[active=true]:from-emerald-900/30 dark:data-[active=true]:to-teal-900/30 data-[active=true]:shadow-sm"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <BarChart2 className="h-5 w-5 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                        <span className="font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                          Analytics
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton 
                      isActive={activeItem === 'reports'}
                      tooltip="Reports & Exports"
                      className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-purple-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-100 data-[active=true]:to-purple-100 dark:data-[active=true]:from-violet-900/30 dark:data-[active=true]:to-purple-900/30 data-[active=true]:shadow-sm"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <FileText className="h-5 w-5 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                        <span className="font-medium group-hover:text-violet-700 dark:group-hover:text-violet-300">
                          Reports
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton 
                      isActive={activeItem === 'settings'}
                      tooltip="Dashboard Settings"
                      className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-900/20 dark:hover:to-gray-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-slate-100 data-[active=true]:to-gray-100 dark:data-[active=true]:from-slate-900/30 dark:data-[active=true]:to-gray-900/30 data-[active=true]:shadow-sm"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Settings className="h-5 w-5 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                        <span className="font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300">
                          Settings
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/">
                    <SidebarMenuButton 
                      isActive={activeItem === 'support'}
                      tooltip="Help & Support"
                      className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-100 data-[active=true]:to-amber-100 dark:data-[active=true]:from-orange-900/30 dark:data-[active=true]:to-amber-900/30 data-[active=true]:shadow-sm"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <CircleHelp className="h-5 w-5 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                        <span className="font-medium group-hover:text-orange-700 dark:group-hover:text-orange-300">
                          Support
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/widgetGen/widgetGen">
                    <SidebarMenuButton>
                      <Settings className="w-5 h-5" />
                      Widget Gen
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeItem === 'dashboard-generator'}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:shadow-md data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-cyan-100 dark:data-[active=true]:from-blue-900/30 dark:data-[active=true]:to-cyan-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-blue-200/50 dark:data-[active=true]:border-blue-700/50"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard Gen
                    {activeItem === 'dashboard-generator' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full"></div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard-loader">
                    <SidebarMenuButton>
                      <LayoutGrid className="w-5 h-5" />
                      Load Dashboard
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/my-dashboards">
                    <SidebarMenuButton>
                      <LayoutDashboard className="w-5 h-5" />
                      My Dashboards
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Status indicator at bottom */}
            <div className="mt-auto mb-4 mx-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50 status-indicator-enhanced">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full status-dot"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  System Online
                </span>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex flex-col h-screen">
          {/* Enhanced Header with Navigation Actions - Fixed Position */}
          <header className="fixed top-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-6 shadow-lg" 
                  style={{ left: 'var(--sidebar-width, 16rem)', width: 'calc(100vw - var(--sidebar-width, 16rem))' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Dashboard Generator
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Drag, drop, and click to build your perfect dashboard
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 flex-shrink-0" onClick={handlePreview}>
                    <Settings2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Preview & Arrange</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview Dashboard</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 flex-shrink-0" onClick={handleSaveDashboard}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Save Dashboard</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save Dashboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Main content area with proper top padding to account for fixed header */}
          <main className="flex-1 overflow-auto pt-16">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="p-8 bg-gray-50 min-h-screen">
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
            </DndContext>
          </main>
        </SidebarInset>
        
        {/* AI Canvas Modal */}
        <AICanvas 
          isOpen={isAICanvasOpen} 
          onClose={() => setIsAICanvasOpen(false)} 
        />
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default DashboardGenerator; 