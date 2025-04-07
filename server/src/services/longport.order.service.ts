import { Injectable } from '@nestjs/common';
import { LongPortBaseService } from './longport.base.service';
import { 
  OrderSide, 
  OrderType,
  SubmitOrderResponse,
  OrderStatus,
  GetHistoryOrdersOptions,
  GetTodayOrdersOptions,
  Order
} from 'longport';

@Injectable()
export class LongPortOrderService extends LongPortBaseService {
  private orderCallbacks: ((order: any) => void)[] = [];

  // 添加订单更新回调
  onOrderUpdate(callback: (order: any) => void) {
    this.orderCallbacks.push(callback);
  }

  // 提交订单
  async submitOrder(params: {
    symbol: string;
    orderType: OrderType;
    side: OrderSide;
    quantity: number;
    price?: number;
  }): Promise<SubmitOrderResponse> {
    const tradeCtx = await this.initTradeContext();
    const response = await tradeCtx.submitOrder(params);
    
    // 监听订单状态变化
    this.watchOrderStatus(response.orderId);
    
    return response;
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
    return await tradeCtx.todayOrders(options);
  }

  // 获取历史订单
  async getHistoryOrders(options: GetHistoryOrdersOptions): Promise<Order[]> {
    const tradeCtx = await this.initTradeContext();
    return await tradeCtx.historyOrders(options);
  }

  // 撤销订单
  async cancelOrder(orderId: string): Promise<void> {
    const tradeCtx = await this.initTradeContext();
    await tradeCtx.cancelOrder(orderId);
  }
} 