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
   * 通过长桥API提交一个新的交易订单
   * @param params 订单参数，包含股票代码、订单类型、买卖方向等信息
   * @returns 返回订单提交响应，包含订单ID和状态
   * @throws 当API调用失败时抛出错误
   */
  async submitOrder(params: SubmitOrderParams): Promise<SubmitOrderResponse> {
    const tradeCtx = await this.initTradeContext();
    const response = await tradeCtx.submitOrder({
      symbol: params.symbol,
      orderType: params.orderType,
      side: params.side,
      submittedQuantity: params.quantity,
      timeInForce: params.timeInForce,
      submittedPrice: params.price ? new Decimal(params.price) : undefined
    });

    return {
      orderId: response.orderId,
      status: response.status as OrderStatus,
      message: response.message
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
    
    tradeCtx.setOrderCallback((order) => {
      if (order.orderId === orderId) {
        this.orderCallbacks.forEach(callback => callback(order));
      }
    });
  }

  /**
   * 获取今日订单
   * 查询当天的所有订单记录
   * @param options 查询选项，可选参数
   * @returns 返回订单数组，包含每个订单的详细信息
   * @throws 当API调用失败时抛出错误
   */
  async getTodayOrders(options?: GetTodayOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.todayOrders(options);
    return orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      orderType: order.orderType as OrderType,
      side: order.side as OrderSide,
      quantity: order.quantity,
      price: order.price?.toNumber(),
      status: order.status as OrderStatus,
      filledQuantity: order.filledQuantity,
      filledPrice: order.filledPrice?.toNumber(),
      createdAt: order.createdAt.getTime(),
      updatedAt: order.updatedAt.getTime()
    }));
  }

  /**
   * 获取历史订单
   * 查询历史订单记录
   * @param options 查询选项，包含股票代码、时间范围等
   * @returns 返回订单数组，包含每个订单的详细信息
   * @throws 当API调用失败时抛出错误
   */
  async getHistoryOrders(options: GetHistoryOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    const orders = await tradeCtx.historyOrders(options);
    return orders.map(order => ({
      orderId: order.orderId,
      symbol: order.symbol,
      orderType: order.orderType as OrderType,
      side: order.side as OrderSide,
      quantity: order.quantity,
      price: order.price?.toNumber(),
      status: order.status as OrderStatus,
      filledQuantity: order.filledQuantity,
      filledPrice: order.filledPrice?.toNumber(),
      createdAt: order.createdAt.getTime(),
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
} 