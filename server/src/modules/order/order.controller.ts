import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { PriceDto } from 'src/dto/market.dtc';
import {
  AutoAiOrderDto,
  AutoCreateOrderDto,
  CancelOrderDto,
  OrderDto,
  OrderSide,
} from 'src/interfaces/order.inteface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('list')
  // 设置请求头
  async getPrice(): Promise<PriceDto> {
    try {
      return this.orderService.getCurrentOrders();
    } catch (error) {
      console.log(error);
      throw new Error('获取用户信息失败');
    }
  }

  @Get('positionMode')
  async getPositionMode(): Promise<any> {
    try {
      return this.orderService.getPositionMode();
    } catch (error) {
      console.log(error);
      throw new Error('获取当前持仓模式失败');
    }
  }

  // 该接口只支持下单, 不支持平仓和修改订单
  @Post('create')
  async createOrder(@Body() orderDto: OrderDto): Promise<any> {
    try {
      const {
        symbol,
        positionSide,
        type,
        // price,
        quantity,
        stopSetType,
        stopOption,
      } = orderDto;
      const params: OrderDto = {
        // ...orderDto,
        symbol,
        side: OrderSide.BUY,
        positionSide,
        type,
        // timeInForce: 'GTC',
        quantity,
        // price,
        recvWindow: 5000,
        timestamp: new Date().getTime(),
      };
      if (positionSide === 'SHORT') {
        params.side = OrderSide.SELL;
      }
      return this.orderService.createOrder(params, stopSetType, stopOption);
    } catch (error) {
      console.log(error);
      throw new Error('下单失败');
    }
  }

  @Post('closePosition')
  async closePosition(@Body() orderDto: OrderDto): Promise<any> {
    try {
      const { symbol, type, price, positionSide } = orderDto;
      return this.orderService.closePosition(symbol, type, price, positionSide);
    } catch (error) {
      console.log(error);
      throw new Error('平仓订单失败');
    }
  }

  @Post('cancel')
  async cancelOrder(@Body() cancelOrderDto: CancelOrderDto): Promise<any> {
    try {
      const { symbol } = cancelOrderDto;
      const params: CancelOrderDto = {
        symbol,
        timestamp: new Date().getTime(),
      };
      return this.orderService.cancelOrder(params);
    } catch (error) {
      console.log(error);
      throw new Error('撤单失败');
    }
  }

  @Post('autoCreate')
  async autoCreateOrder(
    @Body() autoCreateOrderDto: AutoCreateOrderDto,
  ): Promise<any> {
    try {
      return this.orderService.autoCreateOrder(autoCreateOrderDto);
    } catch (error) {
      console.log(error);
      throw new Error('自动下单失败');
    }
  }

  @Post('autoAiCreate')
  async autoAiCreateOrder(
    @Body() autoAiCreateOrderDto: AutoAiOrderDto,
  ): Promise<any> {
    try {
      return this.orderService.autoAiOrder(autoAiCreateOrderDto);
    } catch (error) {
      console.log(error);
      throw new Error('自动下单失败');
    }
  }

  @Post('cancelAutoCreate')
  async cancelAutoCreate(): Promise<any> {
    try {
      return this.orderService.stopAutoCreateOrder();
    } catch (error) {
      console.log(error);
      throw new Error('停止自动下单失败');
    }
  }
}
