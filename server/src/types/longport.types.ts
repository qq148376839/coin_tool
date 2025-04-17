import { Decimal } from 'decimal.js';

// 账户相关类型
export interface AccountBalance {
  totalCash: Decimal;
  availableCash: Decimal;
  frozenCash: Decimal;
  currency: string;
  maxFinanceAmount: Decimal;
  remainingFinanceAmount: Decimal;
  riskLevel: number;
  marginCall: Decimal;
  cashInfos: CashInfo[];
  netAssets: Decimal;
  initMargin: Decimal;
  maintenanceMargin: Decimal;
  buyPower: Decimal;
}

export interface CashInfo {
  withdrawCash: Decimal;
  availableCash: Decimal;
  frozenCash: Decimal;
  settlingCash: Decimal;
  currency: string;
}

export interface MarginRatio {
  imFactor: Decimal;
  mmFactor: Decimal;
  fmFactor: Decimal;
}

// 行情相关类型
export enum TradeStatus {
  NORMAL = 'Normal',
  HALTED = 'Halted',
  DELISTED = 'Delisted',
  FUSE = 'Fuse',
  PREPARE_LIST = 'PrepareList',
  CODE_MOVED = 'CodeMoved',
  TO_BE_OPENED = 'ToBeOpened',
  SPLIT_STOCK_HALTS = 'SplitStockHalts',
  EXPIRED = 'Expired',
  WARRANT_PREPARE_LIST = 'WarrantPrepareList',
  SUSPEND = 'Suspend'
}

export interface PrePostQuote {
  lastDone: Decimal;
  timestamp: Date;
  volume: number;
  turnover: Decimal;
  high: Decimal;
  low: Decimal;
  prevClose: Decimal;
}

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
  preMarketQuote?: {
    lastDone: Decimal;
    timestamp: Date;
    volume: number;
    turnover: Decimal;
    high: Decimal;
    low: Decimal;
    prevClose: Decimal;
  };
  postMarketQuote?: {
    lastDone: Decimal;
    timestamp: Date;
    volume: number;
    turnover: Decimal;
    high: Decimal;
    low: Decimal;
    prevClose: Decimal;
  };
  overnightQuote?: {
    lastDone: Decimal;
    timestamp: Date;
    volume: number;
    turnover: Decimal;
    high: Decimal;
    low: Decimal;
    prevClose: Decimal;
  };
}

export interface OptionQuote extends SecurityQuote {
  strikePrice: Decimal;
  expirationDate: string;
  optionType: string;
}

export interface WarrantQuote extends SecurityQuote {
  strikePrice: Decimal;
  expirationDate: string;
}

export interface Candlestick {
  timestamp: Date;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  close: Decimal;
  volume: Decimal;
  turnover: Decimal;
}

// 订单相关类型
export type OrderType = 'LIMIT' | 'MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
export enum TimeInForceType {
  Unknown = 'Unknown',
  Day = 'Day',
  GoodTilCanceled = 'GoodTilCanceled',
  GoodTilDate = 'GoodTilDate'
}
export type OrderTag = 'NORMAL' | 'LONG_TERM' | 'SHORT_SELL';
export type TriggerStatus = 'NORMAL' | 'TRIGGERED' | 'CANCELLED';
export type OutsideRTH = 'NORMAL' | 'ONLY_RTH' | 'ONLY_NRTH';

export interface Order {
  orderId: string;
  status: OrderStatus;
  stockName: string;
  quantity: Decimal;
  executedQuantity: Decimal;
  price: Decimal;
  executedPrice: Decimal;
  submittedAt: Date;
  side: OrderSide;
  symbol: string;
  orderType: OrderType;
  lastDone: Decimal;
  triggerPrice: Decimal;
  msg: string;
  tag: OrderTag;
  timeInForce: TimeInForceType;
  expireDate: NaiveDate;
  updatedAt: Date;
  triggerAt: Date;
  trailingAmount: Decimal;
  trailingPercent: Decimal;
  limitOffset: Decimal;
  triggerStatus: TriggerStatus;
  currency: string;
  outsideRth: OutsideRTH;
  remark: string;
}

export interface SubmitOrderParams {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: Decimal;
  price?: Decimal;
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
  QUOTE = 'Quote',
  DEPTH = 'Depth',
  BROKER = 'Broker',
  TRADE = 'Trade'
}

export enum Period {
  MIN_1 = 'Min_1',
  MIN_5 = 'Min_5',
  MIN_15 = 'Min_15',
  MIN_30 = 'Min_30',
  MIN_60 = 'Min_60',
  DAY = 'Day',
  WEEK = 'Week',
  MONTH = 'Month',
  YEAR = 'Year'
}

export interface PushQuote {
  symbol: string;
  lastDone: Decimal;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  volume: number;
  turnover: Decimal;
  timestamp: Date;
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

export interface NaiveDate {
  year: number;
  month: number;
  day: number;
} 