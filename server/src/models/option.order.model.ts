import { Model, Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { OptionContract } from './option.contract.model';

@Table
export class OptionOrder extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => OptionContract)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  contractId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '订单号',
  })
  orderId: string;

  @Column({
    type: DataType.ENUM('buy_to_open', 'sell_to_close', 'sell_to_open', 'buy_to_close'),
    allowNull: false,
    comment: '交易类型',
  })
  orderType: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '合约数量',
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单价格',
  })
  price: number;

  @Column({
    type: DataType.ENUM('pending', 'filled', 'cancelled', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '订单状态',
  })
  status: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: '止损价',
  })
  stopLoss: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: '止盈价',
  })
  takeProfit: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: '下单时间',
  })
  orderTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '成交时间',
  })
  fillTime: Date;
} 