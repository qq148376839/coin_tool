import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { LongPortOrderService } from '../services/longport.order.service';
import { 
  Order, 
  SubmitOrderParams, 
  SubmitOrderResponse,
  OrderStatus,
  GetTodayOrdersOptions,
  GetHistoryOrdersOptions
} from '../types/longport.types';

@Controller('longport/order')
export class LongPortOrderController {
  constructor(private readonly orderService: LongPortOrderService) {}

  @Post('submit')
  async submitOrder(@Body() orderData: SubmitOrderParams): Promise<SubmitOrderResponse> {
    return await this.orderService.submitOrder(orderData);
  }

  @Get('today')
  async getTodayOrders(@Query() options?: GetTodayOrdersOptions): Promise<Order[]> {
    return await this.orderService.getTodayOrders(options);
  }

  @Get('history')
  async getHistoryOrders(@Query() options: GetHistoryOrdersOptions): Promise<Order[]> {
    return await this.orderService.getHistoryOrders(options);
  }

  @Delete(':orderId')
  async cancelOrder(@Param('orderId') orderId: string): Promise<void> {
    return await this.orderService.cancelOrder(orderId);
  }
} 