import { Controller, Get } from '@nestjs/common';
import { LongPortAccountService } from '../services/longport.account.service';

@Controller('longport/account')
export class LongPortAccountController {
  constructor(private readonly accountService: LongPortAccountService) {}

  @Get('balance')
  async getAccountBalance() {
    return await this.accountService.getAccountBalance();
  }

  @Get('cash-info')
  async getCashInfo() {
    return await this.accountService.getCashInfo();
  }

  @Get('margin-ratio')
  async getMarginRatio() {
    return await this.accountService.getMarginRatio();
  }
} 