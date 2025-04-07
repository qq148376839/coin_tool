import { Controller, Get, Post, Body, Query, Delete } from '@nestjs/common';
import { LongPortQuoteService } from '../services/longport.quote.service';
import { SubType, Period } from 'longport';

@Controller('longport/quote')
export class LongPortQuoteController {
  constructor(private readonly quoteService: LongPortQuoteService) {}

  @Get('quote')
  async getQuote(@Query('symbols') symbols: string) {
    const symbolArray = symbols.split(',');
    return await this.quoteService.getQuote(symbolArray);
  }

  @Get('option-quote')
  async getOptionQuote(@Query('symbols') symbols: string) {
    const symbolArray = symbols.split(',');
    return await this.quoteService.getOptionQuote(symbolArray);
  }

  @Get('candles')
  async getCandles(
    @Query('symbol') symbol: string,
    @Query('period') period: Period,
    @Query('count') count: number,
    @Query('adjustType') adjustType?: number
  ) {
    return await this.quoteService.getCandles(symbol, period, count, adjustType);
  }

  @Post('subscribe')
  async subscribe(
    @Body() body: { symbols: string[], subTypes: SubType[] }
  ) {
    return await this.quoteService.subscribe(body.symbols, body.subTypes);
  }

  @Delete('unsubscribe')
  async unsubscribe(@Body() body: { symbols: string[] }) {
    return await this.quoteService.unsubscribe(body.symbols);
  }
} 