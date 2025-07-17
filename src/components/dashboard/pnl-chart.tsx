'use client';

import { Trade } from '@/lib/types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartTooltipContent,
  ChartContainer,
} from '@/components/ui/chart';
import { format } from 'date-fns';

interface PnlChartProps {
  data: Trade[];
}

export function PnlChart({ data }: PnlChartProps) {
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(trade => ({
        date: format(new Date(trade.date), 'MMM d'),
        pnl: trade.mtm_pnl,
        fill: trade.mtm_pnl >= 0 ? 'var(--color-profit)' : 'var(--color-loss)',
    }));

  return (
    <div style={{'--color-profit': 'hsl(var(--chart-3))', '--color-loss': 'hsl(var(--chart-2))'} as React.CSSProperties}>
    <ChartContainer
        config={{
            pnl: {
                label: "PnL",
            },
            profit: {
                label: "Profit",
                color: "hsl(var(--chart-3))",
            },
            loss: {
                label: "Loss",
                color: "hsl(var(--chart-2))",
            }
        }}
        className="h-[250px] w-full"
      >
        <ResponsiveContainer>
            <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                  return `$${value}`
                }}
            />
             <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
             />
            <Bar dataKey="pnl" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
    </div>
  );
}
