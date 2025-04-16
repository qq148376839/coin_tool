declare module 'longport' {
  import { Decimal } from 'decimal.js';

  export class QuoteContext {
    setConfig(config: { appKey: string; appSecret: string; accessToken: string }): void;
    quote(symbols: string[]): Promise<SecurityQuote[]>;
    optionQuote(symbols: string[]): Promise<OptionQuote[]>;
    warrantQuote(symbols: string[]): Promise<WarrantQuote[]>;
    candlestick(symbol: string, period: Period, count: number, adjustType?: number): Promise<Candlestick[]>;
    subscribe(symbols: string[], subTypes: SubType[], isFirstPush: boolean): Promise<void>;
    unsubscribe(symbols: string[], subTypes: SubType[]): Promise<void>;
  }

  export class TradeContext {
    setConfig(config: { appKey: string; appSecret: string; accessToken: string }): void;
    accountBalance(currency?: string): Promise<AccountBalance[]>;
    submitOrder(options: SubmitOrderOptions): Promise<SubmitOrderResponse>;
    cancelOrder(orderId: string): Promise<void>;
    todayOrders(options?: GetTodayOrdersOptions): Promise<Order[]>;
    historyOrders(options: GetHistoryOrdersOptions): Promise<Order[]>;
    marginRatio(symbol: string): Promise<MarginRatio>;
  }

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
    toJSON(): any;
  }

  export interface CashInfo {
    withdrawCash: Decimal;
    availableCash: Decimal;
    frozenCash: Decimal;
    settlingCash: Decimal;
    currency: string;
    toJSON(): any;
  }

  export interface MarginRatio {
    imFactor: Decimal;
    mmFactor: Decimal;
    fmFactor: Decimal;
    toJSON(): any;
  }

  export interface SecurityQuote {
    symbol: string;
    lastPrice: Decimal;
    openPrice: Decimal;
    highPrice: Decimal;
    lowPrice: Decimal;
    volume: Decimal;
    turnover: Decimal;
    timestamp: Date;
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
    toJSON(): any;
  }

  export interface SubmitOrderOptions {
    symbol: string;
    orderType: OrderType;
    side: OrderSide;
    submittedQuantity: Decimal;
    timeInForce: TimeInForceType;
    submittedPrice?: Decimal;
    triggerPrice?: Decimal;
    limitOffset?: Decimal;
    trailingAmount?: Decimal;
    trailingPercent?: Decimal;
    expireDate?: NaiveDate;
    outsideRth?: OutsideRTH;
    remark?: string;
  }

  export interface SubmitOrderResponse {
    orderId: string;
    status: OrderStatus;
  }

  export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  export type OrderType = 'LIMIT' | 'MARKET';
  export type OrderSide = 'BUY' | 'SELL';
  export type TimeInForceType = 'DAY' | 'GTC' | 'IOC' | 'FOK';
  export type OrderTag = 'NORMAL' | 'LONG_TERM' | 'SHORT_SELL';
  export type TriggerStatus = 'NORMAL' | 'TRIGGERED' | 'CANCELLED';
  export type OutsideRTH = 'NORMAL' | 'ONLY_RTH' | 'ONLY_NRTH';

  export enum SubType {
    QUOTE = 'quote',
    DEPTH = 'depth',
    BROKER = 'broker',
    TRADE = 'trade'
  }

  export enum Period {
    MIN_1 = '1m',
    MIN_5 = '5m',
    MIN_15 = '15m',
    MIN_30 = '30m',
    MIN_60 = '60m',
    DAY = '1d',
    WEEK = '1w',
    MONTH = '1M',
    YEAR = '1Y'
  }

  export interface NaiveDate {
    year: number;
    month: number;
    day: number;
  }
} 