'use client';

import WidgetGenerator from '@/widgetGen/widgetGen';
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
import { LayoutDashboard, Settings, Bot, Sparkles, FileText, BarChart2, CircleHelp } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';


export default function Page() {
  const [isAICanvasOpen, setIsAICanvasOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('widgetGen');

  return (
    <TooltipProvider>
    <SidebarProvider>
      <Sidebar className="border-r-0 shadow-lg sidebar-enhanced">
        <SidebarHeader className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 sidebar-header-enhanced">
          {/* Header content from dashboard */}
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
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsAICanvasOpen(true)}
                >
                  <Bot className="h-5 w-5" />
                  AI Canvas
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator className="my-2" />
              <SidebarMenuItem>
                <Link href="/widgetGen/widgetGen">
                  <SidebarMenuButton 
                    isActive={activeItem === 'widgetGen'}
                  >
                    <Settings className="w-5 h-5" />
                    Widget Gen
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      
      <SidebarInset className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" />
            <h1 className="text-lg font-semibold">Widget Generator</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <WidgetGenerator />
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
} 