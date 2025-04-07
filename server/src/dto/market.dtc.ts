import { INTERVAL_LIST } from '../enums/market';

export class PriceDto {
  symbol: string;
  price: string;  // 使用字符串类型，因为 lastDone 是 Decimal 类型
}

// k线获取
// interval 只能是 INTERVAL_LIST 中的值
export class KlineDto {
  symbol: string;
  interval: string;
  startTime?: number;
  endTime?: number;
  timeZone?: string; // 时区 默认是0
  limit?: number; // 默认是500, 最大是1000
  isSimple?: boolean; // 是否是简单k线图, 默认是false
  isAi?: boolean; // 是否是ai分析, 默认是false
}
