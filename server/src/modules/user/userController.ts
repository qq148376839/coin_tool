import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './userService';
import { PriceDto } from '../../dto/market.dtc';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUserInfo')
  // 设置请求头
  async getPrice(): Promise<PriceDto> {
    try {
      return this.userService.getUserInfo();
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }
  @Get('getUserContractNews')
  async getUserContractNews(@Query() params: any): Promise<PriceDto> {
    try {
      return this.userService.getUserContractNews(params);
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }
}
