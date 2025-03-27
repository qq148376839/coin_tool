<template>
  <div class="strategy-container">
    <div class="strategy-header">
      <h2>策略交易</h2>
    </div>

    <div class="strategy-content">
      <el-tabs v-model="activeTab" class="strategy-tabs">
        <el-tab-pane label="量化交易" name="quant">
          <QuantTrading />
        </el-tab-pane>
        <el-tab-pane label="AI智能推荐" name="ai">
          <AiRecommend />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QuantTrading from '../components/QuantTrading.vue'
import AiRecommend from '../components/AiRecommend.vue'

const activeTab = ref('quant')
</script>

<style scoped lang="scss">
.strategy-container {
  min-height: 100vh;
  background-color: #f5f7fa;

  .strategy-header {
    background: #fff;
    padding: 20px 24px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
      font-weight: 600;
    }
  }

  .strategy-content {
    padding: 0 24px;
    
    .strategy-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 20px;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
      }

      :deep(.el-tabs__item) {
        font-size: 16px;
        padding: 0 24px;
        height: 48px;
        line-height: 48px;

        &.is-active {
          font-weight: 600;
        }
      }

      :deep(.el-tabs__active-bar) {
        height: 3px;
        border-radius: 3px;
      }
    }
  }
}
</style> 