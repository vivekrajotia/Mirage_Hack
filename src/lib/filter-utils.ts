import { Trade } from './types';
import { FilterState, FilterValue } from '@/components/dashboard/filter-selector';

export function applyFilters(data: Trade[], filters: FilterState): Trade[] {
  if (Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter(trade => {
    return Object.entries(filters).every(([field, filterValue]) => {
      return applyFilter(trade, field as keyof Trade, filterValue);
    });
  });
}

function applyFilter(trade: Trade, field: keyof Trade, filterValue: FilterValue): boolean {
  const value = trade[field];
  
  // Handle string filters
  if (filterValue.stringValue !== undefined) {
    const stringValue = filterValue.stringValue.toLowerCase();
    const tradeValue = String(value || '').toLowerCase();
    
    switch (filterValue.stringOperator) {
      case 'contains':
        return tradeValue.includes(stringValue);
      case 'equals':
        return tradeValue === stringValue;
      case 'startsWith':
        return tradeValue.startsWith(stringValue);
      case 'endsWith':
        return tradeValue.endsWith(stringValue);
      default:
        return tradeValue.includes(stringValue);
    }
  }
  
  // Handle number filters
  if (filterValue.minValue !== undefined || filterValue.maxValue !== undefined) {
    const numValue = Number(value);
    if (isNaN(numValue)) return false;
    
    if (filterValue.minValue !== undefined && numValue < filterValue.minValue) {
      return false;
    }
    if (filterValue.maxValue !== undefined && numValue > filterValue.maxValue) {
      return false;
    }
    return true;
  }
  
  // Handle category filters
  if (filterValue.selectedValues && filterValue.selectedValues.length > 0) {
    const stringValue = String(value || '');
    
    // Special handling for trade_transaction_type
    if (field === 'trade_transaction_type') {
      const transactionType = Number(value) === 0 ? 'Buy' : 'Sell';
      return filterValue.selectedValues.includes(transactionType);
    }
    
    return filterValue.selectedValues.includes(stringValue);
  }
  
  // Handle date filters
  if (filterValue.startDate || filterValue.endDate) {
    const dateValue = new Date(String(value || ''));
    if (isNaN(dateValue.getTime())) return false;
    
    if (filterValue.startDate) {
      const startDate = new Date(filterValue.startDate);
      if (dateValue < startDate) return false;
    }
    
    if (filterValue.endDate) {
      const endDate = new Date(filterValue.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      if (dateValue > endDate) return false;
    }
    
    return true;
  }
  
  return true;
}

export function getFilterSummary(filters: FilterState): string {
  const activeFilters = Object.entries(filters);
  if (activeFilters.length === 0) return 'No filters applied';
  
  const summaryParts = activeFilters.map(([field, filterValue]) => {
    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (filterValue.stringValue) {
      return `${fieldName} ${filterValue.stringOperator || 'contains'} "${filterValue.stringValue}"`;
    }
    
    if (filterValue.minValue !== undefined || filterValue.maxValue !== undefined) {
      const parts = [];
      if (filterValue.minValue !== undefined) parts.push(`≥ ${filterValue.minValue}`);
      if (filterValue.maxValue !== undefined) parts.push(`≤ ${filterValue.maxValue}`);
      return `${fieldName} ${parts.join(' and ')}`;
    }
    
    if (filterValue.selectedValues && filterValue.selectedValues.length > 0) {
      const values = filterValue.selectedValues.slice(0, 3).join(', ');
      const suffix = filterValue.selectedValues.length > 3 ? ` (+${filterValue.selectedValues.length - 3} more)` : '';
      return `${fieldName} in [${values}${suffix}]`;
    }
    
    if (filterValue.startDate || filterValue.endDate) {
      const parts = [];
      if (filterValue.startDate) parts.push(`from ${filterValue.startDate}`);
      if (filterValue.endDate) parts.push(`to ${filterValue.endDate}`);
      return `${fieldName} ${parts.join(' ')}`;
    }
    
    return fieldName;
  });
  
  return summaryParts.join(', ');
}

export function exportFiltersToJson(filters: FilterState): string {
  return JSON.stringify(filters, null, 2);
}

export function importFiltersFromJson(jsonString: string): FilterState {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error importing filters:', error);
    return {};
  }
} 