import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { AccountBalance, CashInfo, MarginRatio } from 'longport';

@Injectable()
export class LongPortAccountService extends LongPortBaseService {
  // 获取账户余额
  async getAccountBalance(): Promise<AccountBalance> {
    const tradeCtx = await this.initTradeContext();
    return await tradeCtx.accountBalance();
  }

  // 获取现金信息
  async getCashInfo(): Promise<CashInfo> {
    const tradeCtx = await this.initTradeContext();
    return await tradeCtx.cashInfo();
  }

  // 获取保证金比率
  async getMarginRatio(): Promise<MarginRatio> {
    const tradeCtx = await this.initTradeContext();
    return await tradeCtx.marginRatio();
  }
} 