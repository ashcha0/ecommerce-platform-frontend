<template>
  <div class="statistics-analysis">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>统计分析</h1>
    </div>

    <!-- 订单状态分布图表 -->
    <a-card class="chart-card" title="订单状态分布">
      <div class="chart-container">
        <div v-if="loading" class="loading-container">
          <a-spin size="large" tip="加载中..." />
        </div>
        <div v-else-if="!orderStats || Object.keys(orderStats).length === 0" class="empty-container">
          <a-empty description="暂无数据" />
        </div>
        <div v-else class="chart-wrapper">
          <!-- 饼图 -->
          <div class="pie-chart">
            <h3>订单状态饼图</h3>
            <v-chart 
              class="chart" 
              :option="pieOption" 
              :loading="loading"
              autoresize
            />
          </div>
          
          <!-- 柱状图 -->
          <div class="bar-chart">
            <h3>订单状态柱状图</h3>
            <v-chart 
              class="chart" 
              :option="barOption" 
              :loading="loading"
              autoresize
            />
          </div>
        </div>
      </div>
      
      <!-- 刷新按钮 -->
      <div class="chart-actions">
        <a-button type="primary" @click="loadOrderStats">
          <template #icon><icon-refresh /></template>
          刷新数据
        </a-button>
      </div>
    </a-card>

    <!-- 统计数据卡片 -->
    <a-card class="stats-card" title="统计概览">
      <div v-if="orderStats" class="stats-overview">
        <a-row :gutter="16">
          <a-col :span="6" v-for="(count, status) in orderStats" :key="status">
            <a-card class="stat-item">
              <div class="stat-content">
                <div class="stat-title">{{ ORDER_STATUS_TEXT[status] || status }}</div>
                <div class="stat-value" :style="{ color: ORDER_STATUS_COLOR[status] }">
                  {{ count }}
                </div>
                <div class="stat-percentage">
                  {{ calculatePercentage(count) }}%
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        
        <!-- 总计 -->
        <div class="total-stats">
          <a-card>
            <div class="total-content">
              <div class="total-title">订单总数</div>
              <div class="total-value">{{ getTotalOrders() }}</div>
            </div>
          </a-card>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconRefresh } from '@arco-design/web-vue/es/icon'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  PieChart,
  BarChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import {
  getOrderStatusStatsApi,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR
} from '../api/order'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 响应式数据
const loading = ref(false)
const orderStats = ref(null)

// 加载订单统计数据
const loadOrderStats = async () => {
  try {
    loading.value = true
    const response = await getOrderStatusStatsApi()
    if (response.code === 200) {
      orderStats.value = response.data
    } else {
      Message.error(response.message || '获取统计数据失败')
    }
  } catch (error) {
    Message.error(`加载统计数据失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

// 计算总订单数
const getTotalOrders = () => {
  if (!orderStats.value) return 0
  return Object.values(orderStats.value).reduce((total, count) => total + count, 0)
}

// 计算百分比
const calculatePercentage = (count) => {
  const total = getTotalOrders()
  if (total === 0) return 0
  return ((count / total) * 100).toFixed(1)
}

// 饼图配置
const pieOption = computed(() => {
  if (!orderStats.value) return {}
  
  const data = Object.entries(orderStats.value).map(([status, count]) => ({
    name: ORDER_STATUS_TEXT[status] || status,
    value: count,
    itemStyle: {
      color: getStatusColor(status)
    }
  }))
  
  return {
    title: {
      text: '订单状态分布',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
})

// 柱状图配置
const barOption = computed(() => {
  if (!orderStats.value) return {}
  
  const categories = Object.keys(orderStats.value).map(status => ORDER_STATUS_TEXT[status] || status)
  const values = Object.values(orderStats.value)
  const colors = Object.keys(orderStats.value).map(status => getStatusColor(status))
  
  return {
    title: {
      text: '订单状态统计',
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 个订单'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '订单数量',
      nameTextStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '订单数量',
        type: 'bar',
        barWidth: '60%',
        data: values.map((value, index) => ({
          value: value,
          itemStyle: {
            color: colors[index]
          }
        })),
        label: {
          show: true,
          position: 'top',
          fontSize: 12
        }
      }
    ]
  }
})

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    'CREATED': '#ff7875',
    'PAID': '#40a9ff', 
    'SHIPPING': '#36cfc9',
    'COMPLETED': '#73d13d',
    'CANCELLED': '#ff4d4f'
  }
  return colorMap[status] || ORDER_STATUS_COLOR[status] || '#1890ff'
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrderStats()
})
</script>

<style scoped>
.statistics-analysis {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #1d2129;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  min-height: 400px;
  position: relative;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.chart-wrapper {
  display: flex;
  gap: 20px;
}

.pie-chart,
.bar-chart {
  flex: 1;
  min-height: 400px;
}

.pie-chart h3,
.bar-chart h3 {
  text-align: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #1d2129;
}

.chart {
  height: 350px;
  width: 100%;
}

.chart-actions {
  margin-top: 20px;
  text-align: center;
}

.stats-card {
  margin-bottom: 20px;
}

.stats-overview {
  padding: 10px 0;
}

.stat-item {
  text-align: center;
  margin-bottom: 16px;
}

.stat-content {
  padding: 10px;
}

.stat-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-percentage {
  font-size: 12px;
  color: #86909c;
}

.total-stats {
  margin-top: 20px;
}

.total-content {
  text-align: center;
  padding: 20px;
}

.total-title {
  font-size: 16px;
  color: #86909c;
  margin-bottom: 10px;
}

.total-value {
  font-size: 36px;
  font-weight: bold;
  color: #1890ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-wrapper {
    flex-direction: column;
  }
  
  .pie-chart,
  .bar-chart {
    min-height: 300px;
  }
  
  .chart {
    height: 250px;
  }
}
</style>