<template>
  <div class="order-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>订单管理</h1>
    </div>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="订单搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="订单号">
          <a-input v-model="searchForm.orderNo" placeholder="输入订单号" allow-clear />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select v-model="searchForm.orderStatus" placeholder="选择订单状态" allow-clear>
            <a-option value="">全部状态</a-option>
            <a-option value="PAYING">待付款</a-option>
            <a-option value="SHIPPING">待发货</a-option>
            <a-option value="RECEIPTING">待收货</a-option>
            <a-option value="COMPLETED">已完成</a-option>
            <a-option value="CANCELLED">已取消</a-option>
            <a-option value="PROCESSING">售后处理中</a-option>
            <a-option value="PROCESSED">售后处理完成</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="客户ID">
          <a-input-number v-model="searchForm.customerId" placeholder="输入客户ID" allow-clear />
        </a-form-item>
        <a-form-item label="下单时间">
          <a-range-picker 
            v-model="searchForm.timeRange" 
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            @change="handleTimeRangeChange"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
      <div>
        <a-button type="primary" @click="showCreateModal">
          <template #icon><icon-plus /></template>
          新建订单
        </a-button>
        <a-button @click="showStatsModal">
          <template #icon><icon-bar-chart /></template>
          订单统计
        </a-button>
      </div>
      <div>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出数据
        </a-button>
      </div>
    </div>

    <!-- 订单表格 -->
    <a-card>
      <a-table 
        :data="orders" 
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="orderId"
      >
        <template #columns>
          <a-table-column title="订单ID" data-index="orderId" :width="60">
            <template #cell="{ record }">
              {{ record.orderId || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="订单号" data-index="orderNo" :width="150">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" data-index="deliveryStatus" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getDeliveryStatusColor(record.deliveryStatus)">
                {{ getDeliveryStatusText(record.deliveryStatus) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="下单时间" data-index="orderTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.orderTime) }}
            </template>
          </a-table-column>
          <a-table-column title="订单金额" data-index="totalAmount" :width="120">
            <template #cell="{ record }">
              <span class="amount-text">¥{{ record.totalAmount?.toFixed(2) || '0.00' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="客户ID" data-index="customerName" :width="150">
            <template #cell="{ record }">
              <div>
                <div>{{ record.customerId || '-' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="用户名" data-index="username" :width="150">
            <template #cell="{ record }">
              <div>
                <div>{{ record.customerName || '-' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="showDetail(record)">
                  详情
                </a-button>

              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建订单模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="新建订单" 
      width="800px"
      @ok="handleCreateOrder"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="createRules" ref="createFormRef" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户" field="customerId" required>
              <a-select 
                v-model="createForm.customerId" 
                placeholder="选择客户"
                :loading="customersLoading"
                @dropdown-visible-change="loadCustomers"
                @change="handleCustomerChange"
              >
                <a-option 
                  v-for="customer in customers" 
                  :key="customer.id" 
                  :value="customer.id"
                >
                  {{ customer.realName || customer.username }} - {{ customer.phone }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收货人姓名" field="consigneeName" required>
              <a-input v-model="createForm.consigneeName" placeholder="输入收货人姓名" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收货人电话" field="consigneePhone" required>
              <a-input v-model="createForm.consigneePhone" placeholder="输入收货人电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配送地址" field="deliveryAddress" required>
              <a-input v-model="createForm.deliveryAddress" placeholder="输入配送地址" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="商品列表" field="items" required>
          <div class="order-items">
            <div v-for="(item, index) in createForm.items" :key="index" class="order-item">
              <a-row :gutter="8" align="center">
                <a-col :span="8">
                  <a-select 
                    v-model="item.productId" 
                    placeholder="选择商品"
                    :loading="productsLoading"
                    @dropdown-visible-change="loadProducts"
                    @change="(value) => handleProductChange(value, index)"
                  >
                    <a-option 
                      v-for="product in products" 
                      :key="product.id" 
                      :value="product.id"
                    >
                      {{ product.name }} - ¥{{ product.price?.toFixed(2) || '0.00' }}
                    </a-option>
                  </a-select>
                </a-col>
                <a-col :span="4">
                  <a-input-number 
                    v-model="item.quantity" 
                    placeholder="数量" 
                    :min="1"
                    @change="calculateItemTotal(index)"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number 
                    v-model="item.price" 
                    placeholder="单价" 
                    :precision="2"
                    @change="calculateItemTotal(index)"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input 
                    :model-value="item.subtotal?.toFixed(2) || '0.00'" 
                    placeholder="小计" 
                    readonly
                  />
                </a-col>
                <a-col :span="4">
                  <a-button 
                    size="small" 
                    status="danger" 
                    @click="removeOrderItem(index)"
                    :disabled="createForm.items.length <= 1"
                  >
                    删除
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addOrderItem" class="add-item-btn">
              <template #icon><icon-plus /></template>
              添加商品
            </a-button>
          </div>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="createForm.remark" placeholder="输入备注信息" :rows="3" />
        </a-form-item>
        <div class="order-total">
          <span class="total-label">订单总金额：</span>
          <span class="total-amount">¥{{ calculateTotalAmount().toFixed(2) }}</span>
        </div>
      </a-form>
    </a-modal>

    <!-- 订单详情抽屉 -->
    <a-drawer 
      v-model:visible="detailDrawerVisible" 
      title="订单详情" 
      width="600px"
      :footer="false"
    >
      <div v-if="currentOrder" class="order-detail">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="订单号">{{ currentOrder.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="订单状态"> 
            <a-tag :color="getDeliveryStatusColor(deliveryInfo?.status)"> 
              {{ getDeliveryStatusText(deliveryInfo?.status) }} 
            </a-tag> 
          </a-descriptions-item>
          <a-descriptions-item label="下单时间">{{ formatDateTime(currentOrder.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="订单金额">¥{{ currentOrder.totalAmount?.toFixed(2) || '0.00' }}</a-descriptions-item>
          <a-descriptions-item label="客户信息" :span="2"> 
             <div v-if="currentOrder.customerInfo">
               <div>用户名：{{ currentOrder.customerInfo.customerName || '-' }}</div>
               <div v-if="currentOrder.customerInfo.phone">电话：{{ currentOrder.customerInfo.phone }}</div>
             </div>
             <div v-else-if="currentOrder.customerId">
               客户ID：{{ currentOrder.customerId }}
             </div>
             <div v-else>-</div>
           </a-descriptions-item>
        </a-descriptions>

        <a-divider>商品明细</a-divider>
        <a-table 
          :data="orderItems" 
          :loading="itemsLoading"
          :pagination="false"
          size="small"
        >
          <template #columns>
            <a-table-column title="商品名称" data-index="productName" />
            <a-table-column title="数量" data-index="quantity" :width="80" />
            <a-table-column title="单价" data-index="unitPrice" :width="100">
              <template #cell="{ record }">
                ¥{{ record.unitPrice?.toFixed(2) || '0.00' }}
              </template>
            </a-table-column>
            <a-table-column title="小计" data-index="itemAmount" :width="100">
              <template #cell="{ record }">
                ¥{{ record.itemAmount?.toFixed(2) || '0.00' }}
              </template>
            </a-table-column>
          </template>
        </a-table>

        <a-divider>配送信息</a-divider>
        <div v-if="deliveryInfo">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="收货人">{{ deliveryInfo.consigneeName || '暂无' }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ deliveryInfo.consigneePhone || '暂无' }}</a-descriptions-item>
            <a-descriptions-item label="配送地址">{{ deliveryInfo.deliveryAddress || '暂无' }}</a-descriptions-item>
            <a-descriptions-item label="配送状态">
              <a-tag :color="getDeliveryStatusColor(deliveryInfo.status)">
                {{ getDeliveryStatusText(deliveryInfo.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="快递单号" v-if="deliveryInfo.trackingNo">
              {{ deliveryInfo.trackingNo }}
            </a-descriptions-item>
            <a-descriptions-item label="承运商" v-if="deliveryInfo.shipper">
              {{ deliveryInfo.shipper }}
            </a-descriptions-item>
            <a-descriptions-item label="发货时间" v-if="deliveryInfo.shipTime">
              {{ formatDateTime(deliveryInfo.shipTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="送达时间" v-if="deliveryInfo.deliveryTime">
              {{ formatDateTime(deliveryInfo.deliveryTime) }}
            </a-descriptions-item>
            <a-descriptions-item label="预计送达时间" v-if="deliveryInfo.estimatedDeliveryTime">
              {{ formatDateTime(deliveryInfo.estimatedDeliveryTime) }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div v-else>
          <a-empty description="暂无配送信息" />
        </div>
      </div>
    </a-drawer>

    <!-- 订单统计模态框 -->
    <a-modal 
      v-model:visible="statsModalVisible" 
      title="订单统计" 
      width="600px"
      :footer="false"
    >
      <div v-if="orderStats" class="order-stats">
        <a-row :gutter="16">
          <a-col :span="8" v-for="(count, status) in orderStats" :key="status">
            <a-card class="stat-card">
              <div class="stat-content">
                <div class="stat-title">{{ ORDER_STATUS_TEXT[status] || status }}</div>
                <div class="stat-value" :style="{ color: ORDER_STATUS_COLOR[status] }">
                  {{ count }}
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-modal>

    <!-- 更新状态模态框 -->
    <a-modal 
      v-model:visible="statusModalVisible" 
      title="更新订单状态" 
      @ok="handleUpdateStatus"
      @cancel="resetStatusForm"
    >
      <a-form :model="statusForm" ref="statusFormRef">
        <a-form-item label="当前状态">
          <a-tag :color="getDeliveryStatusColor(statusForm.currentStatus)">
            {{ getDeliveryStatusText(statusForm.currentStatus) }}
          </a-tag>
        </a-form-item>
        <a-form-item label="新状态" field="newStatus" required>
          <a-select v-model="statusForm.newStatus" placeholder="选择新状态">
            <a-option value="PAYING">待付款</a-option>
            <a-option value="SHIPPING">待发货</a-option>
            <a-option value="RECEIPTING">待收货</a-option>
            <a-option value="COMPLETED">已完成</a-option>
            <a-option value="CANCELLED">已取消</a-option>
            <a-option value="PROCESSING">售后处理中</a-option>
            <a-option value="PROCESSED">售后处理完成</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch,
  IconRefresh,
  IconPlus,
  IconDownload,
  IconBarChart
} from '@arco-design/web-vue/es/icon'
import {
  searchOrdersApi,
  getOrderDetailApi,
  createOrderApi,
  updateOrderStatusApi,
  payOrderApi,
  confirmOrderApi,
  cancelOrderApi,
  getOrderItemsApi,
  getOrderDeliveryInfoApi,
  getOrderStatusStatsApi,
  getSimpleCustomersApi,
  getSimpleProductsApi,
  exportOrdersApi,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR
} from '../api/order'

// 响应式数据
const loading = ref(false)
const orders = ref([])
const customers = ref([])
const products = ref([])
const customersLoading = ref(false)
const productsLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  orderStatus: '',
  customerId: null,
  startTime: '',
  endTime: '',
  timeRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true
})

// 新建订单
const createModalVisible = ref(false)
const createFormRef = ref()
const createForm = reactive({
  customerId: null,
  consigneeName: '',
  consigneePhone: '',
  deliveryAddress: '',
  items: [
    {
      productId: null,
      quantity: 1,
      price: 0,
      subtotal: 0
    }
  ],
  remark: ''
})

const createRules = {
  customerId: [{ required: true, message: '请选择客户' }],
  consigneeName: [{ required: true, message: '请输入收货人姓名' }],
  consigneePhone: [{ required: true, message: '请输入收货人电话' }],
  deliveryAddress: [{ required: true, message: '请输入配送地址' }],
  items: [
    {
      required: true,
      validator: (value, callback) => {
        if (!value || value.length === 0) {
          callback('请至少添加一个商品')
          return
        }
        const validItems = value.filter(item => item.productId && item.quantity > 0)
        if (validItems.length === 0) {
          callback('请至少添加一个有效的商品')
          return
        }
        callback()
      }
    }
  ]
}

// 订单详情
const detailDrawerVisible = ref(false)
const currentOrder = ref(null)
const orderItems = ref([])
const deliveryInfo = ref(null)
const itemsLoading = ref(false)

// 订单统计
const statsModalVisible = ref(false)
const orderStats = ref(null)

// 状态更新
const statusModalVisible = ref(false)
const statusFormRef = ref()
const statusForm = reactive({
  orderId: null,
  currentStatus: '',
  newStatus: ''
})

// 方法
const loadOrders = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      status: searchForm.orderStatus, // 将orderStatus映射为后端期望的status字段
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    
    // 删除前端特有的字段，避免传递给后端
    delete params.orderStatus
    delete params.timeRange
    
    // 清空空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await searchOrdersApi(params)
    
    if (response.code === 200) {
      // 处理嵌套的PageResult数据结构
      const pageData = response.data.data || response.data
      
      const orderList = pageData.list || pageData.records || []
      
      // 为每个订单加载配送状态
      const ordersWithDeliveryStatus = await Promise.all(
        orderList.map(async (order) => {
          try {
            const deliveryResponse = await getOrderDeliveryInfoApi(order.orderId)
            if (deliveryResponse.code === 200 && deliveryResponse.data) {
              order.deliveryStatus = deliveryResponse.data.status
            } else {
              order.deliveryStatus = 'PENDING' // 默认状态：待配送
            }
          } catch (error) {
            order.deliveryStatus = 'PENDING' // 异常时设置默认状态
          }
          return order
        })
      )
      
      orders.value = ordersWithDeliveryStatus
      pagination.total = pageData.total || 0
    } else {
      Message.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    Message.error(`加载订单列表失败: ${error.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const loadCustomers = async (visible) => {
  if (!visible || customers.value.length > 0) return
  
  try {
    customersLoading.value = true
    const response = await getSimpleCustomersApi()
    if (response.code === 200) {
      // 处理分页数据结构
      const customerData = response.data
      customers.value = customerData.list || customerData.records || customerData || []
    }
  } catch (error) {
    Message.error('加载客户列表失败')
  } finally {
    customersLoading.value = false
  }
}

const loadProducts = async (visible) => {
  if (!visible || products.value.length > 0) return
  
  try {
    productsLoading.value = true
    const response = await getSimpleProductsApi()
    if (response.code === 200) {
      // 处理可能的分页数据结构
      const productData = response.data
      products.value = productData.list || productData.records || productData || []
    }
  } catch (error) {
    Message.error('加载商品列表失败')
  } finally {
    productsLoading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadOrders()
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    orderStatus: '',
    customerId: null,
    startTime: '',
    endTime: '',
    timeRange: []
  })
  handleSearch()
}

const handleTimeRangeChange = (value) => {
  if (value && value.length === 2) {
    searchForm.startTime = value[0]
    searchForm.endTime = value[1]
  } else {
    searchForm.startTime = ''
    searchForm.endTime = ''
  }
}

const handlePageChange = (page) => {
  pagination.current = page
  loadOrders()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadOrders()
}

const showCreateModal = async () => {
  resetCreateForm()
  createModalVisible.value = true
  // 在显示新建订单弹窗时加载客户和商品数据
  await loadCustomers(true)
  await loadProducts(true)
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    customerId: null,
    consigneeName: '',
    consigneePhone: '',
    deliveryAddress: '',
    items: [
      {
        productId: null,
        quantity: 1,
        price: 0,
        subtotal: 0
      }
    ],
    remark: ''
  })
  createFormRef.value?.resetFields()
}

const addOrderItem = () => {
  createForm.items.push({
    productId: null,
    quantity: 1,
    price: 0,
    subtotal: 0
  })
}

const removeOrderItem = (index) => {
  createForm.items.splice(index, 1)
}

const handleCustomerChange = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (customer) {
    // 自动填充客户信息到收货人信息
    createForm.consigneeName = customer.realName || customer.username || ''
    createForm.consigneePhone = customer.phone || ''
    createForm.deliveryAddress = customer.address || ''
  }
}

const handleProductChange = (productId, index) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    createForm.items[index].price = product.price
    calculateItemTotal(index)
  }
}

const calculateItemTotal = (index) => {
  const item = createForm.items[index]
  item.subtotal = (item.quantity || 0) * (item.price || 0)
}

const calculateTotalAmount = () => {
  return createForm.items.reduce((total, item) => {
    return total + (item.subtotal || 0)
  }, 0)
}

const handleCreateOrder = async () => {
  try {
    try {
      await createFormRef.value?.validate()
    } catch (error) {
      return
    }
    
    const orderData = {
      ...createForm,
      items: createForm.items.filter(item => item.productId && item.quantity > 0)
    }
    
    if (orderData.items.length === 0) {
      Message.error('请至少添加一个商品')
      return
    }
    
    const response = await createOrderApi(orderData)
    
    if (response.code === 200) {
      Message.success('订单创建成功')
      createModalVisible.value = false
      resetCreateForm()
      loadOrders()
    } else {
      // 针对不同错误类型显示相应提示
      if (response.message && response.message.includes('库存不足')) {
        Message.error('商品库存不足，请减少购买数量或选择其他商品')
      } else if (response.message && response.message.includes('商品不存在')) {
        Message.error('所选商品不存在，请重新选择')
      } else {
        Message.error(response.message || '创建订单失败')
      }
    }
  } catch (error) {
    // 处理网络错误或其他异常
    if (error.message && error.message.includes('库存不足')) {
      Message.error('商品库存不足，请减少购买数量或选择其他商品')
    } else {
      Message.error(`创建订单失败: ${error.message || '网络错误，请稍后重试'}`)
    }
  }
}

const showDetail = async (order) => {
  try {
    currentOrder.value = order
    detailDrawerVisible.value = true
    
    // 加载订单详情
    const detailResponse = await getOrderDetailApi(order.orderId)
    
    if (detailResponse.code === 200) {
      currentOrder.value = detailResponse.data
      
      // 如果没有客户信息，尝试通过customerId获取
      if (!currentOrder.value.customerInfo && currentOrder.value.customerId) {
        try {
          const customerResponse = await getSimpleCustomersApi()
          if (customerResponse.code === 200) {
            const customer = customerResponse.data.find(c => c.id === currentOrder.value.customerId)
            if (customer) {
              currentOrder.value.customerInfo = {
                customerName: customer.username || customer.name,
                phone: customer.phone
              }
            }
          }
        } catch (error) {
        }
      }
    } else {
      Message.error(detailResponse.message || '获取订单详情失败')
    }
    
    // 加载商品明细
    itemsLoading.value = true
    const itemsResponse = await getOrderItemsApi(order.orderId)
    
    if (itemsResponse.code === 200) {
      orderItems.value = itemsResponse.data.items || []
    } else {
      Message.error(itemsResponse.message || '获取订单商品明细失败')
    }
    
    // 加载配送信息
    try {
      const deliveryResponse = await getOrderDeliveryInfoApi(order.orderId)
      
      if (deliveryResponse.code === 200) {
        deliveryInfo.value = deliveryResponse.data
      } else {
        // 如果获取配送信息失败，设置为null以显示"暂无配送信息"
        deliveryInfo.value = null
        console.warn('获取订单配送信息失败:', deliveryResponse.message)
      }
    } catch (error) {
      // 网络错误或其他异常，设置为null
      deliveryInfo.value = null
      console.warn('获取订单配送信息异常:', error.message)
    }
  } catch (error) {
    Message.error(`加载订单详情失败: ${error.message || '未知错误'}`)
  } finally {
    itemsLoading.value = false
  }
}



const handleUpdateStatus = async () => {
  try {
    const response = await updateOrderStatusApi(
      statusForm.orderId,
      statusForm.newStatus
    )
    
    if (response.code === 200) {
      statusModalVisible.value = false
      resetStatusForm()
      loadOrders()
      Message.success('订单状态更新成功')
    } else {
      Message.error(response.message || '更新订单状态失败')
    }
  } catch (error) {
    Message.error(`更新订单状态失败: ${error.message || '未知错误'}`)
  }
}

const resetStatusForm = () => {
  Object.assign(statusForm, {
    orderId: null,
    currentStatus: '',
    newStatus: ''
  })
}

const showStatsModal = async () => {
  try {
    const response = await getOrderStatusStatsApi()
    if (response.code === 200) {
      orderStats.value = response.data
      statsModalVisible.value = true
    }
  } catch (error) {
    Message.error('加载统计数据失败')
  }
}

const handleExport = async () => {
  try {
    const params = { ...searchForm }
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await exportOrdersApi(params)
    
    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `订单数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    Message.success('导出成功')
  } catch (error) {
    Message.error('导出失败')
  }
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取配送状态文本
const getDeliveryStatusText = (status) => {
  if (!status) return '未知状态'
  
  // 配送状态映射（匹配后端DeliveryStatus枚举）
  const DELIVERY_STATUS_TEXT = {
    'PAYING': '待付款',
    'SHIPPING': '待发货',
    'RECEIPTING': '待收货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'PROCESSING': '售后处理中',
    'PROCESSED': '售后处理完成',
    // 兼容订单状态
    'CREATED': '待支付',
    'PAID': '已支付'
  }
  
  return DELIVERY_STATUS_TEXT[status] || ORDER_STATUS_TEXT[status] || status
}

// 获取配送状态颜色
const getDeliveryStatusColor = (status) => {
  if (!status) return 'gray'
  
  // 配送状态颜色映射（匹配后端DeliveryStatus枚举）
  const DELIVERY_STATUS_COLOR = {
    'PAYING': 'orange',
    'SHIPPING': 'blue',
    'RECEIPTING': 'cyan',
    'COMPLETED': 'green',
    'CANCELLED': 'red',
    'PROCESSING': 'purple',
    'PROCESSED': 'green',
    // 兼容订单状态
    'CREATED': 'orange',
    'PAID': 'blue'
  }
  
  return DELIVERY_STATUS_COLOR[status] || ORDER_STATUS_COLOR[status] || 'gray'
}

// 生命周期
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  gap: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-bar > div {
  display: flex;
  gap: 8px;
}

.amount-text {
  font-weight: 600;
  color: #f53f3f;
}

.products-text {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-items {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.order-item {
  margin-bottom: 12px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.add-item-btn {
  width: 100%;
  margin-top: 12px;
}

.order-total {
  text-align: right;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.total-label {
  font-size: 16px;
  color: #4e5969;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f53f3f;
  margin-left: 8px;
}

.order-detail {
  padding: 16px 0;
}

.order-stats {
  padding: 16px 0;
}

.stat-card {
  text-align: center;
  margin-bottom: 16px;
}

.stat-content {
  padding: 16px;
}

.stat-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}
</style>