import { INTERVAL } from "src/enums/market";

export enum OrderSide {
  SELL = 'SELL',
  BUY = 'BUY',
}

export enum PositionSide {
  BOTH = 'BOTH',
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LOSS = 'STOP_MARKET',
  TAKE_PROFIT = 'TAKE_PROFIT_MARKET',
}

export enum WorkingType {
  MARK_PRICE = 'MARK_PRICE',
  CONTRACT_PRICE = 'CONTRACT_PRICE',
}

export enum StopSetType {
  NONE = 1, // 不设置
  AUTO = 2, // 自动设置
  MANUAL = 3, // 手动设置
}

export interface StopOption {
  stopPrice?: number; // 止损价格
  takeProfitPrice?: number; // 止盈价格
}

export interface OrderDto {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  positionSide?: PositionSide;
  price?: number;
  quantity?: number;
  stopPrice?: string;
  closePosition?: boolean;
  activationPrice?: number;
  recvWindow?: number;
  timestamp?: number;
  timeInForce?: string;
  workingType?: WorkingType;
  priceProtect?: boolean;
  stopOption?: StopOption;
  stopSetType?: StopSetType;
}

export interface CancelOrderDto {
  symbol: string;
  orderId?: number;
  timestamp?: number;
}

export interface AutoCreateOrderDto {
  symbol: string;
  interval: INTERVAL;
  limit?: number;
}

export interface AutoAiOrderDto {
  symbol: string;
  interval: INTERVAL;
  limit?: number;
  winPercent?: number;
  lossRate?: number;
}
