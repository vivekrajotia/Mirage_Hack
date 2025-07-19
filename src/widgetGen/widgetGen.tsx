'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, X, Trash2 } from 'lucide-react';
import eodData from '@/app/xceler_eodservice_publisheddata (1).json'; // Use the correct data file
import { DraggableColumnSelector } from '@/components/ui/draggable-column-selector';

// Define the type based on the JSON data structure
type EodData = typeof eodData[0];

const WIDGET_TYPES = ['Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Chart', 'Data Table'];
const AGGREGATION_FUNCTIONS = ['sum', 'average', 'count', 'min', 'max'];
const FILTER_CONDITIONS = ['equals', 'does not equal', 'contains', 'does not contain', 'is greater than', 'is less than'];

// Helper functions for type inference
const isNumericValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const isDateValue = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  // Regex to check for ISO 8601 format (e.g., "2024-01-01T12:00:00Z") or similar date formats
  return /^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value));
};

const getColumnType = (data: any[], columnKey: string): 'numeric' | 'date' | 'text' => {
  if (!data || data.length === 0) return 'text';
  
  const sampleSize = Math.min(20, data.length);
  let numericCount = 0;
  let dateCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const value = data[i]?.[columnKey];
    if (value !== null && value !== undefined && value !== '') {
      if (isNumericValue(value)) numericCount++;
      if (isDateValue(value)) dateCount++;
    }
  }

  if (numericCount > sampleSize / 2) return 'numeric';
  if (dateCount > sampleSize / 2) return 'date';
  return 'text';
};

const ALL_EOD_FIELDS = Object.keys(eodData[0] || {});

const fieldTypes = ALL_EOD_FIELDS.reduce((acc, field) => {
  acc[field] = getColumnType(eodData, field);
  return acc;
}, {} as Record<string, 'numeric' | 'date' | 'text'>);

const NUMERIC_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'numeric');
const TEXT_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'text');
const DATE_FIELDS = ALL_EOD_FIELDS.filter(f => fieldTypes[f] === 'date');

interface Filter {
  id: number;
  field: string;
  condition: string;
  value: string;
}

interface WidgetConfig {
  title: string;
  type: string;
  xAxis: string;
  yAxis: string;
  colorBy: string;
  valueField: string;
  aggregation: string;
  filters: Filter[];
  selectedColumns: string[];
}

const WidgetGenerator = () => {
  const allTableColumns = useMemo(() => Object.keys(eodData[0] || {}), []);

  const [config, setConfig] = useState<WidgetConfig>({
    title: 'New EOD Widget',
    type: WIDGET_TYPES[0],
    xAxis: [...TEXT_FIELDS, ...DATE_FIELDS][0] || '',
    yAxis: NUMERIC_FIELDS[0] || '',
    colorBy: '',
    valueField: NUMERIC_FIELDS[0] || '',
    aggregation: AGGREGATION_FUNCTIONS[0],
    filters: [],
    selectedColumns: [],
  });
  const [nextFilterId, setNextFilterId] = useState(1);

  const handleConfigChange = (field: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addFilter = () => {
    const newFilter: Filter = {
      id: nextFilterId,
      field: ALL_EOD_FIELDS[0],
      condition: FILTER_CONDITIONS[0],
      value: '',
    };
    handleConfigChange('filters', [...config.filters, newFilter]);
    setNextFilterId(prev => prev + 1);
  };

  const removeFilter = (id: number) => {
    const updatedFilters = config.filters.filter(f => f.id !== id);
    handleConfigChange('filters', updatedFilters);
  };

  const handleFilterChange = (id: number, field: keyof Filter, value: string) => {
    const updatedFilters = config.filters.map(f =>
      f.id === id ? { ...f, [field]: value } : f
    );
    handleConfigChange('filters', updatedFilters);
  };

  const generateWidget = () => {
    console.log('Generated Widget Config:', JSON.stringify(config, null, 2));
    alert('Widget configuration logged to console. See how you can integrate this with your dashboard!');
  };

  const handlePreview = () => {
    localStorage.setItem('widgetPreviewConfig', JSON.stringify(config));
    window.open('/graph-engine-demo', '_blank');
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Widget saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save widget: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('An error occurred while saving the widget.');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">
            EOD Widget Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">1. Basic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={config.title}
                  onChange={e => handleConfigChange('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="widget-type">Widget Type</Label>
                <Select
                  value={config.type}
                  onValueChange={value => handleConfigChange('type', value)}
                >
                  <SelectTrigger id="widget-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Configuration */}
          {config.type === 'Data Table' ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">2. Column Selection</h3>
              <DraggableColumnSelector
                allColumns={allTableColumns}
                selectedColumns={config.selectedColumns}
                onSelectedColumnsChange={(newColumns) =>
                  handleConfigChange('selectedColumns', newColumns)
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">2. Data & Axes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="x-axis">X-Axis (Category)</Label>
                  <Select
                    value={config.xAxis}
                    onValueChange={value => handleConfigChange('xAxis', value)}
                  >
                    <SelectTrigger id="x-axis" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...TEXT_FIELDS, ...DATE_FIELDS].map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="y-axis">Y-Axis (Value)</Label>
                  <Select
                    value={config.yAxis}
                    onValueChange={value => handleConfigChange('yAxis', value)}
                  >
                    <SelectTrigger id="y-axis" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMERIC_FIELDS.map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color-by">Color By (Legend)</Label>
                  <Select
                    value={config.colorBy}
                    onValueChange={value => handleConfigChange('colorBy', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger id="color-by" className="mt-1">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <em>None</em>
                      </SelectItem>
                      {[...TEXT_FIELDS, ...DATE_FIELDS].map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="value-field">
                    Value Field (for Pies/Totals)
                  </Label>
                  <Select
                    value={config.valueField}
                    onValueChange={value => handleConfigChange('valueField', value)}
                  >
                    <SelectTrigger id="value-field" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NUMERIC_FIELDS.map(field => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aggregation">Aggregation</Label>
                  <Select
                    value={config.aggregation}
                    onValueChange={value => handleConfigChange('aggregation', value)}
                  >
                    <SelectTrigger id="aggregation" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGGREGATION_FUNCTIONS.map((func: string) => (
                        <SelectItem key={func} value={func}>
                          {func}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Filtering Rules */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-700">3. Filters</h3>
              <Button variant="outline" size="sm" onClick={addFilter}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Filter
              </Button>
            </div>
            <div className="space-y-4">
              {config.filters.map(filter => (
                <div key={filter.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                    <Select
                      value={filter.field}
                      onValueChange={value => handleFilterChange(filter.id, 'field', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ALL_EOD_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.condition}
                      onValueChange={value => handleFilterChange(filter.id, 'condition', value)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FILTER_CONDITIONS.map((cond: string) => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={e => handleFilterChange(filter.id, 'value', e.target.value)}
                      placeholder="Value"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handleSave}>Save Widget</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WidgetGenerator;
