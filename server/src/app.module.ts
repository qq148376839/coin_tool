import { Module } from '@nestjs/common';
import { MarketModule } from './modules/market/market.module';
import { UserModule } from './modules/user/user.module';
import { AiModule } from './modules/ai/ai.module';
import { OrderModule } from './modules/order/order.module';
import { SocketModule } from './modules/socket/socket.module';
// import { SequelizeModule } from '@nestjs/sequelize';
// import config from './config/common';

@Module({
  imports: [
    MarketModule,
    UserModule,
    AiModule,
    OrderModule,
    SocketModule,
    // SequelizeModule.forRoot(config.sequelizeConfig),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
