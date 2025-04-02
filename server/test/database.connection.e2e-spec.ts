import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { OptionContract } from '../src/models/option.contract.model';
import { OptionOrder } from '../src/models/option.order.model';
import { OptionPosition } from '../src/models/option.position.model';
import config from '../src/config/common';

describe('Database Connection Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
        }),
        SequelizeModule.forRoot({
          ...config().sequelizeConfig,
          models: [OptionContract, OptionOrder, OptionPosition],
          synchronize: true, // 这会自动创建表
          logging: console.log, // 显示SQL查询
        }),
        SequelizeModule.forFeature([OptionContract, OptionOrder, OptionPosition]),
      ],
    }).compile();
  });

  it('should create tables', async () => {
    const sequelize = moduleRef.get('SEQUELIZE');
    // 检查表是否存在
    const tables = await sequelize.showAllSchemas();
    expect(tables).toContain('OptionContracts');
    expect(tables).toContain('OptionOrders');
    expect(tables).toContain('OptionPositions');
    console.log('Created tables:', tables);
  });

  it('should insert test data', async () => {
    const optionContract = await OptionContract.create({
      symbol: 'AAPL230908C180000.US',
      underlyingSymbol: 'AAPL.US',
      optionType: 'call',
      strikePrice: 180.00,
      expiryDate: new Date('2023-09-08'),
      contractMultiplier: 100,
      exchange: 'CBOE'
    });

    expect(optionContract.id).toBeDefined();
    console.log('Created test contract:', optionContract.toJSON());
  });

  afterAll(async () => {
    await moduleRef.close();
  });
}); 