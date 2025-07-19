'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface EodDateFilterProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  dates: string[];
}

export function EodDateFilter({
  selectedDate,
  onDateChange,
  dates,
}: EodDateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-500" />
      <Select
        value={selectedDate ?? 'all'}
        onValueChange={(value) => onDateChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select EOD Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Dates</SelectItem>
          {dates.map((date) => (
            <SelectItem key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 