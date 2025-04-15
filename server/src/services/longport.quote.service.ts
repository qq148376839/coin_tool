import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuoteContext, SecurityQuote as LongPortQuote, OptionQuote as LongPortOptionQuote, WarrantQuote as LongPortWarrantQuote, Candlestick as LongPortCandlestick } from 'longport';
import { SecurityQuote, OptionQuote, WarrantQuote, Candlestick, SubType, Period, PushQuote, Subscription } from '../../types/longport.types';
import { LongPortBaseService } from './longport.base.service';
import { ApiError, ErrorCode, handleError, logError } from '../utils/error-handler';

@Injectable()
export class LongPortQuoteService extends LongPortBaseService {
  private readonly logger = new Logger(LongPortQuoteService.name);
  protected quoteContext: QuoteContext;
  private subscriptions: Map<string, Subscription> = new Map();
  private pushCallbacks: ((quote: PushQuote) => void)[] = [];

  constructor(private configService: ConfigService) {
    super();
    const appKey = this.configService.get<string>('LONGPORT_APP_KEY');
    const appSecret = this.configService.get<string>('LONGPORT_APP_SECRET');
    const accessToken = this.configService.get<string>('LONGPORT_ACCESS_TOKEN');

    if (!appKey || !appSecret || !accessToken) {
      throw new Error('LongPort credentials not configured');
    }

    this.quoteContext = new QuoteContext({
      appKey,
      appSecret,
      accessToken,
    });
  }

  // 获取实时报价
  async getQuote(symbols: string[]): Promise<SecurityQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.quote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: quote.lastPrice.toNumber(),
        openPrice: quote.openPrice.toNumber(),
        highPrice: quote.highPrice.toNumber(),
        lowPrice: quote.lowPrice.toNumber(),
        volume: quote.volume.toNumber(),
        turnover: quote.turnover.toNumber(),
        timestamp: quote.timestamp.getTime()
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getQuote');
      throw handleError(error);
    }
  }

  // 获取期权报价
  async getOptionQuote(symbols: string[]): Promise<OptionQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.optionQuote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: quote.lastPrice.toNumber(),
        openPrice: quote.openPrice.toNumber(),
        highPrice: quote.highPrice.toNumber(),
        lowPrice: quote.lowPrice.toNumber(),
        volume: quote.volume.toNumber(),
        turnover: quote.turnover.toNumber(),
        timestamp: quote.timestamp.getTime(),
        strikePrice: quote.strikePrice.toNumber(),
        expirationDate: quote.expirationDate,
        optionType: quote.optionType
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getOptionQuote');
      throw handleError(error);
    }
  }

  // 获取权证报价
  async getWarrantQuote(symbols: string[]): Promise<WarrantQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.warrantQuote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: quote.lastPrice.toNumber(),
        openPrice: quote.openPrice.toNumber(),
        highPrice: quote.highPrice.toNumber(),
        lowPrice: quote.lowPrice.toNumber(),
        volume: quote.volume.toNumber(),
        turnover: quote.turnover.toNumber(),
        timestamp: quote.timestamp.getTime(),
        strikePrice: quote.strikePrice.toNumber(),
        expirationDate: quote.expirationDate
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getWarrantQuote');
      throw handleError(error);
    }
  }

  // 获取K线数据
  async getCandles(symbol: string, period: Period, count: number, adjustType?: number): Promise<Candlestick[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const candles = await quoteCtx.candles(symbol, period, count, adjustType);
      return candles.map(candle => ({
        timestamp: candle.timestamp.getTime(),
        open: candle.open.toNumber(),
        high: candle.high.toNumber(),
        low: candle.low.toNumber(),
        close: candle.close.toNumber(),
        volume: candle.volume.toNumber(),
        turnover: candle.turnover.toNumber()
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getCandles');
      throw handleError(error);
    }
  }

  // 订阅行情
  async subscribe(symbols: string[], subTypes: SubType[]): Promise<void> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const subscription = await quoteCtx.subscribe(symbols, subTypes, true);
      
      subscription.onQuote((quote: PushQuote) => {
        this.pushCallbacks.forEach(callback => callback(quote));
      });

      symbols.forEach(symbol => {
        this.subscriptions.set(symbol, subscription);
      });
    } catch (error) {
      logError(error, 'LongPortQuoteService.subscribe');
      throw handleError(error);
    }
  }

  // 取消订阅
  async unsubscribe(symbols: string[], subTypes: SubType[]): Promise<void> {
    try {
      const quoteCtx = await this.initQuoteContext();
      await quoteCtx.unsubscribe(symbols, subTypes);
      
      symbols.forEach(symbol => {
        this.subscriptions.delete(symbol);
      });
    } catch (error) {
      logError(error, 'LongPortQuoteService.unsubscribe');
      throw handleError(error);
    }
  }

  // 添加行情推送回调
  onPush(callback: (quote: PushQuote) => void): void {
    this.pushCallbacks.push(callback);
  }

  // 移除行情推送回调
  offPush(callback: (quote: PushQuote) => void): void {
    const index = this.pushCallbacks.indexOf(callback);
    if (index !== -1) {
      this.pushCallbacks.splice(index, 1);
    }
  }
} 