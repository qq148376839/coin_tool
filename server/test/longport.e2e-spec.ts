import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { io, Socket } from 'socket.io-client';
import { LongPortAccountService } from '../src/services/longport.account.service';
import { LongPortOrderService } from '../src/services/longport.order.service';
import { LongPortQuoteService } from '../src/services/longport.quote.service';

describe('LongPort API (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(14086);

    // 连接WebSocket
    socket = io('http://localhost:14086/longport', {
      transports: ['websocket'],
    });
  });

  afterAll(async () => {
    socket.disconnect();
    await app.close();
  });

  describe('Account API', () => {
    it('should get account balance', () => {
      return request(app.getHttpServer())
        .get('/longport/account/balance')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.totalEquity).toBeDefined();
        });
    });

    it('should get cash info', () => {
      return request(app.getHttpServer())
        .get('/longport/account/cash-info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.withdrawCash).toBeDefined();
        });
    });
  });

  describe('Quote API', () => {
    it('should get stock quote', () => {
      return request(app.getHttpServer())
        .get('/longport/quote/quote')
        .query({ symbols: 'AAPL.US' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body[0].symbol).toBe('AAPL.US');
        });
    });

    it('should subscribe to quote updates', (done) => {
      socket.emit('subscribe', {
        symbols: ['AAPL.US'],
        subTypes: ['QUOTE'],
      }, (response: any) => {
        expect(response.success).toBe(true);
        
        socket.on('quote', (quote) => {
          expect(quote.symbol).toBe('AAPL.US');
          expect(quote.lastDone).toBeDefined();
          done();
        });
      });
    });
  });

  describe('Order API', () => {
    let orderId: string;

    it('should submit order', () => {
      return request(app.getHttpServer())
        .post('/longport/order/submit')
        .send({
          symbol: 'AAPL.US',
          orderType: 'LIMIT',
          side: 'BUY',
          quantity: 1,
          price: 150
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.orderId).toBeDefined();
          orderId = res.body.orderId;
        });
    });

    it('should get today orders', () => {
      return request(app.getHttpServer())
        .get('/longport/order/today')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should subscribe to order updates', (done) => {
      socket.emit('subscribeOrders', {}, (response: any) => {
        expect(response.success).toBe(true);
        
        socket.on('orderUpdate', (order) => {
          expect(order.orderId).toBeDefined();
          expect(order.status).toBeDefined();
          done();
        });
      });
    });

    it('should cancel order', () => {
      return request(app.getHttpServer())
        .delete(`/longport/order/${orderId}`)
        .expect(200);
    });
  });
}); 