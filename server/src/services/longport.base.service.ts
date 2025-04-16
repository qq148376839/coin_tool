import { TradeContext, QuoteContext } from 'longport';
import { Injectable } from '@nestjs/common';
import config from '../config/common';

@Injectable()
export class LongPortBaseService {
  protected tradeContext: TradeContext;
  protected quoteContext: QuoteContext;

  constructor() {
    // 初始化配置
    const longPortConfig = {
      appKey: config().longPort.appKey,
      appSecret: config().longPort.appSecret,
      accessToken: config().longPort.accessToken,
      enablePrintQuotePackages: true,
    };

    // 初始化交易上下文
    this.initTradeContext(longPortConfig);
    // 初始化行情上下文
    this.initQuoteContext(longPortConfig);
  }

  // 初始化交易上下文
  protected async initTradeContext(config: any) {
    if (!this.tradeContext) {
      this.tradeContext = await TradeContext.new(config);
    }
    return this.tradeContext;
  }

  // 初始化行情上下文
  protected async initQuoteContext(config: any) {
    if (!this.quoteContext) {
      this.quoteContext = await QuoteContext.new(config);
    }
    return this.quoteContext;
  }
} 