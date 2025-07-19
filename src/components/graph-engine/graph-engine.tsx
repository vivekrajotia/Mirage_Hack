'use client';

import React, { useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import ToastBanner from '../toast-banner';
import { AlertCircle } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ChartType = 
  | 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'radar' | 'gauge' 
  | 'funnel' | 'treemap' | 'sunburst' | 'sankey' | 'graph' | 'heatmap'
  | 'candlestick' | 'boxplot' | 'parallel' | 'themeRiver' | 'calendar'
  | 'pictorialBar' | 'custom';

export type DataTransformType = 
  | 'filter' | 'sort' | 'aggregate' | 'regression' | 'histogram';

export interface SeriesConfig {
  name?: string;
  type: ChartType;
  data: any[];
  stack?: string;
  smooth?: boolean;
  symbol?: string;
  symbolSize?: number | number[];
  color?: string | string[];
  itemStyle?: any;
  lineStyle?: any;
  areaStyle?: any;
  label?: any;
  emphasis?: any;
  markPoint?: any;
  markLine?: any;
  markArea?: any;
  encode?: any;
  dimensions?: string[];
  [key: string]: any;
}

export interface AxisConfig {
  type?: 'value' | 'category' | 'time' | 'log';
  name?: string;
  nameLocation?: 'start' | 'middle' | 'center' | 'end';
  nameGap?: number;
  nameRotate?: number;
  inverse?: boolean;
  boundaryGap?: boolean | [string, string];
  min?: number | string | Function;
  max?: number | string | Function;
  scale?: boolean;
  splitNumber?: number;
  minInterval?: number;
  maxInterval?: number;
  interval?: number;
  logBase?: number;
  data?: any[];
  axisLabel?: any;
  axisTick?: any;
  axisLine?: any;
  splitLine?: any;
  splitArea?: any;
  [key: string]: any;
}

export interface LegendConfig {
  show?: boolean;
  type?: 'plain' | 'scroll';
  orient?: 'horizontal' | 'vertical';
  align?: 'auto' | 'left' | 'right';
  left?: string | number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  width?: string | number;
  height?: string | number;
  itemWidth?: number;
  itemHeight?: number;
  itemGap?: number;
  icon?: string;
  data?: any[];
  selected?: { [key: string]: boolean };
  textStyle?: any;
  tooltip?: any;
  [key: string]: any;
}

export interface TooltipConfig {
  show?: boolean;
  trigger?: 'item' | 'axis' | 'none';
  axisPointer?: any;
  showContent?: boolean;
  alwaysShowContent?: boolean;
  triggerOn?: 'mousemove' | 'click' | 'mousemove|click' | 'none';
  showDelay?: number;
  hideDelay?: number;
  enterable?: boolean;
  renderMode?: 'html' | 'richText';
  confine?: boolean;
  appendToBody?: boolean;
  className?: string;
  transitionDuration?: number;
  position?: string | number[] | Function;
  formatter?: string | Function;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number | number[];
  textStyle?: any;
  extraCssText?: string;
  [key: string]: any;
}

export interface GridConfig {
  show?: boolean;
  left?: string | number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  width?: string | number;
  height?: string | number;
  containLabel?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  [key: string]: any;
}

export interface DataTransform {
  type: DataTransformType;
  config?: any;
}

export interface DatasetConfig {
  id?: string;
  source?: any[] | any;
  dimensions?: any[];
  sourceHeader?: boolean;
  transform?: DataTransform | DataTransform[];
  fromDatasetId?: string;
  fromDatasetIndex?: number;
  fromTransformResult?: number;
}

export interface GraphEngineConfig {
  // Chart basic configuration
  title?: {
    text?: string;
    subtext?: string;
    left?: string | number;
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    textAlign?: 'auto' | 'left' | 'right' | 'center';
    textVerticalAlign?: 'auto' | 'top' | 'bottom' | 'middle';
    textStyle?: any;
    subtextStyle?: any;
    [key: string]: any;
  };

  // Data configuration
  dataset?: DatasetConfig | DatasetConfig[];
  
  // Series configuration
  series: SeriesConfig[];
  
  // Axis configuration
  xAxis?: AxisConfig | AxisConfig[];
  yAxis?: AxisConfig | AxisConfig[];
  radiusAxis?: AxisConfig | AxisConfig[];
  angleAxis?: AxisConfig | AxisConfig[];
  
  // Components
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  grid?: GridConfig | GridConfig[];
  polar?: any;
  radar?: any;
  dataZoom?: any;
  visualMap?: any;
  toolbox?: any;
  brush?: any;
  geo?: any;
  parallel?: any;
  parallelAxis?: any;
  singleAxis?: any;
  timeline?: any;
  graphic?: any;
  calendar?: any;
  
  // Global configuration
  backgroundColor?: string;
  color?: string[];
  textStyle?: any;
  animation?: boolean;
  animationThreshold?: number;
  animationDuration?: number | Function;
  animationEasing?: string | Function;
  animationDelay?: number | Function;
  animationDurationUpdate?: number | Function;
  animationEasingUpdate?: string | Function;
  animationDelayUpdate?: number | Function;
  
  // Responsive and performance
  responsive?: boolean;
  width?: string | number;
  height?: string | number;
  devicePixelRatio?: number;
  renderer?: 'canvas' | 'svg';
  ssr?: boolean;
  
  // Custom properties
  [key: string]: any;
}

export interface GraphEngineProps {
  config: GraphEngineConfig;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  error?: string | null;
  onChartReady?: (chartInstance: any) => void;
  onEvents?: { [eventName: string]: Function };
  opts?: {
    renderer?: 'canvas' | 'svg';
    useDirtyRect?: boolean;
    useCoarsePointer?: boolean;
    pointerSize?: number;
    ssr?: boolean;
    width?: number;
    height?: number;
    locale?: string;
  };
}

// =============================================================================
// CONSTANTS AND UTILITIES
// =============================================================================

export const DEFAULT_COLORS = [
  '#5B9BD5', '#70AD47', '#FFC000', '#FF6B6B', '#9966CC',
  '#4ECDC4', '#FF8C42', '#A8E6CF', '#FFB3BA', '#BFBFBF',
  '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FF6B9D', '#36D7B7', '#FDA7DF', '#4ECDC4', '#45B7D1'
];

export const CHART_TYPE_CONFIGS = {
  line: {
    defaultProps: {
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2 }
    },
    requiredAxis: { xAxis: 'category', yAxis: 'value' }
  },
  bar: {
    defaultProps: {
      barWidth: 'auto',
      barMaxWidth: null,
      barMinWidth: 1
    },
    requiredAxis: { xAxis: 'category', yAxis: 'value' }
  },
  pie: {
    defaultProps: {
      radius: ['0%', '70%'],
      center: ['50%', '50%'],
      roseType: false
    },
    requiredAxis: {}
  },
  scatter: {
    defaultProps: {
      symbol: 'circle',
      symbolSize: 8
    },
    requiredAxis: { xAxis: 'value', yAxis: 'value' }
  },
  area: {
    defaultProps: {
      smooth: true,
      areaStyle: { opacity: 0.6 }
    },
    requiredAxis: { xAxis: 'category', yAxis: 'value' }
  },
  radar: {
    defaultProps: {
      symbol: 'circle',
      symbolSize: 4
    },
    requiredAxis: {}
  },
  gauge: {
    defaultProps: {
      min: 0,
      max: 100,
      center: ['50%', '50%'],
      radius: '75%'
    },
    requiredAxis: {}
  },
  funnel: {
    defaultProps: {
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
      gap: 2
    },
    requiredAxis: {}
  },
  treemap: {
    defaultProps: {
      left: 'center',
      top: 'middle',
      width: '80%',
      height: '80%'
    },
    requiredAxis: {}
  },
  sunburst: {
    defaultProps: {
      center: ['50%', '50%'],
      radius: [0, '90%']
    },
    requiredAxis: {}
  },
  sankey: {
    defaultProps: {
      layout: 'none',
      layoutIterations: 32,
      orient: 'horizontal',
      draggable: true
    },
    requiredAxis: {}
  },
  heatmap: {
    defaultProps: {
      label: { show: true }
    },
    requiredAxis: { xAxis: 'category', yAxis: 'category' }
  },
  candlestick: {
    defaultProps: {
      barWidth: 'auto'
    },
    requiredAxis: { xAxis: 'category', yAxis: 'value' }
  },
  boxplot: {
    defaultProps: {},
    requiredAxis: { xAxis: 'category', yAxis: 'value' }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const validateChartConfig = (config: GraphEngineConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.series || config.series.length === 0) {
    errors.push('At least one series must be provided');
  }
  
  config.series.forEach((series, index) => {
    if (!series.type) {
      errors.push(`Series ${index}: type is required`);
    }
    
    if (!series.data || !Array.isArray(series.data)) {
      errors.push(`Series ${index}: data must be an array`);
    }
    
    // Validate chart-specific requirements
    const chartConfig = CHART_TYPE_CONFIGS[series.type as keyof typeof CHART_TYPE_CONFIGS];
    if (chartConfig?.requiredAxis) {
      if (chartConfig.requiredAxis.xAxis && !config.xAxis) {
        errors.push(`Series ${index}: ${series.type} chart requires xAxis configuration`);
      }
      if (chartConfig.requiredAxis.yAxis && !config.yAxis) {
        errors.push(`Series ${index}: ${series.type} chart requires yAxis configuration`);
      }
    }
  });
  
  return errors;
};

const applyDefaultColors = (config: GraphEngineConfig): GraphEngineConfig => {
  const newConfig = { ...config };
  
  if (!newConfig.color) {
    newConfig.color = DEFAULT_COLORS;
  }
  
  // Apply colors to series if not specified
  newConfig.series = newConfig.series.map((series, index) => ({
    ...series,
    color: series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));
  
  return newConfig;
};

const applyChartTypeDefaults = (config: GraphEngineConfig): GraphEngineConfig => {
  const newConfig = { ...config };
  
  newConfig.series = newConfig.series.map(series => {
    const chartConfig = CHART_TYPE_CONFIGS[series.type as keyof typeof CHART_TYPE_CONFIGS];
    if (chartConfig?.defaultProps) {
      return { ...chartConfig.defaultProps, ...series };
    }
    return series;
  });
  
  return newConfig;
};

const generateEChartsOption = (config: GraphEngineConfig) => {
  let processedConfig = applyDefaultColors(config);
  processedConfig = applyChartTypeDefaults(processedConfig);
  
  const option: any = {
    backgroundColor: processedConfig.backgroundColor || '#ffffff',
    color: processedConfig.color,
    textStyle: processedConfig.textStyle || { fontFamily: 'inherit' },
    animation: processedConfig.animation !== false,
    animationDuration: processedConfig.animationDuration || 1000,
    animationEasing: processedConfig.animationEasing || 'cubicOut',
  };
  
  // Add title if provided
  if (processedConfig.title) {
    option.title = processedConfig.title;
  }
  
  // Add dataset if provided
  if (processedConfig.dataset) {
    option.dataset = processedConfig.dataset;
  }
  
  // Add axes
  if (processedConfig.xAxis) {
    option.xAxis = processedConfig.xAxis;
  }
  if (processedConfig.yAxis) {
    option.yAxis = processedConfig.yAxis;
  }
  if (processedConfig.radiusAxis) {
    option.radiusAxis = processedConfig.radiusAxis;
  }
  if (processedConfig.angleAxis) {
    option.angleAxis = processedConfig.angleAxis;
  }
  
  // Add components
  if (processedConfig.legend) {
    option.legend = {
      type: 'scroll',
      orient: 'horizontal',
      top: 10,
      textStyle: { fontSize: 12, color: '#64748b' },
      ...processedConfig.legend
    };
  }
  
  if (processedConfig.tooltip) {
    option.tooltip = {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1e293b', fontSize: 12 },
      ...processedConfig.tooltip
    };
  }
  
  if (processedConfig.grid) {
    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
      ...processedConfig.grid
    };
  }
  
  // Add other components
  ['polar', 'radar', 'dataZoom', 'visualMap', 'toolbox', 'brush', 
   'geo', 'parallel', 'parallelAxis', 'singleAxis', 'timeline', 
   'graphic', 'calendar'].forEach(component => {
    if (processedConfig[component]) {
      option[component] = processedConfig[component];
    }
  });
  
  // Add series
  option.series = processedConfig.series;
  
  return option;
};

// =============================================================================
// GRAPH ENGINE COMPONENT
// =============================================================================

export const GraphEngine: React.FC<GraphEngineProps> = ({
  config,
  className = '',
  style = {},
  loading = false,
  error = null,
  onChartReady,
  onEvents = {},
  opts = {}
}) => {
  // Validate configuration
  const validationErrors = useMemo(() => validateChartConfig(config), [config]);
  
  // Generate ECharts option
  const echartsOption = useMemo(() => {
    if (validationErrors.length > 0) return null;
    
    try {
      return generateEChartsOption(config);
    } catch (err) {
      console.error('Error generating ECharts option:', err);
      return null;
    }
  }, [config, validationErrors]);
  
  // Chart ready handler
  const handleChartReady = useCallback((chartInstance: any) => {
    if (onChartReady) {
      onChartReady(chartInstance);
    }
  }, [onChartReady]);
  
  // Default chart options
  const defaultOpts = {
    renderer: 'canvas' as const,
    useDirtyRect: true,
    ...opts
  };
  
  // Default style
  const defaultStyle = {
    width: config.width || '100%',
    height: config.height || '400px',
    ...style
  };
  
  // Show loading state
  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={defaultStyle}
      >
        <div className="text-gray-500">Loading chart...</div>
      </div>
    );
  }
  
  // Show error state
  if (error || validationErrors.length > 0) {
    const errorMessage = error || validationErrors.join(', ');
    return (
      <div className={`p-4 ${className}`} style={defaultStyle}>
        <ToastBanner type="error" message={errorMessage} onClose={() => {}} />
      </div>
    );
  }
  
  // Show empty state
  if (!echartsOption) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 ${className}`}
        style={defaultStyle}
      >
        <div className="text-gray-500">No chart data available</div>
      </div>
    );
  }
  
  return (
    <div className={className} style={defaultStyle}>
      <ReactECharts
        option={echartsOption}
        style={{ height: '100%', width: '100%' }}
        opts={defaultOpts}
        onChartReady={handleChartReady}
        onEvents={onEvents}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

// =============================================================================
// HELPER FUNCTIONS FOR COMMON CHART CONFIGURATIONS
// =============================================================================

export const createLineChartConfig = (
  data: any[], 
  xField: string, 
  yFields: string[], 
  options: Partial<GraphEngineConfig> = {}
): GraphEngineConfig => ({
  xAxis: { type: 'category', data: data.map(item => item[xField]) },
  yAxis: { type: 'value' },
  series: yFields.map((field, index) => ({
    name: field,
    type: 'line',
    data: data.map(item => item[field]),
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  })),
  tooltip: { trigger: 'axis' },
  legend: { show: yFields.length > 1 },
  ...options
});

export const createBarChartConfig = (
  data: any[], 
  xField: string, 
  yFields: string[], 
  options: Partial<GraphEngineConfig> = {}
): GraphEngineConfig => ({
  xAxis: { type: 'category', data: data.map(item => item[xField]) },
  yAxis: { type: 'value' },
  series: yFields.map((field, index) => ({
    name: field,
    type: 'bar',
    data: data.map(item => item[field]),
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  })),
  tooltip: { trigger: 'axis' },
  legend: { show: yFields.length > 1 },
  ...options
});

export const createPieChartConfig = (
  data: any[], 
  nameField: string, 
  valueField: string, 
  options: Partial<GraphEngineConfig> = {}
): GraphEngineConfig => ({
  series: [{
    name: valueField,
    type: 'pie',
    data: data.map((item, index) => ({
      name: item[nameField],
      value: item[valueField],
      itemStyle: { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length] }
    }))
  }],
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { orient: 'vertical', left: 'left' },
  ...options
});

export const createScatterChartConfig = (
  data: any[], 
  xField: string, 
  yField: string, 
  options: Partial<GraphEngineConfig> = {}
): GraphEngineConfig => ({
  xAxis: { type: 'value', name: xField },
  yAxis: { type: 'value', name: yField },
  series: [{
    name: 'Data Points',
    type: 'scatter',
    data: data.map(item => [item[xField], item[yField]]),
    symbolSize: 8
  }],
  tooltip: { trigger: 'item' },
  ...options
});

export default GraphEngine; 