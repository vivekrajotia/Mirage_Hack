'use client';

import React, { useState } from 'react';
import {
  GraphEngine,
  createLineChartConfig,
  createBarChartConfig,
  createPieChartConfig,
  createScatterChartConfig,
  ChartType,
  AxisConfig,
  GraphEngineConfig,
} from './graph-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import eodData from '@/app/xceler_eodservice_publisheddata (1).json';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';

// Sample data for examples
const sampleLineData = [
  { month: 'Jan', sales: 120, profit: 30, expenses: 90 },
  { month: 'Feb', sales: 150, profit: 45, expenses: 105 },
  { month: 'Mar', sales: 180, profit: 55, expenses: 125 },
  { month: 'Apr', sales: 200, profit: 70, expenses: 130 },
  { month: 'May', sales: 220, profit: 85, expenses: 135 },
  { month: 'Jun', sales: 250, profit: 100, expenses: 150 }
];

const samplePieData = [
  { category: 'Desktop', value: 1048 },
  { category: 'Mobile', value: 735 },
  { category: 'Tablet', value: 580 },
  { category: 'Smart TV', value: 484 },
  { category: 'Others', value: 300 }
];

const sampleScatterData = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 20 + 5
}));

// This is a simplified data processing pipeline for the preview.
export const processPreviewData = (config: any) => {
  if (!config) return null;

  // 1. Apply filters
  const filteredData = eodData.filter(row => {
    if (!config.filters || config.filters.length === 0) {
      return true;
    }
    return config.filters.every((filter: any) => {
      if (!filter.field || !filter.condition) return true;
      const rowValue = (row as any)[filter.field];
      const filterValue = filter.value;
      if (rowValue === null || rowValue === undefined) return false;

      switch (filter.condition) {
        case 'equals': return String(rowValue).toLowerCase() === String(filterValue).toLowerCase();
        case 'does not equal': return String(rowValue).toLowerCase() !== String(filterValue).toLowerCase();
        case 'contains': return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'does not contain': return !String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'is greater than': return Number(rowValue) > Number(filterValue);
        case 'is less than': return Number(rowValue) < Number(filterValue);
        default: return true;
      }
    });
  });

  const {
    type,
    xAxis,
    yAxis,
    aggregation,
    valueField,
    title,
    colorBy,
    selectedColumns,
  } = config;

  if (type === 'Data Table') {
    const data = filteredData.length > 0 ? filteredData : eodData;
    const columns: ColumnDef<any>[] = selectedColumns.map((key: string) => ({
      accessorKey: key,
      header: key,
    }));
    return {
      renderType: 'table',
      data,
      columns,
      title,
    };
  }

  // 2. Aggregate and format data for charts
  if (type === 'Bar Chart' || type === 'Line Chart') {
    const groupField = xAxis;
    const metricField = yAxis;
    const seriesField = colorBy;

    const groups = filteredData.reduce((acc, row) => {
      const xKey = (row as any)[groupField];
      const seriesKey = seriesField ? (row as any)[seriesField] : 'value';
      const value = Number((row as any)[metricField]);

      if (xKey !== undefined && !isNaN(value)) {
        if (!acc[xKey]) acc[xKey] = {};
        if (!acc[xKey][seriesKey]) acc[xKey][seriesKey] = [];
        acc[xKey][seriesKey].push(value);
      }
      return acc;
    }, {} as Record<string, Record<string, number[]>>);

    const categories = Object.keys(groups);
    const seriesNames = Object.keys(Object.values(groups)[0] || {});

    const seriesData = seriesNames.map(seriesName => {
      return {
        name: seriesName,
        type: (type === 'Bar Chart' ? 'bar' : 'line') as ChartType,
        stack: seriesField ? 'total' : undefined, // Stack if colorBy is used
        data: categories.map(cat => {
          const seriesValues = groups[cat][seriesName] || [];
          let result = 0;
          switch (aggregation) {
            case 'sum': result = seriesValues.reduce((a, b) => a + b, 0); break;
            case 'average': result = seriesValues.length > 0 ? seriesValues.reduce((a, b) => a + b, 0) / seriesValues.length : 0; break;
            case 'count': result = seriesValues.length; break;
            case 'min': result = seriesValues.length > 0 ? Math.min(...seriesValues) : 0; break;
            case 'max': result = seriesValues.length > 0 ? Math.max(...seriesValues) : 0; break;
            default: result = 0;
          }
          return result;
        })
      };
    });

    const chartConfig = {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0 },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value' },
      series: seriesData,
    } as GraphEngineConfig;
    return {
      renderType: 'chart',
      config: chartConfig,
      title,
    };
  }
  if (type === 'Pie Chart') {
    const groupField = colorBy || xAxis;
    const metricField = valueField;

    const groups = filteredData.reduce((acc, row) => {
      const key = (row as any)[groupField];
      const value = Number((row as any)[metricField]);
      if (key !== undefined && !isNaN(value)) {
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(value);
      }
      return acc;
    }, {} as Record<string, number[]>);

    const aggregatedData = Object.entries(groups).map(([key, values]) => {
      let result = 0;
      switch (aggregation) {
        case 'sum': result = values.reduce((a, b) => a + b, 0); break;
        case 'average': result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
        case 'count': result = values.length; break;
        case 'min': result = values.length > 0 ? Math.min(...values) : 0; break;
        case 'max': result = values.length > 0 ? Math.max(...values) : 0; break;
        default: result = 0;
      }
      return { name: key, value: result };
    });

    const chartConfig = createPieChartConfig(aggregatedData, 'name', 'value', {
      title: { text: title, left: 'center' },
    });
    return {
      renderType: 'chart',
      config: chartConfig,
      title,
    };
  }

  if (type === 'Scatter Chart') {
    const chartConfig = createScatterChartConfig(filteredData, xAxis, yAxis, {
      title: { text: title, left: 'center' },
    });
    return {
      renderType: 'chart',
      config: chartConfig,
      title,
    };
  }

  return null;
};

export const GraphEngineExamples: React.FC<{ previewConfig?: any }> = ({
  previewConfig,
}) => {
  const [selectedExample, setSelectedExample] = useState<string>('line');

  if (previewConfig) {
    const previewData = processPreviewData(previewConfig);

    if (!previewData) {
      return (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Could not generate a preview for the selected configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>{previewData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {previewData.renderType === 'chart' && previewData.config && (
              <GraphEngine config={previewData.config} />
            )}
            {previewData.renderType === 'table' &&
              previewData.data &&
              previewData.columns && (
                <DataTable
                  columns={previewData.columns}
                  data={previewData.data}
                />
              )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Line Chart Example
  const lineChartConfig: GraphEngineConfig = createLineChartConfig(
    sampleLineData,
    'month',
    ['sales', 'profit', 'expenses'],
    {
      title: {
        text: 'Monthly Performance',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let tooltip = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((param: any) => {
            tooltip += `${param.seriesName}: ${param.value}<br/>`;
          });
          return tooltip;
        }
      }
    }
  );

  // Advanced Line Chart with Multiple Y-Axes
  const dualAxisLineConfig: GraphEngineConfig = {
    title: { text: 'Revenue vs Temperature', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: [
      {
        type: 'value',
        name: 'Revenue',
        position: 'left',
        axisLabel: { formatter: '${value}K' }
      },
      {
        type: 'value',
        name: 'Temperature',
        position: 'right',
        axisLabel: { formatter: '{value} °C' }
      }
    ],
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        data: [120, 132, 101, 134, 90, 230, 210],
        yAxisIndex: 0
      },
      {
        name: 'Temperature',
        type: 'line',
        data: [20, 18, 22, 25, 28, 26, 24],
        yAxisIndex: 1,
        smooth: true
      }
    ]
  };

  // Stacked Bar Chart
  const stackedBarConfig: GraphEngineConfig = {
    title: { text: 'Stacked Bar Chart', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    xAxis: {
      type: 'value',
      boundaryGap: ['0', '0.01']
    },
    yAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    series: [
      {
        name: 'Product A',
        type: 'bar',
        stack: 'total',
        data: [320, 302, 301, 334]
      },
      {
        name: 'Product B',
        type: 'bar',
        stack: 'total',
        data: [120, 132, 101, 134]
      },
      {
        name: 'Product C',
        type: 'bar',
        stack: 'total',
        data: [220, 182, 191, 234]
      }
    ]
  };

  // Pie Chart Example
  const pieChartConfig: GraphEngineConfig = createPieChartConfig(
    samplePieData,
    'category',
    'value',
    {
      title: {
        text: 'Device Usage Distribution',
        left: 'center'
      }
    }
  );

  // Donut Chart Example
  const donutChartConfig: GraphEngineConfig = {
    title: { text: 'Donut Chart', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: samplePieData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  // Scatter Chart Example
  const scatterChartConfig: GraphEngineConfig = createScatterChartConfig(
    sampleScatterData,
    'x',
    'y',
    {
      title: {
        text: 'Scatter Plot Example',
        left: 'center'
      }
    }
  );

  // Area Chart Example
  const areaChartConfig: GraphEngineConfig = {
    title: { text: 'Area Chart', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: { bottom: 0 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Email',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: 'Union Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: 'Video Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [150, 232, 201, 154, 190, 330, 410]
      }
    ]
  };

  // Radar Chart Example
  const radarChartConfig: GraphEngineConfig = {
    title: { text: 'Radar Chart', left: 'center' },
    tooltip: {},
    legend: { bottom: 0 },
    radar: {
      indicator: [
        { name: 'Sales', max: 6500 },
        { name: 'Administration', max: 16000 },
        { name: 'Information Technology', max: 30000 },
        { name: 'Customer Support', max: 38000 },
        { name: 'Development', max: 52000 },
        { name: 'Marketing', max: 25000 }
      ]
    },
    series: [{
      name: 'Budget vs spending',
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: 'Allocated Budget'
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: 'Actual Spending'
        }
      ]
    }]
  };

  // Gauge Chart Example
  const gaugeChartConfig: GraphEngineConfig = {
    title: { text: 'Gauge Chart', left: 'center' },
    series: [{
      name: 'Pressure',
      type: 'gauge',
      progress: { show: true, width: 18 },
      axisLine: { lineStyle: { width: 18 } },
      axisTick: { show: false },
      splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
      axisLabel: { distance: 25, color: '#999', fontSize: 20 },
      anchor: { show: true, showAbove: true, size: 25, itemStyle: { borderWidth: 10 } },
      title: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value} km/h',
        color: 'auto'
      },
      data: [{ value: 70, name: 'SCORE' }]
    }]
  };

  // Heatmap Example
  const heatmapChartConfig: GraphEngineConfig = {
    title: { text: 'Heatmap Chart', left: 'center' },
    tooltip: { position: 'top' },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a']
    },
    yAxis: {
      type: 'category',
      data: ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday']
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: 'Punch Card',
      type: 'heatmap',
      data: [
        [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0],
        [1, 0, 1], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0],
        [2, 0, 7], [2, 1, 0], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0],
        [3, 0, 3], [3, 1, 0], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0],
        [4, 0, 1], [4, 1, 0], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 0],
        [5, 0, 3], [5, 1, 0], [5, 2, 0], [5, 3, 0], [5, 4, 0], [5, 5, 0],
        [6, 0, 4], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0]
      ],
      label: { show: true },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  // Funnel Chart Example
  const funnelChartConfig: GraphEngineConfig = {
    title: { text: 'Funnel Chart', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}%' },
    series: [{
      name: 'Funnel',
      type: 'funnel',
      left: '10%',
      top: 60,
      right: '10%',
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside'
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: 60, name: 'Visit' },
        { value: 40, name: 'Inquiry' },
        { value: 20, name: 'Order' },
        { value: 80, name: 'Click' },
        { value: 100, name: 'Show' }
      ]
    }]
  };

  const examples = {
    line: { config: lineChartConfig, title: 'Line Chart' },
    dualAxis: { config: dualAxisLineConfig, title: 'Dual Axis Chart' },
    stackedBar: { config: stackedBarConfig, title: 'Stacked Bar Chart' },
    pie: { config: pieChartConfig, title: 'Pie Chart' },
    donut: { config: donutChartConfig, title: 'Donut Chart' },
    scatter: { config: scatterChartConfig, title: 'Scatter Plot' },
    area: { config: areaChartConfig, title: 'Area Chart' },
    radar: { config: radarChartConfig, title: 'Radar Chart' },
    gauge: { config: gaugeChartConfig, title: 'Gauge Chart' },
    heatmap: { config: heatmapChartConfig, title: 'Heatmap Chart' },
    funnel: { config: funnelChartConfig, title: 'Funnel Chart' }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Graph Engine Examples</h1>
        <Select value={selectedExample} onValueChange={setSelectedExample}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(examples).map(([key, example]) => (
              <SelectItem key={key} value={key}>
                {example.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{examples[selectedExample as keyof typeof examples].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <GraphEngine
            config={examples[selectedExample as keyof typeof examples].config}
            style={{ height: '500px' }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <code>
              {JSON.stringify(examples[selectedExample as keyof typeof examples].config, null, 2)}
            </code>
          </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(examples).map(([key, example]) => (
          <Card key={key} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedExample(key)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{example.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <GraphEngine
                config={example.config}
                style={{ height: '200px' }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GraphEngineExamples; 