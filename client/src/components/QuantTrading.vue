<template>
  <div class="quant-trading">
    <div class="factor-config">
      <h3>因子参数配置</h3>
      <div class="config-form">
        <el-form :model="factorForm" label-width="100px">
          <el-row :gutter="32">
            <!-- 左列参数 -->
            <el-col :span="12">

              <el-form-item label="时间周期">
                <el-select v-model="factorForm.timeFrame" placeholder="选择时间周期">
                  <el-option v-for="item in timeFrameOptions" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="K线数量">
                <el-input-number 
                  v-model="factorForm.klineCount" 
                  :min="10" 
                  :max="1000"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="窗口数">
                <el-input-number 
                  v-model="factorForm.windowSize" 
                  :min="1" 
                  :max="100"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <!-- 右列参数 -->
            <el-col :span="12">
              <el-form-item label="浮动比">
                <el-input-number 
                  v-model="factorForm.orderFloat" 
                  :min="0.1" 
                  :max="10" 
                  :step="0.1" 
                  :precision="2"
                  style="width: 100%"
                >
                  <template #suffix>%</template>
                </el-input-number>
              </el-form-item>

              <el-form-item label="盈利率">
                <el-input-number 
                  v-model="factorForm.profitRate" 
                  :min="0.1" 
                  :max="100" 
                  :step="0.1" 
                  :precision="2"
                  style="width: 100%"
                >
                  <template #suffix>%</template>
                </el-input-number>
              </el-form-item>

              <el-form-item label="止损率">
                <el-input-number 
                  v-model="factorForm.stopLossRate" 
                  :min="0.1" 
                  :max="100" 
                  :step="0.1" 
                  :precision="2"
                  style="width: 100%"
                >
                  <template #suffix>%</template>
                </el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="control-panel">
        <div class="control-item">
          <span class="label">手续费率：</span>
          <el-input-number 
            v-model="feeRate" 
            :min="0" 
            :max="1" 
            :step="0.001" 
            :precision="3"
            size="small"
          >
            <template #suffix>%</template>
          </el-input-number>
        </div>

        <div class="control-item">
          <span class="label">交易货币：</span>
          <el-select 
            v-model="factorForm.symbol" 
            placeholder="选择交易货币"
            size="small"
            style="width: 120px"
          >
            <el-option
              v-for="item in coinOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="control-item">
          <span class="label">时间范围</span>
          <div class="block">
            <el-date-picker
              v-model="rangeTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </div>
        </div>

        <el-button 
          type="primary" 
          @click="startBacktest"
          size="large"
        >
          开始回测
        </el-button>
      </div>
    </div>

    <div class="backtest-section">
      <h3>回测结果</h3>
      <div class="backtest-results">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><MoneyCircle /></el-icon>
                  <span>本金</span>
                </div>
              </template>
              <div class="card-value">{{ backtestResults?.initialCapital || 0 }} USDT</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><TrendChart /></el-icon>
                  <span>盈亏比</span>
                </div>
              </template>
              <div class="card-value" :class="getProfitClass(backtestResults?.profitRatio)">
                {{ (backtestResults?.profitRatio).toFixed(3) || 0}}
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><TopRight /></el-icon>
                  <span>最高/最低价格</span>
                </div>
              </template>
              <div class="card-value">
                {{ backtestResults?.highestPrice || '0.00' }} / {{ backtestResults?.lowestPrice || '0.00' }}
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mt-20">
          <el-col :span="12">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Check /></el-icon>
                  <span>盈利次数</span>
                </div>
              </template>
              <div class="card-value success">{{ backtestResults?.profitCount || '0' }}</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Warning /></el-icon>
                  <span>亏损次数</span>
                </div>
              </template>
              <div class="card-value danger">{{ backtestResults?.lossCount || '0' }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MoneyCircle, TrendChart, TopRight, Check, Warning } from '@element-plus/icons-vue'
import { io } from 'socket.io-client'

// 时间周期选项
const timeFrameOptions = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '15分钟', value: '15m' },
  { label: '1小时', value: '1h' },
  { label: '4小时', value: '4h' },
  { label: '1天', value: '1d' },
]

// 添加货币选项
const coinOptions = [
  { label: 'DOGE/USDT', value: 'DOGEUSDT' },
  { label: 'BTC/USDT', value: 'BTCUSDT' },
  { label: 'ETH/USDT', value: 'ETHUSDT' },
  { label: 'BNB/USDT', value: 'BNBUSDT' },
]

// 因子表单数据
const factorForm = reactive({
  symbol: 'DOGEUSDT',
  timeFrame: '15m',
  klineCount: 100,
  windowSize: 4,
  orderFloat: 1.0,
  profitRate: 2.0,
  stopLossRate: 1.0,
})

// 手续费率
const feeRate = ref(0.1)

const rangeTime = ref([new Date('2024-02-01'), new Date('2024-03-01')])

// 定义类型
interface BacktestResults {
  initialCapital: number;
  profitRatio: number;
  highestPrice: number;
  lowestPrice: number;
  profitCount: number;
  lossCount: number;
  value?: any; // 添加可选的value属性
}

// 回测状态和结果
const isBacktesting = ref(false)
const backtestResults = reactive<BacktestResults>({
  initialCapital: 1000,
  profitRatio: 0,
  highestPrice: 0,
  lowestPrice: 0,
  profitCount: 0,
  lossCount: 0
})
let socket:any = null;

// 开始回测
const startBacktest = () => {

  try {


    // 监听回测结果
    socket.on('backtestResult', (data: any) => {
      console.log('收到回测结果:', data);
      backtestResults.value = data.data;
      isBacktesting.value = false;
      socket.disconnect(); // 收到结果后断开连接
    });
    console.log(rangeTime.value[0])

    socket.on('tests', (data: any) => {
      console.log('收到回测结果:', data);
      const {failCount, maxPrincipal, minPrincipal, principal, winCount} = data;
      backtestResults.initialCapital = principal;
      if (winCount || failCount) {
        backtestResults.profitRatio = failCount ? winCount/failCount : 100
      }
      backtestResults.highestPrice = maxPrincipal;
      backtestResults.lowestPrice = minPrincipal;
      backtestResults.profitCount = winCount;
      backtestResults.lossCount = failCount;
    });

    const params:any = {
      symbol: factorForm.symbol,
      timeFrame: factorForm.timeFrame,
      klineCount: factorForm.klineCount,
      windowSize: factorForm.windowSize,
      orderFloat: factorForm.orderFloat,
      profitRate: factorForm.profitRate,
      stopLossRate: factorForm.stopLossRate,
      feeRate: feeRate.value,
    }
    if (rangeTime.value.length) {
      params.startTime = new Date(rangeTime.value[0]).getTime()
      params.endTime = new Date(rangeTime.value[1]).getTime()
    }
    socket.emit('checkQuant', params);

    // 监听错误消息
    socket.on('backtestError', (error: any) => {
      console.error('回测错误:', error);
      ElMessage.error(error.data.message || '回测失败');
      isBacktesting.value = false;
      socket.disconnect();
    });

    // 监听连接错误
    socket.on('connect_error', (error: any) => {
      console.error('WebSocket连接错误:', error);
      ElMessage.error('连接失败，请重试');
      isBacktesting.value = false;
      socket.disconnect();
    });

    // 监听断开连接
    socket.on('disconnect', () => {
      console.log('WebSocket断开连接');
      isBacktesting.value = false;
    });

  } catch (error) {
    console.error('连接错误:', error);
    ElMessage.error('连接失败，请重试');
    isBacktesting.value = false;
  }
};

// WebSocket 相关
let ws: WebSocket | null = null;

// 获取盈亏样式类
const getProfitClass = (value: number) => {
  return value >= 0 ? 'profit-positive' : 'profit-negative';
};

onMounted(() => {
      // 创建 WebSocket 连接
      socket = io(`ws://localhost:${import.meta.env.VITE_APP_PORT || '14086'}/ws`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
}),

// 组件卸载时关闭 WebSocket
onUnmounted(() => {
  
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped lang="scss">
.quant-trading {
  display: flex;
  gap: 20px;

  .factor-config {
    flex: 0 0 600px;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    height: fit-content;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    h3 {
      margin-bottom: 20px;
      color: #303133;
      font-weight: 600;
      font-size: 18px;
    }

    .control-panel {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;

      .control-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .label {
          color: #606266;
          font-size: 14px;
        }
      }

      .el-button {
        width: 180px;
        margin-top: 8px;
      }
    }
  }

  .backtest-section {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    h3 {
      margin-bottom: 24px;
      color: #303133;
      font-weight: 600;
      font-size: 18px;
    }

    .backtest-results {
      .result-card {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          
          .el-icon {
            font-size: 16px;
          }
        }

        .card-value {
          font-size: 28px;
          font-weight: 600;
          text-align: center;
          margin: 16px 0;
          color: #303133;

          &.success {
            color: #67C23A;
          }

          &.danger {
            color: #F56C6C;
          }
        }
      }
    }
  }
}

.mt-20 {
  margin-top: 20px;
}
</style> 