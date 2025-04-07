import axios, { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { handleApiError, retryRequest } from '../utils/error-handler';

const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://127.0.0.1:14086';

// WebSocket连接
let socket: Socket | null = null;

// API请求实例
const api = axios.create({
  baseURL: `${baseUrl}/longport`,
  timeout: 10000,
});

// 添加响应拦截器
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const errorMessage = handleApiError(error);
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// 账户相关API
export const accountApi = {
  // 获取账户余额
  getBalance: () => retryRequest(
    () => api.get('/account/balance'),
    3,
    1000
  ),
  
  // 获取现金信息
  getCashInfo: () => api.get('/account/cash-info'),
  
  // 获取保证金比率
  getMarginRatio: () => api.get('/account/margin-ratio'),
};

// 订单相关API
export const orderApi = {
  // 提交订单
  submitOrder: (orderData: {
    symbol: string;
    orderType: string;
    side: string;
    quantity: number;
    price?: number;
  }) => api.post('/order/submit', orderData),

  // 获取今日订单
  getTodayOrders: (params?: {
    symbol?: string;
    status?: string[];
  }) => api.get('/order/today', { params }),

  // 获取历史订单
  getHistoryOrders: (params: {
    symbol: string;
    startAt: string;
    endAt: string;
  }) => api.get('/order/history', { params }),

  // 取消订单
  cancelOrder: (orderId: string) => api.delete(`/order/${orderId}`),
};

// 行情相关API
export const quoteApi = {
  // 获取报价
  getQuote: (symbols: string[]) => 
    api.get(`/quote/quote?symbols=${symbols.join(',')}`),

  // 获取期权报价
  getOptionQuote: (symbols: string[]) => 
    api.get(`/quote/option-quote?symbols=${symbols.join(',')}`),

  // 获取K线数据
  getCandles: (params: {
    symbol: string;
    period: string;
    count: number;
    adjustType?: number;
  }) => api.get('/quote/candles', { params }),
};

// WebSocket相关
export const wsApi = {
  // 连接WebSocket
  connect: () => {
    if (!socket) {
      socket = io(`${baseUrl}/longport`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket连接错误:', error);
      });

      socket.on('error', (error) => {
        console.error('WebSocket错误:', error);
      });
    }
    return socket;
  },

  // 订阅行情
  subscribe: (symbols: string[], subTypes: string[]) => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    return new Promise((resolve, reject) => {
      socket!.emit('subscribe', { symbols, subTypes }, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  },

  // 取消订阅
  unsubscribe: (symbols: string[]) => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    return new Promise((resolve, reject) => {
      socket!.emit('unsubscribe', { symbols }, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  },

  // 断开连接
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // 订阅订单更新
  subscribeOrders: () => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    return new Promise((resolve, reject) => {
      socket!.emit('subscribeOrders', {}, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  },

  // 取消订阅订单更新
  unsubscribeOrders: () => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    return new Promise((resolve, reject) => {
      socket!.emit('unsubscribeOrders', {}, (response: any) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(response.error);
        }
      });
    });
  },

  // 添加订单更新监听器
  onOrderUpdate: (callback: (order: any) => void) => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    socket.on('orderUpdate', callback);
  },

  // 移除订单更新监听器
  offOrderUpdate: (callback: (order: any) => void) => {
    if (!socket) {
      throw new Error('WebSocket not connected');
    }
    socket.off('orderUpdate', callback);
  },
}; 