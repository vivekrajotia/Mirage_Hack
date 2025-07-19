export interface Widget {
  id: string;
  title: string;
  component: 'metric' | 'chart';
  type: 'total-pnl' | 'profitable-trades' | 'losing-trades' | 'total-trades' | 'risk-heatmap' | 'top-risks' | 'risk-trend' | 'risk-impact' | 'trade-distribution' | 'performance-center' | 'position-utilization' | 'monthly-risk';
  gridCols?: string; // Tailwind grid column classes
  visible: boolean;
  order: number;
}

export interface WidgetLayout {
  widgets: Widget[];
  lastUpdated: number;
}

export const DEFAULT_WIDGETS: Widget[] = [
  // Metric Cards
  {
    id: 'total-pnl',
    title: 'Total MTM PnL',
    component: 'metric',
    type: 'total-pnl',
    visible: true,
    order: 0
  },
  {
    id: 'profitable-trades',
    title: 'Profitable Trades',
    component: 'metric',
    type: 'profitable-trades',
    visible: true,
    order: 1
  },
  {
    id: 'losing-trades',
    title: 'Losing Trades',
    component: 'metric',
    type: 'losing-trades',
    visible: true,
    order: 2
  },
  {
    id: 'total-trades',
    title: 'Total Trades',
    component: 'metric',
    type: 'total-trades',
    visible: true,
    order: 3
  },
  // Chart Widgets
  {
    id: 'risk-heatmap',
    title: 'Risk Heatmap by Commodity',
    component: 'chart',
    type: 'risk-heatmap',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 4
  },
  {
    id: 'top-risks',
    title: 'Top 5 Risk Counterparties',
    component: 'chart',
    type: 'top-risks',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 5
  },
  {
    id: 'risk-trend',
    title: 'Risk Trend Over Time',
    component: 'chart',
    type: 'risk-trend',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 6
  },
  {
    id: 'risk-impact',
    title: 'Risk Impact Score',
    component: 'chart',
    type: 'risk-impact',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 7
  },
  {
    id: 'trade-distribution',
    title: 'Trade Type Distribution',
    component: 'chart',
    type: 'trade-distribution',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 8
  },
  {
    id: 'performance-center',
    title: 'Performance by Profit Center',
    component: 'chart',
    type: 'performance-center',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 9
  },
  {
    id: 'position-utilization',
    title: 'Position Utilization',
    component: 'chart',
    type: 'position-utilization',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 10
  },
  {
    id: 'monthly-risk',
    title: 'Monthly Risk Exposure',
    component: 'chart',
    type: 'monthly-risk',
    gridCols: 'lg:col-span-1',
    visible: true,
    order: 11
  }
];

const WIDGET_STORAGE_KEY = 'dashboard-widget-layout';

export class WidgetManager {
  static getWidgetLayout(): WidgetLayout {
    if (typeof window === 'undefined') {
      return { widgets: DEFAULT_WIDGETS, lastUpdated: Date.now() };
    }

    const stored = localStorage.getItem(WIDGET_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with default widgets to ensure new widgets are included
        const existingIds = new Set(parsed.widgets.map((w: Widget) => w.id));
        const newWidgets = DEFAULT_WIDGETS.filter(w => !existingIds.has(w.id));
        
        return {
          widgets: [...parsed.widgets, ...newWidgets].sort((a, b) => a.order - b.order),
          lastUpdated: parsed.lastUpdated || Date.now()
        };
      } catch (error) {
        console.error('Error parsing widget layout:', error);
      }
    }

    return { widgets: DEFAULT_WIDGETS, lastUpdated: Date.now() };
  }

  static saveWidgetLayout(layout: WidgetLayout): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify({
      ...layout,
      lastUpdated: Date.now()
    }));
  }

  static toggleWidgetVisibility(widgetId: string, visible: boolean): WidgetLayout {
    const layout = this.getWidgetLayout();
    const updatedWidgets = layout.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible } : widget
    );
    
    const updatedLayout = { ...layout, widgets: updatedWidgets };
    this.saveWidgetLayout(updatedLayout);
    return updatedLayout;
  }

  static reorderWidgets(widgets: Widget[]): WidgetLayout {
    const updatedWidgets = widgets.map((widget, index) => ({
      ...widget,
      order: index
    }));
    
    const updatedLayout = { widgets: updatedWidgets, lastUpdated: Date.now() };
    this.saveWidgetLayout(updatedLayout);
    return updatedLayout;
  }
} 