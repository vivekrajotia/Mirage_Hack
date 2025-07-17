'use client';

import * as React from 'react';
import { Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ColumnVisibility } from '@/lib/types';
import { allColumns, defaultVisibleColumns } from './columns';

interface ColumnSelectorProps {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
}

// Group columns by category for better organization
const columnCategories = {
  'Basic Information': [
    'trade_id',
    'trade_date_time',
    'commodity',
    'trader_name',
    'counterparty',
    'company',
    'profitcenter',
  ],
  'Trade Details': [
    'trade_transaction_type',
    'trade_type',
    'price',
    'price_type',
    'price_currency',
    'trade_value',
    'quantity',
  ],
  'Position Data': [
    'buy_open_position',
    'sell_open_position',
    'closed_position',
    'realized_position',
    'prev_open_buy_position',
    'prev_open_sell_position',
  ],
  'PnL & MTM': [
    'mtm_pnl',
    'mtm_settlement',
    'realised_pnl_today',
    'closed_pnl_today',
    'pnl_monthly',
    'pnl_yearly',
    'prev_mtm_pnl',
    'prev_realised_pnl',
    'mtm_pnl_in_mtm_currency',
  ],
  'Costs': [
    'total_cost',
    'finance_cost',
    'freight_cost',
    'insurance_cost',
    'tax_cost',
    'other_cost',
    'total_netted_cost',
    'total_added_cost',
    'total_premium_discount',
  ],
  'Risk & Exposure': [
    'fx_exposure',
    'fx_exposure_currency',
    'price_exposure',
    'fx_rate',
    'fx_allocation_status',
  ],
  'Commodity Details': [
    'parent_commodity',
    'brand',
    'grade',
    'origin',
    'season',
    'actual_origin',
    'bulk_packed',
    'incoterm',
  ],
  'Quantities': [
    'trade_quantity',
    'total_contract_qty',
    'planned_quantity',
    'actual_load_quantity',
    'actual_unload_quantity',
    'total_price_allocated_quantity',
    'trade_quantity_in_reporting_uom',
    'obligation_quantity_in_reporting_uom',
    'allocated_quantity_in_reporting_uom',
    'actualized_quantity_in_reporting_uom',
    'discharge_quantity_in_reporting_uom',
    'priced_quantity_in_reporting_uom',
    'un_priced_quantity_in_reporting_uom',
  ],
  'Dates & Timeline': [
    'created_timestamp',
    'updated_timestamp',
    'start_date',
    'end_date',
    'eod_run_date',
    'realized_date',
    'mtm_price_date',
    'delivery_start_date',
    'delivery_end_date',
    'laycan_date',
  ],
  'Settlement & Pricing': [
    'market_settlement_price',
    'future_market_settlement_price',
    'basis_market_settlement_price',
    'trade_settlement_price',
    'closed_pnl_today_in_settlement',
    'realised_pnl_today_in_settlement',
    'provisional_pnl_in_settlement',
    'provisional_pnl_today',
    'price_allocation_status',
    'price_settlement_currency',
    'prov_trade_price',
    'prov_price_currency',
    'prov_priceuom',
  ],
  'Units of Measure': [
    'eoduom',
    'priceuom',
    'quantityuom',
    'reporting_uom',
    'mtm_index_uom',
    'basis_mtm_index_uom',
    'prem_uom',
    'stockuom',
  ],
  'Locations': [
    'location',
    'discharge_port',
    'storage_location',
    'trade_discharge_location',
    'trade_load_location',
  ],
  'Obligations': [
    'obligationid',
    'obligation_status',
    'planned_obligation_id',
    'plan_id',
  ],
  'Indices & Basis': [
    'mtmindex',
    'mtm_index_period',
    'mtm_index_currency',
    'basis_mtm_index_period',
    'basis_mtm_index',
    'basis_mtm_index_currency',
    'basis_mtm_index_uom',
    'contract_month',
    'premium_discount',
  ],
  'Invoice & Stock': [
    'invoice_id',
    'invoice_currency',
    'invoice_amount',
    'stock_price',
    'stock_quantity',
    'stock_type',
    'stock_currency',
    'stockuom',
  ],
  'System Fields': [
    'uuid',
    'tenant_id',
    'created_by',
    'updated_by',
    'raw_data_id',
    'eod_currency',
    'eod_job_name',
    'nbv',
  ],
  'MTM Currency Fields': [
    'total_netted_cost_in_mtm_currency',
    'total_added_cost_in_mtm_currency',
    'total_cost_in_mtm_currency',
    'trade_value_in_mtm_currency',
  ],
  'Premium Fields': [
    'prem_currency',
    'prem_uom',
  ],
};

const STORAGE_KEY = 'trade-table-column-visibility';

export function ColumnSelector({ columnVisibility, onColumnVisibilityChange }: ColumnSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  // Get column display names from the actual column definitions
  const getColumnDisplayName = (columnId: string) => {
    const column = allColumns.find(col => col.accessorKey === columnId);
    if (column && column.header) {
      if (typeof column.header === 'string') {
        return column.header;
      } else if (typeof column.header === 'function') {
        // For complex headers, try to extract the text
        const headerResult = column.header({ column: { toggleSorting: () => {}, getIsSorted: () => false } } as any);
        if (React.isValidElement(headerResult)) {
          // Try to extract text from the header element
          const extractText = (element: React.ReactElement): string => {
            if (typeof element.props.children === 'string') {
              return element.props.children;
            }
            if (Array.isArray(element.props.children)) {
              return element.props.children
                .map(child => typeof child === 'string' ? child : extractText(child))
                .join('');
            }
            return columnId;
          };
          return extractText(headerResult);
        }
      }
    }
    return columnId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleToggleColumn = (columnId: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };
    onColumnVisibilityChange(newVisibility);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVisibility));
  };

  const handleShowAll = () => {
    const allVisible = allColumns.reduce((acc, col) => {
      acc[col.accessorKey as string] = true;
      return acc;
    }, {} as ColumnVisibility);
    onColumnVisibilityChange(allVisible);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisible));
  };

  const handleHideAll = () => {
    const allHidden = allColumns.reduce((acc, col) => {
      acc[col.accessorKey as string] = false;
      return acc;
    }, {} as ColumnVisibility);
    onColumnVisibilityChange(allHidden);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHidden));
  };

  const handleResetToDefault = () => {
    const defaultVisibility = allColumns.reduce((acc, col) => {
      acc[col.accessorKey as string] = defaultVisibleColumns.includes(col.accessorKey as string);
      return acc;
    }, {} as ColumnVisibility);
    onColumnVisibilityChange(defaultVisibility);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisibility));
  };

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return columnCategories;
    
    const filtered: typeof columnCategories = {};
    Object.entries(columnCategories).forEach(([category, columns]) => {
      const matchingColumns = columns.filter(columnId => {
        const displayName = getColumnDisplayName(columnId);
        return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               columnId.toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (matchingColumns.length > 0) {
        filtered[category] = matchingColumns;
      }
    });
    return filtered;
  }, [searchTerm]);

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;
  const totalCount = allColumns.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Columns
          <Badge variant="secondary" className="ml-2">
            {visibleCount}/{totalCount}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="flex gap-1 p-2">
          <Button variant="outline" size="sm" onClick={handleShowAll}>
            Show All
          </Button>
          <Button variant="outline" size="sm" onClick={handleHideAll}>
            Hide All
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetToDefault}>
            Reset
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {Object.entries(filteredCategories).map(([category, columns]) => (
            <div key={category} className="p-2">
              <div className="font-medium text-sm text-muted-foreground mb-2">
                {category}
              </div>
              {columns.map((columnId) => (
                <DropdownMenuItem
                  key={columnId}
                  className="cursor-pointer"
                  onClick={() => handleToggleColumn(columnId)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                      {columnVisibility[columnId] && <Check className="h-3 w-3" />}
                    </div>
                    <span className="text-sm">{getColumnDisplayName(columnId)}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 