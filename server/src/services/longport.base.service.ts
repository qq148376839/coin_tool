import { TradeContext, QuoteContext, Config } from '../types/longport.types';
import config from '../config/common';

declare const require: any;

export class LongPortBaseService {
  protected tradeContext: TradeContext;
  protected quoteContext: QuoteContext;
  protected longPortConfig: Config;

  constructor() {
    // 初始化配置
    this.longPortConfig = {
      appKey: config().longPort.appKey,
      appSecret: config().longPort.appSecret,
      accessToken: config().longPort.accessToken
    };
  }

  // 初始化交易上下文
  protected async initTradeContext() {
    if (!this.tradeContext) {
      const { TradeContext: TradeContextClass } = require('longport');
      this.tradeContext = await TradeContextClass.new(this.longPortConfig);
    }
    return this.tradeContext;
  }

  // 初始化行情上下文
  protected async initQuoteContext() {
    if (!this.quoteContext) {
      const { QuoteContext: QuoteContextClass } = require('longport');
      this.quoteContext = await QuoteContextClass.new(this.longPortConfig);
    }
    return this.quoteContext;
  }
} 