import { Controller, Get } from '@nestjs/common';
import { UserService } from './userService';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  async getUserInfo() {
    return await this.userService.getUserInfo();
  }

  @Get('contract-news')
  async getUserContractNews() {
    return await this.userService.getUserContractNews();
  }
}
