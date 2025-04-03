<template>
  <span @click="getKlineData">获取k线图数据</span>
  <div id="echart_content" ref="echartContent">
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { onMounted, ref, watch } from 'vue';
import * as coinApi from '../api/common'

const props = defineProps<{ coin: string }>()

const echartContent = ref<HTMLDivElement | null>(null);

let myChart: any = null;
const option = ref<any>(null);

const getKlineData = () => {
  coinApi.getKlineData({
    symbol: props.coin,
    interval: '3m',
    limit: 500
  }).then((res: any) => {
    const list = res.data.data;
    computeOption(list);
  })
}

watch(() => props.coin, (newVal: string) => {
  if (newVal) {
    getKlineData();
  }
});


// 根据k线图计算对应的echatOptions
const computeOption = (rawData:any[]) => {
  const upColor = '#00da3c';
  const downColor = '#ec0000';
  function splitData(rawData:any) {
    let categoryData = [];
    let values = [];
    let volumes = [];
      // 数据格式处理:
      // 0 时间
      // 1 开盘价
      // 2 最高价
      // 3 最低价
      // 4 收盘价
      // 5 成交量
      // 6 收盘时间
    for (let i = 0; i < rawData.length; i++) {
      // echart需要将2和4互换
      const swap = rawData[i][2];
      rawData[i][2] = rawData[i][4];
      rawData[i][4] = swap;
      categoryData.push(rawData[i].splice(0, 1)[0]);
      values.push(rawData[i]);
      volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }
    return {
      categoryData: categoryData,
      values: values,
      volumes: volumes
    };
  }
  function calculateMA(dayCount:any, data:any) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += data.values[i - j][1];
      }
      result.push(+(sum / dayCount).toFixed(3));
    }
    return result;
  }
  var data = splitData(rawData);
  myChart.setOption(
    (option = {
      animation: false,
      legend: {
        bottom: 10,
        left: 'center',
        data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        textStyle: {
          color: '#000'
        },
        position: function (pos: number[], _params: any, _el: any, _elRect: any, size: { viewSize: number[]; }) {
          const obj = {
            top: 10
          };
          // 不需要eslint的检查
          // @ts-ignore
          obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        }
        // extraCssText: 'width: 170px'
      },
      axisPointer: {
        link: [
          {
            xAxisIndex: 'all'
          }
        ],
        label: {
          backgroundColor: '#777'
        }
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: false
          },
          brush: {
            type: ['lineX', 'clear']
          }
        }
      },
      brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        outOfBrush: {
          colorAlpha: 0.1
        }
      },
      visualMap: {
        show: false,
        seriesIndex: 5,
        dimension: 2,
        pieces: [
          {
            value: 1,
            color: downColor
          },
          {
            value: -1,
            color: upColor
          }
        ]
      },
      grid: [
        {
          left: '10%',
          right: '8%',
          height: '50%'
        },
        {
          left: '10%',
          right: '8%',
          top: '63%',
          height: '16%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: {
            z: 100
          }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 98,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '85%',
          start: 98,
          end: 100
        }
      ],
      series: [
        {
          name: 'Dow-Jones index',
          type: 'candlestick',
          data: data.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: undefined,
            borderColor0: undefined
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: calculateMA(5, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA10',
          type: 'line',
          data: calculateMA(10, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA20',
          type: 'line',
          data: calculateMA(20, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'MA30',
          type: 'line',
          data: calculateMA(30, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5
          }
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: data.volumes
        }
      ]
    }),
    true
  );

  // const len = data.categoryData.length;
  // myChart.dispatchAction({
  //   type: 'brush',
  //   areas: [
  //     {
  //       brushType: 'lineX',
  //       coordRange: [data.categoryData[len - 16], data.categoryData[len - 1]],
  //       xAxisIndex: 0
  //     }
  //   ]
  // });
}


onMounted(() => {
  myChart = echarts.init(echartContent.value);
  // initEchart(myChart);
  getKlineData();
  window.addEventListener('resize', () => {
    myChart.resize();
  })

  // setInterval(() => {
	// 	getKlineData();
	// }, 2000);
})
</script>

<style scoped>
#echart_content {
  width: 100%;
  height: 500px;
  position: relative;
}
</style>
../api/common