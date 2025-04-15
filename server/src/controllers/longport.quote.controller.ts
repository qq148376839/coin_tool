import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { LongPortQuoteService } from '../services/longport.quote.service';
import { 
  SecurityQuote, 
  OptionQuote, 
  WarrantQuote, 
  Candlestick,
  SubscribeParams,
  SubType
} from '../types/longport.types';

@Controller('longport/quote')
export class LongPortQuoteController {
  constructor(private readonly quoteService: LongPortQuoteService) {}

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
    @Query('symbol') symbol: string,
    @Query('period') period: string,
    @Query('count') count: number,
    @Query('adjustType') adjustType?: number
  ): Promise<Candlestick[]> {
    return await this.quoteService.getCandles(symbol, period, count, adjustType);
  }

  @Post('subscribe')
  async subscribe(@Body() params: SubscribeParams): Promise<void> {
    return await this.quoteService.subscribe(params.symbols, params.subTypes);
  }

  @Delete('unsubscribe')
  async unsubscribe(@Body() params: { symbols: string[]; subTypes: SubType[] }): Promise<void> {
    return await this.quoteService.unsubscribe(params.symbols, params.subTypes);
  }
} 