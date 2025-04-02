import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OptionContract } from './models/option.contract.model';
import { OptionOrder } from './models/option.order.model';
import { OptionPosition } from './models/option.position.model';
import config from './config/common';
import { MarketModule } from './modules/market/market.module';
import { UserModule } from './modules/user/user.module';
import { AiModule } from './modules/ai/ai.module';
import { OrderModule } from './modules/order/order.module';
import { SocketModule } from './modules/socket/socket.module';

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
    OrderModule,
    SocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
