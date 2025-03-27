import {
  Model,
  Column,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

@Table
export class CostRecord extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number; // 交易记录唯一标识符

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string; // 交易类型

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  amount: number; // 金额

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    category: string; // 交易类别

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description: string; // 交易描述

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    date: string; // 交易发生的日期


    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    notes: string; // 详细注释

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    iconName: string; // 图标名称

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    bxStatus: string; // 报销状态

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    costId: string; // 费用记录id

    //   @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    userId: number; // 用户id，外键引用 User 模型
}
