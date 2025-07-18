'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bot,
  Send,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Activity,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Loader2,
  User,
  X,
  Filter,
  Table as TableIcon,
  Palette,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { Trade } from '@/lib/types';
import { AIInsightsService } from '@/lib/ai-insights-service';
import { FilterState } from '@/components/dashboard/filter-selector';
import { applyFilters } from '@/lib/filter-utils';
import rawTrades from '@/app/xceler_eodservice_publisheddata (1).json';

// Map raw data to Trade interface (same as dashboard client)
const tradesData = rawTrades.map(trade => ({
  // Original mapped fields
  id: trade.trade_id,
  date: trade.trade_date_time,
  symbol: trade.commodity,
  type: trade.sell_open_position > 0 ? 'Sell' : 'Buy',
  quantity: trade.buy_open_position > 0 ? trade.buy_open_position : trade.sell_open_position,
  price: trade.price,
  mtm_pnl: trade.mtm_pnl,
  strategy: trade.trade_type,
  
  // All additional fields from JSON
  uuid: trade.uuid,
  created_by: trade.created_by,
  created_timestamp: trade.created_timestamp,
  end_date: trade.end_date,
  start_date: trade.start_date,
  tenant_id: trade.tenant_id,
  updated_by: trade.updated_by,
  updated_timestamp: trade.updated_timestamp,
  buy_open_position: trade.buy_open_position,
  closed_pnl_today: trade.closed_pnl_today,
  closed_position: trade.closed_position,
  commodity: trade.commodity,
  company: trade.company,
  counterparty: trade.counterparty,
  eod_currency: trade.eod_currency,
  eod_job_name: trade.eod_job_name,
  eod_run_date: trade.eod_run_date,
  eoduom: trade.eoduom,
  finance_cost: trade.finance_cost,
  freight_cost: trade.freight_cost,
  fx_exposure: trade.fx_exposure,
  fx_exposure_currency: trade.fx_exposure_currency,
  insurance_cost: trade.insurance_cost,
  mtm_settlement: trade.mtm_settlement,
  nbv: trade.nbv,
  obligationid: trade.obligationid,
  other_cost: trade.other_cost,
  pnl_monthly: trade.pnl_monthly,
  pnl_yearly: trade.pnl_yearly,
  price_currency: trade.price_currency,
  price_exposure: trade.price_exposure,
  profitcenter: trade.profitcenter,
  raw_data_id: trade.raw_data_id,
  realised_pnl_today: trade.realised_pnl_today,
  realized_date: trade.realized_date,
  realized_position: trade.realized_position,
  sell_open_position: trade.sell_open_position,
  tax_cost: trade.tax_cost,
  total_cost: trade.total_cost,
  trade_id: trade.trade_id,
  prev_mtm_pnl: trade.prev_mtm_pnl,
  prev_open_buy_position: trade.prev_open_buy_position,
  prev_open_sell_position: trade.prev_open_sell_position,
  trade_value: trade.trade_value,
  trader_name: trade.trader_name,
  prev_realised_pnl: trade.prev_realised_pnl,
  prev_realised_postion: trade.prev_realised_postion,
  prev_closed_postion: trade.prev_closed_postion,
  total_netted_cost: trade.total_netted_cost,
  total_added_cost: trade.total_added_cost,
  total_premium_discount: trade.total_premium_discount,
  trade_type: trade.trade_type,
  trade_transaction_type: trade.trade_transaction_type,
  price_type: trade.price_type,
  trade_date_time: trade.trade_date_time,
  parent_commodity: trade.parent_commodity,
  mtm_price_date: trade.mtm_price_date,
  bulk_packed: trade.bulk_packed,
  incoterm: trade.incoterm,
  brand: trade.brand,
  grade: trade.grade,
  origin: trade.origin,
  season: trade.season,
  trade_quantity: trade.trade_quantity,
  total_contract_qty: trade.total_contract_qty,
  planned_quantity: trade.planned_quantity,
  actual_load_quantity: trade.actual_load_quantity,
  actual_unload_quantity: trade.actual_unload_quantity,
  total_price_allocated_quantity: trade.total_price_allocated_quantity,
  plan_id: trade.plan_id,
  mtmindex: trade.mtmindex,
  mtm_index_period: trade.mtm_index_period,
  basis_mtm_index_period: trade.basis_mtm_index_period,
  contract_month: trade.contract_month,
  premium_discount: trade.premium_discount,
  market_settlement_price: trade.market_settlement_price,
  future_market_settlement_price: trade.future_market_settlement_price,
  basis_market_settlement_price: trade.basis_market_settlement_price,
  mtm_index_currency: trade.mtm_index_currency,
  mtm_index_uom: trade.mtm_index_uom,
  total_netted_cost_in_mtm_currency: trade.total_netted_cost_in_mtm_currency,
  total_added_cost_in_mtm_currency: trade.total_added_cost_in_mtm_currency,
  total_cost_in_mtm_currency: trade.total_cost_in_mtm_currency,
  trade_value_in_mtm_currency: trade.trade_value_in_mtm_currency,
  mtm_pnl_in_mtm_currency: trade.mtm_pnl_in_mtm_currency,
  reporting_uom: trade.reporting_uom,
  trade_quantity_in_reporting_uom: trade.trade_quantity_in_reporting_uom,
  obligation_quantity_in_reporting_uom: trade.obligation_quantity_in_reporting_uom,
  allocated_quantity_in_reporting_uom: trade.allocated_quantity_in_reporting_uom,
  actualized_quantity_in_reporting_uom: trade.actualized_quantity_in_reporting_uom,
  discharge_quantity_in_reporting_uom: trade.discharge_quantity_in_reporting_uom,
  priced_quantity_in_reporting_uom: trade.priced_quantity_in_reporting_uom,
  un_priced_quantity_in_reporting_uom: trade.un_priced_quantity_in_reporting_uom,
  closed_pnl_today_in_settlement: trade.closed_pnl_today_in_settlement,
  realised_pnl_today_in_settlement: trade.realised_pnl_today_in_settlement,
  provisional_pnl_in_settlement: trade.provisional_pnl_in_settlement,
  provisional_pnl_today: trade.provisional_pnl_today,
  basis_mtm_index_currency: trade.basis_mtm_index_currency,
  basis_mtm_index_uom: trade.basis_mtm_index_uom,
  invoice_currency: trade.invoice_currency,
  invoice_amount: trade.invoice_amount,
  actual_origin: trade.actual_origin,
  basis_mtm_index: trade.basis_mtm_index,
  delivery_end_date: trade.delivery_end_date,
  delivery_start_date: trade.delivery_start_date,
  discharge_port: trade.discharge_port,
  fx_allocation_status: trade.fx_allocation_status,
  fx_rate: trade.fx_rate,
  invoice_id: trade.invoice_id,
  laycan_date: trade.laycan_date,
  location: trade.location,
  obligation_status: trade.obligation_status,
  planned_obligation_id: trade.planned_obligation_id,
  prem_currency: trade.prem_currency,
  prem_uom: trade.prem_uom,
  price_allocation_status: trade.price_allocation_status,
  price_settlement_currency: trade.price_settlement_currency,
  priceuom: trade.priceuom,
  prov_price_currency: trade.prov_price_currency,
  prov_priceuom: trade.prov_priceuom,
  prov_trade_price: trade.prov_trade_price,
  quantityuom: trade.quantityuom,
  stock_currency: trade.stock_currency,
  stock_price: trade.stock_price,
  stock_quantity: trade.stock_quantity,
  stock_type: trade.stock_type,
  stockuom: trade.stockuom,
  storage_location: trade.storage_location,
  trade_discharge_location: trade.trade_discharge_location,
  trade_load_location: trade.trade_load_location,
  trade_settlement_price: trade.trade_settlement_price,
})) as Trade[];

interface AICanvasProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartData?: any;
  loading?: boolean;
}

interface GraphRequest {
  type: 'column' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string[];
  filters?: FilterState;
  title?: string;
  aggregation?: string;
}

// Constants for chart types
const CHART_TYPES = [
  { id: 'column', name: 'Column Chart', icon: BarChart3, color: 'bg-blue-500' },
  { id: 'line', name: 'Line Chart', icon: TrendingUp, color: 'bg-green-500' },
  { id: 'pie', name: 'Pie Chart', icon: Activity, color: 'bg-purple-500' },
  { id: 'area', name: 'Area Chart', icon: Activity, color: 'bg-orange-500' },
  { id: 'scatter', name: 'Scatter Plot', icon: Activity, color: 'bg-red-500' }
];

const EXCEL_COLORS = [
  '#5B9BD5', '#70AD47', '#FFC000', '#FF6B6B', '#9966CC',
  '#4ECDC4', '#FF8C42', '#A8E6CF', '#FFB3BA', '#BFBFBF'
];

export function AICanvas({ isOpen, onClose }: AICanvasProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Trade[]>([]);
  const [allData, setAllData] = useState<Trade[]>([]);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'trade_id', 'commodity', 'price', 'quantity', 'mtm_pnl', 'trader_name'
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    console.log('Loading trades data:', tradesData.length, 'records');
    setAllData(tradesData);
    setFilteredData(tradesData);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus chat input when opened
  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredData(allData);
      setActiveFilters({});
      return;
    }

    // Simple search across key fields
    const filtered = allData.filter(trade => {
      const searchableFields = [
        trade.trade_id,
        trade.commodity,
        trade.company,
        trade.trader_name,
        trade.counterparty,
        trade.price?.toString(),
        trade.quantity?.toString()
      ];
      
      return searchableFields.some(field => 
        field?.toLowerCase().includes(query.toLowerCase())
      );
    });

    setFilteredData(filtered);
  }, [allData]);

  // Generate chart from AI response
  const generateChart = useCallback((graphRequest: GraphRequest, data: Trade[]) => {
    if (!graphRequest.type || !data.length) return null;

    // For better performance and readability, limit and sample the data
    const processedData = data.length > 200 ? 
      data.slice(0, 200) : // Take first 200 records
      data;
    
    const baseOption = {
      backgroundColor: '#ffffff',
      textStyle: { fontFamily: 'inherit' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#1e293b', fontSize: 12 }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 10,
        textStyle: { fontSize: 12, color: '#64748b' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      }
    };

    switch (graphRequest.type) {
      case 'column':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: processedData.map(trade => trade.commodity || 'Unknown'),
            axisLabel: { rotate: 45 }
          },
          yAxis: { type: 'value' },
          series: [{
            name: 'MTM PnL',
            type: 'bar',
            data: processedData.map(trade => trade.mtm_pnl || 0),
            itemStyle: { color: EXCEL_COLORS[0] }
          }]
        };

      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: processedData.map((_, index) => `Trade ${index + 1}`),
          },
          yAxis: { type: 'value' },
          series: [{
            name: 'Price Trend',
            type: 'line',
            data: processedData.map(trade => trade.price || 0),
            smooth: true,
            itemStyle: { color: EXCEL_COLORS[1] }
          }]
        };

      case 'pie':
        const commodityData = processedData.reduce((acc, trade) => {
          const commodity = trade.commodity || 'Unknown';
          acc[commodity] = (acc[commodity] || 0) + Math.abs(trade.mtm_pnl || 0);
          return acc;
        }, {} as Record<string, number>);

        return {
          ...baseOption,
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          series: [{
            name: 'PnL by Commodity',
            type: 'pie',
            radius: ['0%', '70%'],
            data: Object.entries(commodityData).map(([name, value], index) => ({
              name,
              value,
              itemStyle: { color: EXCEL_COLORS[index % EXCEL_COLORS.length] }
            }))
          }]
        };

      case 'area':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: processedData.map((_, index) => `Period ${index + 1}`),
          },
          yAxis: { type: 'value' },
          series: [{
            name: 'Cumulative PnL',
            type: 'line',
            data: processedData.map((trade, index) => 
              processedData.slice(0, index + 1).reduce((sum, t) => sum + (t.mtm_pnl || 0), 0)
            ),
            areaStyle: { opacity: 0.6 },
            smooth: true,
            itemStyle: { color: EXCEL_COLORS[2] }
          }]
        };

      case 'scatter':
        return {
          ...baseOption,
          xAxis: { type: 'value', name: 'Price' },
          yAxis: { type: 'value', name: 'Quantity' },
          series: [{
            name: 'Price vs Quantity',
            type: 'scatter',
            data: processedData.map(trade => [trade.price || 0, trade.quantity || 0]),
            itemStyle: { color: EXCEL_COLORS[3] }
          }]
        };

      default:
        return null;
    }
  }, []);

  // Get data summary
  const getDataSummary = useCallback(() => {
    const totalPnL = filteredData.reduce((sum, trade) => sum + (trade.mtm_pnl || 0), 0);
    const profitableTrades = filteredData.filter(trade => (trade.mtm_pnl || 0) > 0).length;
    const totalTrades = filteredData.length;
    
    return {
      totalTrades,
      profitableTrades,
      totalPnL,
      profitRatio: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0
    };
  }, [filteredData]);

  // Enhanced graph request parsing
  const parseGraphRequest = (message: string): GraphRequest | null => {
    const lowerMessage = message.toLowerCase();
    
    // Check for graph keywords
    const graphKeywords = ['chart', 'graph', 'plot', 'visualize', 'show me'];
    const isGraphRequest = graphKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!isGraphRequest) return null;

    // Determine chart type
    let graphType: GraphRequest['type'] = 'column';
    
    if (lowerMessage.includes('line') || lowerMessage.includes('trend')) {
      graphType = 'line';
    } else if (lowerMessage.includes('pie') || lowerMessage.includes('distribution')) {
      graphType = 'pie';
    } else if (lowerMessage.includes('area') || lowerMessage.includes('cumulative')) {
      graphType = 'area';
    } else if (lowerMessage.includes('scatter') || lowerMessage.includes('correlation')) {
      graphType = 'scatter';
    } else if (lowerMessage.includes('column') || lowerMessage.includes('bar')) {
      graphType = 'column';
    }

    // Try to extract field mentions
    const fieldMentions = {
      commodity: lowerMessage.includes('commodity') || lowerMessage.includes('commodities'),
      pnl: lowerMessage.includes('pnl') || lowerMessage.includes('profit') || lowerMessage.includes('loss'),
      price: lowerMessage.includes('price') || lowerMessage.includes('pricing'),
      quantity: lowerMessage.includes('quantity') || lowerMessage.includes('volume'),
      trader: lowerMessage.includes('trader') || lowerMessage.includes('traders'),
      company: lowerMessage.includes('company') || lowerMessage.includes('companies'),
      date: lowerMessage.includes('date') || lowerMessage.includes('time') || lowerMessage.includes('trend')
    };

    return {
      type: graphType,
      title: `${graphType.charAt(0).toUpperCase() + graphType.slice(1)} Chart - ${new Date().toLocaleDateString()}`,
      xAxis: fieldMentions.commodity ? 'commodity' : 
             fieldMentions.trader ? 'trader_name' : 
             fieldMentions.company ? 'company' : 'commodity',
      yAxis: fieldMentions.pnl ? ['mtm_pnl'] : 
             fieldMentions.price ? ['price'] : 
             fieldMentions.quantity ? ['quantity'] : ['mtm_pnl']
    };
  };

  // Process chat message
  const processChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Check if it's a graph request
      const graphRequest = parseGraphRequest(message);

      if (graphRequest) {
        // Process as graph request
        const chartOption = generateChart(graphRequest, filteredData);
        
        const summary = getDataSummary();
        const analysisText = `I've created a ${graphRequest.type} chart for your ${filteredData.length} trades. 

📊 **Chart Analysis:**
- Total trades: ${summary.totalTrades}
- Profitable trades: ${summary.profitableTrades} (${summary.profitRatio.toFixed(1)}%)
- Total PnL: ₹${summary.totalPnL.toFixed(2)}

The chart visualizes ${graphRequest.yAxis?.join(', ') || 'key metrics'} across ${graphRequest.xAxis || 'categories'} to help you understand your trading performance patterns.`;

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: analysisText,
          timestamp: new Date(),
          chartData: chartOption
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        // Process as regular chat/insight request
        const response = await AIInsightsService.processChatQuery(message, filteredData);
        
        let responseContent = '';
        
        if (response.type === 'insight') {
          responseContent = response.insight || 'No insights available.';
        } else if (response.type === 'filter') {
          // Apply filters and show results
          const filtered = applyFilters(allData, response.filters || {});
          setFilteredData(filtered);
          setActiveFilters(response.filters || {});
          responseContent = `${response.explanation}\n\nFound ${filtered.length} trades matching your criteria.`;
        } else {
          responseContent = response.explanation || 'I can help you analyze your trading data and create visualizations.';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [filteredData, allData, generateChart, getDataSummary]);

  // Handle chat input
  const handleChatSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && !isProcessing) {
      processChatMessage(chatInput);
      setChatInput('');
    }
  }, [chatInput, isProcessing, processChatMessage]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setFilteredData(allData);
    setSearchQuery('');
  }, [allData]);

  // Get column display name
  const getColumnDisplayName = (key: string): string => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen) return null;

  const summary = getDataSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                AI CANVAS
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="text-xs">
                {summary.totalTrades} trades
              </Badge>
              <Badge variant={summary.totalPnL >= 0 ? "default" : "destructive"} className="text-xs">
                ₹{summary.totalPnL.toFixed(2)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[75vh]">
          {/* Left Panel - Data & Search */}
          <div className="space-y-4 h-full overflow-hidden">
            {/* Search Bar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search trades, commodities, traders..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Active Filters */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Active Filters</span>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(activeFilters).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {getColumnDisplayName(key)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Summary */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Profitable</div>
                    <div className="text-sm font-medium">{summary.profitableTrades}</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                    <div className="text-sm font-medium">{summary.profitRatio.toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardHeader className="pb-2">
                <Collapsible open={isTableOpen} onOpenChange={setIsTableOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TableIcon className="h-4 w-4" />
                      Data Preview ({filteredData.length})
                    </CardTitle>
                    {isTableOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-60 mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {selectedColumns.map(column => (
                              <TableHead key={column} className="text-xs whitespace-nowrap">
                                {getColumnDisplayName(column)}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.slice(0, 100).map((trade, index) => (
                            <TableRow key={index}>
                              {selectedColumns.map(column => (
                                <TableCell key={column} className="text-xs">
                                  {column === 'mtm_pnl' && trade[column] !== undefined ? (
                                    <span className={trade[column] >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      ₹{trade[column].toFixed(2)}
                                    </span>
                                  ) : (
                                    String(trade[column as keyof Trade] || '-')
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          </div>

          {/* Right Panel - AI Chat & Visualization */}
          <div className="lg:col-span-2 space-y-4 h-full overflow-hidden">
            {/* Chat Interface */}
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Assistant
                  <Badge variant="outline" className="text-xs ml-auto">
                    Powered by Gemini
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 px-6 py-4" style={{ height: 'calc(75vh - 180px)' }}>
                  <div className="space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                        <div className="space-y-2">
                          <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            👋 Welcome to AI Canvas!
                          </p>
                          <p className="text-sm">
                            I can help you analyze your trading data and create beautiful visualizations.
                          </p>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                          <div className="text-sm font-medium">Try these commands:</div>
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                              <div className="font-medium">📊 Chart Generation</div>
                              <div className="text-muted-foreground">"Show me a pie chart of commodities"</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                              <div className="font-medium">📈 Performance Analysis</div>
                              <div className="text-muted-foreground">"What's my best performing trade?"</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                              <div className="font-medium">🔍 Data Filtering</div>
                              <div className="text-muted-foreground">"Show me profitable trades only"</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                              <div className="font-medium">📋 Trend Analysis</div>
                              <div className="text-muted-foreground">"Create a line chart showing price trends"</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0">
                            <Bot className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                        <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : ''}`}>
                          <div className={`px-4 py-2 rounded-lg text-sm ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-muted'
                          }`}>
                            {message.content}
                          </div>
                          
                          {/* Chart Display */}
                          {message.chartData && (
                            <div className="mt-3 p-3 bg-card border rounded-lg">
                              <div style={{ width: '100%', height: '300px' }}>
                                <ReactECharts
                                  option={message.chartData}
                                  style={{ height: '100%', width: '100%' }}
                                  opts={{ renderer: 'canvas' }}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 order-1">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isProcessing && (
                      <div className="flex gap-3 justify-start">
                        <Bot className="h-6 w-6 text-blue-500" />
                        <div className="max-w-[70%]">
                          <div className="px-4 py-2 rounded-lg text-sm bg-muted">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing your request...
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={chatEndRef} />
                </ScrollArea>

                {/* Chat Input - Fixed at bottom */}
                <div className="flex-shrink-0 space-y-3 border-t pt-3">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me anything about your data or request a chart..."
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={isProcessing || !chatInput.trim()}
                      className="px-3"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('Show me a column chart of PnL by commodity')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        PnL Chart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('Create a pie chart showing commodity distribution')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Pie Chart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('Show me a line chart of price trends')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Price Trends
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('What are my top performing trades?')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Top Trades
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('Show me profitable trades only')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Profitable Only
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processChatMessage('Analyze my trading performance')}
                        disabled={isProcessing}
                        className="justify-start"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 