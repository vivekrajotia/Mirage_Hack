'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DataTableDisplayProps {
  title: string;
  columns: string[];
  rows: string[][];
}

export const DataTableDisplay: React.FC<DataTableDisplayProps> = ({ 
  title, 
  columns, 
  rows 
}) => {
  const exportToCSV = () => {
    const csvContent = [
      columns.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-800">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 border-r last:border-r-0"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="py-3 px-4 text-slate-700 dark:text-slate-300 border-r last:border-r-0"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}; 