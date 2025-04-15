import { Injectable } from '@nestjs/common';
import { LongPortAccountService } from '../../services/longport.account.service';
import { AccountBalance, CashInfo, MarginRatio } from '../../types/longport.types';

@Injectable()
export class UserService {
  constructor(private readonly longPortAccountService: LongPortAccountService) {}

  // 获取当前账号信息
  async getUserInfo(): Promise<{
    balance: AccountBalance;
    cashInfo: CashInfo;
  }> {
    try {
      const [balance, cashInfo] = await Promise.all([
        this.longPortAccountService.getAccountBalance(),
        this.longPortAccountService.getCashInfo()
      ]);
      
      return {
        balance,
        cashInfo
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
  }

  // 获取用户合约信息
  async getUserContractNews(): Promise<MarginRatio> {
    try {
      return await this.longPortAccountService.getMarginRatio();
    } catch (error) {
      console.error('获取用户合约信息失败:', error);
      throw new Error('获取用户合约信息失败');
    }
  }
}
