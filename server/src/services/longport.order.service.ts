import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TradeContext, OrderType, OrderSide, OrderStatus, TimeInForceType } from 'longport';
import { Order, SubmitOrderParams, SubmitOrderResponse, GetTodayOrdersOptions, GetHistoryOrdersOptions } from '../types/longport.types';
import { LongPortBaseService } from './longport.base.service';
import { ApiError, ErrorCode, handleError, logError } from '../utils/error-handler';

/**
 * 长桥订单服务
 * 提供股票、期权、权证等金融产品的交易订单服务
 * 支持订单提交、查询、撤销等功能
 */
@Injectable()
export class LongPortOrderService extends LongPortBaseService {
  private readonly logger = new Logger(LongPortOrderService.name);
  private tradeContext: TradeContext;
  private orderCallbacks: ((order: Order) => void)[] = [];

  constructor(private configService: ConfigService) {
    super();
    this.tradeContext = new TradeContext({
      appKey: this.configService.get<string>('LONGPORT_APP_KEY'),
      appSecret: this.configService.get<string>('LONGPORT_APP_SECRET'),
      accessToken: this.configService.get<string>('LONGPORT_ACCESS_TOKEN'),
    });
  }

  /**
   * 添加订单更新回调
   * 注册一个回调函数，当订单状态更新时会被调用
   * @param callback 回调函数，接收一个Order类型的参数
   */
  onOrderUpdate(callback: (order: Order) => void) {
    this.orderCallbacks.push(callback);
  }

  /**
   * 提交订单
   * 向长桥API提交一个新的订单
   * @param params 订单参数，包括股票代码、订单类型、买卖方向、数量、价格等
   * @returns 返回订单提交结果，包括订单ID和状态
   */
  async submitOrder(params: SubmitOrderParams): Promise<SubmitOrderResponse> {
    const tradeCtx = await this.initTradeContext();
    const order = await tradeCtx.submitOrder({
      symbol: params.symbol,
      orderType: params.orderType,
      side: params.side,
      submittedQuantity: params.quantity,
      submittedPrice: params.price,
      timeInForce: params.timeInForce,
      remark: '',
    });

    return {
      orderId: order.orderId,
      status: order.status,
    };
  }

  /**
   * 监听订单状态
   * 内部方法，用于监听指定订单的状态变化
   * @param orderId 订单ID
   * @private
   */
  private async watchOrderStatus(orderId: string) {
    const tradeCtx = await this.initTradeContext();
    
    // 使用轮询方式检查订单状态
    const checkOrderStatus = async () => {
      const orders = await tradeCtx.todayOrders({ orderId });
      if (orders && orders.length > 0) {
        const order = orders[0];
        this.orderCallbacks.forEach(callback => callback(order));
      }
    };

    // 每5秒检查一次订单状态
    const interval = setInterval(checkOrderStatus, 5000);

    // 30分钟后停止检查
    setTimeout(() => {
      clearInterval(interval);
    }, 30 * 60 * 1000);
  }

  /**
   * 获取今日订单
   * 查询今日的所有订单
   * @param options 查询选项，可选参数
   * @returns 返回今日订单列表
   */
  async getTodayOrders(options?: GetTodayOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.todayOrders(options);
    return orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      orderType: order.orderType,
      side: order.side,
      quantity: Number(order.quantity),
      price: Number(order.price),
      status: order.status as OrderStatus,
      executedQuantity: Number(order.executedQuantity),
      executedPrice: Number(order.executedPrice),
      submittedAt: order.submittedAt.getTime(),
      updatedAt: order.updatedAt.getTime()
    }));
  }

  /**
   * 获取历史订单
   * 查询指定时间范围内的历史订单
   * @param options 查询选项，包括股票代码、开始时间、结束时间等
   * @returns 返回历史订单列表
   */
  async getHistoryOrders(options?: GetHistoryOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.historyOrders({
      symbol: options?.symbol,
      status: options?.status,
      side: options?.side,
      market: options?.market,
      startAt: options?.startAt?.getTime(),
      endAt: options?.endAt?.getTime(),
    });

    return orders.map(order => ({
      orderId: order.orderId,
      status: order.status,
      stockName: order.stockName || '',
      quantity: Number(order.quantity),
      executedQuantity: Number(order.executedQuantity),
      price: Number(order.price),
      executedPrice: Number(order.executedPrice),
      submittedAt: new Date(order.submittedAt),
      side: order.side,
      symbol: order.symbol,
      orderType: order.orderType,
      lastDone: Number(order.lastDone || 0),
      triggerPrice: Number(order.triggerPrice || 0),
      msg: order.msg || '',
      tag: order.tag || '',
      timeInForce: order.timeInForce,
      expireDate: order.expireDate?.toString() || '',
      updatedAt: new Date(order.updatedAt),
      triggerAt: order.triggerAt ? new Date(order.triggerAt) : new Date(),
      trailingAmount: Number(order.trailingAmount || 0),
      trailingPercent: Number(order.trailingPercent || 0),
      limitOffset: Number(order.limitOffset || 0),
      triggerStatus: order.triggerStatus || '',
      currency: order.currency || '',
      outsideRth: Boolean(order.outsideRth),
      remark: order.remark || '',
    }));
  }

  /**
   * 撤销订单
   * 撤销指定的未完成订单
   * @param orderId 要撤销的订单ID
   * @throws 当API调用失败时抛出错误
   */
  async cancelOrder(orderId: string): Promise<void> {
    const tradeCtx = await this.initTradeContext();
    await tradeCtx.cancelOrder(orderId);
  }

  async getOrders(options?: GetTodayOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.todayOrders({
      symbol: options?.symbol,
      status: options?.status,
      side: options?.side,
      market: options?.market,
      startAt: options?.startAt?.getTime(),
      endAt: options?.endAt?.getTime(),
    });

    return orders.map(order => ({
      orderId: order.orderId,
      status: order.status,
      stockName: order.stockName || '',
      quantity: Number(order.quantity),
      executedQuantity: Number(order.executedQuantity),
      price: Number(order.price),
      executedPrice: Number(order.executedPrice),
      submittedAt: new Date(order.submittedAt),
      side: order.side,
      symbol: order.symbol,
      orderType: order.orderType,
      lastDone: Number(order.lastDone || 0),
      triggerPrice: Number(order.triggerPrice || 0),
      msg: order.msg || '',
      tag: order.tag || '',
      timeInForce: order.timeInForce,
      expireDate: order.expireDate?.toString() || '',
      updatedAt: new Date(order.updatedAt),
      triggerAt: order.triggerAt ? new Date(order.triggerAt) : new Date(),
      trailingAmount: Number(order.trailingAmount || 0),
      trailingPercent: Number(order.trailingPercent || 0),
      limitOffset: Number(order.limitOffset || 0),
      triggerStatus: order.triggerStatus || '',
      currency: order.currency || '',
      outsideRth: Boolean(order.outsideRth),
      remark: order.remark || '',
    }));
  }

  private mapOrderToInterface(order: any): Order {
    return {
      orderId: order.orderId,
      status: order.status,
      stockName: order.stockName || '',
      quantity: Number(order.quantity),
      executedQuantity: Number(order.executedQuantity),
      price: Number(order.price),
      executedPrice: Number(order.executedPrice),
      submittedAt: new Date(order.submittedAt),
      side: order.side,
      symbol: order.symbol,
      orderType: order.orderType,
      lastDone: Number(order.lastDone || 0),
      triggerPrice: Number(order.triggerPrice || 0),
      msg: order.msg || '',
      tag: order.tag || '',
      timeInForce: order.timeInForce,
      expireDate: order.expireDate?.toString() || '',
      updatedAt: new Date(order.updatedAt),
      triggerAt: order.triggerAt ? new Date(order.triggerAt) : new Date(),
      trailingAmount: Number(order.trailingAmount || 0),
      trailingPercent: Number(order.trailingPercent || 0),
      limitOffset: Number(order.limitOffset || 0),
      triggerStatus: order.triggerStatus || '',
      currency: order.currency || '',
      outsideRth: Boolean(order.outsideRth),
      remark: order.remark || '',
    };
  }
} 