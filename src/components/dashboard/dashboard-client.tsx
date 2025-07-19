'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays } from 'date-fns';
import {
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  BarChart3,
  Mail,
  Send,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  BarChart,
  LineChart,
} from 'lucide-react';

import { Trade, ColumnVisibility } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { PnlChart } from './pnl-chart';
import { DataTable } from './data-table';
import { GraphEngine, GraphConfigBuilder } from '@/components/graph-engine';
import { allColumns, defaultVisibleColumns } from './columns';
import { ColumnSelector } from './column-selector';
import { FilterSelector, FilterState } from './filter-selector';
import { DataVisualizationPanel } from './data-visualization-panel';
import { applyFilters, getFilterSummary } from '@/lib/filter-utils';
import AIInsightsOverlay from '../ai-insights-overlay';
import { Widget, WidgetLayout, WidgetManager, DEFAULT_WIDGETS } from '@/lib/widget-config';
import { MetricWidget, ChartWidget, WidgetSettings } from './widgets';
import rawTrades from '@/app/xceler_eodservice_publisheddata (1).json';

// Map raw data to Trade interface
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

const STORAGE_KEY = 'trade-table-column-visibility';
const FILTER_STORAGE_KEY = 'trade-table-filters';

export interface DashboardClientHandle {
  exportToCSV: () => void;
  setIsVisualizationOpen: (open: boolean) => void;
  sendInsightsEmail: () => Promise<void>;
}

export const DashboardClient = React.forwardRef<DashboardClientHandle, {}>((props, ref) => {
  const [trades, setTrades] = React.useState<Trade[]>(tradesData);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [tradeType, setTradeType] = React.useState('All');
  const [isMounted, setIsMounted] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibility>({});
  const [filters, setFilters] = React.useState<FilterState>({});
  const [isVisualizationOpen, setIsVisualizationOpen] = React.useState(false);
  const [isSendingInsights, setIsSendingInsights] = React.useState(false);
  const [widgetLayout, setWidgetLayout] = React.useState<WidgetLayout>({ widgets: DEFAULT_WIDGETS, lastUpdated: Date.now() });
  const [draggedWidget, setDraggedWidget] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState<string | null>(null);
  
  // Collapsible states
  const [isMetricWidgetsCollapsed, setIsMetricWidgetsCollapsed] = React.useState(false);
  const [isChartWidgetsCollapsed, setIsChartWidgetsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setDate({
      from: subDays(new Date(), 365), // Default to last year
      to: new Date(),
    });

    // Load column visibility from localStorage
    const savedVisibility = localStorage.getItem(STORAGE_KEY);
    if (savedVisibility) {
      try {
        setColumnVisibility(JSON.parse(savedVisibility));
      } catch (error) {
        console.error('Error parsing saved column visibility:', error);
        // Set default visibility
        const defaultVisibility = allColumns.reduce((acc, col) => {
          const key = (col as any).accessorKey as string;
          acc[key] = defaultVisibleColumns.includes(key);
          return acc;
        }, {} as ColumnVisibility);
        setColumnVisibility(defaultVisibility);
      }
    } else {
      // Set default visibility
      const defaultVisibility = allColumns.reduce((acc, col) => {
        const key = (col as any).accessorKey as string;
        acc[key] = defaultVisibleColumns.includes(key);
        return acc;
      }, {} as ColumnVisibility);
      setColumnVisibility(defaultVisibility);
    }

    // Load filters from localStorage
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }

    // Load widget layout from localStorage
    const layout = WidgetManager.getWidgetLayout();
    setWidgetLayout(layout);
  }, []);

  const filteredTrades = React.useMemo(() => {
    if (!isMounted || !date) {
        return trades;
    }

    // Apply basic date and type filters first
    let filtered = trades.filter((trade) => {
      const tradeDate = new Date(trade.trade_date_time);
      const isDateInRange =
        (!date?.from || tradeDate >= date.from) &&
        (!date?.to || tradeDate <= addDays(date.to, 1)); // include end date
      const isTypeMatch = tradeType === 'All' || 
        (tradeType === 'Buy' && trade.trade_transaction_type === 0) ||
        (tradeType === 'Sell' && trade.trade_transaction_type === 1);
      return isDateInRange && isTypeMatch;
    });

    // Apply advanced filters
    filtered = applyFilters(filtered, filters);

    return filtered;
  }, [trades, date, tradeType, filters, isMounted]);

  const totalPnl = React.useMemo(() => {
    return filteredTrades.reduce((acc, trade) => acc + trade.mtm_pnl, 0);
  }, [filteredTrades]);

  const totalTrades = filteredTrades.length;
  const profitableTrades = filteredTrades.filter(
    (trade) => trade.mtm_pnl > 0
  ).length;
  const losingTrades = totalTrades - profitableTrades;

  // Filter columns based on visibility
  const visibleColumns = React.useMemo(() => {
    return allColumns.filter(column => columnVisibility[(column as any).accessorKey as string]);
  }, [columnVisibility]);

  // Handle filter changes and save to localStorage
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (Object.keys(newFilters).length > 0) {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newFilters));
    } else {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    }
  };

  const exportToCSV = React.useCallback(() => {
    const visibleColumnKeys = visibleColumns.map(col => (col as any).accessorKey as string);
    const headers = visibleColumns.map(col => {
      if (typeof col.header === 'string') {
        return col.header;
      } else if (typeof col.header === 'function') {
        // For complex headers, use the accessor key formatted
        return ((col as any).accessorKey as string).split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      return (col as any).accessorKey as string;
    });

    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(trade => 
        visibleColumnKeys.map(key => {
          const value = trade[key as keyof Trade];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return String(value);
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [visibleColumns, filteredTrades]);

  const sendInsightsEmail = React.useCallback(async () => {
    if (!filteredTrades.length) {
      alert('No data available to analyze');
      return;
    }

    setIsSendingInsights(true);
    try {
      // Generate AI insights first
      const { AIInsightsService } = await import('@/lib/ai-insights-service');
      const contextInfo = {
        dashboardType: 'Trading Dashboard',
        dateRange: date ? { from: date.from || null, to: date.to || null } : { from: null, to: null },
        filters,
        dataCount: filteredTrades.length,
        widgetTitle: `Dashboard Analysis - ${filteredTrades.length} trades`,
        timeSeriesData: filteredTrades,
        chartData: filteredTrades
      };

      const reportText = await AIInsightsService.generateInsights(filteredTrades, contextInfo);

      // Send email with insights
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'AI Insights Bot',
          email: 'subhamnaskar671@gmail.com',
          message: reportText
        }),
      });

      if (emailResponse.ok) {
        alert('AI insights sent successfully to subhamnaskar671@gmail.com!');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending insights:', error);
      alert('Failed to send insights. Please try again.');
    } finally {
      setIsSendingInsights(false);
    }
  }, [filteredTrades, date, filters]);

  // Expose functions via ref
  React.useImperativeHandle(ref, () => ({
    exportToCSV,
    setIsVisualizationOpen,
    sendInsightsEmail,
  }), [exportToCSV, sendInsightsEmail]);

  // Widget Management Functions
  const handleWidgetVisibilityToggle = (widgetId: string, visible: boolean) => {
    const updatedLayout = WidgetManager.toggleWidgetVisibility(widgetId, visible);
    setWidgetLayout(updatedLayout);
  };

  const handleResetWidgets = () => {
    const defaultLayout = { widgets: DEFAULT_WIDGETS, lastUpdated: Date.now() };
    WidgetManager.saveWidgetLayout(defaultLayout);
    setWidgetLayout(defaultLayout);
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setIsDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    
    const sourceWidgetId = e.dataTransfer.getData('text/plain');
    if (sourceWidgetId === targetWidgetId || !sourceWidgetId) return;

    const widgets = [...widgetLayout.widgets];
    const sourceIndex = widgets.findIndex(w => w.id === sourceWidgetId);
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder widgets
    const [removed] = widgets.splice(sourceIndex, 1);
    widgets.splice(targetIndex, 0, removed);

    const updatedLayout = WidgetManager.reorderWidgets(widgets);
    setWidgetLayout(updatedLayout);
    setDraggedWidget(null);
    setIsDragOver(null);
  };

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  // Get visible widgets sorted by order
  const visibleWidgets = widgetLayout.widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.order - b.order);

  const visibleMetricWidgets = visibleWidgets.filter(w => w.component === 'metric');
  const visibleChartWidgets = visibleWidgets.filter(w => w.component === 'chart');

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your trading performance and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <WidgetSettings
            widgets={widgetLayout.widgets}
            onWidgetVisibilityChange={handleWidgetVisibilityToggle}
            onResetToDefault={handleResetWidgets}
          />
          {isSendingInsights && (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="opacity-70"
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending AI Insights...
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Metric Widgets Section */}
      {visibleMetricWidgets.length > 0 && (
        <Collapsible open={!isMetricWidgetsCollapsed} onOpenChange={(open) => setIsMetricWidgetsCollapsed(!open)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Key Metrics</h2>
              <Badge variant="secondary" className="ml-2">
                {visibleMetricWidgets.length} widgets
              </Badge>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isMetricWidgetsCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {visibleMetricWidgets.map((widget) => {
                let value: string | number = '';
                let subtitle = '';
                
                switch (widget.type) {
                  case 'total-pnl':
                    value = totalPnl.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    });
                    subtitle = 'Based on current filters';
                    break;
                  case 'profitable-trades':
                    value = profitableTrades;
                    subtitle = `${totalTrades > 0 ? `${((profitableTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades`;
                    break;
                  case 'losing-trades':
                    value = losingTrades;
                    subtitle = `${totalTrades > 0 ? `${((losingTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades`;
                    break;
                  case 'total-trades':
                    value = totalTrades;
                    subtitle = 'Total trades in selected period';
                    break;
                }

                return (
                  <MetricWidget
                    key={widget.id}
                    widget={widget}
                    value={value}
                    subtitle={subtitle}
                    isDragging={draggedWidget === widget.id}
                    onToggleVisibility={handleWidgetVisibilityToggle}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Collapsible Chart Widgets Section */}
      {visibleChartWidgets.length > 0 && (
        <Collapsible open={!isChartWidgetsCollapsed} onOpenChange={(open) => setIsChartWidgetsCollapsed(!open)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Analytics & Charts</h2>
              <Badge variant="secondary" className="ml-2">
                {visibleChartWidgets.length} widgets
              </Badge>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isChartWidgetsCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {visibleChartWidgets.map((widget) => {
                let chartContent: React.ReactNode = null;
                
                switch (widget.type) {
                  case 'risk-heatmap':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const commodityRisks = filteredTrades.reduce((acc, trade) => {
                              const commodity = trade.commodity || 'Unknown';
                              if (!acc[commodity]) acc[commodity] = { totalPnL: 0, count: 0, avgRisk: 0 };
                              acc[commodity].totalPnL += Math.abs(trade.mtm_pnl);
                              acc[commodity].count++;
                              acc[commodity].avgRisk = acc[commodity].totalPnL / acc[commodity].count;
                              return acc;
                            }, {} as Record<string, any>);

                            const heatmapData = Object.entries(commodityRisks).map(([commodity, data], index) => [
                              index, 0, Math.min(data.avgRisk / 1000000, 100) // Scale risk to 0-100
                            ]);

                            return {
                              xAxis: {
                                type: 'category',
                                data: Object.keys(commodityRisks).map((_, i) => `Risk${i + 1}`)
                              },
                              yAxis: {
                                type: 'category',
                                data: ['Impact']
                              },
                              visualMap: {
                                min: 0,
                                max: 100,
                                calculable: true,
                                orient: 'horizontal',
                                left: 'center',
                                bottom: '15%'
                              },
                              series: [{
                                name: 'Risk Level',
                                type: 'heatmap',
                                data: heatmapData,
                                label: { show: true },
                                itemStyle: { borderRadius: 3 }
                              }],
                              tooltip: { trigger: 'item' },
                              backgroundColor: '#ffffff',
                              width: '100%',
                              height: '300px'
                            };
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'top-risks':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const counterpartyRisks = filteredTrades.reduce((acc, trade) => {
                              const counterparty = trade.counterparty || 'Unknown';
                              if (!acc[counterparty]) acc[counterparty] = 0;
                              acc[counterparty] += Math.abs(trade.mtm_pnl);
                              return acc;
                            }, {} as Record<string, number>);

                            const topRisks = Object.entries(counterpartyRisks)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5);

                            return new GraphConfigBuilder()
                              .title('')
                              .xAxis('category', topRisks.map(([name]) => name))
                              .yAxis('value')
                              .tooltip('axis')
                              .legend(false)
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addBarSeries({
                                name: 'Risk Exposure',
                                data: topRisks.map(([, value]) => (value / 1000000).toFixed(1)),
                                color: '#ff6b6b'
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'risk-trend':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const timeRisks = filteredTrades.reduce((acc, trade) => {
                              const date = new Date(trade.trade_date_time).toISOString().split('T')[0];
                              if (!acc[date]) acc[date] = 0;
                              acc[date] += Math.abs(trade.mtm_pnl);
                              return acc;
                            }, {} as Record<string, number>);

                            const sortedDates = Object.keys(timeRisks).sort();
                            const riskValues = sortedDates.map(date => (timeRisks[date] / 1000000).toFixed(1));

                            return new GraphConfigBuilder()
                              .title('')
                              .xAxis('category', sortedDates.slice(-10))
                              .yAxis('value')
                              .tooltip('axis')
                              .legend(false)
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addLineSeries({
                                name: 'Daily Risk',
                                data: riskValues.slice(-10),
                                smooth: true,
                                color: '#ffc000',
                                areaStyle: { opacity: 0.3 }
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'risk-impact':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const totalRisk = Math.abs(totalPnl);
                            const riskScore = Math.min((totalRisk / 10000000) * 100, 100);

                            return new GraphConfigBuilder()
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addGaugeSeries({
                                name: 'Risk Score',
                                value: riskScore,
                                min: 0,
                                max: 100,
                                unit: '%'
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'trade-distribution':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const tradeTypes = filteredTrades.reduce((acc, trade) => {
                              const type = trade.trade_type || 'Unknown';
                              if (!acc[type]) acc[type] = 0;
                              acc[type]++;
                              return acc;
                            }, {} as Record<string, number>);

                            const pieData = Object.entries(tradeTypes).map(([name, value]) => ({
                              name,
                              value
                            }));

                            return new GraphConfigBuilder()
                              .title('')
                              .tooltip('item')
                              .legend(true, 'bottom')
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addPieSeries({
                                name: 'Trade Types',
                                data: pieData,
                                radius: ['30%', '70%']
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'performance-center':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const profitCenters = filteredTrades.reduce((acc, trade) => {
                              const center = trade.profitcenter || 'Unknown';
                              if (!acc[center]) acc[center] = 0;
                              acc[center] += trade.mtm_pnl;
                              return acc;
                            }, {} as Record<string, number>);

                            const centers = Object.keys(profitCenters);
                            const values = Object.values(profitCenters).map(v => (v / 1000000).toFixed(1));

                            return new GraphConfigBuilder()
                              .title('')
                              .xAxis('category', centers)
                              .yAxis('value')
                              .tooltip('axis')
                              .legend(false)
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addBarSeries({
                                name: 'PnL (M)',
                                data: values,
                                color: '#70ad47'
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'position-utilization':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const totalBuyPositions = filteredTrades.reduce((sum, trade) => sum + (trade.buy_open_position || 0), 0);
                            const totalSellPositions = filteredTrades.reduce((sum, trade) => sum + (trade.sell_open_position || 0), 0);
                            const totalPositions = totalBuyPositions + totalSellPositions;
                            
                            const utilizationPercentage = totalPositions > 0 ? Math.min((totalPositions / 100000) * 100, 100) : 0;

                            return new GraphConfigBuilder()
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addGaugeSeries({
                                name: 'Position Usage',
                                value: utilizationPercentage,
                                min: 0,
                                max: 100,
                                unit: '%'
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  case 'monthly-risk':
                    chartContent = (
                      <div className="h-[300px]">
                        <GraphEngine
                          config={(() => {
                            const monthlyRisks = filteredTrades.reduce((acc, trade) => {
                              const date = new Date(trade.trade_date_time);
                              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                              if (!acc[monthKey]) acc[monthKey] = 0;
                              acc[monthKey] += Math.abs(trade.mtm_pnl);
                              return acc;
                            }, {} as Record<string, number>);

                            const sortedMonths = Object.keys(monthlyRisks).sort();
                            const values = sortedMonths.map(month => (monthlyRisks[month] / 1000000).toFixed(1));

                            return new GraphConfigBuilder()
                              .title('')
                              .xAxis('category', sortedMonths.slice(-6))
                              .yAxis('value')
                              .tooltip('axis')
                              .legend(false)
                              .background('#ffffff')
                              .dimensions('100%', '300px')
                              .addAreaSeries({
                                name: 'Monthly Risk (M)',
                                data: values.slice(-6),
                                color: '#9966cc',
                                opacity: 0.6
                              })
                              .build();
                          })()}
                        />
                      </div>
                    );
                    break;

                  default:
                    chartContent = <div className="h-[300px] flex items-center justify-center text-muted-foreground">Chart not implemented</div>;
                }

                return (
                  <ChartWidget
                    key={widget.id}
                    widget={widget}
                    isDragging={draggedWidget === widget.id}
                    onToggleVisibility={handleWidgetVisibilityToggle}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {chartContent}
                  </ChartWidget>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost Structure Analysis */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cost Structure Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <GraphEngine
                config={(() => {
                  const totalFinanceCost = filteredTrades.reduce((sum, trade) => sum + (trade.finance_cost || 0), 0);
                  const totalFreightCost = filteredTrades.reduce((sum, trade) => sum + (trade.freight_cost || 0), 0);
                  const totalInsuranceCost = filteredTrades.reduce((sum, trade) => sum + (trade.insurance_cost || 0), 0);
                  const totalOtherCost = filteredTrades.reduce((sum, trade) => sum + (trade.other_cost || 0), 0);

                  const costData = [
                    { name: 'Finance', value: totalFinanceCost },
                    { name: 'Freight', value: totalFreightCost },
                    { name: 'Insurance', value: totalInsuranceCost },
                    { name: 'Other', value: totalOtherCost }
                  ].filter(item => item.value > 0);

                  return new GraphConfigBuilder()
                    .title('')
                    .tooltip('item')
                    .legend(true, 'right')
                    .background('#ffffff')
                    .dimensions('100%', '300px')
                    .addPieSeries({
                      name: 'Cost Types',
                      data: costData,
                      radius: ['40%', '70%']
                    })
                    .build();
                })()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error/Defect Rate - Trade Value vs PnL Scatter */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Trade Value vs PnL Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <GraphEngine
                config={(() => {
                  const scatterData = filteredTrades
                    .filter(trade => trade.trade_value && trade.mtm_pnl)
                    .slice(0, 100) // Limit points for performance
                    .map(trade => [
                      trade.trade_value / 1000000, // X: Trade Value in millions
                      trade.mtm_pnl / 1000000      // Y: PnL in millions
                    ]);

                  return new GraphConfigBuilder()
                    .title('')
                    .xAxis('value', undefined, { name: 'Trade Value (M)' })
                    .yAxis('value', { name: 'PnL (M)' })
                    .tooltip('item')
                    .legend(false)
                    .background('#ffffff')
                    .dimensions('100%', '300px')
                    .addScatterSeries({
                      name: 'Trade Points',
                      data: scatterData,
                      symbolSize: 6
                    })
                    .build();
                })()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Select value={tradeType} onValueChange={setTradeType}>
                        <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by type..." />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <FilterSelector 
                        data={tradesData}
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                    />
                    <ColumnSelector 
                        columnVisibility={columnVisibility}
                        onColumnVisibilityChange={setColumnVisibility}
                    />
                    <Button 
                        onClick={() => setIsVisualizationOpen(true)} 
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Visual Representation
                    </Button>
                    <Button onClick={exportToCSV} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>
            {Object.keys(filters).length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">
                        <strong>Active Filters:</strong> {getFilterSummary(filters)}
                    </div>
                </div>
            )}
            <div className="mt-4">
                <DataTable columns={visibleColumns} data={filteredTrades} />
            </div>
        </CardContent>
      </Card>

      {/* Data Visualization Panel */}
      <DataVisualizationPanel
        data={filteredTrades}
        isVisible={isVisualizationOpen}
        onClose={() => setIsVisualizationOpen(false)}
      />

      {/* AI Insights Overlay */}
      <AIInsightsOverlay
        dashboardData={filteredTrades}
        filters={filters}
        dateRange={date ? { from: date.from || null, to: date.to || null } : { from: null, to: null }}
        onFiltersChange={handleFiltersChange}
      />

    </div>
  );
});

DashboardClient.displayName = 'DashboardClient';
