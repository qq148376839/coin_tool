import { Module } from '@nestjs/common';
import { MarketController } from './marketController';
import { MarketService } from './marketService';
import { HttpModule } from '@nestjs/axios';
// import { CostRecord } from '../../model/orderCnfig.model';
// import { SequelizeModule } from '@nestjs/sequelize';
import { AiService } from '../ai/aiService';
@Module({
  // imports: [HttpModule, SequelizeModule.forFeature([CostRecord])],
  imports: [HttpModule],
  controllers: [MarketController],
  providers: [MarketService, AiService],
  exports: [MarketService],
})
export class MarketModule {}
