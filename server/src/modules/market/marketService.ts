import { Injectable } from '@nestjs/common';
import { LongPortQuoteService } from '../../services/longport.quote.service';
import { Period } from 'longport';
import { KlineDto, PriceDto } from '../../dto/market.dtc';
import { INTERVAL, INTERVAL_TIME, TREND_PARAMS } from '../../enums/market';
import {
  KlineChangeType,
  OrderPointParams,
  PointOrder,
} from 'src/interfaces/market.inteface';

@Injectable()
export class MarketService {
  constructor(private readonly quoteService: LongPortQuoteService) {}

  private readonly periodMap: Record<string, Period> = {
    '1m': Period.MIN_1,
    '5m': Period.MIN_5,
    '15m': Period.MIN_15,
    '30m': Period.MIN_30,
    '60m': Period.MIN_60,
    '1d': Period.DAY,
    '1w': Period.WEEK,
    '1M': Period.MONTH
  };

  getPeriod(interval: string): Period {
    return this.periodMap[interval] || Period.MIN_1;
  }

  // 获取价格
  async getPrice(symbol: string): Promise<PriceDto> {
    try {
      const quote = await this.quoteService.getQuote([symbol]);
      return {
        symbol: quote[0].symbol,
        price: Number(quote[0].lastDone),
        updateTime: new Date().toISOString()
      };
    } catch (error) {
      console.log(error);
      throw new Error('获取价格失败');
    }
  }

  // 获取K线数据
  async getKline(klineDto: KlineDto) {
    try {
      const { symbol, interval, limit = 100 } = klineDto;
      const period = this.getPeriod(interval);
      
      const candles = await this.quoteService.getCandles(
        symbol,
        period,
        limit
      );
      
      return candles;
    } catch (error) {
      console.log(error);
      throw new Error('获取K线数据失败');
    }
  }

  // 获取货币的k线
  async getKlineMore(klineDto: KlineDto): Promise<any> {
    const params = {
      symbol: klineDto.symbol,
      interval: klineDto.interval,
      limit: TREND_PARAMS.RANGE_COUNT,
    };
    // 1. 获取k线图
    const list = await this.getKline(params);
    list.splice(list.length - 1, 1);
    // 2. 获取k线图的支撑点: 获取最近x次交易中最高值/最低值
    const riseLargeList = []; // 最高点上涨线
    const fallLargeList = []; // 最低点下跌线
    const riseBodyList = []; // 实体上升线
    const fallBodyList = []; // 实体下跌线
    let beforeLine = list[0];
    let isBeforeRise = beforeLine[4] > beforeLine[1];
    const startPrice = list[0][1]; // 开始的价格
    for (let i = 1; i < list.length; i++) {
      const currentLine = list[i];
      const isRise = currentLine[4] > currentLine[1];
      if (isBeforeRise !== isRise) {
        if (isBeforeRise) {
          // 由涨转跌, 可能是突破位
          const riseTarget = {
            price: Math.max(beforeLine[2], currentLine[2]),
            volume: +beforeLine[7] + +currentLine[7],
            ticketCount: +beforeLine[8] + +currentLine[8],
            weight: 0, // 当前参考值的权重意义, 值越大, 越有参考价值
          };
          riseTarget.weight = riseTarget.volume / riseTarget.price;
          riseLargeList.push(riseTarget);
          riseBodyList.push(Math.max(beforeLine[1], currentLine[1]));
        } else {
          // 由跌转涨, 可能是支撑位
          const fallTarget = {
            price: Math.min(beforeLine[3], currentLine[3]),
            volume: +beforeLine[7] + +currentLine[7],
            ticketCount: +beforeLine[8] + +currentLine[8],
            weight: 0, // 当前参考值的权重意义, 值越大, 越有参考价值
          };
          fallTarget.weight = fallTarget.volume / fallTarget.price;
          fallLargeList.push(fallTarget);
          fallBodyList.push(Math.min(beforeLine[4], currentLine[4]));
        }
      }
      beforeLine = currentLine;
      isBeforeRise = isRise;
    }
    const riseLargePrice = Math.max(...riseLargeList);
    const fallLargePrice = Math.min(...fallLargeList);

    // 需要计算当前的趋势, 用实体涨线各自两者差值 + 实体跌线各自两者差值 / 开始的价格
    let diffCount = 0;
    for (let i = 1; i < riseBodyList.length; i++) {
      diffCount += riseBodyList[i] - riseBodyList[i - 1];
    }
    for (let i = 1; i < fallBodyList.length; i++) {
      diffCount += fallBodyList[i] - fallBodyList[i - 1];
    }
    // 取小数点后4位, 转位百分比
    const trend = (diffCount / startPrice / 2).toFixed(3);
    return {
      riseLargePrice,
      fallLargePrice,
      riseLargeList,
      fallLargeList,
      riseBodyList,
      fallBodyList,
      trend,
    };
  }

  /**
   * 获取k线的支持价格和突破价格
   * @param kLineList
   * @param judgeLength 判断长度
   * @returns
   */
  getSupportPoint(kLineList: any[], judgeLength: number = 3): any {
    /**
     * 获取突破/支撑点不获取最后3条数据, 最后3条数据用于判断当前趋势
     */

    const list = kLineList.slice(0, kLineList.length - judgeLength);
    const lastList = kLineList.slice(kLineList.length - judgeLength);
    let changeType = KlineChangeType.IS_CONTINUE;
    let supportPrice = 0;
    let breakPrice = 0;

    /**
     * 计算突破/支撑点
     * 获取list中的最高的收盘价和最低的收盘价
     */
    const maxClosePrice = Math.max(...list.map((item: any) => item[4]));
    const minClosePrice = Math.min(...list.map((item: any) => item[4]));
    supportPrice = +minClosePrice;
    breakPrice = +maxClosePrice;

    // 如果收盘价大于突破价, 则当前趋势为上涨, 如果小于支撑价, 则当前趋势为下跌
    for (let i = 0; i < lastList.length; i++) {
      const currentLine = lastList[i];
      if (currentLine[4] > breakPrice) {
        changeType = KlineChangeType.IS_RISE;
        continue;
      } else if (currentLine[4] < supportPrice) {
        changeType = KlineChangeType.IS_FALL;
        continue;
      }
    }
    return {
      supportPrice,
      breakPrice,
      changeType, // 趋势类型
    };
  }

  /**
   * 生成推荐挂单点
   * 测试最优的情况:
   * judgeLength = 5
   * bufferPercent = 0.005
   * winPercent = 0.01
   * lossRate = 0.75
   * @param kLineList
   * @param bufferPercent 缓冲百分比
   * @param winPercent 止益百分比
   * @param winRate 赢亏比
   * @returns
   */
  createOrderPoint(
    kLineList: any[],
    judgeLength: number = 5,
    bufferPercent: number = 0.005,
    winPercent: number = 0.01,
    lossRate: number = 0.75,
  ): any {
    // 获取k线的支持点和突破点
    const { supportPrice, breakPrice, changeType } = this.getSupportPoint
    (
      kLineList,
      judgeLength,
    );
    // 突破做多价格 = 突破价格 + 突破价格*缓冲百分比
    const breakLongPrice = breakPrice + breakPrice * bufferPercent;
    // 突破做空价格 = 突破价格 + 突破价格*缓冲百分比
    const breakShortPrice = supportPrice - supportPrice * bufferPercent;
    // 持续做多价格 = 支持价格 + 支持价格*止益百分比
    const continueLongPrice = supportPrice + supportPrice * bufferPercent;
    // 持续做空价格 = 支持价格 - 支持价格*止益百分比
    const continueShortPrice = breakPrice - breakPrice * bufferPercent;

    /**
     * 计算的逻辑
     * 如果k线当前状态是持续状态, 则推荐挂单点为突破价格 + 突破价格*止益百分比
     * 如果k线当前状态是突破状态, 则相同突破方向推荐价格不变(突破的价格), 相反方向推荐价格为(持续方向价格 + 持续方向价格*止益百分比
     */
    const suggestObj: PointOrder = {
      long: {
        price: breakLongPrice,
        // 止益价格
        winPrice: breakLongPrice + breakLongPrice * winPercent,
        failPrice: breakLongPrice - breakLongPrice * winPercent * lossRate,
      },
      short: {
        price: breakShortPrice,
        winPrice: breakShortPrice - breakShortPrice * winPercent,
        failPrice: breakShortPrice + breakShortPrice * winPercent * lossRate,
      },
    };
    // 计算推荐挂单点
    if (changeType === KlineChangeType.IS_RISE) {
      suggestObj.short = {
        price: continueShortPrice,
        winPrice: continueShortPrice - continueShortPrice * winPercent,
        failPrice: continueShortPrice + continueShortPrice * winPercent * lossRate,
      };
    } else if (changeType === KlineChangeType.IS_FALL) {
      suggestObj.long = {
        price: continueLongPrice,
        winPrice: continueLongPrice + continueLongPrice * winPercent,
        failPrice: continueLongPrice - continueLongPrice * winPercent * lossRate,
      };
    }

    // 格式化推荐挂单点
    // 获取当前价格数字的有效位数
    const priceDecimal = 5;
    suggestObj.long.price = Number(suggestObj.long.price.toFixed(priceDecimal));
    suggestObj.long.winPrice = Number(
      suggestObj.long.winPrice.toFixed(priceDecimal),
    );
    suggestObj.short.winPrice = Number(
      suggestObj.short.winPrice.toFixed(priceDecimal),
    );
    suggestObj.long.failPrice = Number(
      suggestObj.long.failPrice.toFixed(priceDecimal),
    );
    suggestObj.long.failPrice = Number(
      suggestObj.long.failPrice.toFixed(priceDecimal),
    );
    suggestObj.short.failPrice = Number(
      suggestObj.short.failPrice.toFixed(priceDecimal),
    );
    return {
      suggestObj,
      supportPrice,
      breakPrice,
    };
  }

  /**
   * 获取当前下单最优价格
   * @param symbol
   * @param interval
   * @param limit
   * @returns
   */
  async getBestPrice(
    symbol: string,
    interval: INTERVAL,
    limit: number = 100,
    priceDecimal: number = 5,
  ): Promise<any> {
    const list = await this.getKline({
      symbol,
      interval: interval,
      limit,
    });
    const { suggestObj } = await this.createOrderPoint(list, priceDecimal);
    return suggestObj;
  }
  /**
   * 校验当前推荐挂单点准确率
   * @param suggestObj
   * @returns
   */
  async checkOrderPoint(
    checkOrderPoint: OrderPointParams,
    socket: any = null,
  ): Promise<any> {
    const { symbol, interval, limit, startTime, endTime, factorObj } =
      checkOrderPoint;
    let { judgeLength, bufferPercent, winPercent, lossRate, tip } = factorObj || {};
    judgeLength = judgeLength || 4;
    bufferPercent = bufferPercent || 0.005;
    winPercent = winPercent || 0.02;
    lossRate = lossRate || 0.8;
    tip = tip || 0;

    console.log('这个', factorObj);

    const endTimeNum = endTime
      ? new Date(endTime).getTime()
      : new Date().getTime();
    const startTimeNum = new Date(startTime).getTime();
    const maxLimit = Math.min(
      (endTimeNum - startTimeNum) / INTERVAL_TIME[interval],
      1000,
    );
    const intervalCount = INTERVAL_TIME[interval] * maxLimit;
    // 获取需要测试用到的所有k线数据
    let resultList = [];
    for (let i = startTimeNum; i < endTimeNum; i += intervalCount) {
      const kLineList = await this.getKline({
        symbol,
        interval,
        startTime: i,
        limit: maxLimit,
      });
      resultList = resultList.concat(kLineList);
    }

    // 初始化价格
    let principal = 1000;
    let winCount = 0;
    let failCount = 0;
    let maxPrincipal = 1000;
    let minPrincipal = 1000;
    let isBuy = false;
    let isLong = false;
    let buyPrice = 0;

    let { suggestObj } = this.createOrderPoint(
      resultList.slice(0, limit),
      judgeLength,
      bufferPercent,
      winPercent,
      lossRate,
    );
    let quantity = 0;
    for (let i = limit; i < resultList.length; i++) {
      const currentLine = resultList[i];
      const beginPrice = currentLine[1]; // 开始价格
      const highPrice = currentLine[2]; // 最高价
      const lowPrice = currentLine[3]; // 最低价
      if (socket && i % 50 === 0) {
        socket.emit('tests', {
          principal,
          winCount,
          failCount,
          maxPrincipal,
          minPrincipal,
        });
      }
      if (!isBuy) {
        // 已经购买了

        const pointOrder = this.createOrderPoint(
          resultList.slice(i - limit, i),
          judgeLength,
          bufferPercent,
          winPercent,
          lossRate,
        );
        suggestObj = pointOrder.suggestObj;
        const maxPrice = suggestObj.long.price;
        const minPrice = suggestObj.short.price;
        // 如果最高价格大于maxPrice, 则买入
        // 如果最低价格小于minPrice, 则卖出
        if (highPrice > maxPrice) {
          if (highPrice > suggestObj.long.winPrice) {
            continue;
          }
          buyPrice = beginPrice < maxPrice ? beginPrice : maxPrice;
          const longdiff = Number(
            (buyPrice - suggestObj.long.price).toFixed(5),
          );
          suggestObj.long.failPrice += longdiff;
          suggestObj.long.winPrice += longdiff;
          isBuy = true;
          isLong = true;
          quantity = principal / +buyPrice;
        } else if (lowPrice < minPrice) {
          if (lowPrice > suggestObj.short.winPrice) {
            continue;
          }
          buyPrice = beginPrice > minPrice ? beginPrice : minPrice;
          quantity = principal / +buyPrice;
          const shortdiff = Number(
            (buyPrice - suggestObj.short.price).toFixed(5),
          );
          suggestObj.short.failPrice += shortdiff;
          suggestObj.short.winPrice += shortdiff;
          isBuy = true;
          isLong = false;
        }
      }
      if (isBuy) {
        // 没有购入, 则需要重新计算推荐订单价格
        const winPrice = isLong
          ? suggestObj.long.winPrice
          : suggestObj.short.winPrice;
        const failPrice = isLong
          ? suggestObj.long.failPrice
          : suggestObj.short.failPrice;

        let isFail = false;
        let isWin = false;
        // 如果是做多, 则大于盈利价为盈利, 小于失败价为亏损, 做空反之
        if (isLong) {
          if (lowPrice < failPrice) {
            isFail = true;
            principal = failPrice * quantity;
          } else if (highPrice > winPrice) {
            isWin = true;
            principal = winPrice * quantity;
          }
        } else {
          if (highPrice > failPrice) {
            isFail = true;
            principal = 2 * principal - failPrice * quantity;
            principal = Number((principal * (buyPrice / failPrice)).toFixed(2));
          } else if (lowPrice < winPrice) {
            isWin = true;
            principal = 2 * principal - quantity * winPrice;
          }
        }
        if (isFail || isWin) {
          isBuy = false;
          principal = Number((principal - principal * tip).toFixed(2));
        }
        if (isFail) {
          failCount++;
          minPrincipal = Math.min(minPrincipal, principal);
        } else if (isWin) {
          winCount++;
          maxPrincipal = Math.max(maxPrincipal, principal);
        }
      }
    }
    if (socket) {
      socket.emit('tests', {
        principal,
        winCount,
        failCount,
        maxPrincipal,
        minPrincipal,
      });
    }

    // 返回最后的结果
    return {
      principal,
      winCount,
      failCount,
      maxPrincipal,
      minPrincipal,
    };
  }
}
