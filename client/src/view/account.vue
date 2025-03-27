<template>
  <div class="account">
    <div class="header">
      <div class="header-content">
        <el-button class="back-btn" @click="$router.push('/home')" type="text">
          <el-icon><ArrowLeft /></el-icon>返回
        </el-button>
        <h2>账户信息</h2>
      </div>
    </div>
    <div class="user-info">
      <div class="info-content">
        <div class="info-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ userInfo.uid }}</span>
        </div>
        <el-button 
          type="primary" 
          class="contract-btn" 
          @click="$router.push('/contract-account')"
        >
          合约账户
        </el-button>
      </div>
    </div>
    <div class="assets">
      <h3>资产列表</h3>
      <div class="asset-list">
        <div v-for="asset in userAssets" :key="asset.asset" class="asset-item">
          <div class="asset-info">
            <span class="symbol">{{ asset.asset }}</span>
            <span class="balance">数量: {{ asset.free }}</span>
          </div>
          <el-button type="primary" size="small" @click="handleTrade(asset)">交易</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as commonApi from '../api/common'
import { ArrowLeft } from '@element-plus/icons-vue'

interface Asset {
  asset: string;
  free: string;
}

const userInfo = ref({
  uid: '--'
})

const userAssets = ref<Asset[]>([])

const handleTrade = (asset: Asset) => {
  console.log('交易', asset)
  // 实现交易逻辑
}

// 获取用户信息和资产
const getUserInfo = async () => {
  try {
    const res = await commonApi.getUserInfo()
    if (res.data.code === 0) {
      const { balances, uid } = res.data.data
      console.log(balances)
      userInfo.value = { uid }
      userAssets.value = balances || []
    } else {
      ElMessage.error(res.data.message || '获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息错误:', error)
  }
}

onMounted(() => {
  getUserInfo()
})
</script>

<style scoped lang="scss">
.account {
  height: 100vh;
  padding: 20px;
  background-color: #f5f7fa;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;

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

  .user-info {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

    .info-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-item {
        .label {
          color: #909399;
          margin-right: 10px;
        }
        .value {
          font-weight: 500;
          color: #303133;
        }
      }

      .contract-btn {
        font-size: 14px;
      }
    }
  }

  .assets {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    h3 {
      margin: 0 0 20px 0;
    }

    .asset-list {
      flex: 1;
      overflow-y: auto;
      padding-right: 10px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-track {
        background: #f5f7fa;
      }

      .asset-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #ebeef5;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        &:last-child {
          border-bottom: none;
        }

        .asset-info {
          .symbol {
            font-weight: bold;
            font-size: 16px;
            margin-right: 20px;
            color: #303133;
          }
          .balance {
            color: #606266;
          }
        }
      }
    }
  }
}
</style> 