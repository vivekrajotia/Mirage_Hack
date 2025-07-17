'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Trade } from '@/lib/types';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm');
  } catch {
    return dateString;
  }
};

export const allColumns: ColumnDef<Trade>[] = [
  // Basic Trade Information
  {
    accessorKey: 'created_timestamp',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDateTime(row.getValue('created_timestamp')),
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    cell: ({ row }) => formatDate(row.getValue('end_date')),
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ row }) => formatDate(row.getValue('start_date')),
  },
  {
    accessorKey: 'tenant_id',
    header: 'Tenant ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('tenant_id')}</div>
    ),
  },
  {
    accessorKey: 'updated_by',
    header: 'Updated By',
  },
  {
    accessorKey: 'updated_timestamp',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Updated Timestamp
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDateTime(row.getValue('updated_timestamp')),
  },
  
  // Position Information
  {
    accessorKey: 'buy_open_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Buy Open Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('buy_open_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'closed_pnl_today',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Closed PnL Today
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('closed_pnl_today') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'closed_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Closed Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('closed_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  
  // Commodity Information
  {
    accessorKey: 'commodity',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Commodity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('commodity')}</div>,
  },
  {
    accessorKey: 'company',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('company')}</div>,
  },
  {
    accessorKey: 'counterparty',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Counterparty
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('counterparty')}</div>,
  },
  {
    accessorKey: 'eod_currency',
    header: 'EOD Currency',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('eod_currency')}</Badge>
    ),
  },
  {
    accessorKey: 'eod_job_name',
    header: 'EOD Job Name',
  },
  {
    accessorKey: 'eod_run_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        EOD Run Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('eod_run_date')),
  },
  {
    accessorKey: 'eoduom',
    header: 'EOD UOM',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('eoduom')}</Badge>
    ),
  },
  
  // Cost Information
  {
    accessorKey: 'finance_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Finance Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('finance_cost') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'freight_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Freight Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('freight_cost') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'fx_exposure',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          FX Exposure
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('fx_exposure') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'fx_exposure_currency',
    header: 'FX Exposure Currency',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('fx_exposure_currency')}</Badge>
    ),
  },
  {
    accessorKey: 'insurance_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Insurance Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('insurance_cost') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  
  // MTM and PnL Information
  {
    accessorKey: 'mtm_pnl',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          MTM PnL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('mtm_pnl') as number;
      return (
        <div className={cn('text-right font-semibold', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'mtm_settlement',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          MTM Settlement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('mtm_settlement') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'nbv',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          NBV
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('nbv') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'obligationid',
    header: 'Obligation ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('obligationid')}</div>
    ),
  },
  {
    accessorKey: 'other_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Other Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('other_cost') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'pnl_monthly',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PnL Monthly
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('pnl_monthly') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'pnl_yearly',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PnL Yearly
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('pnl_yearly') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  
  // Price Information
  {
    accessorKey: 'price_currency',
    header: 'Price Currency',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('price_currency')}</Badge>
    ),
  },
  {
    accessorKey: 'price_exposure',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price Exposure
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('price_exposure') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'profitcenter',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Profit Center
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'raw_data_id',
    header: 'Raw Data ID',
    cell: ({ row }) => {
      const value = row.getValue('raw_data_id') as string;
      return value ? <div className="font-mono text-sm">{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'realised_pnl_today',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Realised PnL Today
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('realised_pnl_today') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'realized_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Realized Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('realized_date')),
  },
  {
    accessorKey: 'realized_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Realized Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('realized_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'sell_open_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Sell Open Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('sell_open_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'tax_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Tax Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('tax_cost') as number;
      return <div className="text-right">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_cost') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trade_id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Trade ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('trade_id')}</div>
    ),
  },
  
  // Previous Values
  {
    accessorKey: 'prev_mtm_pnl',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev MTM PnL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_mtm_pnl') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'prev_open_buy_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev Open Buy Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_open_buy_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'prev_open_sell_position',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev Open Sell Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_open_sell_position') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trade_value',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trade Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_value') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trader_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Trader Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('trader_name')}</div>,
  },
  {
    accessorKey: 'prev_realised_pnl',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev Realised PnL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_realised_pnl') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'prev_realised_postion',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev Realised Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_realised_postion') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'prev_closed_postion',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Prev Closed Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prev_closed_postion') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_netted_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Netted Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_netted_cost') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_added_cost',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Added Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_added_cost') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_premium_discount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Premium Discount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_premium_discount') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trade_type',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Trade Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('trade_type')}</Badge>
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('price') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trade_transaction_type',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Trade Transaction Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_transaction_type') as number;
      return (
        <Badge variant={value === 0 ? 'default' : 'secondary'}>
          {value === 0 ? 'Buy' : 'Sell'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price_type',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Price Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('price_type')}</Badge>
    ),
  },
  {
    accessorKey: 'trade_date_time',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Trade Date Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDateTime(row.getValue('trade_date_time')),
  },
  
  // Additional commodity details
  {
    accessorKey: 'parent_commodity',
    header: 'Parent Commodity',
    cell: ({ row }) => {
      const value = row.getValue('parent_commodity') as string;
      return value ? <div className="font-medium">{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'mtm_price_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        MTM Price Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('mtm_price_date')),
  },
  {
    accessorKey: 'bulk_packed',
    header: 'Bulk Packed',
    cell: ({ row }) => {
      const value = row.getValue('bulk_packed') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'incoterm',
    header: 'Incoterm',
    cell: ({ row }) => {
      const value = row.getValue('incoterm') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
    cell: ({ row }) => {
      const value = row.getValue('brand') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'grade',
    header: 'Grade',
    cell: ({ row }) => {
      const value = row.getValue('grade') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'origin',
    header: 'Origin',
    cell: ({ row }) => {
      const value = row.getValue('origin') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'season',
    header: 'Season',
    cell: ({ row }) => {
      const value = row.getValue('season') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  
  // Quantity fields
  {
    accessorKey: 'trade_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trade Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'total_contract_qty',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Contract Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_contract_qty') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'planned_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Planned Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('planned_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'actual_load_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Actual Load Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('actual_load_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'actual_unload_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Actual Unload Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('actual_unload_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'total_price_allocated_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Price Allocated Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_price_allocated_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'plan_id',
    header: 'Plan ID',
    cell: ({ row }) => {
      const value = row.getValue('plan_id') as string;
      return value ? <div className="font-mono text-sm">{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  
  // Additional fields would continue here... I'll add more in the following sections
  // MTM Index fields
  {
    accessorKey: 'mtmindex',
    header: 'MTM Index',
    cell: ({ row }) => {
      const value = row.getValue('mtmindex') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'mtm_index_period',
    header: 'MTM Index Period',
    cell: ({ row }) => {
      const value = row.getValue('mtm_index_period') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'basis_mtm_index_period',
    header: 'Basis MTM Index Period',
    cell: ({ row }) => {
      const value = row.getValue('basis_mtm_index_period') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'contract_month',
    header: 'Contract Month',
    cell: ({ row }) => {
      const value = row.getValue('contract_month') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'premium_discount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Premium Discount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('premium_discount') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'market_settlement_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Market Settlement Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('market_settlement_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'future_market_settlement_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Future Market Settlement Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('future_market_settlement_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'basis_market_settlement_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Basis Market Settlement Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('basis_market_settlement_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'mtm_index_currency',
    header: 'MTM Index Currency',
    cell: ({ row }) => {
      const value = row.getValue('mtm_index_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'mtm_index_uom',
    header: 'MTM Index UOM',
    cell: ({ row }) => {
      const value = row.getValue('mtm_index_uom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  
  // MTM Currency fields
  {
    accessorKey: 'total_netted_cost_in_mtm_currency',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Netted Cost in MTM Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_netted_cost_in_mtm_currency') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_added_cost_in_mtm_currency',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Added Cost in MTM Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_added_cost_in_mtm_currency') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'total_cost_in_mtm_currency',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Cost in MTM Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('total_cost_in_mtm_currency') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'trade_value_in_mtm_currency',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trade Value in MTM Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_value_in_mtm_currency') as number;
      return <div className="text-right font-semibold">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'mtm_pnl_in_mtm_currency',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          MTM PnL in MTM Currency
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('mtm_pnl_in_mtm_currency') as number;
      return (
        <div className={cn('text-right font-semibold', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  
  // Reporting UOM fields
  {
    accessorKey: 'reporting_uom',
    header: 'Reporting UOM',
    cell: ({ row }) => {
      const value = row.getValue('reporting_uom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'trade_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trade Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'obligation_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Obligation Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('obligation_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'allocated_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Allocated Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('allocated_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'actualized_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Actualized Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('actualized_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'discharge_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Discharge Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('discharge_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'priced_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Priced Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('priced_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'un_priced_quantity_in_reporting_uom',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Un-priced Quantity in Reporting UOM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('un_priced_quantity_in_reporting_uom') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  
  // Settlement fields
  {
    accessorKey: 'closed_pnl_today_in_settlement',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Closed PnL Today in Settlement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('closed_pnl_today_in_settlement') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'realised_pnl_today_in_settlement',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Realised PnL Today in Settlement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('realised_pnl_today_in_settlement') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'provisional_pnl_in_settlement',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Provisional PnL in Settlement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('provisional_pnl_in_settlement') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'provisional_pnl_today',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Provisional PnL Today
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('provisional_pnl_today') as number;
      return (
        <div className={cn('text-right font-medium', value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '')}>
          {formatNumber(value)}
        </div>
      );
    },
  },
  {
    accessorKey: 'basis_mtm_index_currency',
    header: 'Basis MTM Index Currency',
    cell: ({ row }) => {
      const value = row.getValue('basis_mtm_index_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'basis_mtm_index_uom',
    header: 'Basis MTM Index UOM',
    cell: ({ row }) => {
      const value = row.getValue('basis_mtm_index_uom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  
  // Invoice fields
  {
    accessorKey: 'invoice_currency',
    header: 'Invoice Currency',
    cell: ({ row }) => {
      const value = row.getValue('invoice_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'invoice_amount',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Invoice Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('invoice_amount') as number;
      return <div className="text-right font-medium">{formatNumber(value)}</div>;
    },
  },
  {
    accessorKey: 'actual_origin',
    header: 'Actual Origin',
    cell: ({ row }) => {
      const value = row.getValue('actual_origin') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'basis_mtm_index',
    header: 'Basis MTM Index',
    cell: ({ row }) => {
      const value = row.getValue('basis_mtm_index') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'delivery_end_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Delivery End Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('delivery_end_date')),
  },
  {
    accessorKey: 'delivery_start_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Delivery Start Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('delivery_start_date')),
  },
  {
    accessorKey: 'discharge_port',
    header: 'Discharge Port',
    cell: ({ row }) => {
      const value = row.getValue('discharge_port') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'fx_allocation_status',
    header: 'FX Allocation Status',
    cell: ({ row }) => {
      const value = row.getValue('fx_allocation_status') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'fx_rate',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          FX Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('fx_rate') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'invoice_id',
    header: 'Invoice ID',
    cell: ({ row }) => {
      const value = row.getValue('invoice_id') as string;
      return value ? <div className="font-mono text-sm">{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'laycan_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Laycan Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatDate(row.getValue('laycan_date')),
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const value = row.getValue('location') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'obligation_status',
    header: 'Obligation Status',
    cell: ({ row }) => {
      const value = row.getValue('obligation_status') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'planned_obligation_id',
    header: 'Planned Obligation ID',
    cell: ({ row }) => {
      const value = row.getValue('planned_obligation_id') as string;
      return value ? <div className="font-mono text-sm">{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'prem_currency',
    header: 'Premium Currency',
    cell: ({ row }) => {
      const value = row.getValue('prem_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'prem_uom',
    header: 'Premium UOM',
    cell: ({ row }) => {
      const value = row.getValue('prem_uom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'price_allocation_status',
    header: 'Price Allocation Status',
    cell: ({ row }) => {
      const value = row.getValue('price_allocation_status') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'price_settlement_currency',
    header: 'Price Settlement Currency',
    cell: ({ row }) => {
      const value = row.getValue('price_settlement_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'priceuom',
    header: 'Price UOM',
    cell: ({ row }) => {
      const value = row.getValue('priceuom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'prov_price_currency',
    header: 'Provisional Price Currency',
    cell: ({ row }) => {
      const value = row.getValue('prov_price_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'prov_priceuom',
    header: 'Provisional Price UOM',
    cell: ({ row }) => {
      const value = row.getValue('prov_priceuom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'prov_trade_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Provisional Trade Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('prov_trade_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'quantityuom',
    header: 'Quantity UOM',
    cell: ({ row }) => {
      const value = row.getValue('quantityuom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  
  // Stock fields
  {
    accessorKey: 'stock_currency',
    header: 'Stock Currency',
    cell: ({ row }) => {
      const value = row.getValue('stock_currency') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'stock_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('stock_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'stock_quantity',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('stock_quantity') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
  {
    accessorKey: 'stock_type',
    header: 'Stock Type',
    cell: ({ row }) => {
      const value = row.getValue('stock_type') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'stockuom',
    header: 'Stock UOM',
    cell: ({ row }) => {
      const value = row.getValue('stockuom') as string;
      return value ? <Badge variant="outline">{value}</Badge> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'storage_location',
    header: 'Storage Location',
    cell: ({ row }) => {
      const value = row.getValue('storage_location') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'trade_discharge_location',
    header: 'Trade Discharge Location',
    cell: ({ row }) => {
      const value = row.getValue('trade_discharge_location') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'trade_load_location',
    header: 'Trade Load Location',
    cell: ({ row }) => {
      const value = row.getValue('trade_load_location') as string;
      return value ? <div>{value}</div> : <div className="text-gray-400">-</div>;
    },
  },
  {
    accessorKey: 'trade_settlement_price',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Trade Settlement Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const value = row.getValue('trade_settlement_price') as number;
      return value ? <div className="text-right font-medium">{formatNumber(value)}</div> : <div className="text-gray-400 text-right">-</div>;
    },
  },
];

// Default visible columns - showing the most commonly used ones
export const defaultVisibleColumns = [
  'trade_id',
  'trade_date_time',
  'commodity',
  'trader_name',
  'counterparty',
  'trade_transaction_type',
  'buy_open_position',
  'sell_open_position',
  'price',
  'mtm_pnl',
  'trade_value',
  'company',
  'profitcenter',
];

// Export the columns for backward compatibility
export const columns = allColumns.filter(col => 
  defaultVisibleColumns.includes(col.accessorKey as string)
);
