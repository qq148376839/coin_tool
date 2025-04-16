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

    // 初始化行情上下文
    this.quoteContext = new QuoteContext();
    this.quoteContext.setConfig({
      appKey,
      appSecret,
      accessToken,
    });
  }

  /**
   * 获取实时行情数据
   * @param symbols 股票代码列表
   * @returns 返回行情数据数组
   */
  async getQuote(symbols: string[]): Promise<SecurityQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.quote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: Number(quote.lastPrice),
        openPrice: Number(quote.openPrice),
        highPrice: Number(quote.highPrice),
        lowPrice: Number(quote.lowPrice),
        volume: Number(quote.volume),
        turnover: Number(quote.turnover),
        timestamp: quote.timestamp.getTime()
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getQuote');
      throw handleError(error);
    }
  }

  /**
   * 获取期权行情数据
   * @param symbols 期权代码列表
   * @returns 返回期权行情数据数组
   */
  async getOptionQuote(symbols: string[]): Promise<OptionQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.optionQuote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: Number(quote.lastPrice),
        openPrice: Number(quote.openPrice),
        highPrice: Number(quote.highPrice),
        lowPrice: Number(quote.lowPrice),
        volume: Number(quote.volume),
        turnover: Number(quote.turnover),
        timestamp: quote.timestamp.getTime(),
        strikePrice: Number(quote.strikePrice),
        expirationDate: quote.expirationDate,
        optionType: quote.optionType
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getOptionQuote');
      throw handleError(error);
    }
  }

  /**
   * 获取权证行情数据
   * @param symbols 权证代码列表
   * @returns 返回权证行情数据数组
   */
  async getWarrantQuote(symbols: string[]): Promise<WarrantQuote[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const quotes = await quoteCtx.warrantQuote(symbols);
      return quotes.map(quote => ({
        symbol: quote.symbol,
        lastPrice: Number(quote.lastPrice),
        openPrice: Number(quote.openPrice),
        highPrice: Number(quote.highPrice),
        lowPrice: Number(quote.lowPrice),
        volume: Number(quote.volume),
        turnover: Number(quote.turnover),
        timestamp: quote.timestamp.getTime(),
        strikePrice: Number(quote.strikePrice),
        expirationDate: quote.expirationDate
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getWarrantQuote');
      throw handleError(error);
    }
  }

  /**
   * 获取K线数据
   * @param symbol 股票代码
   * @param period K线周期
   * @param count 获取数量
   * @param adjustType 复权类型
   * @returns 返回K线数据数组
   */
  async getCandles(symbol: string, period: Period, count: number, adjustType?: number): Promise<Candlestick[]> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const candles = await quoteCtx.candlestick(symbol, period, count, adjustType);
      return candles.map(candle => ({
        timestamp: candle.timestamp.getTime(),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
        turnover: Number(candle.turnover)
      }));
    } catch (error) {
      logError(error, 'LongPortQuoteService.getCandles');
      throw handleError(error);
    }
  }

  /**
   * 订阅行情
   * @param symbols 股票代码列表
   * @param subTypes 订阅类型列表
   */
  async subscribe(symbols: string[], subTypes: SubType[]): Promise<void> {
    try {
      const quoteCtx = await this.initQuoteContext();
      const subscription = await quoteCtx.subscribe(symbols, subTypes, true);
      
      subscription.on('quote', (quote: PushQuote) => {
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

  /**
   * 取消订阅
   * @param symbols 股票代码列表
   * @param subTypes 订阅类型列表
   */
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

  /**
   * 添加行情推送回调
   * @param callback 回调函数
   */
  onPush(callback: (quote: PushQuote) => void): void {
    this.pushCallbacks.push(callback);
  }

  /**
   * 移除行情推送回调
   * @param callback 回调函数
   */
  offPush(callback: (quote: PushQuote) => void): void {
    const index = this.pushCallbacks.indexOf(callback);
    if (index !== -1) {
      this.pushCallbacks.splice(index, 1);
    }
  }
} 