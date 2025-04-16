import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { MarginRatio } from '@/types/longport.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async getUserInfo() {
    return await this.userService.getUserInfo();
  }

  @Get('contract/:symbol')
  async getUserContractNews(@Param('symbol') symbol: string): Promise<MarginRatio> {
    return await this.userService.getUserContractNews(symbol);
  }
}
