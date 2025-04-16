import { Decimal } from 'decimal.js';
import { OrderStatus, TimeInForceType, OrderType, OrderSide } from 'longport';

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
export interface Order {
  orderId: string;
  status: OrderStatus;
  stockName: string;
  quantity: number;
  executedQuantity: number;
  price: number;
  executedPrice: number;
  submittedAt: Date;
  side: OrderSide;
  symbol: string;
  orderType: OrderType;
  lastDone: number;
  triggerPrice: number;
  msg: string;
  tag: string;
  timeInForce: TimeInForceType;
  expireDate: string;
  updatedAt: Date;
  triggerAt: Date;
  trailingAmount: number;
  trailingPercent: number;
  limitOffset: number;
  triggerStatus: string;
  currency: string;
  outsideRth: boolean;
  remark: string;
}

export interface SubmitOrderParams {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price: number;
  timeInForce: TimeInForceType;
}

export interface SubmitOrderResponse {
  orderId: string;
  status: OrderStatus;
}

export interface GetTodayOrdersOptions {
  symbol?: string;
  status?: OrderStatus[];
  side?: OrderSide;
  market?: string;
  startAt?: Date;
  endAt?: Date;
}

export interface GetHistoryOrdersOptions {
  symbol?: string;
  status?: OrderStatus[];
  side?: OrderSide;
  market?: string;
  startAt?: Date;
  endAt?: Date;
}

// 订阅相关类型
export enum SubType {
  Quote = 'Quote',
  Depth = 'Depth',
  Brokers = 'Brokers',
  Trade = 'Trade'
}

export enum Period {
  Unknown = 'Unknown',
  Min_1 = 'Min_1',
  Min_5 = 'Min_5',
  Min_15 = 'Min_15',
  Min_30 = 'Min_30',
  Min_60 = 'Min_60',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year'
}

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