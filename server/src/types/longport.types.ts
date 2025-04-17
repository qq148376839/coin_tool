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
export enum TopicType {
  Private = 'Private',
  Quote = 'Quote',
  Depth = 'Depth',
  Brokers = 'Brokers',
  Trades = 'Trades',
  Candlestick = 'Candlestick'
}

export enum SubType {
  Quote = 0,
  Depth = 1,
  Brokers = 2,
  Trade = 3
}

export type Private = TopicType.Private;

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
  subTypes: TopicType[];
}

export interface NaiveDate {
  year: number;
  month: number;
  day: number;
}

// 交易上下文类型
export interface TradeContext {
  new(config: Config): Promise<TradeContext>;
  setOnOrderChanged(callback: (err: Error, event: PushOrderChanged) => void): void;
  subscribe(topics: Private[]): Promise<void>;
  unsubscribe(topics: Private[]): Promise<void>;
  historyExecutions(opts?: GetHistoryExecutionsOptions): Promise<Execution[]>;
  todayExecutions(opts?: GetTodayExecutionsOptions): Promise<Execution[]>;
  historyOrders(opts?: GetHistoryOrdersOptions): Promise<Order[]>;
  todayOrders(opts?: GetTodayOrdersOptions): Promise<Order[]>;
  replaceOrder(opts: ReplaceOrderOptions): Promise<void>;
  submitOrder(opts: SubmitOrderOptions): Promise<SubmitOrderResponse>;
  cancelOrder(orderId: string): Promise<void>;
  accountBalance(currency?: string): Promise<AccountBalance[]>;
  cashFlow(opts: GetCashFlowOptions): Promise<CashFlow[]>;
  fundPositions(symbols?: string[]): Promise<FundPositionsResponse>;
  stockPositions(symbols?: string[]): Promise<StockPositionsResponse>;
  marginRatio(symbol: string): Promise<MarginRatio>;
  orderDetail(orderId: string): Promise<OrderDetail>;
  estimateMaxPurchaseQuantity(opts: EstimateMaxPurchaseQuantityOptions): Promise<EstimateMaxPurchaseQuantityResponse>;
}

// 行情上下文类型
export interface QuoteContext {
  new(config: Config): Promise<QuoteContext>;
  memberId(): number;
  quoteLevel(): string;
  quotePackageDetails(): QuotePackageDetail[];
  setOnQuote(callback: (err: Error, event: PushQuoteEvent) => void): void;
  setOnDepth(callback: (err: Error, event: PushDepthEvent) => void): void;
  setOnBrokers(callback: (err: Error, event: PushBrokersEvent) => void): void;
  setOnTrades(callback: (err: Error, event: PushTradesEvent) => void): void;
  setOnCandlestick(callback: (err: Error, event: PushCandlestickEvent) => void): void;
  subscribe(symbols: string[], subTypes: TopicType[]): Promise<void>;
  unsubscribe(symbols: string[], subTypes: TopicType[]): Promise<void>;
  subscribeCandlesticks(symbols: string[], period: Period): Promise<void>;
  unsubscribeCandlesticks(symbols: string[], period: Period): Promise<void>;
  subscriptions(): Promise<Subscription[]>;
  staticInfo(symbols: string[]): Promise<StaticInfo[]>;
  quote(symbols: string[]): Promise<SecurityQuote[]>;
  optionQuote(symbols: string[]): Promise<OptionQuote[]>;
  warrantQuote(symbols: string[]): Promise<WarrantQuote[]>;
  depth(symbols: string[]): Promise<Depth[]>;
  brokers(symbols: string[]): Promise<Brokers[]>;
  participants(symbols: string[]): Promise<Participants[]>;
  trades(symbols: string[]): Promise<Trade[]>;
  intraday(symbols: string[]): Promise<Intraday[]>;
  candlesticks(symbols: string[], period: Period, count: number): Promise<Candlestick[]>;
  historyCandlesticksByOffset(symbol: string, period: Period, count: number, offset?: number): Promise<Candlestick[]>;
  historyCandlesticksByDate(symbol: string, period: Period, start: Date, end: Date): Promise<Candlestick[]>;
  optionChainExpiryDateList(symbol: string): Promise<Date[]>;
  optionChainInfoByDate(symbol: string, expiryDate: Date): Promise<OptionChainInfo[]>;
  warrantIssuers(): Promise<WarrantIssuer[]>;
  warrantList(symbol: string): Promise<WarrantInfo[]>;
  tradingSession(): Promise<TradingSession[]>;
  tradingDays(market: Market, begin: Date, end: Date): Promise<Date[]>;
  capitalFlow(symbols: string[]): Promise<CapitalFlow[]>;
  capitalDistribution(symbols: string[]): Promise<CapitalDistribution[]>;
  calcIndexes(symbols: string[], indexes: string[]): Promise<CalcIndex[]>;
  watchlist(): Promise<WatchlistGroup[]>;
  createWatchlistGroup(name: string, securities: string[]): Promise<void>;
  deleteWatchlistGroup(id: number): Promise<void>;
  updateWatchlistGroup(id: number, name?: string, securities?: string[]): Promise<void>;
  securityList(market: Market, language: Language): Promise<SecurityInfo[]>;
  realtimeQuote(symbols: string[]): Promise<SecurityQuote[]>;
  realtimeDepth(symbols: string[]): Promise<Depth[]>;
  realtimeBrokers(symbols: string[]): Promise<Brokers[]>;
  realtimeTrades(symbols: string[]): Promise<Trade[]>;
  realtimeCandlesticks(symbol: string, period: Period, count: number): Promise<Candlestick[]>;
}

// 配置类型
export interface Config {
  appKey: string;
  appSecret: string;
  accessToken: string;
  httpUrl?: string;
  websocketUrl?: string;
}

// 推送事件类型
export interface PushOrderChanged {
  orderId: string;
  status: OrderStatus;
  stockName: string;
  quantity: Decimal;
  executedQuantity: Decimal;
  price: Decimal;
  executedPrice: Decimal;
  submittedAt: Date;
  updatedAt: Date;
  side: OrderSide;
  symbol: string;
  orderType: OrderType;
  lastDone: Decimal;
  triggerPrice: Decimal;
  msg: string;
  tag: OrderTag;
  timeInForce: TimeInForceType;
  expireDate: NaiveDate;
  triggerAt: Date;
  trailingAmount: Decimal;
  trailingPercent: Decimal;
  limitOffset: Decimal;
  triggerStatus: TriggerStatus;
  currency: string;
  outsideRth: OutsideRTH;
  remark: string;
}

export interface PushQuoteEvent {
  symbol: string;
  lastDone: Decimal;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  volume: number;
  turnover: Decimal;
  timestamp: Date;
}

export interface PushDepthEvent {
  symbol: string;
  asks: DepthItem[];
  bids: DepthItem[];
  timestamp: Date;
}

export interface PushBrokersEvent {
  symbol: string;
  asks: BrokerItem[];
  bids: BrokerItem[];
  timestamp: Date;
}

export interface PushTradesEvent {
  symbol: string;
  trades: Trade[];
  timestamp: Date;
}

export interface PushCandlestickEvent {
  symbol: string;
  period: Period;
  candlestick: Candlestick;
}

// 深度数据相关类型
export interface DepthItem {
  price: Decimal;
  quantity: number;
  orderCount: number;
}

export interface BrokerItem {
  brokerId: number;
  quantity: number;
}

// 执行相关类型
export interface Execution {
  orderId: string;
  symbol: string;
  side: OrderSide;
  executedQuantity: Decimal;
  executedPrice: Decimal;
  executedAt: Date;
  fee: Decimal;
  commission: Decimal;
  currency: string;
}

export interface GetHistoryExecutionsOptions {
  symbol?: string;
  startAt?: Date;
  endAt?: Date;
}

export interface GetTodayExecutionsOptions {
  symbol?: string;
}

// 订单相关类型
export interface ReplaceOrderOptions {
  orderId: string;
  quantity?: number;
  price?: Decimal;
}

export interface SubmitOrderOptions {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  submittedQuantity: Decimal;
  timeInForce: TimeInForceType;
  submittedPrice?: Decimal;
  triggerPrice?: Decimal;
  trailingAmount?: Decimal;
  trailingPercent?: Decimal;
  limitOffset?: Decimal;
  expireDate?: NaiveDate;
  outsideRth?: OutsideRTH;
  remark?: string;
}

export interface OrderDetail extends Order {
  executions: Execution[];
}

export interface EstimateMaxPurchaseQuantityOptions {
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  price?: Decimal;
}

export interface EstimateMaxPurchaseQuantityResponse {
  maxCashBuyQuantity: number;
  maxCashBuyAmount: Decimal;
  maxMarginBuyQuantity: number;
  maxMarginBuyAmount: Decimal;
}

// 资金流相关类型
export interface CashFlow {
  transactionFlowName: string;
  direction: number;
  businessType: number;
  balance: Decimal;
  currency: string;
  businessTime: Date;
  symbol: string;
  description: string;
}

export interface GetCashFlowOptions {
  startAt: Date;
  endAt: Date;
}

// 持仓相关类型
export interface FundPositionsResponse {
  positions: FundPosition[];
}

export interface FundPosition {
  symbol: string;
  currentNetAssetValue: Decimal;
  netAssetValueDay: number;
  symbolName: string;
  currency: string;
  costNetAssetValue: Decimal;
  totalCost: Decimal;
  holdingUnits: Decimal;
}

export interface StockPositionsResponse {
  positions: StockPosition[];
}

export interface StockPosition {
  symbol: string;
  symbolName: string;
  quantity: Decimal;
  availableQuantity: Decimal;
  currency: string;
  costPrice: Decimal;
  costPriceValid: boolean;
  marketValue: Decimal;
  lastPrice: Decimal;
  lastPriceValid: boolean;
  unrealizedPl: Decimal;
  unrealizedPlRatio: Decimal;
  unrealizedPlValid: boolean;
  positionSide: PositionSide;
}

export enum PositionSide {
  Long = 'Long',
  Short = 'Short'
}

// 行情相关类型
export interface QuotePackageDetail {
  packageName: string;
  packageType: string;
  packageDescription: string;
  packagePrice: Decimal;
  packageValidity: number;
  packageStatus: string;
}

export interface StaticInfo {
  symbol: string;
  nameCn: string;
  nameEn: string;
  nameHk: string;
  listingDate: Date;
  exchange: string;
  currency: string;
  lotSize: number;
  totalShares: Decimal;
  circulatingShares: Decimal;
  hkShares: Decimal;
  eps: Decimal;
  epsTtm: Decimal;
  bps: Decimal;
  dividendYield: Decimal;
  stockDerivatives: number[];
  board: string;
}

export interface Depth {
  symbol: string;
  asks: DepthItem[];
  bids: DepthItem[];
  timestamp: Date;
}

export interface Brokers {
  symbol: string;
  asks: BrokerItem[];
  bids: BrokerItem[];
  timestamp: Date;
}

export interface Participants {
  symbol: string;
  participants: Participant[];
  timestamp: Date;
}

export interface Participant {
  brokerId: number;
  brokerName: string;
  position: number;
}

export interface Trade {
  price: Decimal;
  volume: number;
  timestamp: Date;
  tradeType: string;
  direction: number;
}

export interface Intraday {
  symbol: string;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  lastDone: Decimal;
  volume: number;
  turnover: Decimal;
  timestamp: Date;
}

export interface OptionChainInfo {
  symbol: string;
  strikePrice: Decimal;
  expirationDate: Date;
  callOrPut: string;
  contractSize: number;
  openInterest: number;
  impliedVolatility: Decimal;
  premium: Decimal;
  delta: Decimal;
  gamma: Decimal;
  vega: Decimal;
  theta: Decimal;
  rho: Decimal;
}

export interface WarrantIssuer {
  id: number;
  name: string;
}

export interface WarrantInfo {
  symbol: string;
  name: string;
  callOrPut: string;
  exerciseStyle: string;
  issuerId: number;
  lastTradingDate: Date;
  maturityDate: Date;
  strikePrice: Decimal;
  conversionRatio: Decimal;
  lotSize: number;
  lastDone: Decimal;
  premium: Decimal;
  leverageRatio: Decimal;
  impliedVolatility: Decimal;
  effectiveLeverage: Decimal;
  delta: Decimal;
  callPrice: Decimal;
  underlyingSymbol: string;
}

export interface TradingSession {
  market: Market;
  tradeSession: TradeSession;
  beginTime: Date;
  endTime: Date;
}

export enum Market {
  HK = 'HK',
  US = 'US',
  CN = 'CN',
  SG = 'SG'
}

export enum TradeSession {
  PreMarket = 'PreMarket',
  Regular = 'Regular',
  PostMarket = 'PostMarket'
}

export interface CapitalFlow {
  symbol: string;
  capitalIn: Decimal;
  capitalOut: Decimal;
  timestamp: Date;
}

export interface CapitalDistribution {
  symbol: string;
  large: Decimal;
  medium: Decimal;
  small: Decimal;
  timestamp: Date;
}

export interface CalcIndex {
  symbol: string;
  index: string;
  value: Decimal;
  timestamp: Date;
}

export interface WatchlistGroup {
  id: number;
  name: string;
  securities: string[];
}

export interface SecurityInfo {
  symbol: string;
  name: string;
  lotSize: number;
  securityType: string;
  currency: string;
  exchange: string;
}

export enum Language {
  ZH_CN = 'zh_CN',
  ZH_HK = 'zh_HK',
  EN = 'en'
} 