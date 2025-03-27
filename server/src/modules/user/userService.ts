import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createSign } from '../../utils/createSign';
import { USE_URLBASE, USE_CONTRACT_URLBASE } from '../../enums/public';
import config from '../../config/common';
import { MarketService } from '../market/marketService';
const USER_KEY = config.binance.apiKey;
@Injectable()
export class UserService {
  constructor(
    // private readonly orderService: OrderService,
    private readonly httpService: HttpService,
    private readonly marketService: MarketService,
  ) {}
  // 获取当前账号信息
  async getUserInfo(): Promise<any> {
    const params: any = {
      omitZeroBalances: true,
      timestamp: new Date().getTime(),
    };
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const res = await this.httpService.axiosRef.get(
        USE_URLBASE + `/api/v3/account`,
        {
          params,
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }

  // 获取当前合约账号信息
  async getUserContractNews(query: any): Promise<any> {
    const params: any = {
      timestamp: new Date().getTime(),
    };
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const [res] = await Promise.all([
        this.httpService.axiosRef.get(
          USE_CONTRACT_URLBASE + `/fapi/v2/account`,
          {
            params,
          },
        ),
        // this.orderService.getCurrentOrders(),
      ]);
      const { totalMarginBalance, availableBalance, positions } = res.data;
      const positionList = positions.filter((item: any) => +item.initialMargin);
      const symbolList = positionList.map((item: any) => item.symbol);
      if (query.symbol && !symbolList.includes(query.symbol)) {
        symbolList.push(query.symbol);
      }
      const priceMap = {};
      if (symbolList.length) {
        // 获取货币最新价格
        const priceList = await Promise.all(
          symbolList.map((symbol: string) =>
            this.marketService.getPrice(symbol),
          ),
        );
        priceList.forEach((item: any) => {
          priceMap[item.symbol] = Number(item.price).toFixed(5);
        });
      }
      return {
        totalPrice: Number(totalMarginBalance).toFixed(3),
        remainPrice: Number(availableBalance).toFixed(3),
        positions: positionList,
        symbolMap: priceMap,
      };
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }
}
