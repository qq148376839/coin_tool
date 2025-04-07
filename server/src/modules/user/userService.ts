import { Injectable } from '@nestjs/common';
import { LongPortAccountService } from '../../services/longport.account.service';

@Injectable()
export class UserService {
  constructor(private readonly longPortAccountService: LongPortAccountService) {}

  // 获取当前账号信息
  async getUserInfo(): Promise<any> {
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
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }

  // 获取用户合约信息
  async getUserContractNews(): Promise<any> {
    try {
      const marginRatio = await this.longPortAccountService.getMarginRatio();
      return marginRatio;
    } catch (error) {
      console.log(error);
      throw new Error('获取用户合约信息失败');
    }
  }
}
