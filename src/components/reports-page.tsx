'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, MessageSquare, ArrowRight, Table2, Bot } from 'lucide-react';
import { CustomReports } from './custom-reports';
import { GenerateReports } from './generate-reports';

interface ReportsPageProps {}

const ReportsPage: React.FC<ReportsPageProps> = () => {
  const [activeView, setActiveView] = React.useState<'main' | 'custom' | 'generate'>('main');

  if (activeView === 'custom') {
    return <CustomReports onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'generate') {
    return <GenerateReports onBack={() => setActiveView('main')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Reports Center
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Generate custom reports or create intelligent reports with AI assistance
          </p>
        </div>

        {/* Report Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Custom Reports Box */}
          <Card 
            className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
            onClick={() => setActiveView('custom')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
                  <Table2 className="h-8 w-8" />
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Custom Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Access and customize your trading data with our interactive table view. 
                Filter, sort, and analyze your trades with advanced data management tools.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                  Interactive data table with advanced filtering
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                  Export capabilities (CSV, Excel)
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-500" />
                  Column customization and sorting
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('custom');
                }}
              >
                Open Custom Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Generate Reports Box */}
          <Card 
            className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
            onClick={() => setActiveView('generate')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-500"></div>
            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                  <Bot className="h-8 w-8" />
                </div>
                <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Use AI to generate intelligent reports from your data. Simply describe what 
                you need, and our AI will create comprehensive analysis and insights.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                  Natural language report generation
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                  AI-powered insights and analysis
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                  Custom report formatting
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView('generate');
                }}
              >
                Start AI Report Generation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:bg-slate-800/50 dark:border-slate-700/50">
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Choose your preferred reporting method to get started with data analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 