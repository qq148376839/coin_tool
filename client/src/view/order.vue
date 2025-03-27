<template>
  <div class="order-page">
    <!-- 左侧订单列表 -->
    <div class="order-list">
      <div class="header">
        <el-button class="back-btn" @click="$router.push('/')" type="text">
          <el-icon><ArrowLeft /></el-icon>返回首页
        </el-button>
      </div>

      <el-tabs v-model="activeTab">
        <!-- 当前持仓 tab -->
        <el-tab-pane label="当前持仓" name="position">
          <el-table :data="orderList" style="width: 100%">
            <el-table-column prop="symbol" label="货币" />
            <el-table-column prop="positionSide" label="方向">
              <template #default="scope">
                <span :class="scope.row.positionSide === 'LONG' ? 'long' : 'short'">
                  {{ scope.row.positionSide === 'LONG' ? '多' : '空' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="breakEvenPrice" label="成本价">
                <template #default="scope">
                    <span>
                        {{ formatProfit(scope.row.breakEvenPrice) }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="当前价格">
                <template #default="scope">
                    <span style="color: #409EFF;">
                        {{ formatProfit(symbolMap[scope.row.symbol] || 0) }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="leverage" label="倍数" width="60" />
            <el-table-column prop="positionAmt" label="数量" width="100" />
            <el-table-column prop="unrealizedProfit" label="收益">
              <template #default="scope">
                <span :class="getProfitClass(scope.row.unrealizedProfit)" style="font-weight: bold;">
                  {{ formatProfit(scope.row.unrealizedProfit) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleClose(scope.row)">平仓</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 当前挂单 tab -->
        <el-tab-pane label="当前挂单" name="pending">
          <el-table :data="pendingList" style="width: 100%">
            <el-table-column prop="symbol" label="货币" />
            <el-table-column prop="direction" label="方向">
              <template #default="scope">
                <span :class="scope.row.direction === 'LONG' ? 'long' : 'short'">
                  {{ scope.row.direction === 'LONG' ? '多' : '空' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型">
              <template #default="scope">
                <span :class="scope.row.type === 'STOP_MARKET' ? 'short' : 'long'">
                  {{ scope.row.type === 'STOP_MARKET' ? '止损' : '止益' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="挂单价" />
            <el-table-column prop="amount" label="数量" />
            <el-table-column prop="triggerPrice" label="触发价" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="danger" size="small" @click="handleCancelPending(scope.row)">
                  撤销挂单
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧下单面板 -->
    <div class="order-panel">
      <h2>下单面板</h2>
      
      <div class="panel-content">
        <!-- 账户余额显示 -->
        <div class="balance-info">
          <div class="balance-item">
            <span class="label">可用USDT：</span>
            <span class="value">{{ availableUsdt }}</span>
          </div>
          <div class="balance-item">
            <span class="label">账户USDT：</span>
            <span class="value">{{ totalUsdt }}</span>
          </div>
        </div>

        <div class="leverage-info">
          <span class="label">当前倍数：</span>
          <span class="value">5x</span>
        </div>

        <el-form :model="orderForm" label-width="100px">
          <el-form-item label="货币类型">
            <el-select v-model="orderForm.symbol" placeholder="请选择货币" @change="handleSymbolChange">
              <el-option
                v-for="item in coinOptions"
                :key="item.symbol"
                :label="item.label"
                :value="item.symbol"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="当前价格">
            <div class="current-price">
              <span>{{ currentPrice || '--' }}</span>
              <el-button type="primary" link @click="getCurrentPrice">刷新</el-button>
            </div>
          </el-form-item>

          <el-form-item label="交易方向">
            <el-radio-group v-model="orderForm.direction">
              <el-radio label="LONG">做多</el-radio>
              <el-radio label="SHORT">做空</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="挂单价格">
            <el-input-number 
              v-model="orderForm.price" 
              :precision="4" 
              :step="0.0001" 
              :min="0"
            />
          </el-form-item>

          <el-form-item label="数量">
            <div class="amount-input">
              <el-input-number 
                v-model="orderForm.amount" 
                :precision="5" 
                :step="amountStep"
                :min="0"
                :max="maxAmount"
                @change="handleAmountChange"
              />
              <div class="slider-container">
                <el-slider 
                  v-model="amountPercentage" 
                  :min="1" 
                  :max="100"
                  :format-tooltip="(val) => val + '%'"
                  @input="handleSliderChange"
                />
              </div>
            </div>
          </el-form-item>

          <el-divider />

          <el-form-item>
            <el-checkbox v-model="orderForm.enableStopLoss">启用止损</el-checkbox>
            <el-checkbox v-model="orderForm.enableTakeProfit" style="margin-left: 20px">启用止盈</el-checkbox>
          </el-form-item>

          <el-form-item label="止损价格" v-if="orderForm.enableStopLoss">
            <el-input-number 
              v-model="orderForm.stopLoss" 
              :precision="4" 
              :step="0.0001" 
              :min="0"
            />
          </el-form-item>

          <el-form-item label="止盈价格" v-if="orderForm.enableTakeProfit">
            <el-input-number 
              v-model="orderForm.takeProfit" 
              :precision="4" 
              :step="0.0001" 
              :min="0"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 固定的提交按钮 -->
      <div class="submit-footer">
        <el-button type="primary" @click="submitOrder" size="large">
          提交订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserContractNews, getUserOrderList } from '../api/common'

// 余额相关
const availableUsdt = ref(0)
const totalUsdt = ref(0)
let balanceTimer: NodeJS.Timer | null = null

// 订单表单数据
const orderForm = ref({
  symbol: '',
  direction: 'LONG',
  price: 0,
  amount: 0,
  stopLoss: 0,
  takeProfit: 0,
  enableStopLoss: false,
  enableTakeProfit: false
})

// 币种选项
const coinOptions = ref([
  { symbol: 'BTCUSDT', label: 'BTCUSDT' },
  { symbol: 'ETHUSDT', label: 'ETHUSDT' },
  { symbol: 'DOGEUSDT', label: 'DOGEUSDT' }
])

// 订单列表
const orderList = ref([])

const currentPrice = ref<number | null>(null)

const activeTab = ref('position')
const pendingList = ref([])

const amountPercentage = ref(100)
const maxAmount = ref(0)
const amountStep = ref(0.00001)
const symbolMap = ref({})

// 提交订单
const submitOrder = async () => {
  try {
    // 构建提交数据
    const submitData = {
      symbol: orderForm.value.symbol,
      direction: orderForm.value.direction,
      price: orderForm.value.price,
      amount: orderForm.value.amount,
      // 只有启用时才提交止损止盈价格
      ...(orderForm.value.enableStopLoss ? { stopLoss: orderForm.value.stopLoss } : {}),
      ...(orderForm.value.enableTakeProfit ? { takeProfit: orderForm.value.takeProfit } : {})
    }

    // TODO: 调用下单API
    console.log('提交数据:', submitData)
    ElMessage.success('下单成功')
    getUserBalance();
  } catch (error) {
    ElMessage.error('下单失败')
  }
}

// 平仓
const handleClose = async () => {
  try {
    await ElMessageBox.confirm('确认要平仓吗？', '提示')
    // TODO: 调用平仓API
    ElMessage.success('平仓成功')
    getUserBalance();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('平仓失败')
    }
  }
}


// 获取用户余额
const getUserBalance = async () => {
  try {
    // TODO: 调用获取余额API
    const res = await getUserContractNews({
        symbol: orderForm.value.symbol
    })
    const {totalPrice, remainPrice, positions} = res.data.data;
    availableUsdt.value = remainPrice
    totalUsdt.value = totalPrice
    orderList.value = positions
    symbolMap.value = res.data.data.symbolMap
    if (orderForm.value.symbol) {
        currentPrice.value = symbolMap.value[orderForm.value.symbol]
    }
  } catch (error) {
    console.error('获取余额失败:', error)
  }
}

// 启动定时器
const startBalanceTimer = () => {
  getUserBalance() // 立即执行一次
  balanceTimer = setInterval(getUserBalance, 5000)
}

// 清理定时器
const clearBalanceTimer = () => {
  if (balanceTimer) {
    clearInterval(balanceTimer)
    balanceTimer = null
  }
}

// 获取当前价格
const getCurrentPrice = async () => {
  if (!orderForm.value.symbol) return
  
  try {
    await getUserBalance()
    currentPrice.value = symbolMap.value[orderForm.value.symbol]
    // 自动填入当前价格作为挂单价格
    if (!orderForm.value.price) {
      orderForm.value.price = currentPrice.value
    }
    maxAmount.value = calculateMaxAmount()
    handleSliderChange(amountPercentage.value)
  } catch (error) {
    console.error('获取价格失败:', error)
    ElMessage.error('获取价格失败')
  }
}

// 处理货币类型变化
const handleSymbolChange = () => {
  currentPrice.value = null
  getCurrentPrice()
}

// 获取挂单列表
const getPendingList = async () => {
  try {
        // 获取当前用户挂单信息
     const list = await getUserOrderList();
    pendingList.value = list.data.data.map(item => {
      const {symbol, position, stopPrice, origQty, origType} = item;
      return {
        symbol,
        direction: position,
        price: stopPrice,
        amount: +origQty || '全仓',
        triggerPrice: stopPrice,
        type: origType
      }
    });
    // TODO: 调用获取挂单列表API
    // pendingList.value = [
    //   {
    //     symbol: 'BTCUSDT',
    //     direction: 'LONG',
    //     price: 45000,
    //     amount: 0.1,
    //     stopLoss: 44000,
    //     takeProfit: 46000,
    //     createTime: '2024-01-20 10:00:00'
    //   }
    // ]
  } catch (error) {
    console.log(error);
    ElMessage.error('获取挂单列表失败')
  }
}

// 撤销挂单
const handleCancelPending = async (order) => {
  try {
    await ElMessageBox.confirm('确认要撤销此挂单吗？', '提示')
    // TODO: 调用撤销挂单API
    ElMessage.success('撤销成功')
    await getPendingList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('撤销失败')
    }
  }
}

// 更新获取数据的方法
const refreshData = async () => {
  if (activeTab.value !== 'position') {
    await getPendingList()
  }
}

// 监听tab切换
watch(activeTab, () => {
  refreshData()
})

// 计算最大可交易数量
const calculateMaxAmount = () => {
  if (!orderForm.value.price || !availableUsdt.value) return 0
  
  const leverage = 5 // 固定5倍杠杆
  const rawAmount = (availableUsdt.value * leverage) / orderForm.value.price
  // 取5位有效数字
  const precision = 5
  const factor = Math.pow(10, precision - Math.floor(Math.log10(rawAmount)) - 1)
  return Math.floor(rawAmount * factor) / factor
}

// 监听价格变化重新计算最大数量
watch(() => orderForm.value.price, () => {
  maxAmount.value = calculateMaxAmount()
  // 保持百分比不变，重新计算数量
  handleSliderChange(amountPercentage.value)
})

// 监听可用USDT变化
watch(availableUsdt, () => {
  maxAmount.value = calculateMaxAmount()
  handleSliderChange(amountPercentage.value)
})

// 处理滑块变化
const handleSliderChange = (percentage: number) => {
  amountPercentage.value = percentage
  const newAmount = (maxAmount.value * percentage) / 100
  // 保持5位有效数字
  const precision = 5
  const factor = Math.pow(10, precision - Math.floor(Math.log10(newAmount)) - 1)
  orderForm.value.amount = Math.floor(newAmount * factor) / factor
}

// 处理数量输入变化
const handleAmountChange = (value: number) => {
  if (!maxAmount.value) return
  const percentage = (value / maxAmount.value) * 100
  amountPercentage.value = Math.min(Math.max(Math.round(percentage), 1), 100)
}

// 格式化收益数字
const formatProfit = (profit: number) => {
  return Number(profit).toFixed(5)
}

// 获取收益显示的样式类
const getProfitClass = (profit: number) => {
  if (profit > 0) return 'profit-positive'
  if (profit < 0) return 'profit-negative'
  return 'profit-zero'
}

onMounted(() => {
//   refreshData()
  startBalanceTimer()
  nextTick(() => {
    maxAmount.value = calculateMaxAmount()
    if (maxAmount.value > 0) {
      handleSliderChange(100) // 默认设置为100%
    }
  })
})

onUnmounted(() => {
  clearBalanceTimer()
})
</script>

<style scoped lang="scss">
.order-page {
  padding: 20px;
  display: flex;
  gap: 20px;
  height: 100vh;
  box-sizing: border-box;

  .order-list, .order-panel {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .order-list {
    flex: 1;

    .header {
      margin-bottom: 20px;

      .back-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 0;
        height: auto;
        font-size: 14px;
        
        &:hover {
          color: #409EFF;
        }
      }
    }

    :deep(.el-tabs__content) {
      padding: 20px 0;
    }
  }

  .order-panel {
    width: 400px;
    display: flex;
    flex-direction: column;
    position: relative;
    
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 70px; // 为固定按钮留出空间
    }

    .submit-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 15px 20px;
      background: #fff;
      border-top: 1px solid #ebeef5;
      text-align: right;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

      .el-button {
        min-width: 120px;
      }
    }

    .balance-info, .leverage-info {
      margin-bottom: 20px;
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;

      .label {
        color: #909399;
        margin-right: 8px;
      }

      .value {
        color: #409EFF;
        font-weight: bold;
        font-size: 16px;
      }
    }

    .balance-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;

      .balance-item {
        .label {
          color: #909399;
          margin-right: 8px;
        }

        .value {
          color: #409EFF;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }

    .current-price {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      color: #409EFF;
      font-weight: bold;
    }
  }

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #303133;
  }

  .long {
    color: #67C23A;
  }

  .short {
    color: #F56C6C;
  }

  .amount-input {
    .el-input-number {
      width: 100%;
      margin-bottom: 8px;
    }

    .slider-container {
      padding: 0 10px;
      
      :deep(.el-slider__button) {
        border-color: #409EFF;
      }

      :deep(.el-slider__bar) {
        background-color: #409EFF;
      }
    }
  }

  .profit-positive {
    color: #67C23A;
    font-weight: 500;
  }

  .profit-negative {
    color: #F56C6C;
    font-weight: 500;
  }

  .profit-zero {
    color: #909399;
  }
}
</style> 