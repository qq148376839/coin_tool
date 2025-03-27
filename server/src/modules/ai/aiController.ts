import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './aiService';
import { MarketService } from '../market/marketService';
// import { INTERVAL } from 'src/enums/market';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly marketService: MarketService,
  ) {}

  // 提问
  @Post('ask')
  async askQuestion(@Body() body: Record<string, string>): Promise<string> {
    try {
      return this.aiService.askQuestion(body.question);
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }
}
