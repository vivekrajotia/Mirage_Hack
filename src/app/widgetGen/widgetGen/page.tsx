'use client';

import WidgetGenerator from '@/widgetGen/widgetGen';
import './../../../components/ai-canvas-button.css';
import './../../../components/enhanced-sidebar.css';
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
  Settings, 
  Bot, 
  Sparkles, 
  FileText, 
  BarChart2, 
  CircleHelp,
  TrendingUp,
  LayoutGrid,
  Wrench,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AICanvas } from '@/components/ai-canvas';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  const [isAICanvasOpen, setIsAICanvasOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('widgetGen');

  return (
    <TooltipProvider>
    <SidebarProvider collapsible="offcanvas">
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
                  <SidebarMenuButton 
                    isActive={activeItem === 'widgetGen'}
                    className="group relative overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:shadow-md hover:scale-105 data-[active=true]:bg-gradient-to-r data-[active=true]:from-purple-100 data-[active=true]:to-indigo-100 dark:data-[active=true]:from-purple-900/30 dark:data-[active=true]:to-indigo-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-purple-200/50 dark:data-[active=true]:border-purple-700/50 menu-item-enhanced"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <Settings className="h-5 w-5 transition-all duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:rotate-90" />
                        {activeItem === 'widgetGen' && (
                          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-sm animate-pulse"></div>
                        )}
                      </div>
                      <span className="font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                        Widget Gen
                      </span>
                    </div>
                    {activeItem === 'widgetGen' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-r-full active-indicator show"></div>
                    )}
                  </SidebarMenuButton>
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
                  <Link href="/my-dashboards">
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
          <header className="fixed top-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-6 shadow-lg" 
                  style={{ left: 'var(--sidebar-width, 16rem)', width: 'calc(100vw - var(--sidebar-width, 16rem))' }}>
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Widget Generator
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Build custom widgets for your dashboards
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Wrench className="h-3 w-3 mr-1" />
                Tools
              </Badge>
          </div>
        </header>

          <main className="flex-1 overflow-auto pt-16 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <div className="p-8">
              {/* Enhanced Widget Generator Container */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg">
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Widget Builder
                      </h2>
                      <p className="text-slate-600 mt-1">
                        Create interactive widgets with advanced visualization capabilities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 p-3 bg-white/50 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700">Live Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">Smart Configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-slate-700">AI Assisted</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
          <WidgetGenerator />
                </div>
              </div>
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
} 