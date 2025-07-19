'use client';

import React, { useState } from 'react';
import { GraphEngine } from './graph-engine';
import { GraphConfigBuilder, createQuickLineChart, createQuickBarChart, createQuickPieChart, createQuickScatterChart } from './graph-config-builder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const GraphConfigBuilderDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('builder');

  // Sample data
  const salesData = [120, 200, 150, 80, 70, 110, 130];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const pieData = [
    { name: 'Desktop', value: 1048 },
    { name: 'Mobile', value: 735 },
    { name: 'Tablet', value: 580 }
  ];

  // Demo 1: Using GraphConfigBuilder (Fluent API)
  const builderChart = new GraphConfigBuilder()
    .title('Sales Performance Dashboard', 'Monthly sales and profit analysis')
    .xAxis('category', months)
    .yAxis('value')
    .tooltip('axis')
    .legend(true, 'top')
    .grid({ top: '20%', bottom: '15%' })
    .addLineSeries({
      name: 'Sales',
      data: salesData,
      smooth: true,
      color: '#1f77b4'
    })
    .addBarSeries({
      name: 'Profit',
      data: [30, 50, 35, 20, 15, 25, 30],
      color: '#ff7f0e'
    })
    .animation(true, 1000, 'cubicOut')
    .build();

  // Demo 2: Advanced Multi-Axis Chart
  const multiAxisChart = new GraphConfigBuilder()
    .title('Revenue vs Temperature Analysis')
    .xAxis('category', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    .dualYAxis(
      { name: 'Revenue', formatter: '${value}K' },
      { name: 'Temperature', formatter: '{value}°C' }
    )
    .tooltip('axis')
    .legend(true)
    .addBarSeries({
      name: 'Revenue',
      data: [120, 132, 101, 134, 90],
      yAxisIndex: 0,
      color: '#2ecc71'
    })
    .addLineSeries({
      name: 'Temperature',
      data: [20, 18, 22, 25, 28],
      yAxisIndex: 1,
      smooth: true,
      color: '#e74c3c'
    })
    .build();

  // Demo 3: Stacked Area Chart
  const stackedAreaChart = new GraphConfigBuilder()
    .title('Stacked Area Chart')
    .xAxis('category', months)
    .yAxis('value')
    .tooltip('axis')
    .legend(true)
    .addAreaSeries({
      name: 'Email',
      data: [120, 132, 101, 134, 90, 230, 210],
      stack: 'total',
      color: '#3498db'
    })
    .addAreaSeries({
      name: 'Social Media',
      data: [220, 182, 191, 234, 290, 330, 310],
      stack: 'total',
      color: '#e74c3c'
    })
    .addAreaSeries({
      name: 'Direct',
      data: [150, 232, 201, 154, 190, 330, 410],
      stack: 'total',
      color: '#2ecc71'
    })
    .build();

  // Demo 4: Dark Theme Radar Chart
  const radarChart = new GraphConfigBuilder()
    .title('Performance Analysis')
    .tooltip('item')
    .legend(true)
    .addRadarSeries({
      name: 'Performance',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: 'Allocated Budget'
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: 'Actual Spending'
        }
      ],
      indicators: [
        { name: 'Sales', max: 6500 },
        { name: 'Administration', max: 16000 },
        { name: 'IT', max: 30000 },
        { name: 'Support', max: 38000 },
        { name: 'Development', max: 52000 },
        { name: 'Marketing', max: 25000 }
      ]
    })
    .darkTheme()
    .build();

  // Demo 5: Gauge Chart
  const gaugeChart = new GraphConfigBuilder()
    .title('Performance Score')
    .addGaugeSeries({
      name: 'Score',
      value: 75,
      min: 0,
      max: 100,
      unit: '%'
    })
    .build();

  // Demo 6: Using Quick Helper Functions
  const quickLineChart = createQuickLineChart(
    'Quick Line Chart',
    months,
    [
      { name: 'Series 1', data: salesData, color: '#1f77b4' },
      { name: 'Series 2', data: [80, 120, 100, 60, 90, 85, 95], color: '#ff7f0e' }
    ]
  );

  const quickBarChart = createQuickBarChart(
    'Quick Bar Chart',
    ['Q1', 'Q2', 'Q3', 'Q4'],
    [
      { name: 'Product A', data: [320, 302, 301, 334], stack: 'total' },
      { name: 'Product B', data: [120, 132, 101, 134], stack: 'total' }
    ]
  );

  const quickPieChart = createQuickPieChart('Quick Pie Chart', pieData);

  const quickScatterChart = createQuickScatterChart(
    'Quick Scatter Plot',
    Array.from({ length: 30 }, () => [Math.random() * 100, Math.random() * 100]),
    'X Axis',
    'Y Axis'
  );

  const demos = {
    builder: { config: builderChart, title: 'Fluent Builder API', description: 'Using GraphConfigBuilder with method chaining' },
    multiAxis: { config: multiAxisChart, title: 'Multi-Axis Chart', description: 'Chart with dual Y-axes' },
    stackedArea: { config: stackedAreaChart, title: 'Stacked Area', description: 'Stacked area chart with multiple series' },
    radar: { config: radarChart, title: 'Dark Radar Chart', description: 'Radar chart with dark theme' },
    gauge: { config: gaugeChart, title: 'Gauge Chart', description: 'Performance gauge indicator' },
    quickLine: { config: quickLineChart, title: 'Quick Line Chart', description: 'Using createQuickLineChart helper' },
    quickBar: { config: quickBarChart, title: 'Quick Bar Chart', description: 'Using createQuickBarChart helper' },
    quickPie: { config: quickPieChart, title: 'Quick Pie Chart', description: 'Using createQuickPieChart helper' },
    quickScatter: { config: quickScatterChart, title: 'Quick Scatter Plot', description: 'Using createQuickScatterChart helper' }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">GraphConfigBuilder Demo</h1>
        <p className="text-muted-foreground mb-4">
          Demonstrating the fluent API for building chart configurations
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.entries(demos).map(([key, demo]) => (
            <Button
              key={key}
              variant={selectedDemo === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDemo(key)}
            >
              {demo.title}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{demos[selectedDemo as keyof typeof demos].title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {demos[selectedDemo as keyof typeof demos].description}
              </p>
            </div>
            <Badge variant="secondary">Interactive</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <GraphEngine
            config={demos[selectedDemo as keyof typeof demos].config}
            style={{ height: '400px' }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
              <code>
{selectedDemo === 'builder' && `const config = new GraphConfigBuilder()
  .title('Sales Performance Dashboard', 'Monthly sales and profit analysis')
  .xAxis('category', months)
  .yAxis('value')
  .tooltip('axis')
  .legend(true, 'top')
  .addLineSeries({
    name: 'Sales',
    data: salesData,
    smooth: true,
    color: '#1f77b4'
  })
  .addBarSeries({
    name: 'Profit',
    data: profitData,
    color: '#ff7f0e'
  })
  .animation(true, 1000, 'cubicOut')
  .build();`}

{selectedDemo === 'multiAxis' && `const config = new GraphConfigBuilder()
  .title('Revenue vs Temperature Analysis')
  .xAxis('category', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  .dualYAxis(
    { name: 'Revenue', formatter: '$\{value\}K' },
    { name: 'Temperature', formatter: '\{value\}°C' }
  )
  .addBarSeries({
    name: 'Revenue',
    data: [120, 132, 101, 134, 90],
    yAxisIndex: 0
  })
  .addLineSeries({
    name: 'Temperature',
    data: [20, 18, 22, 25, 28],
    yAxisIndex: 1
  })
  .build();`}

{selectedDemo.startsWith('quick') && `// Quick helper functions for common charts
const config = createQuickLineChart(
  'Chart Title',
  ['Jan', 'Feb', 'Mar', 'Apr'],
  [
    { name: 'Series 1', data: [10, 20, 15, 25] },
    { name: 'Series 2', data: [15, 25, 20, 30] }
  ]
);`}

{selectedDemo === 'radar' && `const config = new GraphConfigBuilder()
  .title('Performance Analysis')
  .addRadarSeries({
    name: 'Performance',
    data: [
      {
        value: [4200, 3000, 20000, 35000, 50000, 18000],
        name: 'Allocated Budget'
      }
    ],
    indicators: [
      { name: 'Sales', max: 6500 },
      { name: 'Administration', max: 16000 },
      // ... more indicators
    ]
  })
  .darkTheme()
  .build();`}
              </code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">✨ Fluent API</h4>
                <p className="text-sm text-muted-foreground">Chain methods together for readable code</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">🎨 Built-in Themes</h4>
                <p className="text-sm text-muted-foreground">Dark theme and custom color palettes</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">📊 Multiple Chart Types</h4>
                <p className="text-sm text-muted-foreground">Line, bar, pie, radar, gauge, and more</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">⚡ Quick Helpers</h4>
                <p className="text-sm text-muted-foreground">Shortcuts for common chart patterns</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">🔧 Advanced Features</h4>
                <p className="text-sm text-muted-foreground">Multi-axis, stacking, animations</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-1">✅ Type Safety</h4>
                <p className="text-sm text-muted-foreground">Full TypeScript support with validation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GraphConfigBuilderDemo; 