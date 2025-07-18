'use client';

import * as React from 'react';
import '../components/ai-canvas-button.css';
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
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BarChart2,
  Settings,
  CircleHelp,
  Bot,
  Sparkles,
} from 'lucide-react';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { AICanvas } from '@/components/ai-canvas';

export default function DashboardPage() {
  const [isAICanvasOpen, setIsAICanvasOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <BarChart2 className="size-6 text-primary" />
            <span className="text-lg font-semibold">TradeVision</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive tooltip="Dashboard">
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="AI Canvas - Intelligent Data Analysis"
                onClick={() => setIsAICanvasOpen(true)}
                className="ai-canvas-button text-white border-0 w-full"
              >
                <div className="flex items-center gap-2 relative z-10 w-full">
                  <div className="relative flex-shrink-0">
                    <Bot className="h-4 w-4 bot-icon" />
                    <Sparkles className="h-3 w-3 absolute -top-1 -right-1 sparkle-icon text-yellow-300" />
                  </div>
                  <span className="button-text flex-grow text-left">AI CANVAS</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Reports">
                <BarChart2 />
                Reports
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Support">
                <CircleHelp />
                Support
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-card px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <DashboardClient />
        </main>
      </SidebarInset>
      
      {/* AI Canvas Modal */}
      <AICanvas 
        isOpen={isAICanvasOpen} 
        onClose={() => setIsAICanvasOpen(false)} 
      />
    </SidebarProvider>
  );
}
