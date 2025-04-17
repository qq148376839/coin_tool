import {Controller, Get, Post, Delete, Body, Query, BadRequestException} from '@nestjs/common';
import {LongPortQuoteService} from '../services/longport.quote.service';
import {
    SecurityQuote,
    OptionQuote,
    WarrantQuote,
    Candlestick,
    SubscribeParams,
    SubType,

    Period
} from '../types/longport.types';

@Controller('longport/quote')
export class LongPortQuoteController {
    constructor(private readonly quoteService: LongPortQuoteService) {
    }

    @Get('quote')
    async getQuote(@Query('symbols') symbols: string): Promise<SecurityQuote[]> {
        const symbolArray = symbols.split(',');
        return await this.quoteService.getQuote(symbolArray);
    }

    @Get('option-quote')
    async getOptionQuote(@Query('symbols') symbols: string): Promise<OptionQuote[]> {
        const symbolArray = symbols.split(',');
        return await this.quoteService.getOptionQuote(symbolArray);
    }

    @Get('warrant-quote')
    async getWarrantQuote(@Query('symbols') symbols: string): Promise<WarrantQuote[]> {
        const symbolArray = symbols.split(',');
        return await this.quoteService.getWarrantQuote(symbolArray);
    }

    @Get('candles')
    async getCandles(
        @Query('symbol') symbol: string[],
        @Query('period') period: string, // 接收字符串参数
        @Query('count') count: number
    ): Promise<Candlestick[]> {
        // 添加转换逻辑
        const periodEnum = this.convertToPeriodEnum(period);
        return await this.quoteService.getCandles(symbol, periodEnum, count);
    }

    private convertToPeriodEnum(periodStr: string): Period {
        const mapping: Record<string, Period> = {
            '1m': Period.MIN_1,
            '5m': Period.MIN_5,
            '15m': Period.MIN_15,
            '30m': Period.MIN_30,
            '60m': Period.MIN_60,
            '1d': Period.DAY,
            '1w': Period.WEEK,
            '1M': Period.MONTH,
            '1y': Period.YEAR
        };

        const period = mapping[periodStr];
        if (!period) {
            throw new BadRequestException(`Invalid period value. Valid values are: ${Object.keys(mapping).join(', ')}`);
        }
        return period;
    }

    @Post('subscribe')
    async subscribe(@Body() params: { symbols: string[]; subTypes: SubType[]; isFirstPush?: boolean }): Promise<void> {
        return await this.quoteService.subscribe(
            params.symbols, 
            params.subTypes, 
            params.isFirstPush ?? true
        );
    }

    @Delete('unsubscribe')
    async unsubscribe(@Body() params: { symbols: string[]; subTypes: SubType[] }): Promise<void> {
        return await this.quoteService.unsubscribe(params.symbols, params.subTypes);
    }
} 