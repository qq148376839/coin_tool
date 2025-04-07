import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { OptionContract } from '../src/models/option.contract.model';
import { OptionOrder } from '../src/models/option.order.model';
import { OptionPosition } from '../src/models/option.position.model';
import * as path from 'path';

describe('Database Connection Test', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    // 显式设置环境变量文件路径
    const envPath = path.resolve(__dirname, '../.env');
    
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: envPath,
          isGlobal: true,
        }),
        SequelizeModule.forRoot({
          dialect: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT, 10) || 3306,
          username: process.env.DB_USERNAME || 'root',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE || 'longport_options',
          models: [OptionContract, OptionOrder, OptionPosition],
          autoLoadModels: true,
          synchronize: true,
        }),
        SequelizeModule.forFeature([OptionContract, OptionOrder, OptionPosition]),
      ],
    }).compile();
  }, 30000);

  it('should connect to database', async () => {
    const sequelize = moduleRef.get(SequelizeModule);
    try {
      // 使用 OptionContract 模型来测试连接
      await OptionContract.sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      throw error;
    }
  });

  it('should create tables', async () => {
    try {
      const tables = await OptionContract.sequelize.showAllSchemas({ logging: console.log });
      console.log('Created tables:', tables);
      // 提取表名
      const tableNames = tables.map(table => table.Tables_in_longport);
      expect(tableNames).toEqual(
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