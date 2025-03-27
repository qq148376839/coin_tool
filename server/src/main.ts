import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { OrderService } from './modules/order/order.service';
import { INTERVAL } from './enums/market';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用 CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 使用 Socket.IO 适配器
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalInterceptors(new ResponseInterceptor());
  // 获取 MarketService 实例
  const orderService = app.get(OrderService);
  // 调用 getPrice 方法
  try {
    console.log('开始自动ai创建订单', orderService, INTERVAL);
    // const price = await orderService.autoAiOrder({
    //   symbol: 'DOGEUSDT',
    //   interval: INTERVAL.FIFTEEN_MINUTES,
    //   limit: 150,
    //   winPercent: 0.01,
    //   lossRate: 0.75,
    // });
    // console.log('Initial BTC price:', price);
  } catch (error) {
    console.log('Failed to get initial price:', error);
  }

  await app.listen(process.env.PORT ?? 14086);
  console.log('应用已启动在端口', process.env.PORT ?? 14086);
}
bootstrap();
