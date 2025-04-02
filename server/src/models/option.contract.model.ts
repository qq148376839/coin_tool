import { Model, Column, Table, DataType } from 'sequelize-typescript';

@Table
export class OptionContract extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '期权代码',
  })
  symbol: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '标的股票代码',
  })
  underlyingSymbol: string;

  @Column({
    type: DataType.ENUM('call', 'put'),
    allowNull: false,
    comment: '期权类型：看涨/看跌',
  })
  optionType: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '行权价',
  })
  strikePrice: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '到期日',
  })
  expiryDate: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '合约乘数',
  })
  contractMultiplier: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '交易所',
  })
  exchange: string;
} 