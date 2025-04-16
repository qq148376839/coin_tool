import {
  Model,
  Column,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

/**
 * 费用记录模型
 * 用于记录交易相关的费用信息
 */
@Table({
  tableName: 'cost_records',
  comment: '费用记录表'
})
export class CostRecord extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '交易记录唯一标识符'
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '交易类型'
  })
  type: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    comment: '金额'
  })
  amount: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '交易类别'
  })
  category: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '交易描述'
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '交易发生的日期'
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '详细注释'
  })
  notes: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '图标名称'
  })
  iconName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '报销状态'
  })
  bxStatus: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '费用记录id'
  })
  costId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '用户id，外键引用 User 模型'
  })
  userId: number;
} 