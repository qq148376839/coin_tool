<template>
  <div class="verify-container">
    <div class="header">
      <el-button @click="goBack">返回</el-button>
    </div>
    
    <div class="content">
      <h3>自定义变量</h3>
      <div class="variables-list">
        <div v-for="variable in state.customVariables" 
             :key="variable.name" 
             class="variable-item"
        >
          <span class="name">{{ variable.name }}</span>
          <span class="type">{{ variable.type }}</span>
          <span class="value">{{ variable.value }}</span>
        </div>
      </div>

      <h3>交易变量</h3>
      <div class="trade-variables">
        <div class="trade-item">
          <span class="label">开仓价格:</span>
          <span class="value">{{ state.openPrice }}</span>
        </div>
        <div class="trade-item">
          <span class="label">平仓价格:</span>
          <span class="value">{{ state.closePrice }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

interface CustomVariable {
  name: string;
  value: string;
  type: 'number' | 'formula';
}

interface State {
  customVariables: CustomVariable[];
  openPrice: string;
  closePrice: string;
}

const state = ref<State>({
  customVariables: [],
  openPrice: '',
  closePrice: ''
})

onMounted(() => {
  const stateQuery = route.query.state as string
  if (stateQuery) {
    try {
      state.value = JSON.parse(decodeURIComponent(stateQuery))
    } catch (error) {
      console.error('Failed to parse state:', error)
    }
  }
})

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.verify-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .header {
    margin-bottom: 20px;
  }

  .content {
    background: #fff;
    border-radius: 8px;
    padding: 20px;

    h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .variables-list {
      margin-bottom: 32px;

      .variable-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #f5f7fa;
        margin-bottom: 8px;
        border-radius: 4px;
        gap: 16px;

        .name {
          font-weight: bold;
          min-width: 100px;
        }

        .type {
          color: #409EFF;
          padding: 2px 8px;
          background: #ecf5ff;
          border-radius: 4px;
          font-size: 12px;
        }

        .value {
          color: #666;
        }
      }
    }

    .trade-variables {
      .trade-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;

        .label {
          font-weight: 500;
          min-width: 100px;
        }

        .value {
          color: #67C23A;
          font-weight: 500;
        }
      }
    }
  }
}
</style> 