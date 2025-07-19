'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DbManager = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch('/api/db/tables');
        if (!res.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await res.json();
        setTables(data.tables);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTables();
  }, []);

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    setSelectedTable(tableName);
    try {
      const res = await fetch(`/api/db/tables/${tableName}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch data for table ${tableName}`);
      }
      const data = await res.json();
      setTableData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database Manager</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {tables.map(table => (
                  <li key={table} className="mb-2">
                    <Button
                      variant={selectedTable === table ? 'secondary' : 'ghost'}
                      onClick={() => fetchTableData(table)}
                      className="w-full text-left justify-start"
                    >
                      {table}
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3">
          {selectedTable && (
            <Card>
              <CardHeader>
                <CardTitle>Data for: {selectedTable}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tableData.length > 0 &&
                          Object.keys(tableData[0]).map(key => (
                            <TableHead key={key}>{key}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, i) => (
                            <TableCell key={i}>{String(value)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DbManager; 