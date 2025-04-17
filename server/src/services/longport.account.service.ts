import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { AccountBalance, CashInfo, MarginRatio } from '@/types/longport.types';

/**
 * 长桥账户服务
 * 提供账户相关的功能，包括余额查询、现金信息查询、保证金比例查询等
 */
@Injectable()
export class LongPortAccountService extends LongPortBaseService {
  /**
   * 获取账户余额
   * 查询当前账户的总现金、可用现金、冻结现金等信息
   * @returns 返回账户余额信息数组
   */
  async getAccountBalance(): Promise<AccountBalance[]> {
    const tradeCtx = await this.initTradeContext();
    const balances = await tradeCtx.accountBalance();
    return balances.map(balance => ({
      totalCash: balance.totalCash,
      availableCash: balance.availableCash,
      frozenCash: balance.frozenCash,
      currency: balance.currency,
      maxFinanceAmount: balance.maxFinanceAmount,
      remainingFinanceAmount: balance.remainingFinanceAmount,
      riskLevel: balance.riskLevel,
      marginCall: balance.marginCall,
      cashInfos: balance.cashInfos.map(info => ({
        withdrawCash: info.withdrawCash,
        availableCash: info.availableCash,
        frozenCash: info.frozenCash,
        settlingCash: info.settlingCash,
        currency: info.currency
      })),
      netAssets: balance.netAssets,
      initMargin: balance.initMargin,
      maintenanceMargin: balance.maintenanceMargin,
      buyPower: balance.buyPower
    }));
  }

  /**
   * 获取现金信息
   * 查询当前账户的可用现金和冻结现金信息
   * @returns 返回现金信息
   */
  async getCashInfo(): Promise<CashInfo> {
    const tradeCtx = await this.initTradeContext();
    const balances = await tradeCtx.accountBalance();
    // 使用第一个账户的现金信息
    const balance = balances[0];
    // 使用 cashInfos 数组中的第一个元素
    const cashInfo = balance.cashInfos[0];
    return {
      withdrawCash: cashInfo.withdrawCash.toNumber(),
      availableCash: cashInfo.availableCash.toNumber(),
      frozenCash: cashInfo.frozenCash.toNumber(),
      settlingCash: cashInfo.settlingCash.toNumber(),
      currency: cashInfo.currency
    };
  }

  /**
   * 获取保证金比率
   * 查询指定股票的保证金比例信息
   * @param symbol 股票代码，例如 "700.HK"
   * @returns 返回保证金比例信息，包括初始保证金比例、维持保证金比例等
   */
  async getMarginRatio(symbol: string): Promise<MarginRatio> {
    const tradeCtx = await this.initTradeContext();
    const marginRatio = await tradeCtx.marginRatio(symbol);
    return {
      imFactor: marginRatio.imFactor.toNumber(),
      mmFactor: marginRatio.mmFactor.toNumber(),
      fmFactor: marginRatio.fmFactor.toNumber()
    };
  }
} 