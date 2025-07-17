'use client';

import * as React from 'react';
import { Check, Filter, X, ChevronDown, ChevronRight } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trade } from '@/lib/types';

export type FilterType = 'string' | 'number' | 'category' | 'date';

export interface FilterConfig {
  field: keyof Trade;
  type: FilterType;
  label: string;
  options?: string[]; // For category filters
}

export interface FilterValue {
  // String filters
  stringValue?: string;
  stringOperator?: 'contains' | 'equals' | 'startsWith' | 'endsWith';
  
  // Number filters
  minValue?: number;
  maxValue?: number;
  
  // Category filters
  selectedValues?: string[];
  
  // Date filters
  startDate?: string;
  endDate?: string;
}

export interface FilterState {
  [key: string]: FilterValue;
}

interface FilterSelectorProps {
  data: Trade[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Filter configurations organized by category
const filterCategories: Record<string, FilterConfig[]> = {
  'Basic Information': [
    { field: 'trade_id', type: 'string', label: 'Trade ID' },
    { field: 'commodity', type: 'category', label: 'Commodity' },
    { field: 'company', type: 'category', label: 'Company' },
    { field: 'counterparty', type: 'category', label: 'Counterparty' },
    { field: 'trader_name', type: 'category', label: 'Trader Name' },
    { field: 'profitcenter', type: 'category', label: 'Profit Center' },
  ],
  'Trade Details': [
    { field: 'trade_transaction_type', type: 'category', label: 'Transaction Type', options: ['Buy', 'Sell'] },
    { field: 'trade_type', type: 'category', label: 'Trade Type' },
    { field: 'price_type', type: 'category', label: 'Price Type' },
    { field: 'price', type: 'number', label: 'Price' },
    { field: 'trade_value', type: 'number', label: 'Trade Value' },
    { field: 'quantity', type: 'number', label: 'Quantity' },
  ],
  'Positions': [
    { field: 'buy_open_position', type: 'number', label: 'Buy Open Position' },
    { field: 'sell_open_position', type: 'number', label: 'Sell Open Position' },
    { field: 'closed_position', type: 'number', label: 'Closed Position' },
    { field: 'realized_position', type: 'number', label: 'Realized Position' },
  ],
  'PnL & MTM': [
    { field: 'mtm_pnl', type: 'number', label: 'MTM PnL' },
    { field: 'realised_pnl_today', type: 'number', label: 'Realized PnL Today' },
    { field: 'closed_pnl_today', type: 'number', label: 'Closed PnL Today' },
    { field: 'pnl_monthly', type: 'number', label: 'PnL Monthly' },
    { field: 'pnl_yearly', type: 'number', label: 'PnL Yearly' },
  ],
  'Currencies': [
    { field: 'price_currency', type: 'category', label: 'Price Currency' },
    { field: 'eod_currency', type: 'category', label: 'EOD Currency' },
    { field: 'fx_exposure_currency', type: 'category', label: 'FX Exposure Currency' },
  ],
  'Costs': [
    { field: 'total_cost', type: 'number', label: 'Total Cost' },
    { field: 'finance_cost', type: 'number', label: 'Finance Cost' },
    { field: 'freight_cost', type: 'number', label: 'Freight Cost' },
    { field: 'insurance_cost', type: 'number', label: 'Insurance Cost' },
    { field: 'tax_cost', type: 'number', label: 'Tax Cost' },
  ],
  'Commodity Details': [
    { field: 'parent_commodity', type: 'category', label: 'Parent Commodity' },
    { field: 'brand', type: 'category', label: 'Brand' },
    { field: 'grade', type: 'category', label: 'Grade' },
    { field: 'origin', type: 'category', label: 'Origin' },
    { field: 'season', type: 'category', label: 'Season' },
  ],
  'Dates': [
    { field: 'trade_date_time', type: 'date', label: 'Trade Date' },
    { field: 'created_timestamp', type: 'date', label: 'Created Date' },
    { field: 'updated_timestamp', type: 'date', label: 'Updated Date' },
    { field: 'realized_date', type: 'date', label: 'Realized Date' },
  ],
};

const STORAGE_KEY = 'trade-table-filters';

export function FilterSelector({ data, filters, onFiltersChange }: FilterSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});

  // Get unique values for category filters
  const getUniqueValues = React.useCallback((field: keyof Trade): string[] => {
    const values = data
      .map(item => item[field])
      .filter((value): value is string => value !== null && value !== undefined && value !== '')
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort();
    return values;
  }, [data]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Update filter value
  const updateFilter = (field: keyof Trade, value: FilterValue) => {
    const newFilters = { ...filters };
    if (Object.keys(value).length === 0 || 
        (value.stringValue === '' && value.selectedValues?.length === 0 && 
         value.minValue === undefined && value.maxValue === undefined &&
         value.startDate === '' && value.endDate === '')) {
      delete newFilters[field as string];
    } else {
      newFilters[field as string] = value;
    }
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
    localStorage.removeItem(STORAGE_KEY);
  };

  // Save filters to localStorage
  const saveFilters = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  };

  // Load filters from localStorage
  const loadFilters = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedFilters = JSON.parse(saved);
        onFiltersChange(parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return filterCategories;
    
    const filtered: typeof filterCategories = {};
    Object.entries(filterCategories).forEach(([category, configs]) => {
      const matchingConfigs = configs.filter(config => 
        config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.field.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingConfigs.length > 0) {
        filtered[category] = matchingConfigs;
      }
    });
    return filtered;
  }, [searchTerm]);

  // Count active filters
  const activeFiltersCount = Object.keys(filters).length;

  // Render filter input based on type
  const renderFilterInput = (config: FilterConfig) => {
    const currentFilter = filters[config.field as string] || {};
    
    switch (config.type) {
      case 'string':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select 
                value={currentFilter.stringOperator || 'contains'} 
                onValueChange={(value) => updateFilter(config.field, { 
                  ...currentFilter, 
                  stringOperator: value as 'contains' | 'equals' | 'startsWith' | 'endsWith' 
                })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="startsWith">Starts with</SelectItem>
                  <SelectItem value="endsWith">Ends with</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={`Enter ${config.label.toLowerCase()}...`}
                value={currentFilter.stringValue || ''}
                onChange={(e) => updateFilter(config.field, { 
                  ...currentFilter, 
                  stringValue: e.target.value 
                })}
                className="flex-1"
              />
            </div>
          </div>
        );
        
      case 'number':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={currentFilter.minValue || ''}
                onChange={(e) => updateFilter(config.field, { 
                  ...currentFilter, 
                  minValue: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={currentFilter.maxValue || ''}
                onChange={(e) => updateFilter(config.field, { 
                  ...currentFilter, 
                  maxValue: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>
          </div>
        );
        
      case 'category':
        const options = config.options || getUniqueValues(config.field);
        const selectedValues = currentFilter.selectedValues || [];
        
        return (
          <div className="space-y-2">
            <div className="max-h-32 overflow-y-auto">
              {options.map((option) => (
                <div key={option} className="flex items-center space-x-2 p-1">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const newSelected = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter(v => v !== option);
                      updateFilter(config.field, { 
                        ...currentFilter, 
                        selectedValues: newSelected 
                      });
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'date':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="date"
                value={currentFilter.startDate || ''}
                onChange={(e) => updateFilter(config.field, { 
                  ...currentFilter, 
                  startDate: e.target.value 
                })}
              />
              <Input
                type="date"
                value={currentFilter.endDate || ''}
                onChange={(e) => updateFilter(config.field, { 
                  ...currentFilter, 
                  endDate: e.target.value 
                })}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Input
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="flex gap-1 p-2">
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button variant="outline" size="sm" onClick={saveFilters}>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={loadFilters}>
            Load
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {Object.entries(filteredCategories).map(([category, configs]) => (
            <Collapsible
              key={category}
              open={expandedCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <span className="font-medium text-sm">{category}</span>
                  {expandedCategories[category] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2">
                {configs.map((config) => (
                  <Card key={config.field as string} className="mb-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{config.label}</CardTitle>
                        {filters[config.field as string] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateFilter(config.field, {})}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {renderFilterInput(config)}
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 