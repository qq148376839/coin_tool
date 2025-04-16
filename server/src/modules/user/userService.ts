import { Injectable } from '@nestjs/common';
import { LongPortAccountService } from '../../services/longport.account.service';
import { AccountBalance, CashInfo, MarginRatio } from '../../types/longport.types';

@Injectable()
export class UserService {
  constructor(private readonly longPortAccountService: LongPortAccountService) {}

  /**
   * 获取当前账号信息
   * @returns 返回账户余额和现金信息
   */
  async getUserInfo(): Promise<{
    balance: AccountBalance[];
    cashInfo: CashInfo;
  }> {
    try {
      const [balances, cashInfo] = await Promise.all([
        this.longPortAccountService.getAccountBalance(),
        this.longPortAccountService.getCashInfo()
      ]);
      
      return {
        balance: balances,
        cashInfo
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
  }

  /**
   * 获取用户合约信息
   * @param symbol 股票代码，例如 "700.HK"
   * @returns 返回保证金比例信息
   */
  async getUserContractNews(symbol: string): Promise<MarginRatio> {
    try {
      if (!symbol) {
        throw new Error('股票代码不能为空');
      }
      return await this.longPortAccountService.getMarginRatio(symbol);
    } catch (error) {
      console.error('获取用户合约信息失败:', error);
      throw new Error('获取用户合约信息失败');
    }
  }
}
