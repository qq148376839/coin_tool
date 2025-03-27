import { INTERVAL } from 'src/enums/market';

export class PriceDto {
  symbol: string;
  price: string;
}

export enum KlineChangeType {
  IS_RISE = 1,
  IS_FALL = 2,
  IS_CONTINUE = 3,
}

export interface OrderPointParams {
  symbol: string; // 货币类型
  interval: INTERVAL; // 测试周期
  limit: number; // 测试数据条数
  startTime: number; // 测试开始时间
  endTime?: number; // 测试结束时间
  bufferPercent?: number; // 缓冲百分比
  winPercent?: number; // 止益百分比
  lossRate?: number; // 止益倍率
  judgeLength?: number; // 滑动长度
  factorObj?: {
    judgeLength: number;
    bufferPercent: number;
    winPercent: number;
    lossRate: number;
    tip?: number;
  };
}

export interface PointOrder {
  long: {
    price: number;
    winPrice: number;
    failPrice: number;
  };
  short: {
    price: number;
    winPrice: number;
    failPrice: number;
  };
}
