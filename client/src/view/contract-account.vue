<template>
  <div class="contract-account">
    <div class="header">
      <div class="header-content">
        <el-button class="back-btn" @click="$router.push('/account')" type="text">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>合约账户</h2>
      </div>
    </div>
    
    <div class="content">
      <!-- 账户余额信息 -->
      <el-card class="balance-card">
        <div class="balance-info">
          <div class="balance-item">
            <div class="label">账户总余额</div>
            <div class="value">{{ accountInfo.totalBalance }} USDT</div>
          </div>
          <div class="balance-item">
            <div class="label">可用余额</div>
            <div class="value">{{ accountInfo.availableBalance }} USDT</div>
          </div>
        </div>
      </el-card>

      <!-- 持仓信息 -->
      <el-card class="positions-card">
        <template #header>
          <div class="card-header">
            <span>持仓信息</span>
          </div>
        </template>
        
        <el-table :data="positions" style="width: 100%">
          <el-table-column prop="symbol" label="货币名称" />
          <el-table-column prop="direction" label="持仓方向">
            <template #default="scope">
              <span :class="scope.row.direction === 'LONG' ? 'long' : 'short'">
                {{ scope.row.direction === 'LONG' ? '多' : '空' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="持仓数量" />
          <el-table-column prop="currentPrice" label="当前价格" />
          <el-table-column prop="costPrice" label="成本价" />
          <el-table-column label="收益率">
            <template #default="scope">
              <span :class="getPnlClass(scope.row)">
                {{ calculatePnlRate(scope.row) }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="closePrice" label="平仓价格" />
          <el-table-column prop="liquidationPrice" label="强平价格">
            <template #default="scope">
              <span class="liquidation-price">
                {{ scope.row.liquidationPrice }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button 
                type="danger" 
                size="small" 
                @click="handleClose(scope.row)"
              >
                平仓
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Position {
  symbol: string
  direction: 'LONG' | 'SHORT'
  amount: number
  currentPrice: number
  costPrice: number
  closePrice: number
  liquidationPrice: number
}

interface AccountInfo {
  totalBalance: number
  availableBalance: number
}

const accountInfo = ref<AccountInfo>({
  totalBalance: 0,
  availableBalance: 0
})

const positions = ref<Position[]>([])

// 获取账户信息
const getAccountInfo = async () => {
  try {
    // TODO: 替换为实际API调用
    accountInfo.value = {
      totalBalance: 10000.00,
      availableBalance: 5000.00
    }
    
    positions.value = [
      {
        symbol: 'BTCUSDT',
        direction: 'LONG',
        amount: 0.5,
        currentPrice: 45000,
        costPrice: 44000,
        closePrice: 44500,
        liquidationPrice: 40000
      },
      {
        symbol: 'ETHUSDT',
        direction: 'SHORT',
        amount: 2,
        currentPrice: 2800,
        costPrice: 3000,
        closePrice: 2900,
        liquidationPrice: 3200
      }
    ]
  } catch (error) {
    ElMessage.error('获取账户信息失败')
  }
}

// 计算收益率
const calculatePnlRate = (position: Position) => {
  const pnl = position.direction === 'LONG'
    ? (position.currentPrice - position.costPrice)
    : (position.costPrice - position.currentPrice)
  const rate = (pnl / position.costPrice) * 100
  return rate.toFixed(2)
}

// 处理平仓操作
const handleClose = (position: Position) => {
  ElMessageBox.confirm(
    `确认要平掉 ${position.symbol} 的${position.direction === 'LONG' ? '多' : '空'}单吗？`,
    '平仓确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // TODO: 调用平仓 API
    ElMessage.success('平仓指令已发送')
  }).catch(() => {
    // 取消操作
  })
}

// 获取盈亏样式类
const getPnlClass = (position: Position) => {
  const pnl = Number(calculatePnlRate(position))
  return pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : ''
}

onMounted(() => {
  getAccountInfo()
})
</script>

<style scoped lang="scss">
.contract-account {
  height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;

  .header {
    margin-bottom: 20px;
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .back-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0;
        height: auto;
        
        &:hover {
          color: #409EFF;
        }
      }

      h2 {
        margin: 0;
        color: #303133;
      }
    }
  }

  .content {
    .balance-card {
      margin-bottom: 20px;

      .balance-info {
        display: flex;
        gap: 40px;

        .balance-item {
          .label {
            color: #909399;
            margin-bottom: 8px;
          }
          
          .value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }

    .positions-card {
      .card-header {
        font-weight: bold;
      }
    }
  }
}

// 持仓方向样式
.long {
  color: #67C23A;
}

.short {
  color: #F56C6C;
}

// 盈亏样式
.profit {
  color: #67C23A;
}

.loss {
  color: #F56C6C;
}

// 添加强平价格样式
.liquidation-price {
  color: #E6A23C;
  font-weight: 500;
}

// 更新表格样式
:deep(.el-table) {
  .el-button--small {
    padding: 6px 16px;
  }
}
</style> 