import { Module } from '@nestjs/common';
import { AiController } from './aiController';
import { AiService } from './aiService';
import { HttpModule } from '@nestjs/axios';
import { MarketService } from '../market/marketService';
@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [AiService, MarketService],
})
export class AiModule {}
