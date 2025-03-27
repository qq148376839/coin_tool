<template>
	<div class="home" is-loading="isLoading">
		<div class="header">
			<div class="coin_name">
				 <span>{{ coin.symbol }}</span>
			</div>
			<div class="coin_price">
				<el-icon class="change_icon"><Top color="#0b974d" v-if="coin.isRise" />
					<Bottom color="#d50808ab" v-else />
				</el-icon>
				<span :class="{'rise': coin.isRise, 'fall': !coin.isRise}">{{ coin.price }}</span>
				<span class="update_time">{{ coin.updateTime }}</span>
			</div>
			<span class="refresh_btn" @click="getCoinPrice()">
				<el-icon style="top: 3px;"><Refresh /></el-icon>
			</span>
			<div class="btn-box">
				<el-button @click="$router.push('/formula')">公式配置</el-button>
				<el-button 
					type="primary" 
					@click="$router.push('/order')"
				>
					挂单交易
				</el-button>
				<el-button 
					type="success" 
					@click="$router.push('/strategy')"
				>
					策略交易
				</el-button>
				<el-button @click="$router.push('/account')">账户</el-button>
			</div>
			<div class="search_box">
				<el-select
					v-model="searchSymbol"
					filterable
					remote
					reserve-keyword
					allow-create
					placeholder="请输入需要查询的coin"
					style="width: 240px"
					@change="setCoinSymbol"
				>
					<el-option
					v-for="item in coinOptions"
					:key="item.symbol"
					:label="item.label"
					:value="item.symbol"
					/>
					<template #loading>
					<svg class="circular" viewBox="0 0 50 50">
						<circle class="path" cx="25" cy="25" r="20" fill="none" />
					</svg>
					</template>
				</el-select>
				<!-- <el-button class="search_coin_btn" @click="setCoinSymbol()" round>搜索</el-button> -->
			</div>
		</div>
		<!-- k线图 -->
		 <div class="kline_box">
			<klinkBox :coin="coin.symbol"> </klinkBox>
		 </div>
	</div>
</template>

<script setup lang="ts">
import * as coinApi from '../api/common'
import { format } from "date-fns";
import { reactive, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import klinkBox from '../components/klineBox.vue'

const searchSymbol = ref('')
const coin = reactive({
	symbol: 'DOGEUSDT',
	price: '0.00',
	isRise: true,
	updateTime: '',
})
const isLoading = ref(false)

const coinOptions = ref([
	{
		symbol: 'DOGEUSDT',
		label: 'DOGEUSDT',
	},
	{
		symbol: 'BTCUSDT',
		label: 'BTCUSDT',
	},
	{
		symbol: 'ETHUSDT',
		label: 'ETHUSDT',
	},
	{
		symbol: 'ACTUSDT',
		label: 'ACTUSDT',
	},
	{
		symbol: 'PNUTUSDT',
		label: 'PNUTUSDT',
	},
])

// 设置当前货币的名称
const setCoinSymbol = async () => {
	isLoading.value = true;
	await getCoinPrice(searchSymbol.value.toUpperCase());
	isLoading.value = false;
}

// 获取货币的价格
const getCoinPrice = async (symbol: string = '') => {
	coinApi.getCoinPrice(symbol || coin.symbol).then((res: any) => {
		const data = res.data.data;
		if (data.price !== coin.price) {
			coin.isRise = +data.price > +coin.price;
		}
		coin.price = data.price;
		coin.symbol = data.symbol;
		coin.updateTime = format(data.updateTime, 'yyyy-MM-dd HH:mm:ss');
	}).catch(() => {
		ElMessage.error('搜索的币种不存在')
	}).finally(() => {
		isLoading.value = false;
		searchSymbol.value = '';
	})
}

onMounted(() => {
	getCoinPrice();
	setInterval(() => {
		getCoinPrice();
	}, 2000);
})

</script>

<style scoped lang="scss">
.home {
	width: 100%;
	height: 100%;
	padding-top: 80px;
	position: relative;
	.header {
		height: 80px;
		width: 100%;
		background-color: #fff;
		position: absolute;
		top: 0;
		display: flex;
		align-items: center;
		.coin_name, .coin_price, .refresh_btn, .search_box {
			display: inline-block;
			vertical-align: top;
		}
		.coin_name {
			font-size: 30px;
			font-weight: bold;
			height: 100%;
			line-height: 80px;
			padding-left: 20px;
		}
		.coin_price {
			font-size: 20px;
			font-weight: bold;
			padding-left: 20px;
			position: relative;
			height: 100%;
			line-height: 80px;
			.rise {
				color: #0b974d;
			}
			.fall {
				color: #d50808ab;
			}
			.change_icon {
				position: relative;
				top: 3px;
			}
			.search_coin_btn {
				margin-left: 10px;
			}
			.update_time {
				font-size: 12px;
				width: 200px;
				color: #bebebeea;
				position: absolute;
				bottom: -20px;
				left: 6px;
			}
		}
		.refresh_btn {
			font-size: 16px;
			padding-left: 20px;
			cursor: pointer;
		}
		.btn-box {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			display: flex;
			gap: 12px;
		}
		.search_box {
			position: absolute;
			right: 10px;
			width: 240px;
			.search_coin_btn {
				margin-left: 10px;
			}
		}
	}

}
</style>
../api/common