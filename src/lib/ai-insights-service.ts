import { Trade } from './types';
import { FilterState } from '@/components/dashboard/filter-selector';

const GEMINI_API_KEY =  'AIzaSyBFqwV3wtZ7nt0LmqpzMdvE6XoAxK_yk8c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

interface DashboardContext {
  dashboardType: string;
  dateRange: { from: Date | null; to: Date | null };
  filters: FilterState;
  dataCount: number;
  widgetTitle: string;
  timeSeriesData?: any[];
  chartData?: any[];
}

interface DataAnalysis {
  totalRecords: number;
  dateRange: string;
  priceStats: {
    min: number;
    max: number;
    average: number;
    median: number;
    volatility: number;
  };
  pnlStats: {
    totalPnl: number;
    profitableCount: number;
    losingCount: number;
    avgPnl: number;
  };
  commodityBreakdown: Array<{
    commodity: string;
    count: number;
    totalPnl: number;
    avgPrice: number;
  }>;
  trendAnalysis: {
    direction: 'uptrend' | 'downtrend' | 'sideways';
    strength: number;
    momentum: number;
  };
  riskMetrics: {
    maxDrawdown: number;
    sharpeRatio: number;
    volatility: number;
  };
}

interface ChatResponse {
  type: 'filter' | 'insight';
  filters?: FilterState;
  insight?: string;
  explanation: string;
  confidence: number;
}

export class AIInsightsService {
  /**
   * Parse natural language query - handles both filters and data questions
   */
  static async parseNaturalLanguageQuery(
    query: string,
    availableData: Trade[]
  ): Promise<{ filters: FilterState; explanation: string; confidence: number }> {
    try {
      // First, determine if this is a filter request or a data question
      const chatResponse = await this.processChatQuery(query, availableData);
      
      if (chatResponse.type === 'filter') {
        return {
          filters: chatResponse.filters || {},
          explanation: chatResponse.explanation,
          confidence: chatResponse.confidence
        };
      } else {
        // For insights, return empty filters but include the insight in explanation
        return {
          filters: {},
          explanation: chatResponse.insight || chatResponse.explanation,
          confidence: chatResponse.confidence
        };
      }
    } catch (error) {
      console.error('AI query processing failed:', error);
      return this.fallbackParseQuery(query, availableData);
    }
  }

  /**
   * Process chat query to determine if it's a filter request or data question
   */
  static async processChatQuery(
    query: string,
    availableData: Trade[]
  ): Promise<ChatResponse> {
    try {
      const uniqueValues = AIInsightsService.extractUniqueValues(availableData);
      const dataAnalysis = this.createDetailedDataAnalysis(availableData, {
        dashboardType: 'Trading Dashboard',
        dateRange: { from: null, to: null },
        filters: {},
        dataCount: availableData.length,
        widgetTitle: 'Current Data Analysis'
      });

      const prompt = this.createChatPrompt(query, uniqueValues, availableData, dataAnalysis);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        return this.parseGeminiChatResponse(aiResponse);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Chat processing failed:', error);
      throw error;
    }
  }

  /**
   * Create comprehensive chat prompt for both filters and insights
   */
  private static createChatPrompt(
    query: string,
    uniqueValues: any,
    availableData: Trade[],
    dataAnalysis: DataAnalysis
  ): string {
    const sampleData = availableData.slice(0, 5).map(trade => ({
      trade_id: trade.trade_id,
      commodity: trade.commodity,
      company: trade.company,
      trader_name: trade.trader_name,
      counterparty: trade.counterparty,
      price: trade.price,
      quantity: trade.quantity,
      mtm_pnl: trade.mtm_pnl,
      trade_transaction_type: trade.trade_transaction_type,
      trade_date_time: trade.trade_date_time
    }));

    return `You are an expert trading analyst who can both filter data and provide insights about trading data.

USER QUERY: "${query}"

CURRENT DATA CONTEXT:
- Total records: ${availableData.length}
- Available commodities: ${uniqueValues.commodities.slice(0, 10).join(', ')}${uniqueValues.commodities.length > 10 ? '...' : ''}
- Available companies: ${uniqueValues.companies.slice(0, 10).join(', ')}${uniqueValues.companies.length > 10 ? '...' : ''}
- Available traders: ${uniqueValues.traders.slice(0, 10).join(', ')}${uniqueValues.traders.length > 10 ? '...' : ''}
- Available counterparties: ${uniqueValues.counterparties.slice(0, 10).join(', ')}${uniqueValues.counterparties.length > 10 ? '...' : ''}

SAMPLE DATA:
${JSON.stringify(sampleData, null, 2)}

CURRENT DATA ANALYSIS:
- Total PnL: ₹${dataAnalysis.pnlStats.totalPnl.toFixed(2)}
- Profitable trades: ${dataAnalysis.pnlStats.profitableCount}/${dataAnalysis.totalRecords}
- Average price: ₹${dataAnalysis.priceStats.average.toFixed(2)}
- Price range: ₹${dataAnalysis.priceStats.min.toFixed(2)} - ₹${dataAnalysis.priceStats.max.toFixed(2)}
- Top commodities: ${dataAnalysis.commodityBreakdown.slice(0, 3).map(c => `${c.commodity} (${c.count})`).join(', ')}

INSTRUCTIONS:
1. Determine if the user wants to FILTER data or ASK QUESTIONS about the data
2. Filter requests: "show", "filter", "find", "get", specific commodity names, price ranges, etc.
3. Question requests: "what", "why", "how", "analyze", "explain", "insights", "trends", etc.

FOR FILTER REQUESTS - Use this format:
{
  "type": "filter",
  "filters": {
    "field_name": {"stringValue": "value", "stringOperator": "contains|equals|startsWith|endsWith"}
    // OR
    "field_name": {"selectedValues": ["value1", "value2"]}
    // OR  
    "field_name": {"minValue": number, "maxValue": number}
  },
  "explanation": "Applied filter: description of what was filtered",
  "confidence": 0.95
}

FOR QUESTION/INSIGHT REQUESTS - Use this format:
{
  "type": "insight",
  "insight": "Detailed analysis and insights about the data based on the user's question. Include specific numbers, trends, recommendations, and explanations.",
  "explanation": "Provided insights about: [topic]",
  "confidence": 0.90
}

FILTER FIELD TYPES:
- trade_id: {"stringValue": "value", "stringOperator": "contains|equals|startsWith|endsWith"}
- commodity: {"selectedValues": ["value1", "value2"]}
- company: {"selectedValues": ["value1", "value2"]}
- trader_name: {"selectedValues": ["value1", "value2"]}
- counterparty: {"selectedValues": ["value1", "value2"]}
- price: {"minValue": number, "maxValue": number}
- quantity: {"minValue": number, "maxValue": number}
- mtm_pnl: {"minValue": number, "maxValue": number}
- trade_transaction_type: {"selectedValues": ["0"]} for buy, {"selectedValues": ["1"]} for sell
- trade_date_time: {"startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"}

IMPORTANT:
- For profitable trades: mtm_pnl {"minValue": 0.01}
- For losing trades: mtm_pnl {"maxValue": -0.01}
- Use exact values from available data when possible
- Only return valid JSON, no additional text
- For insights, provide detailed analysis with specific numbers and actionable recommendations
- For filters, use exact field names and proper formats`;
  }

  /**
   * Parse Gemini's chat response
   */
  private static parseGeminiChatResponse(aiResponse: string): ChatResponse {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return {
        type: parsedResponse.type || 'insight',
        filters: parsedResponse.filters || {},
        insight: parsedResponse.insight || '',
        explanation: parsedResponse.explanation || 'Response processed.',
        confidence: parsedResponse.confidence || 0.8
      };
    } catch (error) {
      console.error('Error parsing Gemini chat response:', error);
      return {
        type: 'insight',
        insight: `I had trouble processing your request. Here's what I can tell you about your data:
        
You have ${this.getCurrentDataCount()} trading records available. Try asking specific questions like:
• "What's the overall PnL performance?"
• "Which commodities are most profitable?"
• "Show me profitable trades"
• "What are the trading patterns?"`,
        explanation: 'Provided general data overview',
        confidence: 0.5
      };
    }
  }

  /**
   * Helper to get current data count (fallback)
   */
  private static getCurrentDataCount(): string {
    return 'multiple';
  }

  /**
   * Create a comprehensive prompt for Gemini to parse filter queries (legacy support)
   */
  private static createFilterParsingPrompt(
    query: string,
    uniqueValues: any,
    availableData: Trade[]
  ): string {
    // This is kept for backward compatibility but now uses the new chat system
    return this.createChatPrompt(query, uniqueValues, availableData, 
      this.createDetailedDataAnalysis(availableData, {
        dashboardType: 'Trading Dashboard',
        dateRange: { from: null, to: null },
        filters: {},
        dataCount: availableData.length,
        widgetTitle: 'Filter Request'
      })
    );
  }

  /**
   * Parse Gemini's response into structured filter data (legacy support)
   */
  private static parseGeminiFilterResponse(
    aiResponse: string,
    uniqueValues: any
  ): { filters: FilterState; explanation: string; confidence: number } {
    try {
      const chatResponse = this.parseGeminiChatResponse(aiResponse);
      
      return {
        filters: chatResponse.filters || {},
        explanation: chatResponse.explanation,
        confidence: chatResponse.confidence
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        filters: {},
        explanation: `I couldn't fully understand your query. Please try rephrasing it or use examples like:
        
• "Trade ID containing 'ABC123'"
• "Commodity is 'Gold'"
• "Show profitable trades"
• "Price between 100 and 200"
• "Buy trades"`,
        confidence: 0
      };
    }
  }

  /**
   * Fallback parsing for when Gemini API fails
   */
  private static fallbackParseQuery(
    query: string,
    availableData: Trade[]
  ): { filters: FilterState; explanation: string; confidence: number } {
    const filters: FilterState = {};
    let explanation = '';
    const normalizedQuery = query.toLowerCase();

    // Check if it's a question rather than a filter request
    const questionWords = ['what', 'why', 'how', 'analyze', 'explain', 'insights', 'trends', 'performance'];
    const isQuestion = questionWords.some(word => normalizedQuery.includes(word));

    if (isQuestion) {
      // Provide basic insights as fallback
      const totalRecords = availableData.length;
      const totalPnl = availableData.reduce((sum, trade) => sum + trade.mtm_pnl, 0);
      const profitableCount = availableData.filter(trade => trade.mtm_pnl > 0).length;
      
      explanation = `Based on your ${totalRecords} trading records:
      
📊 **Performance Summary:**
• Total PnL: ₹${totalPnl.toFixed(2)}
• Profitable trades: ${profitableCount}/${totalRecords} (${((profitableCount/totalRecords)*100).toFixed(1)}%)
• Win rate: ${profitableCount > totalRecords/2 ? 'Good' : 'Needs improvement'}

💡 **Key Insights:**
• ${totalPnl > 0 ? 'Overall positive performance' : 'Overall negative performance'}
• ${profitableCount > totalRecords/2 ? 'More winners than losers' : 'More losers than winners'}

Try asking more specific questions or use the AI insights tab for detailed analysis.`;
      
      return { filters, explanation, confidence: 0.7 };
    }

    // Basic pattern matching for filters as fallback
    if (normalizedQuery.includes('profitable') || normalizedQuery.includes('profit')) {
      filters.mtm_pnl = { minValue: 0.01 };
      explanation += 'Applied filter: Profitable trades. ';
    } else if (normalizedQuery.includes('loss') || normalizedQuery.includes('losing')) {
      filters.mtm_pnl = { maxValue: -0.01 };
      explanation += 'Applied filter: Losing trades. ';
    }

    if (normalizedQuery.includes('buy')) {
      filters.trade_transaction_type = { selectedValues: ['0'] };
      explanation += 'Applied filter: Buy trades. ';
    } else if (normalizedQuery.includes('sell')) {
      filters.trade_transaction_type = { selectedValues: ['1'] };
      explanation += 'Applied filter: Sell trades. ';
    }

    // Extract quoted values for various fields
    const quotedMatch = normalizedQuery.match(/["']([^"']+)["']/);
    if (quotedMatch) {
      const value = quotedMatch[1];
      const uniqueValues = this.extractUniqueValues(availableData);
      
      // Check if it's a commodity
      if (uniqueValues.commodities.some(c => c.toLowerCase().includes(value.toLowerCase()))) {
        const matchedCommodity = uniqueValues.commodities.find(c => c.toLowerCase().includes(value.toLowerCase()));
        filters.commodity = { selectedValues: [matchedCommodity!] };
        explanation += `Applied filter: Commodity is "${matchedCommodity}". `;
      }
      // Check if it's a trader
      else if (uniqueValues.traders.some(t => t.toLowerCase().includes(value.toLowerCase()))) {
        const matchedTrader = uniqueValues.traders.find(t => t.toLowerCase().includes(value.toLowerCase()));
        filters.trader_name = { selectedValues: [matchedTrader!] };
        explanation += `Applied filter: Trader is "${matchedTrader}". `;
      }
      // Check if it's a trade ID
      else if (normalizedQuery.includes('trade') && normalizedQuery.includes('id')) {
        filters.trade_id = { stringValue: value, stringOperator: 'contains' };
        explanation += `Applied filter: Trade ID contains "${value}". `;
      }
    }

    if (Object.keys(filters).length === 0 && !isQuestion) {
      explanation = `I couldn't understand your request. You can:

🔍 **Filter data:** "Show profitable trades", "Gold trades", "Buy trades"
❓ **Ask questions:** "What's the performance?", "Which commodity is best?", "How are we doing?"

Try being more specific or use the examples above.`;
    }

    return {
      filters,
      explanation,
      confidence: Object.keys(filters).length > 0 ? 0.6 : 0.3
    };
  }

  /**
   * Extract unique values from data for fuzzy matching
   */
  private static extractUniqueValues(data: Trade[]): {
    commodities: string[];
    companies: string[];
    traders: string[];
    counterparties: string[];
  } {
    const commodities = [...new Set(data.map(t => t.commodity).filter(Boolean))];
    const companies = [...new Set(data.map(t => t.company).filter(Boolean))];
    const traders = [...new Set(data.map(t => t.trader_name).filter(Boolean))];
    const counterparties = [...new Set(data.map(t => t.counterparty).filter(Boolean))];

    return {
      commodities: commodities.sort(),
      companies: companies.sort(),
      traders: traders.sort(),
      counterparties: counterparties.sort()
    };
  }

  /**
   * Find best match using fuzzy matching
   */
  private static findBestMatch(input: string, options: string[]): string {
    const normalizedInput = input.toLowerCase();
    
    // Exact match first
    const exactMatch = options.find(option => option.toLowerCase() === normalizedInput);
    if (exactMatch) return exactMatch;

    // Partial match
    const partialMatch = options.find(option => 
      option.toLowerCase().includes(normalizedInput) || 
      normalizedInput.includes(option.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // Fuzzy match (simple Levenshtein distance)
    let bestMatch = options[0];
    let bestScore = Infinity;

    for (const option of options) {
      const score = AIInsightsService.levenshteinDistance(normalizedInput, option.toLowerCase());
      if (score < bestScore) {
        bestScore = score;
        bestMatch = option;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein distance
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate intelligent suggestions based on query
   */
  private static generateSuggestions(query: string, uniqueValues: any): string {
    const suggestions = [];

    // Check if query mentions any field names
    const fieldMentions = {
      'trade': 'Trade ID containing "ABC123"',
      'commodity': `Commodity is "${uniqueValues.commodities[0] || 'Gold'}"`,
      'company': `Company is "${uniqueValues.companies[0] || 'ABC Corp'}"`,
      'trader': `Trader name is "${uniqueValues.traders[0] || 'John Smith'}"`,
      'price': 'Price between 100 and 200',
      'pnl': 'Profitable trades',
      'buy': 'Buy trades',
      'sell': 'Sell trades',
      'date': 'From 2024-01-01 to 2024-12-31'
    };

    for (const [field, suggestion] of Object.entries(fieldMentions)) {
      if (query.toLowerCase().includes(field)) {
        suggestions.push(suggestion);
      }
    }

    if (suggestions.length === 0) {
      return `I didn't understand your query. Try these examples:

🔍 **Filter Examples:**
• "Trade ID containing 'ABC123'"
• "Commodity is 'Gold'"
• "Show profitable trades"
• "Price between 100 and 200"
• "Buy trades"

❓ **Question Examples:**
• "What's our overall performance?"
• "Which commodity is most profitable?"
• "How are we doing this month?"
• "Analyze the trading patterns"

Available commodities: ${uniqueValues.commodities.slice(0, 5).join(', ')}${uniqueValues.commodities.length > 5 ? '...' : ''}
Available companies: ${uniqueValues.companies.slice(0, 5).join(', ')}${uniqueValues.companies.length > 5 ? '...' : ''}`;
    }

    return `I found some related suggestions based on your query:

• ${suggestions.join('\n• ')}

You can also ask questions like: "What's the performance?" or "Which trader is doing best?"`;
  }

  /**
   * Main method to generate AI insights from dashboard data
   */
  static async generateInsights(
    dashboardData: Trade[],
    contextInfo: DashboardContext
  ): Promise<string> {
    try {
      // First, analyze the screen data
      const dataAnalysis = this.createDetailedDataAnalysis(dashboardData, contextInfo);
      
      // Create comprehensive prompt for AI
      const prompt = this.createInsightsPrompt(dataAnalysis, contextInfo);
      
      // Call Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (error) {
      console.error('AI Insights generation failed:', error);
      // Return fallback analysis if API fails
      return this.generateFallbackInsights(dashboardData, contextInfo);
    }
  }

  /**
   * Create detailed analysis of current screen data
   */
  static createDetailedDataAnalysis(
    dashboardData: Trade[],
    contextInfo: DashboardContext
  ): DataAnalysis {
    if (!dashboardData || dashboardData.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Price statistics
    const prices = dashboardData.map(trade => trade.price).filter(p => p && p > 0);
    const sortedPrices = prices.sort((a, b) => a - b);
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      volatility: this.calculateVolatility(prices)
    };

    // PnL statistics
    const pnlValues = dashboardData.map(trade => trade.mtm_pnl);
    const totalPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
    const profitableCount = pnlValues.filter(pnl => pnl > 0).length;
    const pnlStats = {
      totalPnl,
      profitableCount,
      losingCount: pnlValues.length - profitableCount,
      avgPnl: totalPnl / pnlValues.length
    };

    // Commodity breakdown
    const commodityMap = new Map<string, { count: number; totalPnl: number; prices: number[] }>();
    dashboardData.forEach(trade => {
      const commodity = trade.commodity || 'Unknown';
      if (!commodityMap.has(commodity)) {
        commodityMap.set(commodity, { count: 0, totalPnl: 0, prices: [] });
      }
      const existing = commodityMap.get(commodity)!;
      existing.count++;
      existing.totalPnl += trade.mtm_pnl;
      if (trade.price > 0) existing.prices.push(trade.price);
    });

    const commodityBreakdown = Array.from(commodityMap.entries()).map(([commodity, data]) => ({
      commodity,
      count: data.count,
      totalPnl: data.totalPnl,
      avgPrice: data.prices.length > 0 ? data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length : 0
    }));

    // Trend analysis
    const trendAnalysis = this.analyzeTrend(dashboardData);

    // Risk metrics
    const riskMetrics = this.calculateRiskMetrics(dashboardData);

    return {
      totalRecords: dashboardData.length,
      dateRange: this.formatDateRange(contextInfo.dateRange),
      priceStats,
      pnlStats,
      commodityBreakdown,
      trendAnalysis,
      riskMetrics
    };
  }

  /**
   * Analyze market trends and patterns
   */
  static analyzeTrend(data: Trade[]): DataAnalysis['trendAnalysis'] {
    // Sort by date for time series analysis
    const sortedData = [...data].sort((a, b) => 
      new Date(a.trade_date_time).getTime() - new Date(b.trade_date_time).getTime()
    );

    const prices = sortedData.map(trade => trade.price).filter(p => p > 0);
    
    if (prices.length < 2) {
      return { direction: 'sideways', strength: 0, momentum: 0 };
    }

    // Calculate price changes
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      priceChanges.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    // Determine trend direction
    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const positiveChanges = priceChanges.filter(change => change > 0).length;
    const negativeChanges = priceChanges.filter(change => change < 0).length;

    let direction: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
    if (positiveChanges > negativeChanges * 1.5) {
      direction = 'uptrend';
    } else if (negativeChanges > positiveChanges * 1.5) {
      direction = 'downtrend';
    }

    // Calculate trend strength (0-100)
    const strength = Math.min(Math.abs(avgChange) * 100, 100);

    // Calculate momentum (recent vs older changes)
    const recentChanges = priceChanges.slice(-Math.ceil(priceChanges.length / 3));
    const momentum = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;

    return {
      direction,
      strength,
      momentum: momentum * 100
    };
  }

  /**
   * Calculate price volatility
   */
  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100; // Return as percentage
  }

  /**
   * Calculate risk metrics
   */
  static calculateRiskMetrics(data: Trade[]): DataAnalysis['riskMetrics'] {
    const pnlValues = data.map(trade => trade.mtm_pnl);
    const sortedPnl = [...pnlValues].sort((a, b) => a - b);
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = pnlValues[0];
    for (let i = 1; i < pnlValues.length; i++) {
      if (pnlValues[i] > peak) {
        peak = pnlValues[i];
      }
      const drawdown = (peak - pnlValues[i]) / Math.abs(peak);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    // Calculate Sharpe ratio (simplified)
    const avgPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0) / pnlValues.length;
    const pnlStdDev = Math.sqrt(
      pnlValues.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnl, 2), 0) / pnlValues.length
    );
    const sharpeRatio = pnlStdDev > 0 ? avgPnl / pnlStdDev : 0;

    // Overall portfolio volatility
    const volatility = (pnlStdDev / Math.abs(avgPnl)) * 100;

    return {
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio,
      volatility: Math.min(volatility, 100)
    };
  }

  /**
   * Create comprehensive AI prompt
   */
  static createInsightsPrompt(analysis: DataAnalysis, contextInfo: DashboardContext): string {
    const { dashboardType, dateRange, filters, dataCount, widgetTitle } = contextInfo;
    
    const filtersStr = Object.keys(filters).length > 0 
      ? Object.entries(filters).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(', ')
      : 'No filters applied';

    // Format large numbers in Indian currency format
    const formatINR = (value: number): string => {
      if (Math.abs(value) >= 10000000) { // 1 crore
        return `₹${(value / 10000000).toFixed(2)}Cr`;
      } else if (Math.abs(value) >= 100000) { // 1 lakh
        return `₹${(value / 100000).toFixed(2)}L`;
      } else {
        return `₹${value.toLocaleString('en-IN')}`;
      }
    };

    return `
You are an expert financial analyst providing insights for a commodity trading dashboard for an Indian trading company.

DASHBOARD CONTEXT:
- Dashboard Type: ${dashboardType}
- Widget: ${widgetTitle}
- Date Range: ${analysis.dateRange}
- Active Filters: ${filtersStr}
- Total Records: ${analysis.totalRecords}

CURRENT SCREEN DATA ANALYSIS:
- Price Range: ₹${analysis.priceStats.min.toFixed(2)} - ₹${analysis.priceStats.max.toFixed(2)}
- Average Price: ₹${analysis.priceStats.average.toFixed(2)}
- Price Volatility: ${analysis.priceStats.volatility.toFixed(2)}%

PNL PERFORMANCE:
- Total MTM PnL: ${formatINR(analysis.pnlStats.totalPnl)}
- Profitable Trades: ${analysis.pnlStats.profitableCount}/${analysis.totalRecords} (${((analysis.pnlStats.profitableCount/analysis.totalRecords)*100).toFixed(1)}%)
- Average PnL: ${formatINR(analysis.pnlStats.avgPnl)}

COMMODITY BREAKDOWN:
${analysis.commodityBreakdown.slice(0, 5).map(c => 
  `- ${c.commodity}: ${c.count} trades, PnL: ${formatINR(c.totalPnl)}, Avg Price: ₹${c.avgPrice.toFixed(2)}`
).join('\n')}

TREND ANALYSIS:
- Direction: ${analysis.trendAnalysis.direction}
- Strength: ${analysis.trendAnalysis.strength.toFixed(1)}%
- Momentum: ${analysis.trendAnalysis.momentum.toFixed(1)}%

RISK METRICS:
- Max Drawdown: ${analysis.riskMetrics.maxDrawdown.toFixed(2)}%
- Sharpe Ratio: ${analysis.riskMetrics.sharpeRatio.toFixed(2)}
- Portfolio Volatility: ${analysis.riskMetrics.volatility.toFixed(2)}%

Please provide detailed insights in this exact format:

## 🎯 Current Screen Analysis
[Analyze the specific data visible on screen, including key metrics and patterns. Focus on Indian commodity markets.]

## 📈 Price Trends & Patterns
[Identify price trends, volatility patterns, and market cycles. Consider Indian market hours and seasonality.]

## 🔮 Market Forecast
[Provide specific price predictions with confidence levels and timeframes. Consider Indian market conditions and monsoon effects.]

## ⚠️ Risk Assessment
[Evaluate risks from current patterns, concentration, and market conditions. Consider Indian regulatory environment.]

## 💡 Trading Recommendations
[Give actionable trading advice based on the analysis. Consider Indian market liquidity and trading hours.]

## 📊 Key Metrics Summary
[Summarize the most important numbers and ratios in Indian currency format]

GUIDELINES:
- Focus on EXACT data currently displayed (${analysis.totalRecords} records)
- Use Indian Rupee (₹) currency format and Indian market context
- Provide specific price forecasts with percentages and reasoning
- Include volatility analysis and trend strength assessment
- Consider commodity-specific factors and Indian seasonal patterns
- Give actionable trading recommendations with entry/exit points
- Use specific numbers and dates from the data
- Explain the reasoning behind each recommendation
- Consider risk-reward ratios for suggested trades
- Include time-sensitive insights based on current market conditions
- Consider Indian market regulations and trading practices
- Account for monsoon effects on agricultural commodities
- Factor in Indian festival seasons and their impact on commodity prices
`;
  }

  /**
   * Generate fallback insights when AI is unavailable
   */
  static generateFallbackInsights(
    dashboardData: Trade[],
    contextInfo: DashboardContext
  ): string {
    const analysis = this.createDetailedDataAnalysis(dashboardData, contextInfo);
    
    // Format large numbers in Indian currency format
    const formatINR = (value: number): string => {
      if (Math.abs(value) >= 10000000) { // 1 crore
        return `₹${(value / 10000000).toFixed(2)}Cr`;
      } else if (Math.abs(value) >= 100000) { // 1 lakh
        return `₹${(value / 100000).toFixed(2)}L`;
      } else {
        return `₹${value.toLocaleString('en-IN')}`;
      }
    };
    
    return `
## 🎯 Current Screen Analysis
Analyzing ${analysis.totalRecords} trades from ${analysis.dateRange}. 
Current price range: ₹${analysis.priceStats.min.toFixed(2)} - ₹${analysis.priceStats.max.toFixed(2)} with ${analysis.priceStats.volatility.toFixed(2)}% volatility.

## 📈 Price Trends & Patterns  
Market showing ${analysis.trendAnalysis.direction} with ${analysis.trendAnalysis.strength.toFixed(1)}% strength.
Momentum indicator: ${analysis.trendAnalysis.momentum.toFixed(1)}%

## 🔮 Market Forecast
Based on current trends, expect ${analysis.trendAnalysis.direction === 'uptrend' ? 'continued upward movement' : 
analysis.trendAnalysis.direction === 'downtrend' ? 'potential downward pressure' : 'sideways movement'}.
Consider Indian market seasonality and monsoon effects on commodity prices.

## ⚠️ Risk Assessment
Portfolio volatility: ${analysis.riskMetrics.volatility.toFixed(2)}%
Max drawdown: ${analysis.riskMetrics.maxDrawdown.toFixed(2)}%
Risk level: ${analysis.riskMetrics.volatility > 30 ? 'High' : analysis.riskMetrics.volatility > 15 ? 'Medium' : 'Low'}

## 💡 Trading Recommendations
- ${analysis.pnlStats.totalPnl > 0 ? 'Portfolio showing positive performance' : 'Portfolio needs attention'}
- ${analysis.pnlStats.profitableCount > analysis.pnlStats.losingCount ? 'More winners than losers' : 'Review losing positions'}
- Consider position sizing based on ${analysis.riskMetrics.volatility.toFixed(2)}% volatility
- Monitor Indian market hours and liquidity conditions

## 📊 Key Metrics Summary
- Total PnL: ${formatINR(analysis.pnlStats.totalPnl)}
- Win Rate: ${((analysis.pnlStats.profitableCount/analysis.totalRecords)*100).toFixed(1)}%
- Avg Price: ₹${analysis.priceStats.average.toFixed(2)}
- Volatility: ${analysis.priceStats.volatility.toFixed(2)}%

*Note: AI analysis temporarily unavailable. Showing basic technical analysis.*
`;
  }

  /**
   * Helper methods
   */
  private static getEmptyAnalysis(): DataAnalysis {
    return {
      totalRecords: 0,
      dateRange: 'No data',
      priceStats: { min: 0, max: 0, average: 0, median: 0, volatility: 0 },
      pnlStats: { totalPnl: 0, profitableCount: 0, losingCount: 0, avgPnl: 0 },
      commodityBreakdown: [],
      trendAnalysis: { direction: 'sideways', strength: 0, momentum: 0 },
      riskMetrics: { maxDrawdown: 0, sharpeRatio: 0, volatility: 0 }
    };
  }

  private static formatDateRange(dateRange: { from: Date | null; to: Date | null }): string {
    if (!dateRange.from || !dateRange.to) return 'All time';
    return `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`;
  }
} 