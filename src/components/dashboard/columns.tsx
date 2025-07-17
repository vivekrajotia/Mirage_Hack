'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Trade } from '@/lib/types';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export const columns: ColumnDef<Trade>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => format(new Date(row.getValue('date')), 'dd MMM yyyy'),
  },
  {
    accessorKey: 'symbol',
    header: 'Commodity',
    cell: ({ row }) => <div className="font-medium">{row.getValue('symbol')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={type === 'Buy' ? 'default' : 'secondary'}
        className={cn(type === 'Buy' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'quantity',
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue('quantity'));
      return <div className="text-right font-medium">{quantity}</div>;
    },
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
      return <div className="text-right">{formatted}</div>;
    },
  },
    {
    accessorKey: 'strategy',
    header: 'Trade Type',
  },
  {
    accessorKey: 'mtm_pnl',
    header: ({ column }) => {
       return (
        <div className="text-right">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
            MTM PnL
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const pnl = parseFloat(row.getValue('mtm_pnl'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(pnl);

      return (
        <div
          className={cn(
            'text-right font-semibold',
            pnl > 0 ? 'text-green-600' : 'text-red-600'
          )}
        >
          {formatted}
        </div>
      );
    },
  },
];
