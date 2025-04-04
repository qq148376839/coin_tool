// 现货链接
export enum URLBASE {
  BASE_URL = 'https://api.binance.com',
  BASE1_URL = 'https://api-gcp.binance.com',
  BASE2_URL = 'https://api1.binance.com',
  BASE3_URL = 'https://api2.binance.com',
  BASE4_URL = 'https://api3.binance.com',
  BASE5_URL = 'https://api4.binance.com',
}

// 合约链接
export enum CONTRACT_URLBASE {
  BASE_URL = 'https://fapi.binance.com',
  BASE1_URL = 'https://fapi-gcp.binance.com',
  BASE2_URL = 'https://fapi1.binance.com',
  BASE3_URL = 'https://fapi2.binance.com',
  BASE4_URL = 'https://fapi3.binance.com',
  BASE5_URL = 'https://fapi4.binance.com',
}

export const USE_CONTRACT_URLBASE = CONTRACT_URLBASE.BASE_URL;
export const USE_URLBASE = URLBASE.BASE_URL;
