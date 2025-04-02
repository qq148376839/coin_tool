import { Config, TradeContext, QuoteContext } from 'longport';
import { Injectable } from '@nestjs/common';
import config from '../config/common';

@Injectable()
export class LongPortBaseService {
  protected config: Config;
  protected tradeContext: TradeContext;
  protected quoteContext: QuoteContext;

  constructor() {
    // 初始化配置
    this.config = new Config({
      appKey: config.longPort.appKey,
      appSecret: config.longPort.appSecret,
      accessToken: config.longPort.accessToken
    });
  }

  // 初始化交易上下文
  protected async initTradeContext() {
    if (!this.tradeContext) {
      this.tradeContext = await TradeContext.new(this.config);
    }
    return this.tradeContext;
  }

  // 初始化行情上下文
  protected async initQuoteContext() {
    if (!this.quoteContext) {
      this.quoteContext = await QuoteContext.new(this.config);
    }
    return this.quoteContext;
  }
} 