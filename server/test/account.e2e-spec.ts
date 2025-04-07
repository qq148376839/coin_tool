import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Account API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/longport/account', () => {
    it('/balance (GET)', () => {
      return request(app.getHttpServer())
        .get('/longport/account/balance')
        .expect(200)
        .then(response => {
          expect(response.body).toBeDefined();
          // 记录响应以便调试
          console.log('Balance response:', response.body);
        });
    });

    it('/cash-info (GET)', () => {
      return request(app.getHttpServer())
        .get('/longport/account/cash-info')
        .expect(200)
        .then(response => {
          expect(response.body).toBeDefined();
          // 记录响应以便调试
          console.log('Cash info response:', response.body);
        });
    });

    it('/margin-ratio (GET)', () => {
      return request(app.getHttpServer())
        .get('/longport/account/margin-ratio')
        .expect(200)
        .then(response => {
          expect(response.body).toBeDefined();
          // 记录响应以便调试
          console.log('Margin ratio response:', response.body);
        });
    });
  });
}); 