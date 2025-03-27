import { Module } from '@nestjs/common';
import { UserController } from './userController';
import { UserService } from './userService';
import { HttpModule } from '@nestjs/axios';
import { MarketService } from '../market/marketService';

@Module({
  imports: [HttpModule],
  controllers: [UserController],
  providers: [UserService, MarketService],
})
export class UserModule {}
