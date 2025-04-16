import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './userService';
import { MarginRatio } from './margin-ratio.entity';

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
