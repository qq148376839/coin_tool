import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { USE_CONTRACT_URLBASE } from '../../enums/public';
import { createSign } from 'src/utils/createSign';
import config from '../../config/common';
import {
  OrderDto,
  CancelOrderDto,
  OrderType,
  PositionSide,
  WorkingType,
  StopSetType,
  OrderSide,
  StopOption,
  AutoCreateOrderDto,
  AutoAiOrderDto,
} from 'src/interfaces/order.inteface';
import { UserService } from '../user/userService';
import { MarketService } from '../market/marketService';
import { PointOrder } from 'src/interfaces/market.inteface';
import { AiService } from '../ai/aiService';

const USER_KEY = config.binance.apiKey;
@Injectable()
export class OrderService {
  private priceWorker: NodeJS.Timer | null = null;
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly marketService: MarketService,
    private readonly aiService: AiService,
  ) { }

  // 查询当前所有挂单
  async getCurrentOrders() {
    const params: any = {
      timestamp: new Date().getTime(),
    };
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const res = await this.httpService.axiosRef.get(
        USE_CONTRACT_URLBASE + `/fapi/v1/openOrders`,
        {
          params,
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error('查询当前用户挂单情况');
    }
  }
  // 获取当前持仓模式
  async getPositionMode() {
    const params: any = {
      timestamp: new Date().getTime(),
    };
    // 这个签名一定要按其规定的顺序传递参数, 不然签名是无效的
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const res = await this.httpService.axiosRef.get(
        USE_CONTRACT_URLBASE + `/fapi/v1/positionSide/dual`,
        {
          params,
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error('获取当前持仓模式');
    }
  }

  // 下单
  async createOrder(
    orderDto: OrderDto,
    stopSetType: StopSetType = StopSetType.NONE,
    stopOption?: StopOption,
  ) {
    const params: any = {
      ...orderDto,
    };
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const res = await this.httpService.axiosRef.post(
        USE_CONTRACT_URLBASE + `/fapi/v1/order`,
        null,
        {
          params,
        },
      );
      // 自动设置止溢出,止损
      if (stopSetType === StopSetType.MANUAL) {
        const { symbol, positionSide } = orderDto;
        const { stopPrice, takeProfitPrice } = stopOption;
        if (stopPrice) {
          await this.closePosition(
            symbol,
            OrderType.STOP_LOSS,
            stopPrice,
            positionSide,
          );
        }
        if (takeProfitPrice) {
          await this.closePosition(
            symbol,
            OrderType.TAKE_PROFIT,
            takeProfitPrice,
            positionSide,
          );
        }
      }
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error('下单失败');
    }
  }

  // 止损/止盈单
  async closePosition(
    symbol: string,
    type: OrderType,
    price: number,
    positionSide: PositionSide,
    immediately: boolean = false,
  ) {
    const params: OrderDto = {
      symbol,
      side: OrderSide.SELL,
      positionSide,
      type,
      stopPrice: price.toString(),
      closePosition: true,
      workingType: immediately
        ? WorkingType.CONTRACT_PRICE
        : WorkingType.MARK_PRICE,
      priceProtect: true,
      timestamp: new Date().getTime(),
    };
    if (positionSide === 'SHORT') {
      params.side = OrderSide.BUY;
    }
    const res = await this.createOrder(params);
    return res;
  }

  // 撤单
  async cancelOrder(orderDto: CancelOrderDto) {
    const params: any = {
      ...orderDto,
    };
    const sign = createSign(params);
    params.signature = sign;
    try {
      this.httpService.axiosRef.defaults.headers.common['X-MBX-APIKEY'] =
        USER_KEY;
      const res = await this.httpService.axiosRef.delete(
        USE_CONTRACT_URLBASE + `/fapi/v1/allOpenOrders`,
        {
          params,
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Error('撤单失败');
    }
  }

  /**
   * 获取当前挂单情况, 并清除异常订单
   * @param symbol 货币名称
   * @param multiple 杠杠倍数
   * @returns {positions: any[], remainPrice: number, price: number} // 挂单列表, 可用资产, 最新价格
   */
  async getCurrentOrdersAndClearException(
    symbol: string,
    multiple: number = 5,
  ) {
    const data = await this.getCurrentOrders();
    const { remainPrice, positions } =
      await this.userService.getUserContractNews({});
    const { price } = await this.marketService.getPrice(symbol);
    // 如果挂单列表有数据, 无持仓 则需要取消挂单
    if (data.length && !positions.length) {
      await this.cancelOrder({
        symbol,
        timestamp: new Date().getTime(),
      });
    }
    // 如果持仓有数据, 无挂单数据, 则需要平仓
    if (positions.length && !data.length) {
      const positionSide = positions[0].positionSide;
      const stopLossPrice =
        positionSide === 'LONG'
          ? +Number(+price * 0.99).toFixed(5)
          : +Number(+price * 1.01).toFixed(5);
      const takeProfitPrice =
        positionSide === 'LONG'
          ? +Number(+price * 1.01).toFixed(5)
          : +Number(+price * 0.99).toFixed(5);
      await this.closePosition(
        symbol,
        OrderType.STOP_LOSS,
        stopLossPrice,
        positionSide === 'LONG' ? PositionSide.LONG : PositionSide.SHORT,
        true,
      );
      await this.closePosition(
        symbol,
        OrderType.TAKE_PROFIT,
        takeProfitPrice,
        positionSide === 'LONG' ? PositionSide.LONG : PositionSide.SHORT,
        true,
      );
    }
    const quantity = Math.floor((remainPrice / +price) * 0.9) * multiple; // 计算下单数量
    return {
      positions,
      price: Number(price),
      quantity,
    };
  }

  /**
   * 下单模块, 根据当前价格和推荐价格, 执行下单操作
   * @param symbol 货币名称
   * @param price 当前价格
   * @param long 推荐买入价格
   * @param short 推荐卖出价格
   */
  async createOrderByPrice(
    positionOrder: PointOrder,
    price: number,
    symbol: string,
    quantity: number,
  ) {
    const { long, short } = positionOrder;
    let target = null;
    let positionSide = PositionSide.LONG;
    let result = null;
    if (long.price < price) {
      const longdiff = Number((price - long.price).toFixed(5));
      long.failPrice += longdiff;
      long.winPrice += longdiff;
      target = long;
    } else if (short.price > price) {
      const shortdiff = Number((price - short.price).toFixed(5));
      short.failPrice += shortdiff;
      short.winPrice += shortdiff;
      target = short;
      positionSide = PositionSide.SHORT;
    }
    console.log(
      `当前${symbol}价格: ${price}, 下单价格: 多 ${long.price},空 ${short.price}`,
    );
    if (target) {
      console.log(`下单: ${symbol} ${positionSide} ${quantity}`);
      const params = {
        symbol,
        side: OrderSide.BUY,
        positionSide,
        type: OrderType.MARKET,
        quantity,
        ecvWindow: 5000,
        timestamp: new Date().getTime(),
      };
      if (positionSide === 'SHORT') {
        params.side = OrderSide.SELL;
      }
      result = await this.createOrder(params, StopSetType.MANUAL, {
        stopPrice: target.failPrice,
        takeProfitPrice: target.winPrice,
      });
    }
    return result;
  }

  /**
   * 自动下单
   * 1. 获取当前持仓状态和挂单列表, 有买入单/有平仓单, 则无需操作
   * 2. 如果无挂单, 则需要获取推荐订单, 并获取最新价格, 如果符合则按市场价买入并挂入止损和止盈单
   */
  async autoCreateOrder(autoCreateOrderDto: AutoCreateOrderDto) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: any = this;
    const symbol = autoCreateOrderDto.symbol;
    async function operator() {
      const { positions, price, quantity } =
        await that.getCurrentOrdersAndClearException(symbol);
      // 如果当前有挂单, 则无需操作
      if (positions.length) {
        console.log(`当前${symbol}价格: ${price}`);
      } else {
        // 获取推荐下单价格
        const positionOrder: PointOrder = await that.marketService.getBestPrice(
          symbol,
          autoCreateOrderDto.interval,
          autoCreateOrderDto.limit || 100,
        );
        await that.createOrderByPrice(positionOrder, price, symbol, quantity);
      }
    }

    // 每5秒执行一次
    this.priceWorker = setInterval(async () => {
      try {
        await operator();
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  }

  /**
   * ai自动挂单
   */
  async autoAiOrder(autoAiOrderDto: AutoAiOrderDto) {
    const { symbol, interval, limit, winPercent, lossRate } = autoAiOrderDto;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // 缓存推荐数据
    let positionOrder: any = null;
    let keyCache: number = 0;
    async function operator() {
      keyCache++;
      // 每6000s次执行一次, 清空缓存
      if (keyCache % 1200 === 0) {
        positionOrder = null;
      }
      // 获取并初始化挂单数据
      const { positions, price, quantity } =
        await that.getCurrentOrdersAndClearException(symbol);
      // 如果当前有挂单, 则无需操作
      if (positions.length) {
        console.log(`ai挂单: 当前${symbol}价格: ${price}`);
      } else {
        // 如果存在推荐价格, 则没有超出浮动范围, 则不需要重复去获取
        if (!positionOrder) {
          const kLineList = await that.marketService.getKline({
            symbol,
            interval,
            limit,
          });
          positionOrder = await that.aiService.getRecommendPrice(
            kLineList,
            winPercent || 0.01,
            lossRate || 0.75,
          );
        }
        const result = await that.createOrderByPrice(
          positionOrder,
          price,
          symbol,
          quantity,
        );
        // 如果挂单成功, 则需清空推荐价格
        if (result) {
          positionOrder = null;
          console.log(`ai挂单成功: 当前${symbol}价格: ${price}`);
        }
      }
    }

    // 每5秒执行一次
    this.priceWorker = setInterval(async () => {
      try {
        await operator();
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  }

  /**
   * 停止自动量化下单
   */
  stopAutoCreateOrder() {
    if (this.priceWorker) {
      clearInterval(this.priceWorker as NodeJS.Timeout);
      this.priceWorker = null;
    }
    console.log('stopAutoCreateOrder success');
  }
}
