// 账户相关类型
export interface AccountBalance {
  totalCash: number;
  availableCash: number;
  frozenCash: number;
  currency: string;
  maxFinanceAmount: number;
  remainingFinanceAmount: number;
  marginRatio: number;
  maintenanceMarginRatio: number;
  initialMarginRatio: number;
  toJSON: () => any;
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
export type OrderType = 'LIMIT' | 'MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface Order {
  orderId: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  status: OrderStatus;
  filledQuantity: number;
  filledPrice: number;
  createdAt: number;
  updatedAt: number;
}

export interface SubmitOrderParams {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  submittedQuantity: number;
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
}

export interface SubmitOrderResponse {
  orderId: string;
  status: OrderStatus;
  message?: string;
}

export interface GetTodayOrdersOptions {
  symbol?: string;
  status?: OrderStatus[];
}

export interface GetHistoryOrdersOptions {
  symbol: string;
  startAt: Date;
  endAt: Date;
}

// 订阅相关类型
export type SubType = 'QUOTE' | 'DEPTH' | 'TRADE' | 'ORDER';
export type Period = '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M';

export interface PushQuote {
  symbol: string;
  lastPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  turnover: number;
  timestamp: number;
}

export interface Subscription {
  onQuote: (callback: (quote: PushQuote) => void) => void;
  unsubscribe: () => Promise<void>;
}

// 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

export interface SubscribeParams {
  symbols: string[];
  subTypes: SubType[];
} 