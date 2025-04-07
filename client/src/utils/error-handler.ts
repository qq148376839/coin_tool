// 错误类型定义
export interface ApiError {
  code: string;
  message: string;
  data?: any;
}

// 错误处理函数
export const handleApiError = (error: any): string => {
  if (error.response?.data) {
    const apiError: ApiError = error.response.data;
    return apiError.message;
  }
  return error.message || '未知错误';
};

// 请求重试工具
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}; 