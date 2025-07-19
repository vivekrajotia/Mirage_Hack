'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraphEngine } from '@/components/graph-engine';
import { processPreviewData } from '@/components/graph-engine/graph-engine-examples';
import { DataTable } from '@/components/dashboard/data-table';
import { useToast } from '@/hooks/use-toast';
import ToastBanner from '@/components/toast-banner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: number;
  name: string;
  type: string;
  config: any;
}

const DashboardPreview = () => {
  const searchParams = useSearchParams();
  const [dashboardName, setDashboardName] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layout, setLayout] = useState<any[]>([]);
  const [widgetIds, setWidgetIds] = useState<number[]>([]);
  const { toast } = useToast();
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    const widgetIdsParam = searchParams.get('widgets');
    const dashboardIdParam = searchParams.get('dashboardId');

    if (dashboardIdParam) {
      const fetchDashboard = async () => {
        try {
          const response = await fetch(`/api/dashboards/${dashboardIdParam}`);
          const data = await response.json();
          const { dashboard } = data;
          setDashboardName(dashboard.name);
          setWidgets(dashboard.widgets);
          setLayout(dashboard.layout);
        } catch (error) {
          console.error('Failed to fetch dashboard:', error);
        }
      };
      fetchDashboard();
    } else if (widgetIdsParam) {
      const parsedWidgetIds = JSON.parse(widgetIdsParam);
      setWidgetIds(parsedWidgetIds);
      // In a real app, you'd fetch the full widget data here
      // For now, we'll just use dummy data
      const fetchedWidgets = parsedWidgetIds.map((id: number) => ({
        id: id,
        name: `Widget ${id}`,
        type: 'Sample Type',
        config: {},
      }));
      setWidgets(fetchedWidgets);

      const initialLayout = fetchedWidgets.map((widget: Widget, index: number) => ({
        i: String(widget.id),
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 4,
        w: 4,
        h: 4,
      }));
      setLayout(initialLayout);
    }
  }, [searchParams]);

  const handleLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
  };
  
  const handleSaveLayout = async () => {
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dashboardName || 'My Custom Dashboard',
          layout: layout,
          widgets: widgets.map(w => w.id),
        }),
      });

      if (response.ok) {
        setBanner({ type: 'success', message: 'Dashboard layout saved successfully!' });
      } else {
        setBanner({ type: 'error', message: 'Failed to save dashboard layout.' });
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      setBanner({ type: 'error', message: 'An error occurred while saving the layout.' });
    }
  };
  
  const renderWidget = (widget: Widget) => {
    let configObject;
    try {
      // Handle double-encoded JSON and regular objects
      const configString = typeof widget.config === 'string' ? widget.config : JSON.stringify(widget.config);
      configObject = JSON.parse(configString);
    } catch (error) {
      console.error("Failed to parse widget config:", error);
      return <p>Invalid widget configuration.</p>;
    }

    // Combine the widget type and name with its config for the rendering function
    const fullConfig = { ...configObject, type: widget.type, title: widget.name };
    const chartData = processPreviewData(fullConfig);

    if (!chartData) {
      return <p>Could not render widget.</p>;
    }
    
    if (chartData.renderType === 'chart' && chartData.config) {
      return <GraphEngine config={chartData.config} />;
    }
    
    if (chartData.renderType === 'table' && chartData.columns && chartData.data) {
      return <DataTable columns={chartData.columns} data={chartData.data} />;
    }
    
    return null;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{dashboardName || 'Dashboard Preview'}</h1>
          <p className="text-gray-500">Arrange and resize your widgets as needed.</p>
        </div>
        <Button onClick={handleSaveLayout} size="lg">Save Layout</Button>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={String(widget.id)}>
            <Card className="h-full w-full overflow-auto">
              <CardHeader>
                <CardTitle>{widget.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderWidget(widget)}
              </CardContent>
            </Card>
          </div>
        ))}
      </ResponsiveGridLayout>
      {banner && (
        <ToastBanner
          type={banner.type}
          message={banner.message}
          onClose={() => setBanner(null)}
          duration={3000}
        />
      )}
    </div>
  );
};

export default DashboardPreview; 