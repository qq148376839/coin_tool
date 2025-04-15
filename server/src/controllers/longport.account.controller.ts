import { Controller, Get } from '@nestjs/common';
import { LongPortAccountService } from '../services/longport.account.service';
import { AccountBalance, CashInfo, MarginRatio } from '../types/longport.types';

@Controller('longport/account')
export class LongPortAccountController {
  constructor(private readonly accountService: LongPortAccountService) {}

  @Get('balance')
  async getAccountBalance(): Promise<AccountBalance> {
    return await this.accountService.getAccountBalance();
  }

  @Get('cash-info')
  async getCashInfo(): Promise<CashInfo> {
    return await this.accountService.getCashInfo();
  }

  @Get('margin-ratio')
  async getMarginRatio(): Promise<MarginRatio> {
    return await this.accountService.getMarginRatio();
  }
} 