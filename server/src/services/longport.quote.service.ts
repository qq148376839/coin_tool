import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { 
  SubType,
  PushQuote,
  Subscription,
  SecurityQuote,
  OptionQuote,
  WarrantQuote,
  Period,
  Candlestick
} from 'longport';
import { ApiError, ErrorCode, handleError, logError } from '../utils/error-handler';

@Injectable()
export class LongPortQuoteService extends LongPortBaseService {
  private subscriptions: Map<string, Subscription> = new Map();
  private pushCallbacks: ((quote: PushQuote) => void)[] = [];

  // 获取实时报价
  async getQuote(symbols: string[]): Promise<SecurityQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      return await quoteCtx.quote(symbols);
    } catch (error) {
      logError(error, 'LongPortQuoteService.getQuote');
      throw handleError(error);
    }
  }

  // 获取期权报价
  async getOptionQuote(symbols: string[]): Promise<OptionQuote[]> {
    const quoteCtx = await this.initQuoteContext();
    return await quoteCtx.optionQuote(symbols);
  }

  // 获取轮证报价
  async getWarrantQuote(symbols: string[]): Promise<WarrantQuote[]> {
    const quoteCtx = await this.initQuoteContext();
    return await quoteCtx.warrantQuote(symbols);
  }

  // 添加推送回调
  onPushQuote(callback: (quote: PushQuote) => void) {
    this.pushCallbacks.push(callback);
  }

  // 订阅行情
  async subscribe(symbols: string[], subTypes: SubType[]): Promise<void> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const subscription = await quoteCtx.subscribe(symbols, subTypes);
      
      subscription.onQuote((quote: PushQuote) => {
        this.pushCallbacks.forEach(callback => {
          try {
            callback(quote);
          } catch (error) {
            logError(error, 'LongPortQuoteService.onQuote');
          }
        });
      });
      
      symbols.forEach(symbol => {
        this.subscriptions.set(symbol, subscription);
      });
    } catch (error) {
      logError(error, 'LongPortQuoteService.subscribe');
      throw handleError(error);
    }
  }

  // 获取K线数据
  async getCandles(
    symbol: string,
    period: Period,
    count: number,
    adjustType?: number
  ): Promise<Candlestick[]> {
    const quoteCtx = await this.initQuoteContext();
    return await quoteCtx.candlesticks(symbol, period, count, adjustType);
  }

  // 取消订阅
  async unsubscribe(symbols: string[]): Promise<void> {
    const quoteCtx = await this.initQuoteContext();
    await quoteCtx.unsubscribe(symbols);
    
    // 清理订阅信息
    symbols.forEach(symbol => {
      this.subscriptions.delete(symbol);
    });
  }
} 