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
import { ChartInfoButton } from '@/components/ui/chart-info-button';
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Profit & Loss Chart</h3>
        <ChartInfoButton
          title="Profit & Loss Chart"
          description="This chart displays the profit and loss (PnL) for each trade over time. Green bars represent profitable trades, while red bars show losses."
          dataSource="Trade data from your portfolio, showing MTM (Mark-to-Market) PnL values"
          insights={[
            "Identifies your most and least profitable trading periods",
            "Helps track overall portfolio performance trends",
            "Green bars indicate positive PnL (profits)",
            "Red bars indicate negative PnL (losses)"
          ]}
        />
      </div>
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
