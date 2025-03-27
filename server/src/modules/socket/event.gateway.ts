import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MarketService } from '../market/marketService';
import { INTERVAL } from '../../enums/market';
import { OrderPointParams } from 'src/interfaces/market.inteface';

interface CheckQuantParams {
  symbol: string;
  timeFrame: string;
  klineCount: number;
  model: string;
  profitRate: number;
  stopLossRate: number;
  feeRate: number;
}

// 注意ws端口号不能和http端口号一样，否则会冲突
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventGateway');

  constructor(private readonly marketService: MarketService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket 服务器初始化完成');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`客户端连接成功: ${client.id}`);
    
    // 发送测试消息
    client.emit('test', { 
      message: '连接成功',
      timestamp: new Date().toISOString()
    });

    // 每3秒发送一次心跳
    const interval = setInterval(() => {
      client.emit('heartbeat', { 
        timestamp: new Date().toISOString() 
      });
    }, 3000);

    // 保存interval引用以便断开连接时清除
    client.interval = interval;
  }

  handleDisconnect(client: any) {
    this.logger.log(`客户端断开连接: ${client.id}`);
    // 清除心跳定时器
    clearInterval(client.interval);
  }

  @SubscribeMessage('checkQuant')
  async handleCheckQuant(@MessageBody() params: any) {
    this.logger.log('收到回测请求:', params);
    console.log('你干嘛', params);

    try {

      
      // 调用 MarketService 的回测方法
      await this.marketService.checkOrderPoint({
        symbol: params.symbol,
        interval: params.timeFrame as INTERVAL,
        limit: Number(params.klineCount),
          startTime:
            params.startTime ||
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(),
          endTime: params.endTime || new Date(Date.now()).getTime(),
        factorObj: {
          judgeLength: params.windowSize,
          bufferPercent: Number(params.orderFloat) / 100,
          winPercent: Number(params.profitRate) / 100,
            lossRate: Number(params.stopLossRate / params.profitRate),
          tip: Number(params.feeRate) / 100,
        },
      }, this.server);

    } catch (error) {
      this.logger.error('回测失败:', error);
      return {
        event: 'backtestError',
        data: {
          message: error.message || '回测失败',
        },
      };
    }
  }
}
