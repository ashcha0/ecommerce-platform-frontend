<template>
  <div class="statistics-analysis">
    <!-- 概览统计卡片 -->
    <a-row :gutter="16" class="mb-20">
      <a-col :span="6">
        <a-card class="stat-card overview-card">
          <a-statistic
            title="总销售额"
            :value="overviewStats.totalSales"
            :precision="2"
            suffix="元"
            :value-style="{ color: '#1890ff', fontSize: '24px' }"
          >
            <template #prefix>
              <icon-dollar />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <span :class="['trend-text', overviewStats.salesTrend >= 0 ? 'trend-up' : 'trend-down']">
              <icon-arrow-up v-if="overviewStats.salesTrend >= 0" />
              <icon-arrow-down v-else />
              {{ Math.abs(overviewStats.salesTrend) }}%
            </span>
            <span class="trend-desc">较上月</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card overview-card">
          <a-statistic
            title="订单总数"
            :value="overviewStats.totalOrders"
            :value-style="{ color: '#52c41a', fontSize: '24px' }"
          >
            <template #prefix>
              <icon-file-text />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <span :class="['trend-text', overviewStats.ordersTrend >= 0 ? 'trend-up' : 'trend-down']">
              <icon-arrow-up v-if="overviewStats.ordersTrend >= 0" />
              <icon-arrow-down v-else />
              {{ Math.abs(overviewStats.ordersTrend) }}%
            </span>
            <span class="trend-desc">较上月</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card overview-card">
          <a-statistic
            title="客户总数"
            :value="overviewStats.totalCustomers"
            :value-style="{ color: '#faad14', fontSize: '24px' }"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <span :class="['trend-text', overviewStats.customersTrend >= 0 ? 'trend-up' : 'trend-down']">
              <icon-arrow-up v-if="overviewStats.customersTrend >= 0" />
              <icon-arrow-down v-else />
              {{ Math.abs(overviewStats.customersTrend) }}%
            </span>
            <span class="trend-desc">较上月</span>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card overview-card">
          <a-statistic
            title="商品总数"
            :value="overviewStats.totalProducts"
            :value-style="{ color: '#722ed1', fontSize: '24px' }"
          >
            <template #prefix>
              <icon-gift />
            </template>
          </a-statistic>
          <div class="stat-trend">
            <span :class="['trend-text', overviewStats.productsTrend >= 0 ? 'trend-up' : 'trend-down']">
              <icon-arrow-up v-if="overviewStats.productsTrend >= 0" />
              <icon-arrow-down v-else />
              {{ Math.abs(overviewStats.productsTrend) }}%
            </span>
            <span class="trend-desc">较上月</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 时间筛选器 -->
    <a-card class="filter-card" title="数据筛选">
      <a-form layout="inline" class="filter-form">
        <a-form-item label="时间范围">
          <a-range-picker
            v-model="timeRange"
            format="YYYY-MM-DD"
            @change="handleTimeRangeChange"
          />
        </a-form-item>
        <a-form-item label="统计维度">
          <a-select v-model="timeDimension" @change="handleDimensionChange">
            <a-option value="day">按天</a-option>
            <a-option value="week">按周</a-option>
            <a-option value="month">按月</a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="refreshData">
            <template #icon><icon-refresh /></template>
            刷新数据
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button @click="exportReport">
            <template #icon><icon-download /></template>
            导出报表
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="charts-row">
      <!-- 销售趋势图 -->
      <a-col :span="12">
        <a-card title="销售趋势" class="chart-card">
          <div ref="salesTrendChart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <!-- 订单状态分布 -->
      <a-col :span="12">
        <a-card title="订单状态分布" class="chart-card">
          <div ref="orderStatusChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <!-- 商品销量排行 -->
      <a-col :span="12">
        <a-card title="商品销量排行" class="chart-card">
          <div ref="productSalesChart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <!-- 客户消费排行 -->
      <a-col :span="12">
        <a-card title="客户消费排行" class="chart-card">
          <div ref="customerSpendingChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <!-- 商品销量占比 -->
      <a-col :span="12">
        <a-card title="商品销量占比" class="chart-card">
          <div ref="productShareChart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <!-- 库存状态分析 -->
      <a-col :span="12">
        <a-card title="库存状态分析" class="chart-card">
          <div ref="inventoryChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据表格区域 -->
    <a-row :gutter="16" class="tables-row">
      <!-- 热销商品表格 -->
      <a-col :span="12">
        <a-card title="热销商品TOP10" class="table-card">
          <a-table 
            :data="hotProducts" 
            :pagination="false"
            size="small"
          >
            <template #columns>
              <a-table-column title="排名" :width="60">
                <template #cell="{ rowIndex }">
                  <a-tag 
                    :color="rowIndex < 3 ? ['red', 'orange', 'gold'][rowIndex] : 'blue'"
                    class="rank-tag"
                  >
                    {{ rowIndex + 1 }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="商品名称" data-index="productName" />
              <a-table-column title="销量" data-index="salesCount" :width="80">
                <template #cell="{ record }">
                  <span class="sales-count">{{ record.salesCount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="销售额" data-index="salesAmount" :width="100">
                <template #cell="{ record }">
                  <span class="amount-text">¥{{ record.salesAmount.toFixed(2) }}</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <!-- 客户消费排行表格 -->
      <a-col :span="12">
        <a-card title="客户消费TOP10" class="table-card">
          <a-table 
            :data="topCustomers" 
            :pagination="false"
            size="small"
          >
            <template #columns>
              <a-table-column title="排名" :width="60">
                <template #cell="{ rowIndex }">
                  <a-tag 
                    :color="rowIndex < 3 ? ['red', 'orange', 'gold'][rowIndex] : 'blue'"
                    class="rank-tag"
                  >
                    {{ rowIndex + 1 }}
                  </a-tag>
                </template>
              </a-table-column>
              <a-table-column title="客户姓名" data-index="customerName" />
              <a-table-column title="订单数" data-index="orderCount" :width="80">
                <template #cell="{ record }">
                  <span class="order-count">{{ record.orderCount }}</span>
                </template>
              </a-table-column>
              <a-table-column title="消费金额" data-index="totalAmount" :width="100">
                <template #cell="{ record }">
                  <span class="amount-text">¥{{ record.totalAmount.toFixed(2) }}</span>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 实时数据监控 -->
    <a-card title="实时数据监控" class="realtime-card">
      <a-row :gutter="16">
        <a-col :span="6">
          <div class="realtime-item">
            <div class="realtime-label">今日销售额</div>
            <div class="realtime-value">¥{{ realtimeData.todaySales.toFixed(2) }}</div>
            <div class="realtime-change">
              <span :class="realtimeData.todaySalesChange >= 0 ? 'positive' : 'negative'">
                {{ realtimeData.todaySalesChange >= 0 ? '+' : '' }}{{ realtimeData.todaySalesChange.toFixed(2) }}%
              </span>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="realtime-item">
            <div class="realtime-label">今日订单</div>
            <div class="realtime-value">{{ realtimeData.todayOrders }}</div>
            <div class="realtime-change">
              <span :class="realtimeData.todayOrdersChange >= 0 ? 'positive' : 'negative'">
                {{ realtimeData.todayOrdersChange >= 0 ? '+' : '' }}{{ realtimeData.todayOrdersChange }}%
              </span>
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="realtime-item">
            <div class="realtime-label">在线用户</div>
            <div class="realtime-value">{{ realtimeData.onlineUsers }}</div>
            <div class="realtime-status">
              <a-badge status="processing" text="实时更新" />
            </div>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="realtime-item">
            <div class="realtime-label">待处理订单</div>
            <div class="realtime-value">{{ realtimeData.pendingOrders }}</div>
            <div class="realtime-action">
              <a-link @click="viewPendingOrders">查看详情</a-link>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  getSalesStatsApi,
  getProductSalesStatsApi,
  getProductSalesShareApi,
  getSalesTrendApi,
  getCustomerStatsApi,
  getOrderStatsApi,
  getInventoryStatsApi,
  getShopStatsApi,
  getDeliveryStatsApi,
  getHotProductsApi,
  getTopCustomersApi,
  getRealTimeDataApi,
  getComprehensiveReportApi,
  exportStatisticsReportApi
} from '@/api/statistics'
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 图表实例
const salesTrendChart = ref()
const orderStatusChart = ref()
const productSalesChart = ref()
const customerSpendingChart = ref()
const productShareChart = ref()
const inventoryChart = ref()

let salesTrendChartInstance = null
let orderStatusChartInstance = null
let productSalesChartInstance = null
let customerSpendingChartInstance = null
let productShareChartInstance = null
let inventoryChartInstance = null

// 数据状态
const loading = ref(false)
const timeRange = ref([dayjs().subtract(30, 'day'), dayjs()])
const timeDimension = ref('day')

// 概览统计数据
const overviewStats = reactive({
  totalSales: 0,
  salesTrend: 0,
  totalOrders: 0,
  ordersTrend: 0,
  totalCustomers: 0,
  customersTrend: 0,
  totalProducts: 0,
  productsTrend: 0
})

// 表格数据
const hotProducts = ref([])
const topCustomers = ref([])

// 实时数据
const realtimeData = reactive({
  todaySales: 0,
  todaySalesChange: 0,
  todayOrders: 0,
  todayOrdersChange: 0,
  onlineUsers: 0,
  pendingOrders: 0
})

// 定时器
let realtimeTimer = null

// 初始化
onMounted(async () => {
  await nextTick()
  initCharts()
  await fetchAllData()
  startRealtimeUpdate()
})

onUnmounted(() => {
  destroyCharts()
  stopRealtimeUpdate()
})

// 初始化图表
const initCharts = () => {
  salesTrendChartInstance = echarts.init(salesTrendChart.value)
  orderStatusChartInstance = echarts.init(orderStatusChart.value)
  productSalesChartInstance = echarts.init(productSalesChart.value)
  customerSpendingChartInstance = echarts.init(customerSpendingChart.value)
  productShareChartInstance = echarts.init(productShareChart.value)
  inventoryChartInstance = echarts.init(inventoryChart.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 销毁图表
const destroyCharts = () => {
  salesTrendChartInstance?.dispose()
  orderStatusChartInstance?.dispose()
  productSalesChartInstance?.dispose()
  customerSpendingChartInstance?.dispose()
  productShareChartInstance?.dispose()
  inventoryChartInstance?.dispose()
  
  window.removeEventListener('resize', handleResize)
}

// 窗口大小变化处理
const handleResize = () => {
  salesTrendChartInstance?.resize()
  orderStatusChartInstance?.resize()
  productSalesChartInstance?.resize()
  customerSpendingChartInstance?.resize()
  productShareChartInstance?.resize()
  inventoryChartInstance?.resize()
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchOverviewStats(),
      fetchSalesTrend(),
      fetchOrderStats(),
      fetchProductSalesStats(),
      fetchCustomerStats(),
      fetchProductSalesShare(),
      fetchInventoryStats(),
      fetchHotProducts(),
      fetchTopCustomers()
    ])
  } catch (error) {
    Message.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取概览统计
const fetchOverviewStats = async () => {
  try {
    const [salesRes, orderRes, customerRes, productRes] = await Promise.all([
      getSalesStatsApi(getTimeParams()),
      getOrderStatsApi(getTimeParams()),
      getCustomerStatsApi(getTimeParams()),
      getProductSalesStatsApi(getTimeParams())
    ])
    
    overviewStats.totalSales = salesRes.data.totalSales || 0
    overviewStats.salesTrend = salesRes.data.trend || 0
    overviewStats.totalOrders = orderRes.data.totalOrders || 0
    overviewStats.ordersTrend = orderRes.data.trend || 0
    overviewStats.totalCustomers = customerRes.data.totalCustomers || 0
    overviewStats.customersTrend = customerRes.data.trend || 0
    overviewStats.totalProducts = productRes.data.totalProducts || 0
    overviewStats.productsTrend = productRes.data.trend || 0
  } catch (error) {
    console.error('获取概览统计失败:', error)
  }
}

// 获取销售趋势
const fetchSalesTrend = async () => {
  try {
    const { data } = await getSalesTrendApi({
      ...getTimeParams(),
      dimension: timeDimension.value
    })
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['销售额', '订单数']
      },
      xAxis: {
        type: 'category',
        data: data.dates || []
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额(元)',
          position: 'left'
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right'
        }
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          data: data.sales || [],
          smooth: true,
          itemStyle: {
            color: '#1890ff'
          }
        },
        {
          name: '订单数',
          type: 'bar',
          yAxisIndex: 1,
          data: data.orders || [],
          itemStyle: {
            color: '#52c41a'
          }
        }
      ]
    }
    
    salesTrendChartInstance.setOption(option)
  } catch (error) {
    console.error('获取销售趋势失败:', error)
  }
}

// 获取订单统计
const fetchOrderStats = async () => {
  try {
    const { data } = await getOrderStatsApi(getTimeParams())
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '订单状态',
          type: 'pie',
          radius: ['40%', '70%'],
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
          data: data.statusDistribution || []
        }
      ]
    }
    
    orderStatusChartInstance.setOption(option)
  } catch (error) {
    console.error('获取订单统计失败:', error)
  }
}

// 获取商品销量统计
const fetchProductSalesStats = async () => {
  try {
    const { data } = await getProductSalesStatsApi({
      ...getTimeParams(),
      limit: 10
    })
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.productNames || []
      },
      series: [
        {
          name: '销量',
          type: 'bar',
          data: data.salesCounts || [],
          itemStyle: {
            color: '#faad14'
          }
        }
      ]
    }
    
    productSalesChartInstance.setOption(option)
  } catch (error) {
    console.error('获取商品销量统计失败:', error)
  }
}

// 获取客户统计
const fetchCustomerStats = async () => {
  try {
    const { data } = await getCustomerStatsApi({
      ...getTimeParams(),
      limit: 10
    })
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.customerNames || []
      },
      series: [
        {
          name: '消费金额',
          type: 'bar',
          data: data.spendingAmounts || [],
          itemStyle: {
            color: '#722ed1'
          }
        }
      ]
    }
    
    customerSpendingChartInstance.setOption(option)
  } catch (error) {
    console.error('获取客户统计失败:', error)
  }
}

// 获取商品销量占比
const fetchProductSalesShare = async () => {
  try {
    const { data } = await getProductSalesShareApi(getTimeParams())
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20
      },
      series: [
        {
          name: '销量占比',
          type: 'pie',
          radius: '55%',
          center: ['40%', '50%'],
          data: data.shareData || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    
    productShareChartInstance.setOption(option)
  } catch (error) {
    console.error('获取商品销量占比失败:', error)
  }
}

// 获取库存统计
const fetchInventoryStats = async () => {
  try {
    const { data } = await getInventoryStatsApi()
    
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '库存状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '40',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.inventoryStatus || []
        }
      ]
    }
    
    inventoryChartInstance.setOption(option)
  } catch (error) {
    console.error('获取库存统计失败:', error)
  }
}

// 获取热销商品
const fetchHotProducts = async () => {
  try {
    const { data } = await getHotProductsApi({
      ...getTimeParams(),
      limit: 10
    })
    hotProducts.value = data.list || []
  } catch (error) {
    console.error('获取热销商品失败:', error)
  }
}

// 获取客户消费排行
const fetchTopCustomers = async () => {
  try {
    const { data } = await getTopCustomersApi({
      ...getTimeParams(),
      limit: 10
    })
    topCustomers.value = data.list || []
  } catch (error) {
    console.error('获取客户排行失败:', error)
  }
}

// 获取实时数据
const fetchRealtimeData = async () => {
  try {
    const { data } = await getRealTimeDataApi()
    Object.assign(realtimeData, data)
  } catch (error) {
    console.error('获取实时数据失败:', error)
  }
}

// 开始实时更新
const startRealtimeUpdate = () => {
  fetchRealtimeData()
  realtimeTimer = setInterval(fetchRealtimeData, 30000) // 30秒更新一次
}

// 停止实时更新
const stopRealtimeUpdate = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 获取时间参数
const getTimeParams = () => {
  return {
    startTime: dayjs(timeRange.value[0]).format('YYYY-MM-DD'),
    endTime: dayjs(timeRange.value[1]).format('YYYY-MM-DD')
  }
}

// 时间范围变化
const handleTimeRangeChange = () => {
  fetchAllData()
}

// 维度变化
const handleDimensionChange = () => {
  fetchSalesTrend()
}

// 刷新数据
const refreshData = () => {
  fetchAllData()
  fetchRealtimeData()
  Message.success('数据已刷新')
}

// 导出报表
const exportReport = async () => {
  try {
    const params = {
      ...getTimeParams(),
      dimension: timeDimension.value
    }
    
    const response = await exportStatisticsReportApi(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `统计报表_${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    Message.success('报表导出成功')
  } catch (error) {
    Message.error('报表导出失败')
  }
}

// 查看待处理订单
const viewPendingOrders = () => {
  // 这里可以跳转到订单管理页面并筛选待处理订单
  Message.info('跳转到订单管理页面')
}
</script>

<style scoped>
.statistics-analysis {
  padding: 20px;
}

.filter-card {
  margin-bottom: 16px;
}

.charts-row {
  margin-bottom: 16px;
}

.tables-row {
  margin-bottom: 16px;
}

.chart-card,
.table-card {
  height: 400px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.overview-card {
  text-align: center;
  position: relative;
}

.stat-trend {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.trend-text {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: #52c41a;
}

.trend-down {
  color: #f53f3f;
}

.trend-desc {
  font-size: 12px;
  color: #86909c;
}

.rank-tag {
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}

.sales-count,
.order-count {
  font-weight: 500;
  color: #1890ff;
}

.amount-text {
  font-weight: 500;
  color: #52c41a;
}

.realtime-card {
  margin-top: 16px;
}

.realtime-item {
  text-align: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.realtime-label {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 8px;
}

.realtime-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.realtime-change {
  font-size: 12px;
}

.realtime-status {
  font-size: 12px;
}

.realtime-action {
  font-size: 12px;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #f53f3f;
}

@media (max-width: 1200px) {
  .charts-row .arco-col {
    margin-bottom: 16px;
  }
  
  .charts-row .arco-col:nth-child(odd) {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .statistics-analysis {
    padding: 10px;
  }
  
  .filter-form .arco-form {
    flex-direction: column;
  }
  
  .filter-form .arco-form-item {
    width: 100% !important;
    margin-bottom: 16px;
  }
  
  .chart-card,
  .table-card {
    height: auto;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .realtime-item {
    margin-bottom: 16px;
  }
}
</style>