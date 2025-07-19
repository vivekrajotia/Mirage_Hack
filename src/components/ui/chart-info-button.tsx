'use client';

import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ChartInfoButtonProps {
  title: string;
  description: string;
  dataSource?: string;
  insights?: string[];
  className?: string;
}

export function ChartInfoButton({ 
  title, 
  description, 
  dataSource, 
  insights = [], 
  className = "" 
}: ChartInfoButtonProps) {
  return (
    <TooltipProvider>
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
              >
                <Info className="h-3 w-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chart Information</p>
          </TooltipContent>
        </Tooltip>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            
            {dataSource && (
              <div>
                <h4 className="text-sm font-medium mb-2">Data Source</h4>
                <p className="text-sm text-muted-foreground">
                  {dataSource}
                </p>
              </div>
            )}
            
            {insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 