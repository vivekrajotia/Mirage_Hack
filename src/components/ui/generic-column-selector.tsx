'use client';

import * as React from 'react';
import { Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GenericColumnSelectorProps {
  allColumns: string[];
  columnVisibility: { [key: string]: boolean };
  onColumnVisibilityChange: (visibility: { [key: string]: boolean }) => void;
  defaultVisibleColumns?: string[];
}

export function GenericColumnSelector({
  allColumns,
  columnVisibility,
  onColumnVisibilityChange,
  defaultVisibleColumns = [],
}: GenericColumnSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const getColumnDisplayName = (columnId: string) => {
    return columnId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleToggleColumn = (columnId: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId],
    };
    onColumnVisibilityChange(newVisibility);
  };

  const handleShowAll = () => {
    const allVisible = allColumns.reduce((acc, col) => {
      acc[col] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    onColumnVisibilityChange(allVisible);
  };

  const handleHideAll = () => {
    const allHidden = allColumns.reduce((acc, col) => {
      acc[col] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    onColumnVisibilityChange(allHidden);
  };

  const handleResetToDefault = () => {
    const defaultState = allColumns.reduce((acc, col) => {
      acc[col] = defaultVisibleColumns.includes(col);
      return acc;
    }, {} as { [key: string]: boolean });
    onColumnVisibilityChange(defaultState);
  };

  const filteredColumns = allColumns.filter((col) =>
    getColumnDisplayName(col).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Settings className="mr-2 h-4 w-4" />
          Manage Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5 text-xs">
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={handleShowAll}
          >
            Show all
          </Button>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={handleHideAll}
          >
            Hide all
          </Button>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={handleResetToDefault}
          >
            Reset
          </Button>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea style={{ height: '300px' }}>
          {filteredColumns.map((columnId) => (
            <DropdownMenuItem
              key={columnId}
              className="flex items-center justify-between"
              onSelect={(e) => {
                e.preventDefault();
                handleToggleColumn(columnId);
              }}
            >
              <span className="truncate">{getColumnDisplayName(columnId)}</span>
              {columnVisibility[columnId] && (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 