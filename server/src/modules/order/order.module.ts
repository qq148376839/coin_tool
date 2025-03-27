import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HttpModule } from '@nestjs/axios';
import { UserService } from '../user/userService';
import { MarketService } from '../market/marketService';
import { AiService } from '../ai/aiService';
@Module({
  imports: [HttpModule],
  controllers: [OrderController],
  providers: [OrderService, UserService, MarketService, AiService],
})
export class OrderModule {}
