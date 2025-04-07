// 自定义错误类型
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 错误码定义
export const ErrorCode = {
  UNKNOWN: 'UNKNOWN',
  INVALID_PARAMS: 'INVALID_PARAMS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  TRADE_ERROR: 'TRADE_ERROR',
  QUOTE_ERROR: 'QUOTE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
} as const;

// 错误信息映射
export const ErrorMessage = {
  [ErrorCode.UNKNOWN]: '未知错误',
  [ErrorCode.INVALID_PARAMS]: '无效的参数',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.TRADE_ERROR]: '交易失败',
  [ErrorCode.QUOTE_ERROR]: '获取行情失败',
  [ErrorCode.NETWORK_ERROR]: '网络错误',
  [ErrorCode.RATE_LIMIT]: '请求过于频繁',
} as const;

// 错误处理工具函数
export const handleError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  // 处理长桥API的错误
  if (error.name === 'LongPortError') {
    return new ApiError(
      ErrorCode.TRADE_ERROR,
      error.message,
      500,
      error
    );
  }

  // 处理网络错误
  if (error.isAxiosError) {
    const status = error.response?.status || 500;
    return new ApiError(
      ErrorCode.NETWORK_ERROR,
      error.message,
      status,
      error.response?.data
    );
  }

  // 默认错误
  return new ApiError(
    ErrorCode.UNKNOWN,
    error.message || '未知错误',
    500,
    error
  );
};

// 日志工具
export const logError = (error: any, context: string = '') => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, {
    name: error.name,
    code: error.code,
    message: error.message,
    stack: error.stack,
    data: error.data,
  });
}; 