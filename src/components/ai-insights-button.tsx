'use client';

import React, { useState, useMemo } from 'react';
import { Lightbulb, Loader2, RefreshCw, X, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import './ai-insights-button.css';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import ToastBanner from './toast-banner';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { Trade } from '@/lib/types';
import { FilterState } from './dashboard/filter-selector';

interface AIInsightsButtonProps {
  dashboardData: Trade[];
  dashboardType: string;
  widgetTitle?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  dateRange?: { from: Date | null; to: Date | null };
  filters?: FilterState;
  timeSeriesData?: any[];
  chartData?: any[];
  className?: string;
}

export const AIInsightsButton: React.FC<AIInsightsButtonProps> = ({
  dashboardData,
  dashboardType,
  widgetTitle = 'Dashboard Analysis',
  position = 'top-right',
  dateRange = { from: null, to: null },
  filters = {},
  timeSeriesData,
  chartData,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { insights, loading, error, generateInsights, clearInsights, retryGeneration } = useAIInsights();

  // Analyze current screen data for quick metrics
  const screenAnalysis = useMemo(() => {
    if (!dashboardData || dashboardData.length === 0) {
      return {
        totalRecords: 0,
        totalPnl: 0,
        profitableCount: 0,
        priceRange: { min: 0, max: 0, avg: 0 },
        topCommodities: [],
        riskLevel: 'Low'
      };
    }

    const totalRecords = dashboardData.length;
    const totalPnl = dashboardData.reduce((sum, trade) => sum + trade.mtm_pnl, 0);
    const profitableCount = dashboardData.filter(trade => trade.mtm_pnl > 0).length;
    
    const prices = dashboardData.map(trade => trade.price).filter(p => p > 0);
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / prices.length
    } : { min: 0, max: 0, avg: 0 };

    // Get top commodities by trade count
    const commodityCounts = dashboardData.reduce((acc, trade) => {
      const commodity = trade.commodity || 'Unknown';
      acc[commodity] = (acc[commodity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCommodities = Object.entries(commodityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([commodity, count]) => ({ commodity, count }));

    // Calculate risk level based on volatility
    const pnlValues = dashboardData.map(trade => trade.mtm_pnl);
    const avgPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0) / pnlValues.length;
    const pnlStdDev = Math.sqrt(
      pnlValues.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnl, 2), 0) / pnlValues.length
    );
    const volatility = Math.abs(avgPnl) > 0 ? (pnlStdDev / Math.abs(avgPnl)) * 100 : 0;
    
    const riskLevel = volatility > 30 ? 'High' : volatility > 15 ? 'Medium' : 'Low';

    return {
      totalRecords,
      totalPnl,
      profitableCount,
      priceRange,
      topCommodities,
      riskLevel,
      volatility
    };
  }, [dashboardData]);

  const handleInsightsRequest = async () => {
    const contextInfo = {
      dashboardType,
      dateRange,
      filters,
      dataCount: dashboardData.length,
      widgetTitle,
      timeSeriesData,
      chartData
    };

    await generateInsights(dashboardData, contextInfo);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    if (!insights && !loading) {
      handleInsightsRequest();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 10,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyle, top: '8px', right: '8px' };
      case 'top-left':
        return { ...baseStyle, top: '8px', left: '8px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '8px', right: '8px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '8px', left: '8px' };
      default:
        return { ...baseStyle, top: '8px', right: '8px' };
    }
  };

  const formatInsights = (insightsText: string) => {
    // Split by sections and format as markdown-like structure
    const sections = insightsText.split('## ').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      const title = lines[0];
      const content = lines.slice(1).join('\n');
      
      return (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {title.includes('🎯') && <BarChart3 className="h-5 w-5" />}
            {title.includes('📈') && <TrendingUp className="h-5 w-5" />}
            {title.includes('💡') && <Lightbulb className="h-5 w-5" />}
            {title.includes('⚠️') && <X className="h-5 w-5" />}
            {title.includes('🔮') && <TrendingUp className="h-5 w-5" />}
            {title.includes('📊') && <BarChart3 className="h-5 w-5" />}
            {title.replace(/[🎯📈💡⚠️🔮📊]/g, '').trim()}
          </h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {/* AI Insights Button */}
      <div style={getPositionStyle()} className={`ai-insights-container ${className}`}>
        <Button
          onClick={handleModalOpen}
          className="ai-insights-button relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Lightbulb className="h-5 w-5" />
          )}
          <span className="ml-2 hidden sm:inline">AI Insights</span>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-white opacity-0 animate-pulse rounded-lg"></div>
        </Button>
      </div>

      {/* Modal with AI Insights */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-blue-500" />
              AI Insights - {widgetTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6">
            {/* Screen Data Summary */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Current Screen Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {screenAnalysis.totalRecords}
                    </div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${screenAnalysis.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {screenAnalysis.totalPnl >= 0 ? '+' : ''}
                      ${screenAnalysis.totalPnl.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total PnL</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {screenAnalysis.profitableCount}/{screenAnalysis.totalRecords}
                    </div>
                    <div className="text-sm text-gray-600">Win Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ${screenAnalysis.priceRange.avg.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant={screenAnalysis.riskLevel === 'High' ? 'destructive' : 
                                screenAnalysis.riskLevel === 'Medium' ? 'default' : 'secondary'}>
                    Risk Level: {screenAnalysis.riskLevel}
                  </Badge>
                  
                  {screenAnalysis.topCommodities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-gray-600">Top:</span>
                      {screenAnalysis.topCommodities.slice(0, 2).map((item, index) => (
                        <Badge key={index} variant="outline">
                          {item.commodity} ({item.count})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator className="my-4" />

            {/* AI Insights Content */}
            <ScrollArea className="h-[400px] w-full pr-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-lg">Analyzing your data...</span>
                </div>
              )}

              {error && (
                <ToastBanner type="error" message={error} onClose={retryGeneration} />
              )}

              {insights && (
                <div className="space-y-4">
                  {formatInsights(insights)}
                </div>
              )}

              {!loading && !insights && !error && (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click "Generate Insights" to analyze your data</p>
                  <Button onClick={handleInsightsRequest} className="mt-4">
                    Generate Insights
                  </Button>
                </div>
              )}
            </ScrollArea>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex gap-2">
                <Button
                  onClick={handleInsightsRequest}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Refresh Analysis
                </Button>
                
                <Button
                  onClick={clearInsights}
                  variant="outline"
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
              
              <Button onClick={handleModalClose} variant="default">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIInsightsButton; 