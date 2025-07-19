'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GraphEngine } from '@/components/graph-engine';
import { DataTable } from '@/components/dashboard/data-table';
import { processPreviewData } from '@/components/graph-engine/graph-engine-examples';
import { Pencil, Save } from 'lucide-react';
import LoadingOverlay from '@/components/ui/loading-overlay';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: number;
  name: string;
  type: string;
  config: any;
}

interface Dashboard {
  id: number;
  name: string;
  layout: any[];
  widgets: Widget[];
}

const MyDashboardsPage = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboards');
        const data = await response.json();
        const fullDashboards = await Promise.all(
          (data.dashboards || []).map(async (d: any) => {
            const res = await fetch(`/api/dashboards/${d.id}`);
            const fullData = await res.json();
            return fullData.dashboard;
          })
        );
        setDashboards(fullDashboards);
        if (fullDashboards.length > 0) {
          setSelectedDashboard(fullDashboards[0]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboards();
  }, []);

  const handleNameChange = async (dashboardId: number) => {
    try {
      await fetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      setDashboards(dashboards.map(d => d.id === dashboardId ? { ...d, name: newName } : d));
      setEditingName(null);
    } catch (error) {
      console.error('Failed to update dashboard name:', error);
    }
  };

  const renderWidget = (widget: Widget) => {
    let configObject;
    try {
      configObject = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
    } catch (error) {
      console.error("Failed to parse widget config:", error);
      return <p>Invalid widget configuration.</p>;
    }
    const fullConfig = { ...configObject, type: widget.type, title: widget.name };
    const chartData = processPreviewData(fullConfig);
    if (!chartData) return <p>Could not render widget.</p>;
    if (chartData.renderType === 'chart' && chartData.config) return <GraphEngine config={chartData.config} />;
    if (chartData.renderType === 'table' && chartData.columns && chartData.data) return <DataTable columns={chartData.columns} data={chartData.data} />;
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <LoadingOverlay isLoading={isLoading} />
      <aside className="w-64 bg-white border-r">
        <h2 className="text-xl font-bold p-4 border-b">My Dashboards</h2>
        <nav>
          <ul>
            {dashboards.map(d => (
              <li key={d.id}>
                <button
                  onClick={() => setSelectedDashboard(d)}
                  className={`w-full text-left p-4 ${selectedDashboard?.id === d.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  {d.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {selectedDashboard ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              {editingName === selectedDashboard.id ? (
                <>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="text-3xl font-bold" />
                  <Button onClick={() => handleNameChange(selectedDashboard.id)}><Save className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{selectedDashboard.name}</h1>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingName(selectedDashboard.id); setNewName(selectedDashboard.name); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: selectedDashboard.layout }}
              isDraggable={false}
              isResizable={false}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={30}
            >
              {selectedDashboard.widgets.map(widget => (
                <div key={String(widget.id)}>
                  <Card className="h-full w-full overflow-auto">
                    <CardHeader>
                      <CardTitle>{widget.name}</CardTitle>
                    </CardHeader>
                    <CardContent>{renderWidget(widget)}</CardContent>
                  </Card>
                </div>
              ))}
            </ResponsiveGridLayout>
          </>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <h3 className="text-2xl font-semibold mb-2">No Dashboards Found</h3>
            <p>Go to the Dashboard Generator to create your first one.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDashboardsPage; 