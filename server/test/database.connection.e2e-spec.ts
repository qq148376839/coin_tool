import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { OptionContract } from '../src/models/option.contract.model';
import { OptionOrder } from '../src/models/option.order.model';
import { OptionPosition } from '../src/models/option.position.model';
import configOptions from '../src/config/common';

describe('Database Connection Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
        }),
        SequelizeModule.forRoot({
          ...configOptions().sequelizeConfig,
          models: [OptionContract, OptionOrder, OptionPosition],
          synchronize: true, // 这会自动创建表
          logging: console.log, // 显示SQL查询
        }),
        SequelizeModule.forFeature([OptionContract, OptionOrder, OptionPosition]),
      ],
    }).compile();
  });

  it('should create tables', async () => {
    try {
      const sequelize = moduleRef.get('SEQUELIZE');
      const tables = await sequelize.showAllSchemas();
      console.log('Created tables:', tables);
      expect(tables).toEqual(
        expect.arrayContaining(['OptionContracts', 'OptionOrders', 'OptionPositions'])
      );
    } catch (error) {
      console.error('Error in create tables test:', error);
      throw error;
    }
  });

  it('should insert test data', async () => {
    try {
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
    } catch (error) {
      console.error('Error in insert test data:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });
}); 