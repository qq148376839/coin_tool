import { Test, TestingModule } from '@nestjs/testing';
import { LongPortBaseService } from '../src/services/longport.base.service';
import { ConfigModule } from '@nestjs/config';

describe('LongPort Connection Test', () => {
  let service: LongPortBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
        }),
      ],
      providers: [LongPortBaseService],
    }).compile();

    service = module.get<LongPortBaseService>(LongPortBaseService);
  });

  it('should connect to trade context', async () => {
    const tradeCtx = await service['initTradeContext']();
    // 获取账户余额来测试连接
    const account = await tradeCtx.accountBalance();
    expect(account).toBeDefined();
    console.log('Trade Account Balance:', account);
  });

  it('should connect to quote context', async () => {
    const quoteCtx = await service['initQuoteContext']();
    // 获取某个期权的报价来测试连接
    const quote = await quoteCtx.quote();
    expect(quote).toBeDefined();
    console.log('Quote Data:', quote);
  });
}); 