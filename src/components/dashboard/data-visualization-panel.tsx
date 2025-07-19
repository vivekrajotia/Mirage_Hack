'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './data-visualization-panel.css';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  X,
  Settings,
  Filter,
  SortAsc,
  Hash,
  Calendar,
  Type,
  GripVertical,
  ChevronDown,
  ChevronRight,
  BarChart,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Trade } from '@/lib/types';
import ToastBanner from '../toast-banner';

// Types
interface ColumnInfo {
  key: string;
  header: string;
  type: 'numeric' | 'date' | 'text';
}

interface SelectedFields {
  filters: string[];
  legend: string[];
  axis: string[];
  values: string[];
}

interface AggregationFunctions {
  [key: string]: string;
}

interface FilterValues {
  [key: string]: string[];
}

interface DataVisualizationPanelProps {
  data: Trade[];
  isVisible: boolean;
  onClose: () => void;
}

// Constants
const AGGREGATION_FUNCTIONS = [
  { value: 'sum', label: 'Sum', icon: '∑' },
  { value: 'count', label: 'Count', icon: '#' },
  { value: 'average', label: 'Average', icon: 'x̄' },
  { value: 'min', label: 'Min', icon: '↓' },
  { value: 'max', label: 'Max', icon: '↑' },
  { value: 'product', label: 'Product', icon: '∏' }
];

const EXCEL_COLORS = [
  '#5B9BD5', '#70AD47', '#FFC000', '#FF6B6B', '#9966CC',
  '#4ECDC4', '#FF8C42', '#A8E6CF', '#FFB3BA', '#BFBFBF'
];

const CHART_TYPES = [
  {
    value: 'column',
    label: 'Column',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Compare values across categories'
  },
  {
    value: 'line',
    label: 'Line',
    icon: <LineChart className="h-4 w-4" />,
    description: 'Show trends over time'
  },
  {
    value: 'pie',
    label: 'Pie',
    icon: <PieChart className="h-4 w-4" />,
    description: 'Show parts of a whole'
  },
  {
    value: 'area',
    label: 'Area',
    icon: <AreaChart className="h-4 w-4" />,
    description: 'Show cumulative totals'
  },
  {
    value: 'scatter',
    label: 'Scatter',
    icon: <ScatterChart className="h-4 w-4" />,
    description: 'Show correlation between variables'
  }
];

const COLUMN_SUBTYPES = [
  {
    value: 'clustered',
    label: 'Clustered Column',
    description: 'Compare values across categories side by side',
    icon: '📊'
  },
  {
    value: 'stacked',
    label: 'Stacked Column',
    description: 'Show parts of a whole stacked vertically',
    icon: '📈'
  },
  {
    value: 'stacked100',
    label: '100% Stacked Column',
    description: 'Show percentage contribution of each part',
    icon: '📉'
  },
  {
    value: 'bar-stack',
    label: 'Stacked Bar',
    description: 'Horizontal stacked bars for category comparison',
    icon: '📋'
  }
];

const LINE_SUBTYPES = [
  {
    value: 'basic',
    label: 'Basic Line',
    description: 'Simple line chart with data points',
    icon: '📈'
  },
  {
    value: 'smooth',
    label: 'Smooth Line',
    description: 'Curved line chart for smoother visualization',
    icon: '〰️'
  },
  {
    value: 'stepped',
    label: 'Stepped Line',
    description: 'Step-like line chart showing discrete changes',
    icon: '📊'
  },
  {
    value: 'dashed',
    label: 'Dashed Line',
    description: 'Line chart with dashed line style',
    icon: '➖'
  },
  {
    value: 'markers',
    label: 'Line with Markers',
    description: 'Line chart with emphasized data point markers',
    icon: '🔵'
  }
];

// Helper functions
const isNumericValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
};

const isDateValue = (value: any): boolean => {
  if (!value) return false;
  const str = String(value);
  
  // Check YYYYMM format
  if (/^\d{6}$/.test(str)) {
    const year = parseInt(str.substring(0, 4));
    const month = parseInt(str.substring(4, 6));
    return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
  }
  
  // Check YYYY format
  if (/^\d{4}$/.test(str)) {
    const year = parseInt(str);
    return year >= 1900 && year <= 2100;
  }
  
  // Check standard date formats
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

const formatDateValue = (value: any): string => {
  const str = String(value);
  if (/^\d{6}$/.test(str)) {
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  return value;
};

const getColumnType = (data: any[], columnKey: string): 'numeric' | 'date' | 'text' => {
  if (!data || data.length === 0) return 'text';
  
  const sampleSize = Math.min(10, data.length);
  let numericCount = 0;
  let dateCount = 0;
  let validCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const value = data[i]?.[columnKey];
    if (value !== null && value !== undefined && value !== '') {
      validCount++;
      if (isNumericValue(value)) numericCount++;
      if (isDateValue(value)) dateCount++;
    }
  }
  
  if (validCount === 0) return 'text';
  
  const numericRatio = numericCount / validCount;
  const dateRatio = dateCount / validCount;
  
  if (numericRatio >= 0.8) return 'numeric';
  if (dateRatio >= 0.8) return 'date';
  return 'text';
};

export function DataVisualizationPanel({ data, isVisible, onClose }: DataVisualizationPanelProps) {
  // State management
  const [chartType, setChartType] = useState('column');
  const [columnSubType, setColumnSubType] = useState('clustered');
  const [lineSubType, setLineSubType] = useState('basic');
  const [selectedFields, setSelectedFields] = useState<SelectedFields>({
    filters: [],
    legend: [],
    axis: [],
    values: []
  });
  const [chartTitle, setChartTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [aggregationFunctions, setAggregationFunctions] = useState<AggregationFunctions>({});
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [dragOverArea, setDragOverArea] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    numeric: true,
    date: true,
    text: true
  });

  // Enhanced column analysis
  const columnAnalysis = useMemo(() => {
    if (!data || data.length === 0) {
      return { numeric: [], date: [], text: [], all: [] };
    }

    const analysis = {
      numeric: [] as ColumnInfo[],
      date: [] as ColumnInfo[],
      text: [] as ColumnInfo[],
      all: [] as ColumnInfo[]
    };

    // Get all keys from the data
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    Array.from(allKeys).forEach(key => {
      const columnInfo: ColumnInfo = {
        key,
        header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: getColumnType(data, key)
      };

      analysis.all.push(columnInfo);
      analysis[columnInfo.type].push(columnInfo);
    });

    return analysis;
  }, [data]);

  // Get unique values for filter fields
  const filterOptions = useMemo(() => {
    if (!data || selectedFields.filters.length === 0) {
      return {};
    }

    const options: { [key: string]: any[] } = {};
    selectedFields.filters.forEach(field => {
      const uniqueValues = [...new Set(
        data
          .map(row => (row as any)[field])
          .filter(value => value !== null && value !== undefined && value !== '')
      )].sort();
      options[field] = uniqueValues;
    });

    return options;
  }, [data, selectedFields.filters]);

  // Data processing with Excel-like aggregation
  const processedData = useMemo(() => {
    if (!data || selectedFields.values.length === 0) {
      return [];
    }

    try {
      setError(null);
      let processedData = [...data];

      // Apply filters first
      selectedFields.filters.forEach(field => {
        const selectedValues = filterValues[field];
        if (selectedValues && selectedValues.length > 0) {
          processedData = processedData.filter(row => 
            selectedValues.includes((row as any)[field])
          );
        }
      });

      // Filter out invalid rows
      processedData = processedData.filter(row => {
        return selectedFields.values.some(field => {
          const value = (row as any)[field];
          return value !== null && value !== undefined && value !== '' && isNumericValue(value);
        });
      });

      // Handle legend field grouping
      const legendField = selectedFields.legend[0];
      const axisField = selectedFields.axis[0];
      
      if (legendField && axisField) {
        // Group by both axis and legend fields
        const grouped: { [key: string]: any } = {};
        
        processedData.forEach(row => {
          const axisKey = (row as any)[axisField];
          const legendKey = (row as any)[legendField];
          
          if (axisKey !== null && axisKey !== undefined && axisKey !== '' &&
              legendKey !== null && legendKey !== undefined && legendKey !== '') {
            const compositeKey = `${axisKey}|${legendKey}`;
            if (!grouped[compositeKey]) {
              grouped[compositeKey] = {
                [axisField]: axisKey,
                [legendField]: legendKey,
                rows: []
              };
            }
            grouped[compositeKey].rows.push(row);
          }
        });

        // Create aggregated data with legend grouping
        const aggregatedData: { [key: string]: any } = {};
        
        Object.values(grouped).forEach((group: any) => {
          const axisKey = group[axisField];
          const legendKey = group[legendField];
          
          if (!aggregatedData[axisKey]) {
            aggregatedData[axisKey] = { [axisField]: axisKey };
          }
          
          selectedFields.values.forEach(field => {
            const values = group.rows
              .map((row: any) => Number(row[field]))
              .filter((val: number) => !isNaN(val) && isFinite(val));
            
            if (values.length > 0) {
              const aggFunc = aggregationFunctions[field] || 'sum';
              let aggregatedValue = 0;
              
              switch (aggFunc) {
                case 'sum':
                  aggregatedValue = values.reduce((sum: number, val: number) => sum + val, 0);
                  break;
                case 'count':
                  aggregatedValue = values.length;
                  break;
                case 'average':
                  aggregatedValue = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
                  break;
                case 'min':
                  aggregatedValue = Math.min(...values);
                  break;
                case 'max':
                  aggregatedValue = Math.max(...values);
                  break;
                case 'product':
                  aggregatedValue = values.reduce((product: number, val: number) => product * val, 1);
                  break;
                default:
                  aggregatedValue = values.reduce((sum: number, val: number) => sum + val, 0);
              }
              
              const fieldKey = `${field}_${legendKey}`;
              aggregatedData[axisKey][fieldKey] = aggregatedValue;
              
              if (!aggregatedData[axisKey]._legendMapping) {
                aggregatedData[axisKey]._legendMapping = {};
              }
              aggregatedData[axisKey]._legendMapping[fieldKey] = legendKey;
            }
          });
        });
        
        processedData = Object.values(aggregatedData);
      } else if (axisField) {
        // Group by axis field only
        const grouped: { [key: string]: any[] } = {};
        
        processedData.forEach(row => {
          const key = (row as any)[axisField];
          if (key !== null && key !== undefined && key !== '') {
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(row);
          }
        });

        processedData = Object.keys(grouped).map(key => {
          const group = grouped[key];
          const aggregated: any = { [axisField]: key };
          
          selectedFields.values.forEach(field => {
            const values = group
              .map(row => Number((row as any)[field]))
              .filter(val => !isNaN(val) && isFinite(val));
            
            if (values.length > 0) {
              const aggFunc = aggregationFunctions[field] || 'sum';
              
              switch (aggFunc) {
                case 'sum':
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0);
                  break;
                case 'count':
                  aggregated[field] = values.length;
                  break;
                case 'average':
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
                  break;
                case 'min':
                  aggregated[field] = Math.min(...values);
                  break;
                case 'max':
                  aggregated[field] = Math.max(...values);
                  break;
                case 'product':
                  aggregated[field] = values.reduce((product, val) => product * val, 1);
                  break;
                default:
                  aggregated[field] = values.reduce((sum, val) => sum + val, 0);
              }
            } else {
              aggregated[field] = 0;
            }
          });
          
          return aggregated;
        });
      }

      // Sort data for better visualization
      if (selectedFields.axis.length > 0) {
        const axisField = selectedFields.axis[0];
        const axisType = getColumnType(data, axisField);
        
        if (axisType === 'date') {
          processedData.sort((a, b) => {
            const aVal = String((a as any)[axisField]);
            const bVal = String((b as any)[axisField]);
            return aVal.localeCompare(bVal);
          });
        } else if (axisType === 'numeric') {
          processedData.sort((a, b) => Number((a as any)[axisField]) - Number((b as any)[axisField]));
        }
      }

      // Limit data points for performance
      return processedData.slice(0, 100);
    } catch (err) {
      setError('Error processing data: ' + (err as Error).message);
      return [];
    }
  }, [data, selectedFields, filterValues, aggregationFunctions]);

  // Get unique legend values for color mapping
  const legendValues = useMemo(() => {
    if (!selectedFields.legend[0] || !data) return [];
    
    const legendField = selectedFields.legend[0];
    return [...new Set(
      data
        .map(row => (row as any)[legendField])
        .filter(value => value !== null && value !== undefined && value !== '')
    )].sort();
  }, [data, selectedFields.legend]);

  // Create color mapping for legend values
  const legendColorMap = useMemo(() => {
    const colorMap: { [key: string]: string } = {};
    legendValues.forEach((value, index) => {
      colorMap[value] = EXCEL_COLORS[index % EXCEL_COLORS.length];
    });
    return colorMap;
  }, [legendValues]);

  // Field management functions
  const addFieldToArea = useCallback((field: string, area: keyof SelectedFields) => {
    setSelectedFields(prev => {
      const newFields = { ...prev };
      
      // Remove field from other areas first
      Object.keys(newFields).forEach(key => {
        newFields[key as keyof SelectedFields] = newFields[key as keyof SelectedFields].filter(f => f !== field);
      });
      
      // Add to target area with validation
      if (area === 'values' && getColumnType(data, field) !== 'numeric') {
        setError('Values area only accepts numeric fields');
        return prev;
      }
      
      if (area === 'axis' && newFields.axis.length >= 1) {
        setError('Axis area accepts only one field');
        return prev;
      }
      
      if (area === 'legend' && newFields.legend.length >= 1) {
        setError('Legend area accepts only one field');
        return prev;
      }
      
      newFields[area] = [...newFields[area], field];
      
      // Set default aggregation for values area
      if (area === 'values') {
        setAggregationFunctions(prevAgg => ({
          ...prevAgg,
          [field]: prevAgg[field] || 'sum'
        }));
      }
      
      setError(null);
      return newFields;
    });
  }, [data]);

  const removeFieldFromArea = useCallback((field: string, area: keyof SelectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [area]: prev[area].filter(f => f !== field)
    }));
    
    // Clear filter values when removing from filters area
    if (area === 'filters') {
      setFilterValues(prev => {
        const newValues = { ...prev };
        delete newValues[field];
        return newValues;
      });
    }
    
    // Clear aggregation functions when removing from values area
    if (area === 'values') {
      setAggregationFunctions(prev => {
        const newAgg = { ...prev };
        delete newAgg[field];
        return newAgg;
      });
    }
  }, []);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, field: string) => {
    setDraggedField(field);
    e.dataTransfer.setData('text/plain', field);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, area: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverArea(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, area: keyof SelectedFields) => {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    if (field && draggedField) {
      addFieldToArea(field, area);
    }
    setDraggedField(null);
    setDragOverArea(null);
  }, [draggedField, addFieldToArea]);

  const handleDragEnd = useCallback(() => {
    setDraggedField(null);
    setDragOverArea(null);
  }, []);

  // Aggregation function change handler
  const handleAggregationChange = useCallback((field: string, aggFunction: string) => {
    setAggregationFunctions(prev => ({
      ...prev,
      [field]: aggFunction
    }));
  }, []);

  // Filter value change handler
  const handleFilterChange = useCallback((field: string, values: string[]) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: values
    }));
  }, []);

  // Reset function
  const resetChart = useCallback(() => {
    setSelectedFields({
      filters: [],
      legend: [],
      axis: [],
      values: []
    });
    setChartTitle('');
    setError(null);
    setFilterValues({});
    setAggregationFunctions({});
    setChartType('column');
    setColumnSubType('clustered');
    setLineSubType('basic');
  }, []);

  // Chart configuration generator (simplified for space)
  const getEChartsOption = () => {
    if (selectedFields.values.length === 0 || processedData.length === 0) {
      return null;
    }

    const axisField = selectedFields.axis[0];
    const isAxisDate = axisField && getColumnType(data, axisField) === 'date';
    
    const chartData = processedData.map(row => {
      const newRow = { ...row };
      if (isAxisDate) {
        newRow[`${axisField}_formatted`] = formatDateValue((row as any)[axisField]);
      }
      return newRow;
    });

    const baseOption = {
      backgroundColor: '#ffffff',
      textStyle: {
        fontFamily: 'inherit'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#1e293b',
          fontSize: 12
        }
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 10,
        textStyle: {
          fontSize: 12,
          color: '#64748b'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '15%',
        containLabel: true
      }
    };

    // Column Chart Implementation
    if (chartType === 'column') {
      const xAxisData = chartData.map(row => 
        isAxisDate ? formatDateValue((row as any)[axisField]) : ((row as any)[axisField] || '')
      );
      
      const series = selectedFields.values.map((field, index) => {
        const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
        const aggFunc = aggregationFunctions[field] || 'sum';
        const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
        
        const seriesConfig: any = {
          name: `${aggLabel} of ${fieldHeader}`,
          type: 'bar',
          data: chartData.map(row => (row as any)[field] || 0),
          itemStyle: {
            color: EXCEL_COLORS[index % EXCEL_COLORS.length]
          }
        };

        // Apply stacking based on column sub-type
        if (columnSubType === 'stacked' || columnSubType === 'stacked100') {
          seriesConfig.stack = 'total';
        }

        return seriesConfig;
      });
      
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: isAxisDate ? 45 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series
      };
    }

    // Line Chart Implementation
    if (chartType === 'line') {
      const xAxisData = chartData.map(row => 
        isAxisDate ? formatDateValue((row as any)[axisField]) : ((row as any)[axisField] || '')
      );
      
      const series = selectedFields.values.map((field, index) => {
        const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
        const aggFunc = aggregationFunctions[field] || 'sum';
        const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
        
        const lineConfig: any = {
          smooth: lineSubType === 'smooth',
          symbol: 'circle',
          symbolSize: lineSubType === 'markers' ? 8 : 4,
          lineStyle: { 
            width: 2,
            type: lineSubType === 'dashed' ? 'dashed' : 'solid'
          }
        };

        if (lineSubType === 'stepped') {
          lineConfig.step = 'middle';
        }
        
        return {
          name: `${aggLabel} of ${fieldHeader}`,
          type: 'line',
          data: chartData.map(row => (row as any)[field] || 0),
          itemStyle: {
            color: EXCEL_COLORS[index % EXCEL_COLORS.length]
          },
          ...lineConfig
        };
      });
      
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: isAxisDate ? 45 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series
      };
    }

    // Pie Chart Implementation
    if (chartType === 'pie') {
      if (selectedFields.values.length > 1) {
        return null; // Pie charts only support one value field
      }

      const pieData = chartData.map((item, index) => ({
        name: isAxisDate ? formatDateValue((item as any)[axisField]) : ((item as any)[axisField] || 'Unknown'),
        value: Number((item as any)[selectedFields.values[0]]) || 0,
        itemStyle: {
          color: EXCEL_COLORS[index % EXCEL_COLORS.length]
        }
      })).filter(item => item.value > 0);
      
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [{
          name: selectedFields.values[0],
          type: 'pie',
          radius: ['0%', '70%'],
          center: ['50%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            formatter: function(params: any) {
              return params.percent > 5 ? `${params.name}\n${params.percent}%` : '';
            }
          }
        }]
      };
    }

    // Area Chart Implementation
    if (chartType === 'area') {
      const xAxisData = chartData.map(row => 
        isAxisDate ? formatDateValue((row as any)[axisField]) : ((row as any)[axisField] || '')
      );
      
      const series = selectedFields.values.map((field, index) => {
        const fieldHeader = columnAnalysis.all.find(col => col.key === field)?.header || field;
        const aggFunc = aggregationFunctions[field] || 'sum';
        const aggLabel = AGGREGATION_FUNCTIONS.find(f => f.value === aggFunc)?.label || 'Sum';
        const color = EXCEL_COLORS[index % EXCEL_COLORS.length];
        
        return {
          name: `${aggLabel} of ${fieldHeader}`,
          type: 'line',
          data: chartData.map(row => (row as any)[field] || 0),
          areaStyle: {
            opacity: 0.6
          },
          lineStyle: {
            color: color,
            width: 2
          },
          itemStyle: {
            color: color
          },
          symbol: 'circle',
          symbolSize: 4,
          smooth: true,
          stack: 'total'
        };
      });
      
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: {
            rotate: isAxisDate ? 45 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series
      };
    }

    // Scatter Chart Implementation
    if (chartType === 'scatter') {
      if (selectedFields.values.length !== 2) {
        return null; // Scatter charts require exactly 2 value fields
      }

      const scatterData = chartData.map(row => [
        Number((row as any)[selectedFields.values[0]]) || 0,
        Number((row as any)[selectedFields.values[1]]) || 0
      ]);
      
      const xFieldHeader = columnAnalysis.all.find(col => col.key === selectedFields.values[0])?.header || selectedFields.values[0];
      const yFieldHeader = columnAnalysis.all.find(col => col.key === selectedFields.values[1])?.header || selectedFields.values[1];
      
      return {
        ...baseOption,
        xAxis: {
          type: 'value',
          name: xFieldHeader,
          nameLocation: 'middle',
          nameGap: 30
        },
        yAxis: {
          type: 'value',
          name: yFieldHeader,
          nameLocation: 'middle',
          nameGap: 40
        },
        series: [{
          name: 'Data Points',
          type: 'scatter',
          data: scatterData,
          itemStyle: {
            color: EXCEL_COLORS[0]
          },
          symbolSize: 8
        }]
      };
    }

    return baseOption;
  };

  // Chart rendering
  const renderChart = () => {
    if (selectedFields.values.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Create a Chart</h3>
          <p className="text-sm text-muted-foreground">
            Drag fields to the areas below to create your chart
          </p>
        </div>
      );
    }

    if (processedData.length === 0) {
      return (
        <ToastBanner type="info" message="No data available for the selected fields and filters." />
      );
    }

    const option = getEChartsOption();
    
    if (!option) {
      return (
        <ToastBanner type="warning" message="Unable to generate chart configuration. Please check your field selections." />
      );
    }

    return (
      <div style={{ width: '100%', height: '400px' }}>
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Data Visualization
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[80vh]">
          {/* Left Panel - Chart Types and Options */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Chart Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CHART_TYPES.map(type => (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setChartType(type.value)}
                  >
                    {type.icon}
                    <span className="ml-2">{type.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Field Areas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Chart Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Filters */}
                <div 
                  className={`p-2 border-2 border-dashed rounded-md min-h-[40px] ${
                    dragOverArea === 'filters' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'filters')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'filters')}
                >
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Filter className="h-3 w-3" />
                    Filters
                  </div>
                  <div className="space-y-1">
                    {selectedFields.filters.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Drop fields here</div>
                    ) : (
                      selectedFields.filters.map(field => (
                        <Badge
                          key={field}
                          variant="secondary"
                          className="text-xs"
                        >
                          {columnAnalysis.all.find(col => col.key === field)?.header || field}
                          <button
                            onClick={() => removeFieldFromArea(field, 'filters')}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Axis */}
                <div 
                  className={`p-2 border-2 border-dashed rounded-md min-h-[40px] ${
                    dragOverArea === 'axis' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'axis')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'axis')}
                >
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Type className="h-3 w-3" />
                    Axis (Categories)
                  </div>
                  <div className="space-y-1">
                    {selectedFields.axis.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Drop fields here</div>
                    ) : (
                      selectedFields.axis.map(field => (
                        <Badge
                          key={field}
                          variant="secondary"
                          className="text-xs"
                        >
                          {columnAnalysis.all.find(col => col.key === field)?.header || field}
                          <button
                            onClick={() => removeFieldFromArea(field, 'axis')}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Values */}
                <div 
                  className={`p-2 border-2 border-dashed rounded-md min-h-[40px] ${
                    dragOverArea === 'values' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'values')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'values')}
                >
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Hash className="h-3 w-3" />
                    Values
                  </div>
                  <div className="space-y-1">
                    {selectedFields.values.length === 0 ? (
                      <div className="text-xs text-muted-foreground">Drop numeric fields here</div>
                    ) : (
                      selectedFields.values.map(field => (
                        <div key={field} className="space-y-1">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {columnAnalysis.all.find(col => col.key === field)?.header || field}
                            <button
                              onClick={() => removeFieldFromArea(field, 'values')}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                          <Select
                            value={aggregationFunctions[field] || 'sum'}
                            onValueChange={(value) => handleAggregationChange(field, value)}
                          >
                            <SelectTrigger className="h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGGREGATION_FUNCTIONS.map(func => (
                                <SelectItem key={func.value} value={func.value} className="text-xs">
                                  {func.icon} {func.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Fields */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Available Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    <Collapsible 
                      open={expandedSections.numeric} 
                      onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, numeric: open }))}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium">
                        <span>Numeric ({columnAnalysis.numeric.length})</span>
                        {expandedSections.numeric ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {columnAnalysis.numeric.map(col => (
                          <div
                            key={col.key}
                            className="flex items-center gap-2 p-1 text-xs bg-muted rounded cursor-move hover:bg-muted/80"
                            draggable
                            onDragStart={(e) => handleDragStart(e, col.key)}
                            onDragEnd={handleDragEnd}
                            onClick={() => addFieldToArea(col.key, 'values')}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <Hash className="h-3 w-3 text-blue-500" />
                            <span className="truncate">{col.header}</span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible 
                      open={expandedSections.date} 
                      onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, date: open }))}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium">
                        <span>Date ({columnAnalysis.date.length})</span>
                        {expandedSections.date ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {columnAnalysis.date.map(col => (
                          <div
                            key={col.key}
                            className="flex items-center gap-2 p-1 text-xs bg-muted rounded cursor-move hover:bg-muted/80"
                            draggable
                            onDragStart={(e) => handleDragStart(e, col.key)}
                            onDragEnd={handleDragEnd}
                            onClick={() => addFieldToArea(col.key, 'axis')}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <Calendar className="h-3 w-3 text-green-500" />
                            <span className="truncate">{col.header}</span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    <Collapsible 
                      open={expandedSections.text} 
                      onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, text: open }))}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium">
                        <span>Text ({columnAnalysis.text.length})</span>
                        {expandedSections.text ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {columnAnalysis.text.map(col => (
                          <div
                            key={col.key}
                            className="flex items-center gap-2 p-1 text-xs bg-muted rounded cursor-move hover:bg-muted/80"
                            draggable
                            onDragStart={(e) => handleDragStart(e, col.key)}
                            onDragEnd={handleDragEnd}
                            onClick={() => addFieldToArea(col.key, 'axis')}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                            <Type className="h-3 w-3 text-purple-500" />
                            <span className="truncate">{col.header}</span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chart Display */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Chart Options</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetChart}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="chart-title" className="text-xs">Chart Title</Label>
                  <Input
                    id="chart-title"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Enter chart title"
                    className="h-8 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {chartTitle || 'Chart Preview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && <ToastBanner type="error" message={error} onClose={() => setError(null)} />}
                {renderChart()}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 