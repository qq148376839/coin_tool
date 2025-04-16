import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OptionContract } from './models/option.contract.model';
import { OptionOrder } from './models/option.order.model';
import { OptionPosition } from './models/option.position.model';
import config from './config/common';
import { MarketModule } from './modules/market/market.module';
import { UserModule } from './modules/user/user.module';
import { AiModule } from './modules/ai/ai.module';
import { SocketModule } from './modules/socket/socket.module';
import { LongPortBaseService } from './services/longport.base.service';
import { LongPortAccountService } from './services/longport.account.service';
import { LongPortOrderService } from './services/longport.order.service';
import { LongPortQuoteService } from './services/longport.quote.service';
import { LongPortAccountController } from './controllers/longport.account.controller';
import { LongPortQuoteController } from './controllers/longport.quote.controller';
import { LongPortGateway } from './gateways/longport.gateway';

@Module({
  imports: [
    SequelizeModule.forRoot({
      ...config().sequelizeConfig,
      models: [OptionContract, OptionOrder, OptionPosition],
    }),
    SequelizeModule.forFeature([OptionContract, OptionOrder, OptionPosition]),
    MarketModule,
    UserModule,
    AiModule,
    SocketModule,
  ],
  controllers: [
    LongPortAccountController,
    LongPortQuoteController,
  ],
  providers: [
    LongPortBaseService,
    LongPortAccountService,
    LongPortOrderService,
    LongPortQuoteService,
    LongPortGateway,
  ],
})
export class AppModule {}
