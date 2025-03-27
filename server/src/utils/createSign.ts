import * as sha256 from 'crypto-js/hmac-sha256';
import config from '../config/common';

export const createSign = (params: any) => {
  const secretKey = config.binance.apiSecret;
  // 将params转换url字符串拼接
  const urlParams = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const sign = sha256(urlParams, secretKey).toString();
  return sign;
};
