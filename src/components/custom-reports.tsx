'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, subDays } from 'date-fns';
import {
  ArrowLeft,
  Download,
  Filter,
  BarChart3,
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
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DataTable } from './dashboard/data-table';
import { allColumns, defaultVisibleColumns } from './dashboard/columns';
import { ColumnSelector } from './dashboard/column-selector';
import { FilterSelector, FilterState } from './dashboard/filter-selector';
import { DataVisualizationPanel } from './dashboard/data-visualization-panel';
import { applyFilters, getFilterSummary } from '@/lib/filter-utils';
import rawTrades from '@/app/xceler_eodservice_publisheddata (1).json';

// Map raw data to Trade interface (same as in dashboard-client)
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
  trade_date_time: trade.trade_date_time,
  trade_settlement_price: trade.trade_settlement_price,
  trade_transaction_type: trade.trade_transaction_type,
  trade_type: trade.trade_type,
  prev_mtm_pnl: trade.prev_mtm_pnl,
  prov_grade: trade.prov_grade,
  prov_grade_basis: trade.prov_grade_basis,
  prov_price_type: trade.prov_price_type,
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
})) as Trade[];

const STORAGE_KEY = 'custom-reports-column-visibility';
const FILTER_STORAGE_KEY = 'custom-reports-filters';

interface CustomReportsProps {
  onBack: () => void;
}

export const CustomReports: React.FC<CustomReportsProps> = ({ onBack }) => {
  const [trades] = React.useState<Trade[]>(tradesData);
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [tradeType, setTradeType] = React.useState('All');
  const [isMounted, setIsMounted] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibility>({});
  const [filters, setFilters] = React.useState<FilterState>({});
  const [isVisualizationOpen, setIsVisualizationOpen] = React.useState(false);

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
        const defaultVisibility = allColumns.reduce((acc, col) => {
          const key = (col as any).accessorKey as string;
          acc[key] = defaultVisibleColumns.includes(key);
          return acc;
        }, {} as ColumnVisibility);
        setColumnVisibility(defaultVisibility);
      }
    } else {
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
        (!date?.to || tradeDate <= addDays(date.to, 1));
      const isTypeMatch = tradeType === 'All' || 
        (tradeType === 'Buy' && trade.trade_transaction_type === 0) ||
        (tradeType === 'Sell' && trade.trade_transaction_type === 1);
      return isDateInRange && isTypeMatch;
    });

    // Apply advanced filters
    filtered = applyFilters(filtered, filters);

    return filtered;
  }, [trades, date, tradeType, filters, isMounted]);

  // Handle filter changes and save to localStorage
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (Object.keys(newFilters).length > 0) {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newFilters));
    } else {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    }
  };

  // Handle column visibility changes and save to localStorage
  const handleColumnVisibilityChange = (newVisibility: ColumnVisibility) => {
    setColumnVisibility(newVisibility);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibility));
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = visibleColumns.map(col => (col as any).accessorKey);
    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(trade => 
        headers.map(header => {
          const value = (trade as any)[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trade-data-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Filter columns based on visibility
  const visibleColumns = React.useMemo(() => {
    return allColumns.filter(column => columnVisibility[(column as any).accessorKey as string]);
  }, [columnVisibility]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Custom Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                View and analyze your trading data with advanced filtering and export options
              </p>
            </div>
          </div>
        </div>

        {/* Trade History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Data Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
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
              
              <div className="flex flex-wrap gap-2">
                <FilterSelector 
                  data={tradesData}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
                <ColumnSelector 
                  columnVisibility={columnVisibility}
                  onColumnVisibilityChange={handleColumnVisibilityChange}
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
              <div className="mb-4 p-2 bg-muted rounded-md">
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
      </div>
    </div>
  );
}; 