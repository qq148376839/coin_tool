import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { 
  Order, 
  SubmitOrderParams, 
  SubmitOrderResponse,
  OrderStatus,
  GetTodayOrdersOptions,
  GetHistoryOrdersOptions
} from '../../types/longport.types';

@Injectable()
export class LongPortOrderService extends LongPortBaseService {
  private orderCallbacks: ((order: any) => void)[] = [];

  // 添加订单更新回调
  onOrderUpdate(callback: (order: any) => void) {
    this.orderCallbacks.push(callback);
  }

  // 提交订单
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

  // 监听订单状态
  private async watchOrderStatus(orderId: string) {
    const tradeCtx = await this.initTradeContext();
    
    // 设置订单状态推送回调
    tradeCtx.setOrderCallback((order) => {
      if (order.orderId === orderId) {
        this.orderCallbacks.forEach(callback => callback(order));
      }
    });
  }

  // 获取今日订单
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

  // 获取历史订单
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

  // 撤销订单
  async cancelOrder(orderId: string): Promise<void> {
    const tradeCtx = await this.initTradeContext();
    await tradeCtx.cancelOrder(orderId);
  }
} 