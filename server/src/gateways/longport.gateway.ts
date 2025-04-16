import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LongPortQuoteService } from '../services/longport.quote.service';
import { LongPortOrderService } from '../services/longport.order.service';
import { SubType } from 'longport';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/longport',
})
export class LongPortGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private subscriptions: Map<string, Set<string>> = new Map(); // clientId -> symbols
  private orderSubscriptions: Set<string> = new Set(); // clientIds

  constructor(
    private readonly quoteService: LongPortQuoteService,
    private readonly orderService: LongPortOrderService,
  ) {
    // 订阅订单状态变化
    this.orderService.onOrderUpdate((order) => {
      this.broadcastOrderUpdate(order);
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.subscriptions.set(client.id, new Set());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const symbols = this.subscriptions.get(client.id);
    if (symbols) {
      this.quoteService.unsubscribe(Array.from(symbols), ['QUOTE']);
      this.subscriptions.delete(client.id);
    }
    this.orderSubscriptions.delete(client.id);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    client: Socket,
    payload: { symbols: string[]; subTypes: SubType[] }
  ) {
    try {
      const { symbols, subTypes } = payload;
      await this.quoteService.subscribe(symbols, subTypes);
      
      const clientSymbols = this.subscriptions.get(client.id);
      symbols.forEach(symbol => clientSymbols?.add(symbol));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('subscribeOrders')
  async handleSubscribeOrders(client: Socket) {
    try {
      this.orderSubscriptions.add(client.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('unsubscribeOrders')
  async handleUnsubscribeOrders(client: Socket) {
    try {
      this.orderSubscriptions.delete(client.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    client: Socket,
    payload: { symbols: string[]; subTypes: SubType[] }
  ) {
    try {
      const { symbols, subTypes } = payload;
      await this.quoteService.unsubscribe(symbols, subTypes);
      
      const clientSymbols = this.subscriptions.get(client.id);
      symbols.forEach(symbol => clientSymbols?.delete(symbol));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private broadcastOrderUpdate(order: any) {
    this.orderSubscriptions.forEach(clientId => {
      this.server.to(clientId).emit('orderUpdate', order);
    });
  }
} 