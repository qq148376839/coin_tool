import { Controller, Get, Post, Delete, Body, Query, Param } from '@nestjs/common';
import { LongPortOrderService } from '../services/longport.order.service';
import { OrderSide, OrderType } from 'longport';

@Controller('longport/order')
export class LongPortOrderController {
  constructor(private readonly orderService: LongPortOrderService) {}

  @Post('submit')
  async submitOrder(@Body() orderData: {
    symbol: string;
    orderType: OrderType;
    side: OrderSide;
    quantity: number;
    price?: number;
  }) {
    return await this.orderService.submitOrder(orderData);
  }

  @Get('today')
  async getTodayOrders(@Query() options?: {
    symbol?: string;
    status?: string[];
  }) {
    return await this.orderService.getTodayOrders(options);
  }

  @Get('history')
  async getHistoryOrders(@Query() options: {
    symbol: string;
    startAt: string;
    endAt: string;
  }) {
    return await this.orderService.getHistoryOrders(options);
  }

  @Delete(':orderId')
  async cancelOrder(@Param('orderId') orderId: string) {
    return await this.orderService.cancelOrder(orderId);
  }
} 