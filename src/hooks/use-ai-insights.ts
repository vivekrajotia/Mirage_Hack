import { useState, useCallback } from 'react';
import { AIInsightsService } from '@/lib/ai-insights-service';
import { Trade } from '@/lib/types';
import { FilterState } from '@/components/dashboard/filter-selector';

interface DashboardContext {
  dashboardType: string;
  dateRange: { from: Date | null; to: Date | null };
  filters: FilterState;
  dataCount: number;
  widgetTitle: string;
  timeSeriesData?: any[];
  chartData?: any[];
}

interface UseAIInsightsResult {
  insights: string | null;
  loading: boolean;
  error: string | null;
  generateInsights: (dashboardData: Trade[], contextInfo: DashboardContext) => Promise<void>;
  clearInsights: () => void;
  retryGeneration: () => void;
}

export const useAIInsights = (): UseAIInsightsResult => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{
    dashboardData: Trade[];
    contextInfo: DashboardContext;
  } | null>(null);

  const generateInsights = useCallback(async (
    dashboardData: Trade[],
    contextInfo: DashboardContext
  ) => {
    // Store request for retry functionality
    setLastRequest({ dashboardData, contextInfo });
    
    // Validate input data
    if (!dashboardData || dashboardData.length === 0) {
      setError('No data available for analysis');
      return;
    }

    setLoading(true);
    setError(null);
    setInsights(null);

    try {
      // Add screen data analysis context
      const enhancedContextInfo = {
        ...contextInfo,
        dataCount: dashboardData.length,
        widgetTitle: contextInfo.widgetTitle || `Analysis of ${dashboardData.length} trades`
      };

      // Generate insights using AI service
      const result = await AIInsightsService.generateInsights(
        dashboardData,
        enhancedContextInfo
      );

      setInsights(result);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      console.error('AI Insights generation error:', err);
      
      // Still provide fallback insights on error
      try {
        const fallbackResult = AIInsightsService.generateFallbackInsights(
          dashboardData,
          contextInfo
        );
        setInsights(fallbackResult);
      } catch (fallbackErr) {
        console.error('Fallback insights also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearInsights = useCallback(() => {
    setInsights(null);
    setError(null);
    setLastRequest(null);
  }, []);

  const retryGeneration = useCallback(async () => {
    if (lastRequest) {
      await generateInsights(lastRequest.dashboardData, lastRequest.contextInfo);
    }
  }, [lastRequest, generateInsights]);

  return {
    insights,
    loading,
    error,
    generateInsights,
    clearInsights,
    retryGeneration
  };
}; 