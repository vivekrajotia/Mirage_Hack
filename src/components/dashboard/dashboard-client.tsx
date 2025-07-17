'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format, subDays } from 'date-fns';
import {
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
} from 'lucide-react';

import { Trade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { PnlChart } from './pnl-chart';
import { DataTable } from './data-table';
import { columns } from './columns';
import rawTrades from '@/app/xceler_eodservice_publisheddata (1).json';

const tradesData = rawTrades.map(t => ({
  id: t.trade_id,
  date: t.trade_date_time,
  symbol: t.commodity,
  type: t.sell_open_position > 0 ? 'Sell' : 'Buy',
  quantity: t.buy_open_position > 0 ? t.buy_open_position : t.sell_open_position,
  price: t.price,
  mtm_pnl: t.mtm_pnl,
  strategy: t.trade_type
})) as Trade[];


export function DashboardClient() {
  const [trades, setTrades] = React.useState<Trade[]>(tradesData);
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [tradeType, setTradeType] = React.useState('All');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setDate({
      from: subDays(new Date(), 365), // Default to last year
      to: new Date(),
    });
  }, []);

  const filteredTrades = React.useMemo(() => {
    if (!isMounted || !date) {
        return trades;
    }

    return trades.filter((trade) => {
      const tradeDate = new Date(trade.date);
      const isDateInRange =
        (!date?.from || tradeDate >= date.from) &&
        (!date?.to || tradeDate <= addDays(date.to, 1)); // include end date
      const isTypeMatch = tradeType === 'All' || trade.type === tradeType;
      return isDateInRange && isTypeMatch;
    });
  }, [trades, date, tradeType, isMounted]);

  const totalPnl = React.useMemo(() => {
    return filteredTrades.reduce((acc, trade) => acc + trade.mtm_pnl, 0);
  }, [filteredTrades]);

  const totalTrades = filteredTrades.length;
  const profitableTrades = filteredTrades.filter(
    (trade) => trade.mtm_pnl > 0
  ).length;
  const losingTrades = totalTrades - profitableTrades;

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Symbol', 'Type', 'Quantity', 'Price', 'MTM PnL', 'Strategy'];
    const csvContent = [
      headers.join(','),
      ...filteredTrades.map(t => [t.id, t.date, t.symbol, t.type, t.quantity, t.price, t.mtm_pnl, t.strategy].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MTM PnL</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {totalPnl.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current filters
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable Trades
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitableTrades}</div>
            <p className="text-xs text-muted-foreground">
              {totalTrades > 0 ? `${((profitableTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Losing Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{losingTrades}</div>
             <p className="text-xs text-muted-foreground">
               {totalTrades > 0 ? `${((losingTrades / totalTrades) * 100).toFixed(1)}%` : '0%'} of total trades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              Total trades in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>MTM PnL Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <PnlChart data={filteredTrades} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <DatePickerWithRange date={date} setDate={setDate} />
                    <Select value={tradeType} onValueChange={setTradeType}>
                        <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by type..." />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="mt-4">
                <DataTable columns={columns} data={filteredTrades} />
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
