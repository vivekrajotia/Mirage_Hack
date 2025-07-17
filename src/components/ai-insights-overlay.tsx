'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Loader2, RefreshCw, X, TrendingUp, BarChart3, MessageCircle, Send, Filter as FilterIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { Trade } from '@/lib/types';
import { FilterState } from './dashboard/filter-selector';
import { AIInsightsService } from '@/lib/ai-insights-service';
import './ai-insights-button.css';

interface AIInsightsOverlayProps {
  dashboardData: Trade[];
  filters: FilterState;
  dateRange: { from: Date | null; to: Date | null };
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  appliedFilters?: FilterState;
}

export const AIInsightsOverlay: React.FC<AIInsightsOverlayProps> = ({
  dashboardData,
  filters,
  dateRange,
  onFiltersChange,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
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
        riskLevel: 'Low',
        volatility: 0
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

  // Auto-hide button when no data
  useEffect(() => {
    setIsVisible(dashboardData && dashboardData.length > 0);
  }, [dashboardData]);

  // Parse natural language query into filters
  const parseNaturalLanguageQuery = async (query: string): Promise<{ filters: FilterState, explanation: string }> => {
    setIsChatLoading(true);
    
    try {
      // Use the enhanced AI service for parsing
      const result = await AIInsightsService.parseNaturalLanguageQuery(query, dashboardData);
      
      // Add confidence information to explanation if available
      let enhancedExplanation = result.explanation;
      if (result.confidence > 0) {
        enhancedExplanation += `\n\nConfidence: ${(result.confidence * 100).toFixed(0)}%`;
      }
      
      return { 
        filters: result.filters, 
        explanation: enhancedExplanation 
      };
    } catch (error) {
      return { 
        filters: {}, 
        explanation: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Parse the query and apply filters
    const { filters: newFilters, explanation } = await parseNaturalLanguageQuery(chatInput.trim());
    
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: explanation,
      timestamp: new Date(),
      appliedFilters: newFilters
    };

    setChatMessages(prev => [...prev, assistantMessage]);

    // Apply filters if any were parsed
    if (Object.keys(newFilters).length > 0 && onFiltersChange) {
      const combinedFilters = { ...filters, ...newFilters };
      onFiltersChange(combinedFilters);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const handleInsightsRequest = async () => {
    const contextInfo = {
      dashboardType: 'Trading Dashboard',
      dateRange,
      filters,
      dataCount: dashboardData.length,
      widgetTitle: `Dashboard Analysis - ${dashboardData.length} trades`,
      timeSeriesData: dashboardData,
      chartData: dashboardData
    };

    await generateInsights(dashboardData, contextInfo);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    if (!insights && !loading && activeTab === 'insights') {
      handleInsightsRequest();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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

  if (!isVisible) return null;

  return (
    <>
      {/* Fixed Overlay AI Insights Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleModalOpen}
          className="ai-insights-button relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-14 h-14 rounded-full p-0"
          size="lg"
          disabled={loading}
          title="AI Insights & Chat - Click for intelligent analysis and filtering"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <div className="flex items-center justify-center">
              <Lightbulb className="h-5 w-5" />
              <MessageCircle className="h-3 w-3 absolute top-1 right-1" />
            </div>
          )}
          
          {/* Pulse animation */}
          <div className="absolute inset-0 bg-white opacity-0 animate-pulse rounded-full"></div>
          
          {/* Notification badge for new insights */}
          {screenAnalysis.totalRecords > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {screenAnalysis.totalRecords > 99 ? '99+' : screenAnalysis.totalRecords}
            </div>
          )}
        </Button>
      </div>

      {/* Modal with AI Insights and Chat */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-blue-500" />
              AI Insights & Chat - Trading Dashboard
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
                      ₹{(screenAnalysis.totalPnl / 1000000).toFixed(2)}M
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
                      ₹{screenAnalysis.priceRange.avg.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </div>
                </div>

                {/* Risk Badge and Top Commodities */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={screenAnalysis.riskLevel === 'High' ? 'destructive' : 
                                screenAnalysis.riskLevel === 'Medium' ? 'default' : 'secondary'}>
                    Risk Level: {screenAnalysis.riskLevel}
                  </Badge>
                  
                  {screenAnalysis.topCommodities.length > 0 && (
                    <>
                      <span className="text-sm text-gray-600">Top Commodities:</span>
                      {screenAnalysis.topCommodities.slice(0, 2).map((item, index) => (
                        <Badge key={index} variant="outline">
                          {item.commodity} ({item.count})
                        </Badge>
                      ))}
                    </>
                  )}
                </div>

                {/* Active Filters Display */}
                {Object.keys(filters).length > 0 && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="text-sm">
                      <strong>Active Filters:</strong> {Object.keys(filters).length} filter(s) applied
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator className="my-4" />

            {/* Tabs for Insights and Chat */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'insights' | 'chat')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat Filter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights">
                <ScrollArea className="h-[400px] w-full pr-4">
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="ml-2 text-lg">Analyzing your trading data...</span>
                    </div>
                  )}

                  {error && (
                    <Alert className="mb-4">
                      <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button onClick={retryGeneration} variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {insights && (
                    <div className="space-y-4 insights-fade-in">
                      {formatInsights(insights)}
                    </div>
                  )}

                  {!loading && !insights && !error && (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Click "Generate Insights" to analyze your trading data</p>
                      <Button onClick={handleInsightsRequest} className="mt-4">
                        Generate Insights
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat">
                <div className="space-y-4">
                  {/* Quick Filter Buttons */}
                  {chatMessages.length === 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput("Show profitable trades")}
                          disabled={isChatLoading}
                        >
                          Profitable Trades
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput("Show losing trades")}
                          disabled={isChatLoading}
                        >
                          Losing Trades
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput("Buy trades")}
                          disabled={isChatLoading}
                        >
                          Buy Trades
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput("Sell trades")}
                          disabled={isChatLoading}
                        >
                          Sell Trades
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Chat Messages */}
                  <ScrollArea className="h-[300px] w-full pr-4 border rounded-md p-4">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Start chatting to filter your data!</p>
                        <p className="text-sm mt-2">Try: "Trade ID containing 'ABC123'" or "Show profitable trades"</p>
                        <div className="mt-4 text-xs text-gray-400">
                          <p>You can also try:</p>
                          <p>• "Price between 100 and 200"</p>
                          <p>• "Commodity is 'Gold'"</p>
                          <p>• "Trader name is 'John Smith'"</p>
                          <p>• "From 2024-01-01 to 2024-12-31"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <div className="whitespace-pre-wrap">{message.content}</div>
                              {message.appliedFilters && Object.keys(message.appliedFilters).length > 0 && (
                                <div className="mt-2 p-2 bg-black/10 rounded text-xs">
                                  <FilterIcon className="h-3 w-3 inline mr-1" />
                                  {Object.keys(message.appliedFilters).length} filter(s) applied
                                </div>
                              )}
                              <div className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your filter request... (e.g., 'Trade ID containing ABC123')"
                      disabled={isChatLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                      {isChatLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="flex gap-2">
                {activeTab === 'insights' && (
                  <>
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
                  </>
                )}
                
                {activeTab === 'chat' && (
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    disabled={isChatLoading}
                  >
                    Clear Chat
                  </Button>
                )}
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

export default AIInsightsOverlay; 