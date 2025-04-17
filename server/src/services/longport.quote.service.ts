import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
    QuoteContext,
    SecurityQuote as LongPortQuote,
    OptionQuote as LongPortOptionQuote,
    WarrantQuote as LongPortWarrantQuote,
    Candlestick as LongPortCandlestick
} from '../types/longport.types';
import {
    SecurityQuote,
    OptionQuote,
    WarrantQuote,
    Candlestick,
    SubType,
    Period,
    PushQuote,
    Subscription
} from '@/types/longport.types';
import {LongPortBaseService} from './longport.base.service';
import {ApiError, ErrorCode, handleError, logError} from '../utils/error-handler';

/**
 * 长桥行情服务
 * 提供股票、期权、权证等金融产品的实时行情数据服务
 * 支持实时行情查询、K线数据获取、行情订阅等功能
 */
@Injectable()
export class LongPortQuoteService extends LongPortBaseService {
    private readonly logger = new Logger(LongPortQuoteService.name);
    protected quoteContext: QuoteContext;
    private subscriptions: Map<string, Subscription> = new Map();
    private pushCallbacks: ((quote: PushQuote) => void)[] = [];

    /**
     * 构造函数
     * 初始化长桥行情服务，配置必要的认证信息
     * @param configService 配置服务，用于获取长桥API的认证信息
     */
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
     * 通过长桥API获取指定股票的实时行情数据
     * @param symbols 股票代码列表，支持多个股票同时查询
     * @returns 返回行情数据数组，包含每个股票的最新价格、成交量等信息
     * @throws 当API调用失败时抛出错误
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
     * 通过长桥API获取指定期权的实时行情数据
     * @param symbols 期权代码列表，支持多个期权同时查询
     * @returns 返回期权行情数据数组，包含每个期权的最新价格、行权价等信息
     * @throws 当API调用失败时抛出错误
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
     * 通过长桥API获取指定权证的实时行情数据
     * @param symbols 权证代码列表，支持多个权证同时查询
     * @returns 返回权证行情数据数组，包含每个权证的最新价格、行权价等信息
     * @throws 当API调用失败时抛出错误
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
     * 通过长桥API获取指定股票的K线数据
     * @param symbol 股票代码
     * @param period K线周期，支持1分钟、5分钟、15分钟、30分钟、60分钟、日线、周线、月线、年线
     * @param count 获取的K线数量
     * @param adjustType 复权类型，可选参数
     * @returns 返回K线数据数组，包含每个时间点的开盘价、最高价、最低价、收盘价等信息
     * @throws 当API调用失败时抛出错误
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
     * 订阅指定股票的实时行情数据
     * @param symbols 股票代码列表
     * @param subTypes 订阅类型列表，支持行情、深度、经纪商、成交等类型
     * @throws 当API调用失败时抛出错误
     */
    async subscribe(symbols: string[], subTypes: SubType[]): Promise<void> {
        try {
            const quoteCtx = await this.initQuoteContext();
            await quoteCtx.subscribe(symbols, subTypes, true);

            // 使用轮询方式获取最新行情
            const checkQuotes = async () => {
                const quotes = await this.getQuote(symbols);
                quotes.forEach(quote => {
                    this.pushCallbacks.forEach(callback => callback(quote));
                });
            };

            // 每1秒获取一次最新行情
            const interval = setInterval(checkQuotes, 1000);

            symbols.forEach(symbol => {
                this.subscriptions.set(symbol, {
                    onQuote: (callback) => {
                        this.pushCallbacks.push(callback);
                    },
                    unsubscribe: () => {
                        this.unsubscribe([symbol], subTypes);
                        clearInterval(interval);
                    }
                });
            });
        } catch (error) {
            logError(error, 'LongPortQuoteService.subscribe');
            throw handleError(error);
        }
    }

    /**
     * 取消订阅
     * 取消指定股票的行情订阅
     * @param symbols 股票代码列表
     * @param subTypes 订阅类型列表
     * @throws 当API调用失败时抛出错误
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
     * 注册一个回调函数，当收到行情推送时会被调用
     * @param callback 回调函数，接收一个PushQuote类型的参数
     */
    onPush(callback: (quote: PushQuote) => void): void {
        this.pushCallbacks.push(callback);
    }

    /**
     * 移除行情推送回调
     * 移除之前注册的行情推送回调函数
     * @param callback 要移除的回调函数
     */
    offPush(callback: (quote: PushQuote) => void): void {
        const index = this.pushCallbacks.indexOf(callback);
        if (index !== -1) {
            this.pushCallbacks.splice(index, 1);
        }
    }
} 