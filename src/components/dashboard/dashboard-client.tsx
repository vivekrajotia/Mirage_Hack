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
import { PnlChart } from './pnl-chart';
import { DataTable } from './data-table';
import { allColumns, defaultVisibleColumns } from './columns';
import { ColumnSelector } from './column-selector';
import { FilterSelector, FilterState } from './filter-selector';
import { DataVisualizationPanel } from './data-visualization-panel';
import { applyFilters, getFilterSummary } from '@/lib/filter-utils';
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

export function DashboardClient() {
  const [trades, setTrades] = React.useState<Trade[]>(tradesData);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
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

  const exportToCSV = () => {
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
  };

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MTM PnL</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalPnl.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current filters
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable Trades
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitableTrades}</div>
            <p className="text-xs text-muted-foreground">
              {totalTrades > 0 ? `${((profitableTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Losing Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{losingTrades}</div>
             <p className="text-xs text-muted-foreground">
               {totalTrades > 0 ? `${((losingTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              Total trades in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>MTM PnL Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <PnlChart data={filteredTrades} />
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

    </div>
  );
}
