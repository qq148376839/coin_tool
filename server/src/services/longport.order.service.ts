import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { 
  Order, 
  SubmitOrderParams, 
  SubmitOrderResponse,
  OrderStatus,
  GetTodayOrdersOptions,
  GetHistoryOrdersOptions,
  OrderType,
  OrderSide
} from '../../types/longport.types';
import { Decimal } from 'decimal.js';

/**
 * 长桥订单服务
 * 提供股票、期权、权证等金融产品的交易订单服务
 * 支持订单提交、查询、撤销等功能
 */
@Injectable()
export class LongPortOrderService extends LongPortBaseService {
  private orderCallbacks: ((order: Order) => void)[] = [];

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
    const response = await tradeCtx.submitOrder({
      symbol: params.symbol,
      orderType: params.orderType,
      side: params.side,
      submittedQuantity: new Decimal(params.quantity),
      timeInForce: params.timeInForce,
      submittedPrice: params.price ? new Decimal(params.price) : undefined
    });

    return {
      orderId: response.orderId,
      status: response.status
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
      const order = await tradeCtx.orderDetail(orderId);
      if (order) {
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
      quantity: order.quantity.toNumber(),
      price: order.price?.toNumber(),
      status: order.status as OrderStatus,
      executedQuantity: order.executedQuantity.toNumber(),
      executedPrice: order.executedPrice.toNumber(),
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
  async getHistoryOrders(options: GetHistoryOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.historyOrders(options);
    return orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      orderType: order.orderType,
      side: order.side,
      quantity: order.quantity.toNumber(),
      price: order.price?.toNumber(),
      status: order.status as OrderStatus,
      executedQuantity: order.executedQuantity.toNumber(),
      executedPrice: order.executedPrice.toNumber(),
      submittedAt: order.submittedAt.getTime(),
      updatedAt: order.updatedAt.getTime()
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

  async getOrders(): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.todayOrders();
    return orders.map(order => ({
      orderId: order.orderId,
      status: order.status,
      stockName: order.stockName,
      quantity: order.quantity.toNumber(),
      executedQuantity: order.executedQuantity.toNumber(),
      price: order.price.toNumber(),
      executedPrice: order.executedPrice.toNumber(),
      submittedAt: order.submittedAt.getTime(),
      updatedAt: order.updatedAt.getTime(),
      side: order.side,
      orderType: order.orderType,
      timeInForce: order.timeInForce,
      symbol: order.symbol,
      lastDone: order.lastDone?.toNumber() || 0,
      triggerPrice: order.triggerPrice?.toNumber() || 0,
      msg: order.msg || '',
      tag: order.tag || '',
      expireDate: order.expireDate || '',
      triggerAt: order.triggerAt || 0,
      trailingAmount: order.trailingAmount?.toNumber() || 0,
      trailingPercent: order.trailingPercent?.toNumber() || 0,
      limitOffset: order.limitOffset?.toNumber() || 0,
      triggerStatus: order.triggerStatus || '',
      currency: order.currency || '',
      outsideRth: order.outsideRth || '',
      remark: order.remark || ''
    }));
  }
} 