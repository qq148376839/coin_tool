import { Model, Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { OptionContract } from './option.contract.model';

@Table
export class OptionPosition extends Model {
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
    type: DataType.INTEGER,
    allowNull: false,
    comment: '持仓数量',
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '平均成本',
  })
  averageCost: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '当前市值',
  })
  marketValue: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '未实现盈亏',
  })
  unrealizedPnL: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '已实现盈亏',
  })
  realizedPnL: number;
} 