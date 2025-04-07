<template>
  <div class="contract-account" v-loading="isLoading">
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
      <el-card class="account-info">
        <template #header>
          <div class="card-header">
            <span>账户信息</span>
          </div>
        </template>
        <div class="info-content">
          <div class="info-item">
            <span class="label">账户权益:</span>
            <span class="value">{{ accountInfo.totalEquity }}</span>
          </div>
          <div class="info-item">
            <span class="label">可用余额:</span>
            <span class="value">{{ accountInfo.availableBalance }}</span>
          </div>
          <div class="info-item">
            <span class="label">保证金率:</span>
            <span class="value">{{ accountInfo.marginRatio }}%</span>
          </div>
        </div>
      </el-card>

      <!-- 持仓信息 -->
      <el-card class="positions">
        <template #header>
          <div class="card-header">
            <span>持仓列表</span>
          </div>
        </template>
        
        <el-table :data="positions" style="width: 100%">
          <el-table-column prop="symbol" label="合约" />
          <el-table-column prop="direction" label="方向">
            <template #default="{ row }">
              <span :class="row.direction === 'LONG' ? 'long' : 'short'">
                {{ row.direction === 'LONG' ? '多' : '空' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="currentPrice" label="当前价格" />
          <el-table-column prop="costPrice" label="成本价" />
          <el-table-column prop="unrealizedPnL" label="未实现盈亏" />
          <el-table-column prop="marginRatio" label="保证金率" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="handleClose(row)">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { accountApi, orderApi, wsApi, quoteApi } from '../api/longport'

interface Position {
  symbol: string
  direction: 'LONG' | 'SHORT'
  quantity: number
  currentPrice: number
  costPrice: number
  unrealizedPnL: number
  marginRatio: number
}

interface AccountInfo {
  totalEquity: number
  availableBalance: number
  marginRatio: number
}

const accountInfo = ref<AccountInfo>({
  totalEquity: 0,
  availableBalance: 0,
  marginRatio: 0
})

const positions = ref<Position[]>([])
const isLoading = ref(false)

// 获取账户信息
const getAccountInfo = async () => {
  try {
    isLoading.value = true
    const [balanceRes, marginRes] = await Promise.all([
      accountApi.getBalance(),
      accountApi.getMarginRatio()
    ])
    
    accountInfo.value = {
      totalEquity: balanceRes.data.totalEquity,
      availableBalance: balanceRes.data.availableBalance,
      marginRatio: marginRes.data.marginRatio
    }
  } catch (error) {
    ElMessage.error('获取账户信息失败')
  } finally {
    isLoading.value = false
  }
}

// 获取持仓信息
const getPositions = async () => {
  try {
    const todayOrders = await orderApi.getTodayOrders()
    // 处理订单数据转换为持仓信息
    positions.value = todayOrders.data.map((order: any) => ({
      symbol: order.symbol,
      direction: order.side === 'BUY' ? 'LONG' : 'SHORT',
      quantity: order.quantity,
      currentPrice: order.price,
      costPrice: order.avgPrice,
      unrealizedPnL: order.unrealizedPnL,
      marginRatio: order.marginRatio
    }))
  } catch (error) {
    ElMessage.error('获取持仓信息失败')
  }
}

// 订阅行情
const subscribeQuotes = async () => {
  try {
    const socket = wsApi.connect()
    const symbols = positions.value.map(p => p.symbol)
    if (symbols.length > 0) {
      await wsApi.subscribe(symbols, ['QUOTE'])
      socket.on('quote', (quote) => {
        // 更新持仓的当前价格
        const position = positions.value.find(p => p.symbol === quote.symbol)
        if (position) {
          position.currentPrice = quote.lastDone
        }
      })
    }
  } catch (error) {
    console.error('订阅行情失败:', error)
  }
}

// 处理平仓操作
const handleClose = async (position: Position) => {
  try {
    await ElMessageBox.confirm(
      `确认要平掉 ${position.symbol} 的${position.direction === 'LONG' ? '多' : '空'}单吗？`,
      '平仓确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await orderApi.submitOrder({
      symbol: position.symbol,
      orderType: 'MARKET',
      side: position.direction === 'LONG' ? 'SELL' : 'BUY',
      quantity: position.quantity
    })
    
    ElMessage.success('平仓成功')
    await getPositions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('平仓失败')
    }
  }
}

onMounted(async () => {
  await getAccountInfo()
  await getPositions()
  await subscribeQuotes()
})

onUnmounted(() => {
  wsApi.disconnect()
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
    .account-info {
      margin-bottom: 20px;
    }
    
    .info-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .info-item {
      .label {
        color: #666;
        margin-right: 8px;
      }
      
      .value {
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

// 更新表格样式
:deep(.el-table) {
  .el-button--small {
    padding: 6px 16px;
  }
}
</style> 