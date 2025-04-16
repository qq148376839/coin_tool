import { TradeContext, QuoteContext } from 'longport';
import { Injectable } from '@nestjs/common';
import config from '../config/common';

@Injectable()
export class LongPortBaseService {
  protected tradeContext: TradeContext;
  protected quoteContext: QuoteContext;
  protected longPortConfig: any;

  constructor() {
    // 初始化配置
    this.longPortConfig = {
      appKey: config().longPort.appKey,
      appSecret: config().longPort.appSecret,
      accessToken: config().longPort.accessToken,
      enablePrintQuotePackages: true,
    };

    // 初始化交易上下文
    this.tradeContext = new TradeContext();
    this.tradeContext.setConfig(this.longPortConfig);

    // 初始化行情上下文
    this.quoteContext = new QuoteContext();
    this.quoteContext.setConfig(this.longPortConfig);
  }

  // 初始化交易上下文
  protected async initTradeContext() {
    return this.tradeContext;
  }

  // 初始化行情上下文
  protected async initQuoteContext() {
    return this.quoteContext;
  }
} 