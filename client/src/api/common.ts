// 删除旧的币安API相关代码
// 导出长桥API
export * from './longport';

import axios from 'axios';
const baseUrl = 'http://127.0.0.1:14086';

export const getCoinPrice = async (symbol: string) => {
    const res = await axios.get(`${baseUrl}/market/price/${symbol}`);
    return res;
}

// 获取k线图数据
export const getKlineData = async (params: any) => {
    const res = await axios.post(`${baseUrl}/market/kline`, params);
    return res;
}

// 获取用户信息
export const getUserInfo = async () => {
    const res = await axios.get(`${baseUrl}/user/info`);
    return res;
}

// 获取用户合约信息
export const getUserContractNews = async () => {
    const res = await axios.get(`${baseUrl}/user/contract-news`);
    return res;
}

// 获取用户订单列表
export const getUserOrderList = async () => {
    const res = await axios.get(`${baseUrl}/order/today`);
    return res;
} 
