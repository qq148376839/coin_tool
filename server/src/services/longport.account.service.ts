import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { AccountBalance, CashInfo, MarginRatio } from '../../types/longport.types';

@Injectable()
export class LongPortAccountService extends LongPortBaseService {
  // 获取账户余额
  async getAccountBalance(): Promise<AccountBalance> {
    const tradeCtx = await this.initTradeContext();
    const balance = await tradeCtx.accountBalance();
    return {
      totalCash: balance.totalCash.toNumber(),
      availableCash: balance.availableCash.toNumber(),
      frozenCash: balance.frozenCash.toNumber(),
      currency: balance.currency,
      maxFinanceAmount: balance.maxFinanceAmount.toNumber(),
      remainingFinanceAmount: balance.remainingFinanceAmount.toNumber(),
      marginRatio: balance.marginRatio.toNumber(),
      maintenanceMarginRatio: balance.maintenanceMarginRatio.toNumber(),
      initialMarginRatio: balance.initialMarginRatio.toNumber(),
      toJSON: () => balance.toJSON()
    };
  }

  // 获取现金信息
  async getCashInfo(): Promise<CashInfo> {
    const tradeCtx = await this.initTradeContext();
    const cashInfo = await tradeCtx.cashInfo();
    return {
      availableCash: cashInfo.availableCash.toNumber(),
      frozenCash: cashInfo.frozenCash.toNumber(),
      currency: cashInfo.currency
    };
  }

  // 获取保证金比率
  async getMarginRatio(symbol: string): Promise<MarginRatio> {
    const tradeCtx = await this.initTradeContext();
    const marginRatio = await tradeCtx.marginRatio(symbol);
    return {
      initialMarginRatio: marginRatio.initialMarginRatio.toNumber(),
      maintenanceMarginRatio: marginRatio.maintenanceMarginRatio.toNumber(),
      currency: marginRatio.currency
    };
  }
} 