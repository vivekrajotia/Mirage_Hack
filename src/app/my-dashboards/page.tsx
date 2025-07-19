'use client';

import React, { useState, useEffect, useMemo } from 'react';
import './../../components/ai-canvas-button.css';
import './../../components/enhanced-sidebar.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GraphEngine } from '@/components/graph-engine';
import { DataTable } from '@/components/dashboard/data-table';
import { processPreviewData } from '@/components/graph-engine/graph-engine-examples';
import { Pencil, Save, Grid3x3, FolderOpen, Calendar, Star, MoreHorizontal, Trash2, Settings as SettingsIcon, Plus } from 'lucide-react';
import LoadingOverlay from '@/components/ui/loading-overlay';
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
  LayoutGrid,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AICanvas } from '@/components/ai-canvas';
import Link from 'next/link';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: number;
  name: string;
  type: string;
  config: any;
}

interface Dashboard {
  id: number;
  name: string;
  layout: any[];
  widgets: Widget[];
  updated_at?: string;
  created_at?: string;
}

const MyDashboardsPage = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAICanvasOpen, setIsAICanvasOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('my-dashboards');

  useEffect(() => {
    const fetchDashboards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboards');
        const data = await response.json();
        const fullDashboards = await Promise.all(
          (data.dashboards || []).map(async (d: any) => {
            const res = await fetch(`/api/dashboards/${d.id}`);
            const fullData = await res.json();
            return fullData.dashboard;
          })
        );
        setDashboards(fullDashboards);
        if (fullDashboards.length > 0) {
          setSelectedDashboard(fullDashboards[0]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboards();
  }, []);

  const handleNameChange = async (dashboardId: number) => {
    try {
      await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      setDashboards(dashboards.map(d => d.id === dashboardId ? { ...d, name: newName } : d));
      setEditingName(null);
    } catch (error) {
      console.error('Failed to update dashboard name:', error);
    }
  };

  const handleDeleteDashboard = async (dashboardId: number) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await fetch(`/api/dashboards/${dashboardId}`, {
          method: 'DELETE',
        });
        const updatedDashboards = dashboards.filter(d => d.id !== dashboardId);
        setDashboards(updatedDashboards);
        if (selectedDashboard?.id === dashboardId) {
          setSelectedDashboard(updatedDashboards.length > 0 ? updatedDashboards[0] : null);
        }
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
      }
    }
  };

  const renderWidget = (widget: Widget) => {
    let configObject;
    try {
      configObject = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
    } catch (error) {
      console.error("Failed to parse widget config:", error);
      return <p>Invalid widget configuration.</p>;
    }
    const fullConfig = { ...configObject, type: widget.type, title: widget.name };
    const chartData = processPreviewData(fullConfig);
    if (!chartData) return <p>Could not render widget.</p>;
    if (chartData.renderType === 'chart' && chartData.config) return <GraphEngine config={chartData.config} />;
    if (chartData.renderType === 'table' && chartData.columns && chartData.data) return <DataTable columns={chartData.columns} data={chartData.data} />;
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                    <SidebarMenuButton
                      isActive={activeItem === 'widget-gen'}
                      className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:shadow-md hover:scale-105 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-100 data-[active=true]:to-indigo-100 dark:data-[active=true]:from-purple-900/30 dark:data-[active=true]:to-indigo-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-purple-200/50 dark:data-[active=true]:border-purple-700/50 menu-item-enhanced"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Settings className="h-5 w-5 transition-all duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:rotate-90" />
                          {activeItem === 'widget-gen' && (
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-sm animate-pulse"></div>
                          )}
                        </div>
                        <span className="font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                          Widget Gen
                        </span>
                      </div>
                      {activeItem === 'widget-gen' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full active-indicator show"></div>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard-generator">
                    <SidebarMenuButton
                      isActive={activeItem === 'dashboard-gen'}
                      className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:shadow-md hover:scale-105 data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-100 data-[active=true]:to-teal-100 dark:data-[active=true]:from-emerald-900/30 dark:data-[active=true]:to-teal-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-emerald-200/50 dark:data-[active=true]:border-emerald-700/50 menu-item-enhanced"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <LayoutDashboard className="h-5 w-5 transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:scale-110" />
                          {activeItem === 'dashboard-gen' && (
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-sm animate-pulse"></div>
                          )}
                        </div>
                        <span className="font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
                          Dashboard Gen
                        </span>
                      </div>
                      {activeItem === 'dashboard-gen' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-r-full active-indicator show"></div>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard-loader">
                    <SidebarMenuButton
                      isActive={activeItem === 'dashboard-loader'}
                      className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 hover:shadow-md hover:scale-105 data-[active=true]:bg-gradient-to-r data-[active=true]:from-amber-100 data-[active=true]:to-orange-100 dark:data-[active=true]:from-amber-900/30 dark:data-[active=true]:to-orange-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-amber-200/50 dark:data-[active=true]:border-amber-700/50 menu-item-enhanced"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <LayoutGrid className="h-5 w-5 transition-all duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:rotate-12" />
                          {activeItem === 'dashboard-loader' && (
                            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-sm animate-pulse"></div>
                          )}
                        </div>
                        <span className="font-medium group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300">
                          Load Dashboard
                        </span>
                      </div>
                      {activeItem === 'dashboard-loader' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-r-full active-indicator show"></div>
                      )}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeItem === 'my-dashboards'}
                    className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/20 dark:hover:to-pink-900/20 hover:shadow-md hover:scale-105 data-[active=true]:bg-gradient-to-r data-[active=true]:from-rose-100 data-[active=true]:to-pink-100 dark:data-[active=true]:from-rose-900/30 dark:data-[active=true]:to-pink-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-rose-200/50 dark:data-[active=true]:border-rose-700/50 menu-item-enhanced"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <LayoutDashboard className="h-5 w-5 transition-all duration-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:scale-110" />
                        {activeItem === 'my-dashboards' && (
                          <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-sm animate-pulse"></div>
                        )}
                      </div>
                      <span className="font-medium group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors duration-300">
                        My Dashboards
                      </span>
                    </div>
                    {activeItem === 'my-dashboards' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-pink-500 rounded-r-full active-indicator show"></div>
                    )}
                  </SidebarMenuButton>
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
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Dashboards
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage and view your saved dashboards
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                {dashboards.length} dashboards
              </Badge>
              <Link href="/dashboard-generator">
                <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New Dashboard
                </Button>
              </Link>
            </div>
          </header>

          {/* Main content area with proper top padding to account for fixed header */}
          <main className="flex-1 overflow-hidden pt-16">
      <LoadingOverlay isLoading={isLoading} />
            <div className="flex h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
              {/* Dashboard Sidebar */}
              <aside className="w-80 bg-white/70 backdrop-blur-sm border-r border-slate-200 shadow-lg">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                        <Grid3x3 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Dashboard Library</h2>
                      <p className="text-sm text-slate-600">Select a dashboard to view</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-6">
                  <div className="space-y-3">
                    {dashboards.length > 0 ? (
                      dashboards.map(d => (
                        <div 
                          key={d.id}
                          className={`group relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedDashboard?.id === d.id 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md' 
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                          }`}
                  onClick={() => setSelectedDashboard(d)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate transition-colors duration-200 ${
                                  selectedDashboard?.id === d.id ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'
                                }`}>
                  {d.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                                    {d.widgets?.length || 0} widgets
                                  </Badge>
                                  {d.updated_at && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(d.updated_at)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setEditingName(d.id); setNewName(d.name); }}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setSelectedDashboard(d)}>
                                    <SettingsIcon className="mr-2 h-4 w-4" />
                                    Configure
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDashboard(d.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {selectedDashboard?.id === d.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
                          <div className="relative bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-full mx-auto w-fit">
                            <FolderOpen className="h-12 w-12 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Dashboards Yet</h3>
                        <p className="text-slate-500 mb-6">Create your first dashboard to get started</p>
                        <Link href="/dashboard-generator">
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Dashboard
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
        </nav>
      </aside>

              {/* Dashboard Content */}
              <main className="flex-1 overflow-auto">
        {selectedDashboard ? (
                  <div className="p-8">
                    {/* Dashboard Header */}
                    <div className="mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
                      <div className="flex items-center justify-between">
              {editingName === selectedDashboard.id ? (
                          <div className="flex items-center gap-4 flex-1">
                            <Input 
                              value={newName} 
                              onChange={(e) => setNewName(e.target.value)} 
                              className="text-2xl font-bold bg-white/50 border-slate-300 focus:border-blue-300"
                            />
                            <div className="flex gap-2">
                              <Button onClick={() => handleNameChange(selectedDashboard.id)} size="sm">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" onClick={() => setEditingName(null)} size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
              ) : (
                <>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                                  <Grid3x3 className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {selectedDashboard.name}
                                </h1>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {selectedDashboard.widgets?.length || 0} widgets
                                  </Badge>
                                  {selectedDashboard.updated_at && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Calendar className="h-4 w-4" />
                                      Last updated {formatDate(selectedDashboard.updated_at)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { setEditingName(selectedDashboard.id); setNewName(selectedDashboard.name); }}
                              className="bg-white/50 hover:bg-white"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                  </Button>
                </>
              )}
            </div>
                    </div>

                    {/* Dashboard Grid */}
                    {selectedDashboard.widgets && selectedDashboard.widgets.length > 0 ? (
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: selectedDashboard.layout }}
              isDraggable={false}
              isResizable={false}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={30}
            >
              {selectedDashboard.widgets.map(widget => (
                <div key={String(widget.id)}>
                            <Card className="h-full w-full overflow-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b">
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                  {widget.name}
                                </CardTitle>
                    </CardHeader>
                              <CardContent className="p-6">
                                {renderWidget(widget)}
                              </CardContent>
                  </Card>
                </div>
              ))}
            </ResponsiveGridLayout>
                    ) : (
                      <div className="text-center py-20">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
                          <div className="relative bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-full mx-auto w-fit">
                            <Grid3x3 className="h-16 w-16 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Empty Dashboard</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                          This dashboard doesn't have any widgets yet. Add some widgets to start visualizing your data.
                        </p>
                        <Link href="/dashboard-generator">
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Widgets
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20"></div>
                        <div className="relative bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-full mx-auto w-fit">
                          <FolderOpen className="h-16 w-16 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-700 mb-2">Select a Dashboard</h3>
                      <p className="text-slate-500">Choose a dashboard from the sidebar to view its contents</p>
                    </div>
          </div>
        )}
      </main>
    </div>
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

export default MyDashboardsPage; 