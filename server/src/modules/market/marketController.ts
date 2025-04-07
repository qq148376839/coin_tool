import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { MarketService } from './marketService';
import { KlineDto, PriceDto } from '../../dto/market.dtc';
import { OrderPointParams } from 'src/interfaces/market.inteface';
import { AiService } from '../ai/aiService';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly aiService: AiService,
  ) {}

  @Get('price/:coin')
  async getPrice(@Param('coin') coin: string): Promise<PriceDto> {
    return this.marketService.getPrice(coin);
  }

  // 获取货币的k线
  @Post('kline')
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  async getKline(@Body() klineDto: KlineDto): Promise<any> {
    try {
      return this.marketService.getKline(klineDto);
    } catch (error) {
      console.log(error);
      throw new Error('获取k线失败');
    }
  }

  // 获取k线图的更多信息
  @Post('kline/more')
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  async getKlineMore(@Body() klineDto: KlineDto): Promise<any> {
    return this.marketService.getKlineMore(klineDto);
  }

  // 获取挂单点
  @Post('order/point')
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  async getOrder(@Body() klineDto: KlineDto): Promise<any> {
    const list = await this.marketService.getKline(klineDto);
    if (klineDto.isAi) {
      // 将 Candlestick[] 转换为 AI 服务需要的格式
      const klineData = list.map(candle => ({
        time: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
      const recommendPrice = await this.aiService.getRecommendPrice(JSON.stringify(klineData));
      return recommendPrice;
    }
    return this.marketService.createOrderPoint(list);
  }

  // 检查当前挂单的准确率
  @Post('order/point/check')
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  async checkOrderPoint(@Body() orderPointDto: OrderPointParams): Promise<any> {
    return await this.marketService.checkOrderPoint(orderPointDto);
  }
}
