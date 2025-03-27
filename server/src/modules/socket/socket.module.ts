import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { MarketModule } from '../market/market.module';

@Module({
  imports: [MarketModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class SocketModule {}
