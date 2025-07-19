'use client';

import * as React from 'react';
import './ai-canvas-button.css';
import './enhanced-sidebar.css';
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
  Download,
  Filter,
  BarChart3,
  Send,
  RefreshCw,
  Eye,
  Columns3,
  Calendar,
  PieChart,
  Settings2,
  Mail,
  Loader2,
  MessageSquareText,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { AICanvas } from '@/components/ai-canvas';
import ReportsPage from '@/components/reports-page';
import Link from 'next/link';

interface DashboardPageProps {
  eodDates: string[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ eodDates }) => {
  const [isAICanvasOpen, setIsAICanvasOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('dashboard');
  const [dashboardRef, setDashboardRef] = React.useState<any>(null);

  // Functions to trigger dashboard actions
  const handleExportCSV = () => {
    if (dashboardRef?.exportToCSV) {
      dashboardRef.exportToCSV();
    }
  };

  const handleOpenVisualization = () => {
    if (dashboardRef?.setIsVisualizationOpen) {
      dashboardRef.setIsVisualizationOpen(true);
    }
  };

  const handleSendInsights = () => {
    if (dashboardRef?.sendInsightsEmail) {
      dashboardRef.sendInsightsEmail();
    }
  };

  const handleRefreshData = () => {
    window.location.reload();
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
                  <SidebarMenuButton 
                    isActive={activeItem === 'dashboard'}
                    tooltip="Dashboard Overview"
                    onClick={() => setActiveItem('dashboard')}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:shadow-md data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-cyan-100 dark:data-[active=true]:from-blue-900/30 dark:data-[active=true]:to-cyan-900/30 data-[active=true]:shadow-sm border-0 data-[active=true]:border data-[active=true]:border-blue-200/50 dark:data-[active=true]:border-blue-700/50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <LayoutDashboard className="h-5 w-5 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        {activeItem === 'dashboard' && (
                          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm"></div>
                        )}
                      </div>
                      <span className="font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        Dashboard
                      </span>
                    </div>
                    {activeItem === 'dashboard' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full"></div>
                    )}
                  </SidebarMenuButton>
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
                  <SidebarMenuButton 
                    isActive={activeItem === 'analytics'}
                    tooltip="Advanced Analytics"
                    onClick={() => setActiveItem('analytics')}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-100 data-[active=true]:to-teal-100 dark:data-[active=true]:from-emerald-900/30 dark:data-[active=true]:to-teal-900/30 data-[active=true]:shadow-sm"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <BarChart2 className="h-5 w-5 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                      <span className="font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        Analytics
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeItem === 'reports'}
                    tooltip="Reports & Exports"
                    onClick={() => setActiveItem('reports')}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 dark:hover:from-violet-900/20 dark:hover:to-purple-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-violet-100 data-[active=true]:to-purple-100 dark:data-[active=true]:from-violet-900/30 dark:data-[active=true]:to-purple-900/30 data-[active=true]:shadow-sm"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <FileText className="h-5 w-5 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                      <span className="font-medium group-hover:text-violet-700 dark:group-hover:text-violet-300">
                        Reports
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeItem === 'settings'}
                    tooltip="Dashboard Settings"
                    onClick={() => setActiveItem('settings')}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-900/20 dark:hover:to-gray-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-slate-100 data-[active=true]:to-gray-100 dark:data-[active=true]:from-slate-900/30 dark:data-[active=true]:to-gray-900/30 data-[active=true]:shadow-sm"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Settings className="h-5 w-5 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                      <span className="font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300">
                        Settings
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeItem === 'support'}
                    tooltip="Help & Support"
                    onClick={() => setActiveItem('support')}
                    className="group relative overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-100 data-[active=true]:to-amber-100 dark:data-[active=true]:from-orange-900/30 dark:data-[active=true]:to-amber-900/30 data-[active=true]:shadow-sm"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <CircleHelp className="h-5 w-5 transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400" />
                      <span className="font-medium group-hover:text-orange-700 dark:group-hover:text-orange-300">
                        Support
                      </span>
                    </div>
                  </SidebarMenuButton>
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
                  <Link href="/dashboard-generator">
                    <SidebarMenuButton>
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard Gen
                    </SidebarMenuButton>
                  </Link>
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
        
        <SidebarInset className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          {/* Enhanced Header with Navigation Actions */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {activeItem === 'reports' ? 'Reports Center' : 'Welcome to TradeVision'}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {activeItem === 'reports' 
                    ? 'Generate custom reports and AI-powered insights' 
                    : 'Your comprehensive trading analytics dashboard'
                  }
                </p>
              </div>
            </div>

            {/* Action Toolbar - Only show for dashboard */}
            {activeItem !== 'reports' && (
              <div className="flex items-center gap-2">
              {/* Quick Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Settings2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Quick Actions</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quick Actions</p>
                    </TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRefreshData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsAICanvasOpen(true)}>
                    <Bot className="mr-2 h-4 w-4" />
                    Open AI Canvas
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleOpenVisualization}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Data Visualization
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSendInsights}>
                    <Send className="mr-2 h-4 w-4" />
                    Send AI Insights
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Actions */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Data to CSV</p>
                </TooltipContent>
              </Tooltip>

              {/* Visualization Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleOpenVisualization}>
                    <PieChart className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Visualize</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Data Visualization Panel</p>
                </TooltipContent>
              </Tooltip>

              {/* AI Insights */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-700 hover:from-purple-500/20 hover:to-blue-500/20"
                    onClick={handleSendInsights}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">AI Insights</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send AI-Generated Insights via Email</p>
                </TooltipContent>
              </Tooltip>

              {/* Refresh Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleRefreshData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh Dashboard Data</p>
                </TooltipContent>
              </Tooltip>
            </div>
            )}
          </header>

          <main className="flex-1 overflow-auto">
            {activeItem === 'reports' ? (
              <ReportsPage />
            ) : (
              <div className="p-6">
                <DashboardClient ref={setDashboardRef} eodDates={eodDates} />
              </div>
            )}
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

export default DashboardPage; 