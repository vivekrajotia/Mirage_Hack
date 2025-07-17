export interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  mtm_pnl: number;
  strategy: string;
}
