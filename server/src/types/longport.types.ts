import { Decimal } from 'decimal.js';

// 账户相关类型
export interface AccountBalance {
  totalCash: number;
  availableCash: number;
  frozenCash: number;
  currency: string;
  maxFinanceAmount: number;
  remainingFinanceAmount: number;
  riskLevel: number;
  marginCall: number;
  cashInfos: CashInfo[];
  netAssets: number;
  initMargin: number;
  maintenanceMargin: number;
  buyPower: number;
}

export interface CashInfo {
  withdrawCash: number;
  availableCash: number;
  frozenCash: number;
  settlingCash: number;
  currency: string;
}

export interface MarginRatio {
  imFactor: number;
  mmFactor: number;
  fmFactor: number;
}

// 行情相关类型
export interface SecurityQuote {
  symbol: string;
  lastDone: Decimal;
  prevClose: Decimal;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  timestamp: Date;
  volume: number;
  turnover: Decimal;
  tradeStatus: TradeStatus;
  preMarketQuote: PrePostQuote;
  postMarketQuote: PrePostQuote;
  overnightQuote: PrePostQuote;
}

export interface OptionQuote extends SecurityQuote {
  strikePrice: number;
  expirationDate: string;
  optionType: string;
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
export enum TimeInForceType {
  DAY = "Day",
  GTC = "GoodTilCanceled",
  GTD = "GoodTilDate"
}

export interface Order {
  orderId: string;
  status: OrderStatus;
  stockName: string;
  quantity: number;
  executedQuantity: number;
  price: number;
  executedPrice: number;
  submittedAt: number;
  side: OrderSide;
  symbol: string;
  orderType: OrderType;
  lastDone: number;
  triggerPrice: number;
  msg: string;
  tag: string;
  timeInForce: TimeInForceType;
  expireDate: string;
  updatedAt: number;
  triggerAt: number;
  trailingAmount: number;
  trailingPercent: number;
  limitOffset: number;
  triggerStatus: string;
  currency: string;
  outsideRth: string;
  remark: string;
}

export interface SubmitOrderParams {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  timeInForce: TimeInForceType;
}

export interface SubmitOrderResponse {
  orderId: string;
  status: OrderStatus;
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
export enum SubType {
  QUOTE = "Quote",
  DEPTH = "Depth",
  BROKER = "Broker",
  TRADE = "Trade"
}

export enum Period {
  MIN_1 = "Min_1",
  MIN_5 = "Min_5",
  MIN_15 = "Min_15",
  MIN_30 = "Min_30",
  MIN_60 = "Min_60",
  DAY = "Day",
  WEEK = "Week",
  MONTH = "Month",
  YEAR = "Year"
}

export interface PushQuote {
  symbol: string;
  lastDone: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  turnover: number;
  timestamp: number;
}

export interface Subscription {
  onQuote: (callback: (quote: PushQuote) => void) => void;
  unsubscribe: () => void;
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