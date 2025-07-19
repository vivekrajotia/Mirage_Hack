'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Dashboard {
  id: number;
  name: string;
  updated_at: string;
}

const DashboardLoader = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await fetch('/api/dashboards');
        const data = await response.json();
        setDashboards(data.dashboards || []);
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
      }
    };
    fetchDashboards();
  }, []);

  const handleLoadDashboard = (dashboardId: number) => {
    // In a real app, you would fetch the full dashboard data and pass it to the preview page
    // For now, we'll just redirect to a placeholder URL
    router.push(`/dashboard-preview?dashboardId=${dashboardId}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Load a Dashboard</h1>
      {dashboards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{dashboard.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Last updated: {format(new Date(dashboard.updated_at), 'PPP')}
                </p>
                <Button
                  onClick={() => handleLoadDashboard(dashboard.id)}
                  className="mt-4 w-full"
                >
                  Load Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20">
          <h3 className="text-2xl font-semibold mb-2">No Dashboards Found</h3>
          <p className="mb-4">You haven't saved any dashboards yet.</p>
          <Button onClick={() => router.push('/dashboard-generator')}>
            Create a New Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardLoader; 