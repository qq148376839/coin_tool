import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-bbdc8c868d3e4f77b8d7abd64bd04de9',
});

@Injectable()
export class AiService {
  constructor(private readonly httpService: HttpService) { }
  // 获取货币的k线
  async askQuestion(question: string, options?: any): Promise<any> {
    const params: any = {
      messages: [{ role: 'user', content: question }],
      model: 'deepseek-reasoner',
    };
    const completion = await openai.chat.completions.create(options || params);
    return completion.choices[0].message.content;
  }
  // 获取推荐价位
  async getRecommendPrice(
    kline: string,
    winPercent: number = 0.01,
    lossRate: number = 0.75,
  ): Promise<any> {
    const responseMessage = `
      用户将提供一些k线图文本, 
      文本中的数组分别对应[开盘时间,开盘价, 最高价, 最低价, 收盘价, 成交量, 收盘时间, 交易额, 成交笔数, 主动买入成交量, 主动买入成交额]
      请解析“问题”, “答案”将以 JSON 格式输出。
      输出的json格式如下:
      {
        "supportPrice": 100.12,
        "breakPrice": 100.23,
        "long": {
          "price": 100.34,
          "stopLoss": 100.45,
          "takeProfit": 100.56
        },
        "short": {
          "price": 100,
          "stopLoss": 100,
          "takeProfit": 100
        },
      }`;
    const userMessage = `
        当前的k线图数据如下:
        ${kline}
        帮我预测接下来突破位和支撑位,
        并推算出合适做空/做多的点位和对应的止益/止损价格.
        要求盈利至少为${winPercent * 100}%,止损至少为${lossRate * 100 * winPercent}%`;
    const options = {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: responseMessage },
        { role: 'user', content: userMessage },
      ],
      response_format: {
        type: 'json_object',
      },
    };
    console.time('askQuestion');
    const result = await this.askQuestion('', options);
    console.timeEnd('askQuestion');
    return JSON.parse(result);
  }
}
