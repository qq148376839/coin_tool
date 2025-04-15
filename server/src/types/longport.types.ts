// 账户相关类型
export interface AccountBalance {
  totalCash: number;
  availableCash: number;
  frozenCash: number;
  currency: string;
}

export interface CashInfo {
  availableCash: number;
  frozenCash: number;
  currency: string;
}

export interface MarginRatio {
  initialMarginRatio: number;
  maintenanceMarginRatio: number;
  currency: string;
}

// 行情相关类型
export interface SecurityQuote {
  symbol: string;
  lastPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  turnover: number;
  timestamp: number;
}

export interface OptionQuote extends SecurityQuote {
  strikePrice: number;
  expirationDate: string;
  optionType: 'CALL' | 'PUT';
}

export interface WarrantQuote extends SecurityQuote {
  strikePrice: number;
  expirationDate: string;
}

export interface Candlestick {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

// 订单相关类型
export interface Order {
  orderId: string;
  symbol: string;
  orderType: 'LIMIT' | 'MARKET';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  filledPrice: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubmitOrderParams {
  symbol: string;
  orderType: 'LIMIT' | 'MARKET';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
}

export interface SubmitOrderResponse {
  orderId: string;
  status: 'PENDING' | 'REJECTED';
  message?: string;
}

// 订阅相关类型
export type SubType = 'QUOTE' | 'DEPTH' | 'TRADE' | 'ORDER';

export interface SubscribeParams {
  symbols: string[];
  subTypes: SubType[];
}

// 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: any;
} 