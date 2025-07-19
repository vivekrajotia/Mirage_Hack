# GraphEngine Component Documentation

## Overview

The `GraphEngine` is a comprehensive React component that provides a unified interface for generating all types of charts using Apache ECharts. It accepts JSON configuration to create interactive, customizable charts with minimal code.

## Features

### Supported Chart Types

- **Line Charts**: Basic, smooth, stepped, dashed, with markers
- **Bar/Column Charts**: Clustered, stacked, 100% stacked, horizontal
- **Pie Charts**: Basic pie, donut, rose charts
- **Scatter Plots**: Basic scatter, bubble charts
- **Area Charts**: Basic area, stacked area
- **Radar Charts**: Multi-dimensional data visualization
- **Gauge Charts**: Progress indicators, speedometers
- **Funnel Charts**: Conversion funnels
- **Heatmaps**: Data correlation matrices
- **Treemap**: Hierarchical data visualization
- **Sunburst**: Nested hierarchical data
- **Sankey**: Flow diagrams
- **Candlestick**: Financial data
- **Box Plot**: Statistical distribution
- **Calendar**: Time-series heatmaps
- **Graph**: Network diagrams

## Installation

```bash
npm install echarts echarts-for-react
```

## Basic Usage

```tsx
import { GraphEngine, GraphEngineConfig } from '@/components/graph-engine';

const chartConfig: GraphEngineConfig = {
  title: { text: 'My Chart' },
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{
    name: 'Data',
    type: 'bar',
    data: [10, 20, 30]
  }]
};

function MyChart() {
  return <GraphEngine config={chartConfig} />;
}
```

## Configuration Schema

### GraphEngineConfig Interface

```typescript
interface GraphEngineConfig {
  // Chart metadata
  title?: TitleConfig;
  
  // Data configuration
  dataset?: DatasetConfig | DatasetConfig[];
  
  // Chart series
  series: SeriesConfig[];
  
  // Axes configuration
  xAxis?: AxisConfig | AxisConfig[];
  yAxis?: AxisConfig | AxisConfig[];
  radiusAxis?: AxisConfig | AxisConfig[];
  angleAxis?: AxisConfig | AxisConfig[];
  
  // Interactive components
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  grid?: GridConfig | GridConfig[];
  
  // Specialized components
  polar?: any;
  radar?: any;
  dataZoom?: any;
  visualMap?: any;
  toolbox?: any;
  brush?: any;
  geo?: any;
  
  // Global styling
  backgroundColor?: string;
  color?: string[];
  textStyle?: any;
  
  // Animation
  animation?: boolean;
  animationDuration?: number;
  animationEasing?: string;
  
  // Performance
  responsive?: boolean;
  width?: string | number;
  height?: string | number;
  renderer?: 'canvas' | 'svg';
}
```

## Chart Type Examples

### 1. Line Chart

```typescript
const lineConfig: GraphEngineConfig = {
  title: { text: 'Sales Trend' },
  xAxis: { 
    type: 'category', 
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] 
  },
  yAxis: { type: 'value' },
  series: [{
    name: 'Sales',
    type: 'line',
    data: [120, 200, 150, 80, 70],
    smooth: true,
    itemStyle: { color: '#1f77b4' }
  }],
  tooltip: { trigger: 'axis' }
};
```

### 2. Stacked Bar Chart

```typescript
const stackedBarConfig: GraphEngineConfig = {
  title: { text: 'Product Sales by Quarter' },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: {},
  xAxis: { type: 'value' },
  yAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
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
    }
  ]
};
```

### 3. Pie Chart with Custom Colors

```typescript
const pieConfig: GraphEngineConfig = {
  title: { text: 'Market Share', left: 'center' },
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [{
    name: 'Market Share',
    type: 'pie',
    radius: '50%',
    center: ['50%', '60%'],
    data: [
      { value: 1048, name: 'Company A', itemStyle: { color: '#ff6b6b' } },
      { value: 735, name: 'Company B', itemStyle: { color: '#4ecdc4' } },
      { value: 580, name: 'Company C', itemStyle: { color: '#45b7d1' } }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
};
```

### 4. Multi-Axis Chart

```typescript
const multiAxisConfig: GraphEngineConfig = {
  title: { text: 'Revenue vs Temperature' },
  tooltip: { trigger: 'axis' },
  legend: {},
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
      yAxisIndex: 1
    }
  ]
};
```

### 5. Radar Chart

```typescript
const radarConfig: GraphEngineConfig = {
  title: { text: 'Performance Analysis' },
  tooltip: {},
  legend: {},
  radar: {
    indicator: [
      { name: 'Sales', max: 6500 },
      { name: 'Administration', max: 16000 },
      { name: 'IT', max: 30000 },
      { name: 'Support', max: 38000 },
      { name: 'Development', max: 52000 },
      { name: 'Marketing', max: 25000 }
    ]
  },
  series: [{
    name: 'Performance',
    type: 'radar',
    data: [{
      value: [4200, 3000, 20000, 35000, 50000, 18000],
      name: 'Budget'
    }]
  }]
};
```

### 6. Heatmap

```typescript
const heatmapConfig: GraphEngineConfig = {
  title: { text: 'Activity Heatmap' },
  tooltip: { position: 'top' },
  grid: { height: '50%', top: '10%' },
  xAxis: {
    type: 'category',
    data: ['12a', '1a', '2a', '3a', '4a', '5a']
  },
  yAxis: {
    type: 'category',
    data: ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday']
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: 'horizontal',
    left: 'center'
  },
  series: [{
    name: 'Activity',
    type: 'heatmap',
    data: [
      [0, 0, 5], [0, 1, 1], [0, 2, 0],
      [1, 0, 1], [1, 1, 0], [1, 2, 0]
    ],
    label: { show: true }
  }]
};
```

## Helper Functions

The component provides helper functions for common chart types:

### createLineChartConfig

```typescript
import { createLineChartConfig } from '@/components/graph-engine';

const data = [
  { month: 'Jan', sales: 120, profit: 30 },
  { month: 'Feb', sales: 150, profit: 45 }
];

const config = createLineChartConfig(
  data,           // data array
  'month',        // x-axis field
  ['sales', 'profit'], // y-axis fields
  {               // additional options
    title: { text: 'Monthly Performance' }
  }
);
```

### createBarChartConfig

```typescript
const config = createBarChartConfig(
  data,
  'category',
  ['value1', 'value2'],
  { title: { text: 'Comparison Chart' } }
);
```

### createPieChartConfig

```typescript
const config = createPieChartConfig(
  data,
  'category',  // name field
  'value',     // value field
  { title: { text: 'Distribution' } }
);
```

### createScatterChartConfig

```typescript
const config = createScatterChartConfig(
  data,
  'xValue',
  'yValue',
  { title: { text: 'Correlation Analysis' } }
);
```

## Component Props

### GraphEngineProps

```typescript
interface GraphEngineProps {
  config: GraphEngineConfig;        // Chart configuration
  className?: string;               // CSS class names
  style?: React.CSSProperties;      // Inline styles
  loading?: boolean;                // Show loading state
  error?: string | null;            // Error message to display
  onChartReady?: (chart: any) => void; // Chart ready callback
  onEvents?: {                      // Event handlers
    [eventName: string]: Function;
  };
  opts?: {                          // ECharts options
    renderer?: 'canvas' | 'svg';
    useDirtyRect?: boolean;
    locale?: string;
  };
}
```

## Advanced Features

### Data Transformations

```typescript
const configWithTransform: GraphEngineConfig = {
  dataset: {
    source: rawData,
    transform: [
      { type: 'filter', config: { dimension: 'year', '>=': 2000 } },
      { type: 'sort', config: { dimension: 'value', order: 'desc' } }
    ]
  },
  series: [{
    type: 'bar',
    encode: { x: 'category', y: 'value' }
  }]
};
```

### Custom Themes

```typescript
const themedConfig: GraphEngineConfig = {
  backgroundColor: '#2c3e50',
  color: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'],
  textStyle: {
    color: '#ecf0f1',
    fontFamily: 'Arial, sans-serif'
  },
  // ... rest of configuration
};
```

### Animation Control

```typescript
const animatedConfig: GraphEngineConfig = {
  animation: true,
  animationDuration: 2000,
  animationEasing: 'elasticOut',
  animationDelay: (idx: number) => idx * 100,
  // ... rest of configuration
};
```

## Error Handling

The component includes built-in validation and error handling:

```typescript
function MyChart() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <GraphEngine
      config={chartConfig}
      loading={loading}
      error={error}
      onChartReady={(chart) => {
        console.log('Chart ready:', chart);
      }}
    />
  );
}
```

## Performance Optimization

### Large Datasets

```typescript
const optimizedConfig: GraphEngineConfig = {
  // Use canvas renderer for better performance
  renderer: 'canvas',
  
  // Enable progressive rendering
  progressive: 400,
  progressiveThreshold: 3000,
  
  // Reduce animation for large datasets
  animation: false,
  
  // Use sampling for large line charts
  series: [{
    type: 'line',
    data: largeDataset,
    sampling: 'average'
  }]
};
```

### Memory Management

```typescript
function OptimizedChart() {
  const chartRef = useRef(null);
  
  useEffect(() => {
    // Cleanup chart instance on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.dispose();
      }
    };
  }, []);
  
  return (
    <GraphEngine
      config={config}
      onChartReady={(chart) => {
        chartRef.current = chart;
      }}
    />
  );
}
```

## Best Practices

1. **Data Validation**: Always validate your data before passing to the component
2. **Error Boundaries**: Wrap charts in error boundaries for production apps
3. **Responsive Design**: Use percentage values for dimensions when possible
4. **Color Accessibility**: Ensure sufficient contrast in color schemes
5. **Performance**: Limit data points for real-time charts (< 1000 points)
6. **Memory**: Dispose of chart instances when components unmount

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Check if data array is properly formatted
2. **Axis not showing**: Verify axis configuration matches data structure
3. **Colors not applied**: Ensure color values are valid CSS colors
4. **Performance issues**: Reduce data points or disable animations

### Debug Mode

```typescript
const debugConfig: GraphEngineConfig = {
  // ... your config
  animation: false,  // Disable for debugging
  title: { 
    text: 'Debug Mode',
    subtext: `Data points: ${data.length}` 
  }
};
```

## Examples Repository

Check out the `GraphEngineExamples` component for comprehensive examples of all chart types and configurations. Each example includes both the rendered chart and the corresponding JSON configuration.

## API Reference

For complete ECharts API documentation, visit: https://echarts.apache.org/en/api.html

The GraphEngine component is a wrapper that validates and processes configurations before passing them to ECharts, so most ECharts options are supported directly. 