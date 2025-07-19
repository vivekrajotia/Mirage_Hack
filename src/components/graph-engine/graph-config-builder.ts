import { GraphEngineConfig, SeriesConfig, DEFAULT_COLORS } from './graph-engine';

/**
 * GraphConfigBuilder - A utility class for building GraphEngine configurations
 * Provides a fluent interface for creating chart configurations
 */
export class GraphConfigBuilder {
  private config: Partial<GraphEngineConfig> = {};

  constructor() {
    this.reset();
  }

  /**
   * Reset the configuration to defaults
   */
  reset(): GraphConfigBuilder {
    this.config = {
      backgroundColor: '#ffffff',
      color: DEFAULT_COLORS,
      animation: true,
      series: []
    };
    return this;
  }

  /**
   * Set the chart title
   */
  title(text: string, subtext?: string, position?: 'left' | 'center' | 'right'): GraphConfigBuilder {
    this.config.title = {
      text,
      subtext,
      left: position || 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' },
      subtextStyle: { fontSize: 12, color: '#666' }
    };
    return this;
  }

  /**
   * Configure tooltip
   */
  tooltip(trigger: 'item' | 'axis' | 'none' = 'axis', formatter?: string | Function): GraphConfigBuilder {
    this.config.tooltip = {
      trigger,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#1e293b', fontSize: 12 }
    };
    
    if (formatter) {
      this.config.tooltip.formatter = formatter;
    }
    
    return this;
  }

  /**
   * Configure legend
   */
  legend(show: boolean = true, position?: 'top' | 'bottom' | 'left' | 'right'): GraphConfigBuilder {
    if (show) {
      this.config.legend = {
        show: true,
        type: 'scroll',
        orient: (position === 'left' || position === 'right') ? 'vertical' : 'horizontal',
        [position || 'top']: position === 'top' ? 10 : position === 'bottom' ? 10 : 0,
        textStyle: { fontSize: 12, color: '#64748b' }
      };
    } else {
      this.config.legend = { show: false };
    }
    return this;
  }

  /**
   * Configure grid/chart area
   */
  grid(options?: {
    left?: string | number;
    right?: string | number;
    top?: string | number;
    bottom?: string | number;
    containLabel?: boolean;
  }): GraphConfigBuilder {
    this.config.grid = {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
      ...options
    };
    return this;
  }

  /**
   * Configure X-axis
   */
  xAxis(type: 'category' | 'value' | 'time' | 'log' = 'category', data?: any[], options?: any): GraphConfigBuilder {
    this.config.xAxis = {
      type,
      ...(data && { data }),
      ...options
    };
    return this;
  }

  /**
   * Configure Y-axis
   */
  yAxis(type: 'value' | 'category' | 'time' | 'log' = 'value', options?: any): GraphConfigBuilder {
    this.config.yAxis = {
      type,
      ...options
    };
    return this;
  }

  /**
   * Configure dual Y-axes
   */
  dualYAxis(
    leftOptions?: { name?: string; formatter?: string },
    rightOptions?: { name?: string; formatter?: string }
  ): GraphConfigBuilder {
    this.config.yAxis = [
      {
        type: 'value',
        position: 'left',
        name: leftOptions?.name,
        axisLabel: leftOptions?.formatter ? { formatter: leftOptions.formatter } : undefined
      },
      {
        type: 'value',
        position: 'right',
        name: rightOptions?.name,
        axisLabel: rightOptions?.formatter ? { formatter: rightOptions.formatter } : undefined
      }
    ];
    return this;
  }

  /**
   * Add a line series
   */
  addLineSeries(options: {
    name: string;
    data: any[];
    smooth?: boolean;
    color?: string;
    yAxisIndex?: number;
    lineStyle?: any;
    areaStyle?: any;
  }): GraphConfigBuilder {
    const series: SeriesConfig = {
      name: options.name,
      type: 'line',
      data: options.data,
      smooth: options.smooth || false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2, ...options.lineStyle },
      ...(options.color && { color: options.color }),
      ...(options.yAxisIndex !== undefined && { yAxisIndex: options.yAxisIndex }),
      ...(options.areaStyle && { areaStyle: options.areaStyle })
    };
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add a bar series
   */
  addBarSeries(options: {
    name: string;
    data: any[];
    color?: string;
    stack?: string;
    yAxisIndex?: number;
    horizontal?: boolean;
  }): GraphConfigBuilder {
    // If horizontal bar, we need to ensure proper axis configuration
    if (options.horizontal && this.config.xAxis && this.config.yAxis) {
      // Swap axis types for horizontal bar
      const tempXAxis = this.config.xAxis;
      this.config.xAxis = { ...this.config.yAxis as any, type: 'value' };
      this.config.yAxis = { ...tempXAxis as any, type: 'category' };
    }

    const series: SeriesConfig = {
      name: options.name,
      type: 'bar',
      data: options.data,
      ...(options.color && { color: options.color }),
      ...(options.stack && { stack: options.stack }),
      ...(options.yAxisIndex !== undefined && { yAxisIndex: options.yAxisIndex })
    };
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add a pie series
   */
  addPieSeries(options: {
    name: string;
    data: { name: string; value: number; itemStyle?: any }[];
    radius?: [string, string] | string;
    center?: [string, string];
    roseType?: boolean;
  }): GraphConfigBuilder {
    const series: SeriesConfig = {
      name: options.name,
      type: 'pie',
      data: options.data,
      radius: options.radius || ['0%', '70%'],
      center: options.center || ['50%', '50%'],
      ...(options.roseType && { roseType: 'radius' }),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    };
    
    // For pie charts, we don't need axes
    delete this.config.xAxis;
    delete this.config.yAxis;
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add a scatter series
   */
  addScatterSeries(options: {
    name: string;
    data: [number, number][];
    symbolSize?: number;
    color?: string;
  }): GraphConfigBuilder {
    const series: SeriesConfig = {
      name: options.name,
      type: 'scatter',
      data: options.data,
      symbolSize: options.symbolSize || 8,
      ...(options.color && { color: options.color })
    };
    
    // Ensure both axes are value type for scatter plots
    this.config.xAxis = { type: 'value', ...this.config.xAxis };
    this.config.yAxis = { type: 'value', ...this.config.yAxis };
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add area series
   */
  addAreaSeries(options: {
    name: string;
    data: any[];
    stack?: string;
    color?: string;
    opacity?: number;
  }): GraphConfigBuilder {
    const series: SeriesConfig = {
      name: options.name,
      type: 'line',
      data: options.data,
      smooth: true,
      areaStyle: { opacity: options.opacity || 0.6 },
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 4,
      ...(options.color && { color: options.color }),
      ...(options.stack && { stack: options.stack })
    };
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add radar series
   */
  addRadarSeries(options: {
    name: string;
    data: { value: number[]; name: string }[];
    indicators: { name: string; max: number }[];
  }): GraphConfigBuilder {
    // Configure radar component
    this.config.radar = {
      indicator: options.indicators,
      radius: '60%'
    };

    const series: SeriesConfig = {
      name: options.name,
      type: 'radar',
      data: options.data
    };
    
    // Remove axes for radar chart
    delete this.config.xAxis;
    delete this.config.yAxis;
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Add gauge series
   */
  addGaugeSeries(options: {
    name: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
  }): GraphConfigBuilder {
    const series: SeriesConfig = {
      name: options.name,
      type: 'gauge',
      progress: { show: true, width: 18 },
      axisLine: { lineStyle: { width: 18 } },
      axisTick: { show: false },
      splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
      axisLabel: { distance: 25, color: '#999', fontSize: 20 },
      anchor: { show: true, showAbove: true, size: 25 },
      title: { show: false },
      detail: {
        valueAnimation: true,
        formatter: options.unit ? `{value} ${options.unit}` : '{value}',
        color: 'auto'
      },
      data: [{ 
        value: options.value, 
        name: options.name 
      }],
      min: options.min || 0,
      max: options.max || 100
    };
    
    // Remove axes for gauge chart
    delete this.config.xAxis;
    delete this.config.yAxis;
    
    this.config.series!.push(series);
    return this;
  }

  /**
   * Configure data zoom (for large datasets)
   */
  dataZoom(start?: number, end?: number): GraphConfigBuilder {
    this.config.dataZoom = [
      {
        type: 'slider',
        start: start || 0,
        end: end || 100
      },
      {
        type: 'inside',
        start: start || 0,
        end: end || 100
      }
    ];
    return this;
  }

  /**
   * Configure visual map (for heatmaps)
   */
  visualMap(options: {
    min: number;
    max: number;
    calculable?: boolean;
    orient?: 'horizontal' | 'vertical';
    left?: string;
    bottom?: string;
  }): GraphConfigBuilder {
    this.config.visualMap = {
      min: options.min,
      max: options.max,
      calculable: options.calculable !== false,
      orient: options.orient || 'horizontal',
      left: options.left || 'center',
      bottom: options.bottom || '15%'
    };
    return this;
  }

  /**
   * Set custom colors
   */
  colors(colors: string[]): GraphConfigBuilder {
    this.config.color = colors;
    return this;
  }

  /**
   * Configure animation
   */
  animation(enabled: boolean = true, duration?: number, easing?: string): GraphConfigBuilder {
    this.config.animation = enabled;
    if (duration) this.config.animationDuration = duration;
    if (easing) this.config.animationEasing = easing;
    return this;
  }

  /**
   * Set chart dimensions
   */
  dimensions(width?: string | number, height?: string | number): GraphConfigBuilder {
    if (width) this.config.width = width;
    if (height) this.config.height = height;
    return this;
  }

  /**
   * Set background color
   */
  background(color: string): GraphConfigBuilder {
    this.config.backgroundColor = color;
    return this;
  }

  /**
   * Apply dark theme
   */
  darkTheme(): GraphConfigBuilder {
    this.config.backgroundColor = '#1e1e1e';
    this.config.color = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
      '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ];
    
    if (this.config.title) {
      this.config.title.textStyle = { color: '#ffffff' };
      this.config.title.subtextStyle = { color: '#cccccc' };
    }
    
    return this;
  }

  /**
   * Build and return the final configuration
   */
  build(): GraphEngineConfig {
    // Ensure we have at least one series
    if (!this.config.series || this.config.series.length === 0) {
      throw new Error('At least one series must be added to the chart');
    }
    
    return this.config as GraphEngineConfig;
  }

  /**
   * Get the current configuration (useful for debugging)
   */
  preview(): Partial<GraphEngineConfig> {
    return { ...this.config };
  }
}

/**
 * Quick builder functions for common chart types
 */

export const createQuickLineChart = (
  title: string,
  xData: string[],
  series: { name: string; data: number[]; color?: string }[]
): GraphEngineConfig => {
  const builder = new GraphConfigBuilder()
    .title(title)
    .xAxis('category', xData)
    .yAxis('value')
    .tooltip('axis')
    .legend(true);
    
  series.forEach(s => builder.addLineSeries(s));
  
  return builder.build();
};

export const createQuickBarChart = (
  title: string,
  categories: string[],
  series: { name: string; data: number[]; color?: string; stack?: string }[]
): GraphEngineConfig => {
  const builder = new GraphConfigBuilder()
    .title(title)
    .xAxis('category', categories)
    .yAxis('value')
    .tooltip('axis')
    .legend(true);
    
  series.forEach(s => builder.addBarSeries(s));
  
  return builder.build();
};

export const createQuickPieChart = (
  title: string,
  data: { name: string; value: number; color?: string }[]
): GraphEngineConfig => {
  const pieData = data.map((item, index) => ({
    ...item,
    itemStyle: item.color ? { color: item.color } : { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length] }
  }));

  return new GraphConfigBuilder()
    .title(title)
    .tooltip('item')
    .legend(true)
    .addPieSeries({ name: title, data: pieData })
    .build();
};

export const createQuickScatterChart = (
  title: string,
  data: [number, number][],
  xAxisName: string,
  yAxisName: string
): GraphEngineConfig => {
  return new GraphConfigBuilder()
    .title(title)
    .xAxis('value', undefined, { name: xAxisName })
    .yAxis('value', { name: yAxisName })
    .tooltip('item')
    .addScatterSeries({ name: 'Data Points', data })
    .build();
};

export default GraphConfigBuilder; 