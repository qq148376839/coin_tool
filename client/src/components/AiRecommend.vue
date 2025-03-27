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

              <el-form-item label="模型选择">
                <el-select v-model="factorForm.model" placeholder="选择AI模型">
                  <el-option v-for="item in modelOptions" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 右列参数 -->
            <el-col :span="12">
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

        <el-button 
          type="primary" 
          :loading="isBacktesting"
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
                  <el-icon><Money /></el-icon>
                  <span>初始本金</span>
                </div>
              </template>
              <div class="card-value">{{ backtestResults?.initialCapital || '10000' }} USDT</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Money /></el-icon>
                  <span>盈亏比</span>
                </div>
              </template>
              <div class="card-value" :class="getValueClass(backtestResults?.profitRatio)">
                {{ backtestResults?.profitRatio || '0.00' }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="result-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><Money /></el-icon>
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
                  <el-icon><Money /></el-icon>
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
                  <el-icon><Money /></el-icon>
                  <span>亏损次数</span>
                </div>
              </template>
              <div class="card-value danger">{{ backtestResults?.lossCount || '0' }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>


    <!-- AI对话按钮 -->
    <el-button
      class="ai-chat-btn"
      type="primary"
      circle
      @click="openChatDialog"
    >
      <el-icon><ChatDotRound /></el-icon>
    </el-button>

    <!-- AI对话弹窗 -->
    <el-dialog
      v-model="chatDialogVisible"
      title="AI 智能助手"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <div v-for="(msg, index) in chatMessages" 
            :key="index" 
            :class="['message', msg.type]"
          >
            {{ msg.content }}
          </div>
        </div>
        <div class="chat-input">
          <el-input
            v-model="userInput"
            placeholder="请输入您的问题..."
            :disabled="isAiResponding"
            @keyup.enter="sendMessage"
          >
            <template #append>
              <el-button 
                type="primary" 
                :loading="isAiResponding"
                @click="sendMessage"
              >
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, ChatDotRound } from '@element-plus/icons-vue'
import { io } from 'socket.io-client'

// 定义回测结果类型
interface BacktestResults {
  initialCapital: number
  profitRatio: number
  highestPrice: number
  lowestPrice: number
  profitCount: number
  lossCount: number
}

// 模型选项
const modelOptions = [
  { label: 'GPT-4', value: 'gpt4' },
  { label: 'LSTM', value: 'lstm' },
  { label: 'Transformer', value: 'transformer' },
]

// 时间周期选项
const timeFrameOptions = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '15分钟', value: '15m' },
  { label: '1小时', value: '1h' },
  { label: '4小时', value: '4h' },
  { label: '1天', value: '1d' },
]

// 货币选项
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
  model: 'gpt4',
  profitRate: 2.0,
  stopLossRate: 1.0,
});

// 手续费率
const feeRate = ref(0.1);

// 回测状态和结果
const isBacktesting = ref(false);
const backtestResults = ref<BacktestResults | null>(null);

// 聊天相关
const chatDialogVisible = ref(false);
const isAiResponding = ref(false);
const userInput = ref('');
const chatMessages = ref<Array<{type: 'user' | 'ai', content: string}>>([]);

let socket: any = null;

// 连接WebSocket
onMounted(() => {
  // 连接到WebSocket服务器
  socket = io(`ws://localhost:${import.meta.env.VITE_APP_PORT || '14086'}/ws`, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // 监听连接成功事件
  socket.on('connect', () => {
    console.log('WebSocket连接成功');
  });

  // 监听测试消息
  socket.on('test', (data: any) => {
    console.log('收到测试消息:', data);
  });

  // 监听心跳消息
  socket.on('heartbeat', (data: any) => {
    console.log('收到心跳:', data);
  });

  // 监听连接错误
  socket.on('connect_error', (error: any) => {
    console.error('WebSocket连接错误:', error);
    ElMessage.error('WebSocket连接失败，正在重试...');
  });

  // 监听断开连接
  socket.on('disconnect', (reason: string) => {
    console.log('WebSocket断开连接:', reason);
    ElMessage.warning('WebSocket断开连接，正在重连...');
  });
});

// 组件卸载时断开连接
onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

// 打开聊天对话框
const openChatDialog = () => {
  chatDialogVisible.value = true
  if (chatMessages.value.length === 0) {
    chatMessages.value.push({
      type: 'ai',
      content: '您好！我是AI智能助手，请问有什么可以帮您？'
    })
  }
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || isAiResponding.value) return;

  const userMessage = userInput.value;
  chatMessages.value.push({
    type: 'user',
    content: userMessage
  });
  userInput.value = '';
  isAiResponding.value = true;

  try {
    if (!socket?.connected) {
      throw new Error('WebSocket未连接');
    }

    socket.emit('aiChat', userMessage, (response: any) => {
      if (response.event === 'aiResponse') {
        chatMessages.value.push(response.data);
      } else if (response.event === 'aiError') {
        ElMessage.error(response.data.message);
      }
      isAiResponding.value = false;
    });
  } catch (error) {
    ElMessage.error('发送消息失败');
    isAiResponding.value = false;
  }
};

// 开始回测
const startBacktest = () => {
  if (!socket?.connected) {
    ElMessage.error('WebSocket未连接');
    return;
  }

  isBacktesting.value = true;
  
  socket.emit('startBacktest', {
    ...factorForm,
    feeRate: feeRate.value
  }, (response: any) => {
    if (response.event === 'backtestResult') {
      backtestResults.value = response.data;
    } else if (response.event === 'backtestError') {
      ElMessage.error(response.data.message);
    }
    isBacktesting.value = false;
  });
};

// 获取数值的样式类
const getValueClass = (value: number | undefined) => {
  if (value === undefined) return ''
  return value > 0 ? 'success' : value < 0 ? 'danger' : ''
}
</script>

<style scoped lang="scss">
.quant-trading {
  display: flex;
  gap: 20px;
  height: 650px;
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

    .config-form {
      :deep(.el-form-item) {
        margin-bottom: 18px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(.el-select) {
        width: 100%;
      }
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

// AI对话按钮
.ai-chat-btn {
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  :deep(.el-icon) {
    font-size: 24px;
  }
}

// 对话框样式
.chat-container {
  height: 400px;
  display: flex;
  flex-direction: column;

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .message {
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      max-width: 80%;

      &.user {
        background: #409eff;
        color: white;
        margin-left: auto;
      }

      &.ai {
        background: white;
        color: #303133;
        margin-right: auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .chat-input {
    margin-top: auto;
  }
}
</style> 