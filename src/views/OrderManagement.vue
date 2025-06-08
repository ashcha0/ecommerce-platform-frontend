<template>
  <div class="order-management">
    <!-- 统计卡片区域 -->
    <a-row :gutter="16" class="mb-20">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日订单"
            :value="stats.todayOrders"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <icon-file-text />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日销售额"
            :value="stats.todayAmount"
            :precision="2"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              ¥
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="待处理订单"
            :value="stats.pendingOrders"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <icon-clock-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总订单数"
            :value="stats.totalOrders"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <icon-bar-chart />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="订单搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="订单号">
          <a-input v-model="searchForm.orderNo" placeholder="输入订单号" allow-clear />
        </a-form-item>
        <a-form-item label="客户姓名">
          <a-input v-model="searchForm.customerName" placeholder="输入客户姓名" allow-clear />
        </a-form-item>
        <a-form-item label="客户电话">
          <a-input v-model="searchForm.customerPhone" placeholder="输入客户电话" allow-clear />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select v-model="searchForm.status" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option :value="1">待支付</a-option>
            <a-option :value="2">已支付</a-option>
            <a-option :value="3">待发货</a-option>
            <a-option :value="4">已发货</a-option>
            <a-option :value="5">已收货</a-option>
            <a-option :value="6">已完成</a-option>
            <a-option :value="7">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="金额范围">
          <a-input-number v-model="searchForm.minAmount" :min="0.01" placeholder="最低金额" />
          <span class="price-separator">-</span>
          <a-input-number v-model="searchForm.maxAmount" :min="0.01" placeholder="最高金额" />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker
            v-model="searchForm.timeRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="[开始时间, 结束时间]"
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
        <a-button 
          type="outline" 
          status="danger" 
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          <template #icon><icon-delete /></template>
          批量删除
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
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="订单号" data-index="orderNo" :width="160">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="客户信息" :width="150">
            <template #cell="{ record }">
              <div>
                <div class="customer-name">{{ record.customerName }}</div>
                <div class="customer-phone">{{ record.customerPhone }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="200">
            <template #cell="{ record }">
              <div class="order-items">
                <div 
                  v-for="item in record.orderItems.slice(0, 2)" 
                  :key="item.id"
                  class="order-item"
                >
                  {{ item.productName }} × {{ item.quantity }}
                </div>
                <div v-if="record.orderItems.length > 2" class="more-items">
                  等{{ record.orderItems.length }}件商品
                </div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="订单金额" data-index="totalAmount" :width="120">
            <template #cell="{ record }">
              <span class="amount">¥{{ record.totalAmount.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="订单状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)" class="status-tag">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="showDetail(record)" size="small">
                  <icon-eye /> 查看
                </a-link>
                <a-link 
                  v-if="record.status === 1" 
                  @click="showEditModal(record)" 
                  size="small"
                >
                  <icon-edit /> 编辑
                </a-link>
                <a-dropdown>
                  <a-link size="small">
                    <icon-more /> 更多
                  </a-link>
                  <template #content>
                    <a-doption 
                      v-if="canUpdateStatus(record.status, 2)"
                      @click="updateOrderStatus(record, 2)"
                    >
                      标记已支付
                    </a-doption>
                    <a-doption 
                      v-if="canUpdateStatus(record.status, 4)"
                      @click="updateOrderStatus(record, 4)"
                    >
                      标记已发货
                    </a-doption>
                    <a-doption 
                      v-if="canUpdateStatus(record.status, 6)"
                      @click="updateOrderStatus(record, 6)"
                    >
                      标记已完成
                    </a-doption>
                    <a-doption 
                      v-if="record.status !== 7"
                      @click="updateOrderStatus(record, 7)"
                    >
                      取消订单
                    </a-doption>
                    <a-doption 
                      v-if="record.status === 1"
                      @click="deleteOrder(record.id)"
                      class="danger"
                    >
                      删除订单
                    </a-doption>
                  </template>
                </a-dropdown>
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
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="formRules" layout="vertical" ref="createFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户" field="customerId" required>
              <a-select 
                v-model="createForm.customerId" 
                placeholder="请选择客户"
                @change="handleCustomerChange"
              >
                <a-option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }} ({{ customer.phone }})
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="支付方式" field="paymentMethod">
              <a-select v-model="createForm.paymentMethod" placeholder="请选择支付方式">
                <a-option value="支付宝">支付宝</a-option>
                <a-option value="微信支付">微信支付</a-option>
                <a-option value="银行卡">银行卡</a-option>
                <a-option value="现金">现金</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        
        <!-- 商品选择 -->
        <a-form-item label="商品" required>
          <div class="product-selection">
            <div 
              v-for="(item, index) in createForm.orderItems" 
              :key="index"
              class="product-item"
            >
              <a-row :gutter="8" align="middle">
                <a-col :span="8">
                  <a-select 
                    v-model="item.productId" 
                    placeholder="选择商品"
                    @change="(value) => handleProductChange(value, index)"
                  >
                    <a-option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.name }} (¥{{ product.price }})
                    </a-option>
                  </a-select>
                </a-col>
                <a-col :span="4">
                  <a-input-number 
                    v-model="item.quantity" 
                    :min="1" 
                    placeholder="数量"
                    @change="() => calculateItemTotal(index)"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number 
                    v-model="item.price" 
                    :min="0.01" 
                    :precision="2"
                    placeholder="单价"
                    @change="() => calculateItemTotal(index)"
                  />
                </a-col>
                <a-col :span="4">
                  <span class="item-total">¥{{ (item.quantity * item.price || 0).toFixed(2) }}</span>
                </a-col>
                <a-col :span="4">
                  <a-button 
                    type="text" 
                    status="danger" 
                    @click="removeOrderItem(index)"
                    :disabled="createForm.orderItems.length === 1"
                  >
                    <icon-delete />
                  </a-button>
                </a-col>
              </a-row>
            </div>
            <a-button type="dashed" @click="addOrderItem" class="add-item-btn">
              <icon-plus /> 添加商品
            </a-button>
          </div>
        </a-form-item>
        
        <!-- 配送信息 -->
        <a-divider>配送信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="收货人" field="deliveryName" required>
              <a-input v-model="createForm.deliveryName" placeholder="请输入收货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="联系电话" field="deliveryPhone" required>
              <a-input v-model="createForm.deliveryPhone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="邮政编码" field="deliveryPostcode">
              <a-input v-model="createForm.deliveryPostcode" placeholder="请输入邮政编码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="收货地址" field="deliveryAddress" required>
          <a-textarea 
            v-model="createForm.deliveryAddress" 
            placeholder="请输入详细收货地址" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="createForm.remark" 
            placeholder="订单备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
        
        <!-- 订单总计 -->
        <a-divider>订单总计</a-divider>
        <div class="order-total">
          <span class="total-label">订单总金额：</span>
          <span class="total-amount">¥{{ orderTotal.toFixed(2) }}</span>
        </div>
      </a-form>
    </a-modal>

    <!-- 编辑订单模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      title="编辑订单"
      width="600px"
      @ok="handleUpdate"
      @cancel="resetEditForm"
    >
      <a-form :model="editForm" :rules="editFormRules" layout="vertical" ref="editFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收货人" field="deliveryName" required>
              <a-input v-model="editForm.deliveryName" placeholder="请输入收货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" field="deliveryPhone" required>
              <a-input v-model="editForm.deliveryPhone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="收货地址" field="deliveryAddress" required>
          <a-textarea 
            v-model="editForm.deliveryAddress" 
            placeholder="请输入详细收货地址" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
        <a-form-item label="邮政编码" field="deliveryPostcode">
          <a-input v-model="editForm.deliveryPostcode" placeholder="请输入邮政编码" />
        </a-form-item>
        <a-form-item label="支付方式" field="paymentMethod">
          <a-select v-model="editForm.paymentMethod" placeholder="请选择支付方式">
            <a-option value="支付宝">支付宝</a-option>
            <a-option value="微信支付">微信支付</a-option>
            <a-option value="银行卡">银行卡</a-option>
            <a-option value="现金">现金</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="editForm.remark" 
            placeholder="订单备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 订单详情抽屉 -->
    <a-drawer 
      v-model:visible="detailVisible" 
      title="订单详情"
      placement="right"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="订单号">{{ currentOrder.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="订单状态">
            <a-tag :color="getStatusColor(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="客户姓名">{{ currentOrder.customerName }}</a-descriptions-item>
          <a-descriptions-item label="客户电话">{{ currentOrder.customerPhone }}</a-descriptions-item>
          <a-descriptions-item label="客户邮箱">{{ currentOrder.customerEmail || '-' }}</a-descriptions-item>
          <a-descriptions-item label="订单金额">
            <span class="amount">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="支付方式">{{ currentOrder.paymentMethod || '-' }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.createTime) }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 商品信息 -->
        <a-divider>商品信息</a-divider>
        <a-table :data="currentOrder.orderItems" :pagination="false">
          <template #columns>
            <a-table-column title="商品名称" data-index="productName" />
            <a-table-column title="单价" data-index="price">
              <template #cell="{ record }">
                ¥{{ record.price.toFixed(2) }}
              </template>
            </a-table-column>
            <a-table-column title="数量" data-index="quantity" />
            <a-table-column title="小计" data-index="totalPrice">
              <template #cell="{ record }">
                ¥{{ record.totalPrice.toFixed(2) }}
              </template>
            </a-table-column>
          </template>
        </a-table>
        
        <!-- 配送信息 -->
        <a-divider>配送信息</a-divider>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="收货人">{{ currentOrder.deliveryName }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ currentOrder.deliveryPhone }}</a-descriptions-item>
          <a-descriptions-item label="收货地址">{{ currentOrder.deliveryAddress }}</a-descriptions-item>
          <a-descriptions-item label="邮政编码">{{ currentOrder.deliveryPostcode || '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 时间信息 -->
        <a-divider>时间信息</a-divider>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentOrder.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="支付时间">{{ currentOrder.paymentTime ? formatDateTime(currentOrder.paymentTime) : '-' }}</a-descriptions-item>
          <a-descriptions-item label="发货时间">{{ currentOrder.deliveryTime ? formatDateTime(currentOrder.deliveryTime) : '-' }}</a-descriptions-item>
          <a-descriptions-item label="完成时间">{{ currentOrder.completeTime ? formatDateTime(currentOrder.completeTime) : '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 备注信息 -->
        <a-divider>备注信息</a-divider>
        <p>{{ currentOrder.remark || '无备注' }}</p>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import {
  getOrdersApi,
  searchOrdersApi,
  getOrderDetailApi,
  createOrderApi,
  updateOrderApi,
  deleteOrderApi,
  updateOrderStatusApi,
  getCustomersApi,
  getSimpleProductsApi,
  batchDeleteOrdersApi,
  getOrderStatsApi,
  exportOrdersApi
} from '@/api/order'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const orders = ref([])
const customers = ref([])
const products = ref([])
const stats = ref({
  todayOrders: 0,
  todayAmount: 0,
  pendingOrders: 0,
  totalOrders: 0
})

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true,
})

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  customerPhone: '',
  status: '',
  minAmount: null,
  maxAmount: null,
  timeRange: []
})

// 表格选择
const selectedRowKeys = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
})

// 模态框控制
const createModalVisible = ref(false)
const editModalVisible = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)
const currentEditOrder = ref(null)

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 创建订单表单
const createForm = reactive({
  customerId: null,
  orderItems: [
    {
      productId: null,
      quantity: 1,
      price: 0
    }
  ],
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryPostcode: '',
  paymentMethod: '',
  remark: ''
})

// 编辑订单表单
const editForm = reactive({
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryPostcode: '',
  paymentMethod: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  customerId: [{ required: true, message: '请选择客户' }],
  deliveryName: [{ required: true, message: '请输入收货人姓名' }],
  deliveryPhone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  deliveryAddress: [{ required: true, message: '请输入收货地址' }]
}

const editFormRules = {
  deliveryName: [{ required: true, message: '请输入收货人姓名' }],
  deliveryPhone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  deliveryAddress: [{ required: true, message: '请输入收货地址' }]
}

// 计算订单总金额
const orderTotal = computed(() => {
  return createForm.orderItems.reduce((total, item) => {
    return total + (item.quantity * item.price || 0)
  }, 0)
})

// 初始化
onMounted(() => {
  fetchOrders()
  fetchCustomers()
  fetchProducts()
  fetchStats()
})

// 获取订单统计
const fetchStats = async () => {
  try {
    const { data } = await getOrderStatsApi()
    stats.value = data
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await getOrdersApi({
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    
    orders.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const { data } = await getCustomersApi()
    customers.value = data
  } catch (error) {
    Message.error('获取客户列表失败')
  }
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    const { data } = await getSimpleProductsApi()
    products.value = data
  } catch (error) {
    Message.error('获取商品列表失败')
  }
}

// 搜索订单
const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    
    // 处理时间范围
    if (searchForm.timeRange && searchForm.timeRange.length === 2) {
      params.startTime = dayjs(searchForm.timeRange[0]).format('YYYY-MM-DD HH:mm:ss')
      params.endTime = dayjs(searchForm.timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
    }
    delete params.timeRange
    
    const { data } = await searchOrdersApi(params)
    
    orders.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('搜索订单失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'timeRange') {
      searchForm[key] = []
    } else {
      searchForm[key] = ''
    }
  })
  pagination.current = 1
  fetchOrders()
}

// 分页处理
const handlePageChange = (pageNum) => {
  pagination.current = pageNum
  handleSearch()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  handleSearch()
}

// 显示创建模态框
const showCreateModal = () => {
  createModalVisible.value = true
}

// 处理客户选择
const handleCustomerChange = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (customer) {
    createForm.deliveryName = customer.name
    createForm.deliveryPhone = customer.phone
  }
}

// 处理商品选择
const handleProductChange = (productId, index) => {
  const product = products.value.find(p => p.id === productId)
  if (product) {
    createForm.orderItems[index].price = product.price
    calculateItemTotal(index)
  }
}

// 计算商品小计
const calculateItemTotal = (index) => {
  const item = createForm.orderItems[index]
  item.totalPrice = item.quantity * item.price
}

// 添加订单商品
const addOrderItem = () => {
  createForm.orderItems.push({
    productId: null,
    quantity: 1,
    price: 0
  })
}

// 移除订单商品
const removeOrderItem = (index) => {
  createForm.orderItems.splice(index, 1)
}

// 创建订单
const handleCreate = async () => {
  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return
    
    // 验证商品信息
    const hasInvalidItem = createForm.orderItems.some(item => 
      !item.productId || !item.quantity || !item.price
    )
    if (hasInvalidItem) {
      Message.error('请完善商品信息')
      return
    }
    
    const { data } = await createOrderApi(createForm)
    Message.success('创建成功')
    createModalVisible.value = false
    resetCreateForm()
    fetchOrders()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '创建失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    if (key === 'orderItems') {
      createForm[key] = [{
        productId: null,
        quantity: 1,
        price: 0
      }]
    } else {
      createForm[key] = ''
    }
  })
  createFormRef.value?.resetFields()
}

// 显示编辑模态框
const showEditModal = (order) => {
  currentEditOrder.value = order
  Object.assign(editForm, {
    deliveryName: order.deliveryName,
    deliveryPhone: order.deliveryPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryPostcode: order.deliveryPostcode,
    paymentMethod: order.paymentMethod,
    remark: order.remark
  })
  editModalVisible.value = true
}

// 更新订单
const handleUpdate = async () => {
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    await updateOrderApi(currentEditOrder.value.id, editForm)
    Message.success('更新成功')
    editModalVisible.value = false
    resetEditForm()
    fetchOrders()
  } catch (error) {
    Message.error(error.message || '更新失败')
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.keys(editForm).forEach(key => {
    editForm[key] = ''
  })
  editFormRef.value?.resetFields()
}

// 删除订单
const deleteOrder = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该订单吗？删除后无法恢复。',
    onOk: async () => {
      try {
        await deleteOrderApi(id)
        Message.success('删除成功')
        fetchOrders()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认批量删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个订单吗？`,
    onOk: async () => {
      try {
        await batchDeleteOrdersApi(selectedRowKeys.value)
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchOrders()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '批量删除失败')
      }
    }
  })
}

// 更新订单状态
const updateOrderStatus = async (order, status) => {
  try {
    await updateOrderStatusApi(order.id, status)
    Message.success('状态更新成功')
    fetchOrders()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '状态更新失败')
  }
}

// 判断是否可以更新状态
const canUpdateStatus = (currentStatus, targetStatus) => {
  const statusFlow = {
    1: [2, 7], // 待支付 -> 已支付、已取消
    2: [3, 7], // 已支付 -> 待发货、已取消
    3: [4, 7], // 待发货 -> 已发货、已取消
    4: [5, 7], // 已发货 -> 已收货、已取消
    5: [6, 7], // 已收货 -> 已完成、已取消
    6: [],     // 已完成
    7: []      // 已取消
  }
  return statusFlow[currentStatus]?.includes(targetStatus) || false
}

// 查看详情
const showDetail = async (order) => {
  try {
    const { data } = await getOrderDetailApi(order.id)
    currentOrder.value = data
    detailVisible.value = true
  } catch (error) {
    Message.error('获取详情失败')
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const params = { ...searchForm }
    if (searchForm.timeRange && searchForm.timeRange.length === 2) {
      params.startTime = dayjs(searchForm.timeRange[0]).format('YYYY-MM-DD HH:mm:ss')
      params.endTime = dayjs(searchForm.timeRange[1]).format('YYYY-MM-DD HH:mm:ss')
    }
    delete params.timeRange
    
    const response = await exportOrdersApi(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `订单数据_${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    Message.success('导出成功')
  } catch (error) {
    Message.error('导出失败')
  }
}

// 工具函数
const getStatusColor = (status) => {
  const colors = {
    1: 'orange',   // 待支付
    2: 'blue',     // 已支付
    3: 'cyan',     // 待发货
    4: 'purple',   // 已发货
    5: 'lime',     // 已收货
    6: 'green',    // 已完成
    7: 'red'       // 已取消
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    1: '待支付',
    2: '已支付',
    3: '待发货',
    4: '已发货',
    5: '已收货',
    6: '已完成',
    7: '已取消'
  }
  return texts[status] || '未知'
}

const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.action-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-bar > div {
  display: flex;
  gap: 8px;
}

.customer-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.customer-phone {
  font-size: 12px;
  color: #86909c;
}

.order-items {
  font-size: 12px;
}

.order-item {
  margin-bottom: 2px;
}

.more-items {
  color: #86909c;
  font-style: italic;
}

.amount {
  font-weight: 600;
  color: #f53f3f;
}

.status-tag {
  font-weight: 500;
}

.product-selection {
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 16px;
}

.product-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 4px;
}

.product-item:last-child {
  margin-bottom: 0;
}

.item-total {
  font-weight: 600;
  color: #f53f3f;
}

.add-item-btn {
  width: 100%;
  margin-top: 12px;
}

.order-total {
  text-align: right;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 6px;
}

.total-label {
  font-size: 16px;
  margin-right: 8px;
}

.total-amount {
  font-size: 20px;
  font-weight: 600;
  color: #f53f3f;
}

.order-detail {
  padding: 16px 0;
}

.price-separator {
  margin: 0 8px;
  color: #999;
}

.stat-card {
  text-align: center;
}

.danger {
  color: #f53f3f !important;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-form .arco-form {
    flex-direction: column;
  }
  
  .search-form .arco-form-item {
    width: 100% !important;
  }
}
</style>