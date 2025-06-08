<template>
  <div class="delivery-management">
    <!-- 统计卡片区域 -->
    <a-row :gutter="16" class="mb-20">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总配送单"
            :value="stats.totalDeliveries"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <icon-truck />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="配送中"
            :value="stats.deliveringCount"
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
            title="已完成"
            :value="stats.completedCount"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <icon-check-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="配送成功率"
            :value="stats.successRate"
            :precision="1"
            suffix="%"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <icon-trophy />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="配送搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="订单号">
          <a-input v-model="searchForm.orderNo" placeholder="输入订单号" allow-clear />
        </a-form-item>
        <a-form-item label="配送单号">
          <a-input v-model="searchForm.deliveryNo" placeholder="输入配送单号" allow-clear />
        </a-form-item>
        <a-form-item label="收货人">
          <a-input v-model="searchForm.deliveryName" placeholder="输入收货人姓名" allow-clear />
        </a-form-item>
        <a-form-item label="联系电话">
          <a-input v-model="searchForm.deliveryPhone" placeholder="输入联系电话" allow-clear />
        </a-form-item>
        <a-form-item label="配送状态">
          <a-select v-model="searchForm.status" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option :value="1">待配送</a-option>
            <a-option :value="2">配送中</a-option>
            <a-option :value="3">已送达</a-option>
            <a-option :value="4">配送失败</a-option>
            <a-option :value="5">已取消</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="配送公司">
          <a-select v-model="searchForm.deliveryCompany" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option v-for="company in deliveryCompanies" :key="company" :value="company">
              {{ company }}
            </a-option>
          </a-select>
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
          新建配送
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
        <a-button 
          type="outline" 
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchUpdateStatus"
        >
          <template #icon><icon-edit /></template>
          批量更新状态
        </a-button>
      </div>
      <div>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出数据
        </a-button>
      </div>
    </div>

    <!-- 配送表格 -->
    <a-card>
      <a-table 
        :data="deliveries" 
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="配送单号" data-index="deliveryNo" :width="160">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.deliveryNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单号" data-index="orderNo" :width="160">
            <template #cell="{ record }">
              <a-link @click="viewOrder(record.orderId)">{{ record.orderNo }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="配送公司" data-index="deliveryCompany" :width="120" />
          <a-table-column title="收货人信息" :width="150">
            <template #cell="{ record }">
              <div>
                <div class="delivery-name">{{ record.deliveryName }}</div>
                <div class="delivery-phone">{{ record.deliveryPhone }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="收货地址" data-index="deliveryAddress" :width="250">
            <template #cell="{ record }">
              <a-tooltip :content="record.deliveryAddress">
                <span class="address-text">{{ record.deliveryAddress }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="配送状态" data-index="status" :width="100">
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
                      @click="updateDeliveryStatus(record, 2)"
                    >
                      开始配送
                    </a-doption>
                    <a-doption 
                      v-if="canUpdateStatus(record.status, 3)"
                      @click="updateDeliveryStatus(record, 3)"
                    >
                      标记送达
                    </a-doption>
                    <a-doption 
                      v-if="canUpdateStatus(record.status, 4)"
                      @click="updateDeliveryStatus(record, 4)"
                    >
                      配送失败
                    </a-doption>
                    <a-doption 
                      v-if="record.status !== 5"
                      @click="updateDeliveryStatus(record, 5)"
                    >
                      取消配送
                    </a-doption>
                    <a-doption 
                      v-if="record.deliveryNo"
                      @click="trackDelivery(record)"
                    >
                      物流跟踪
                    </a-doption>
                    <a-doption 
                      v-if="record.status === 1"
                      @click="deleteDelivery(record.id)"
                      class="danger"
                    >
                      删除配送
                    </a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建配送模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="新建配送"
      width="600px"
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="formRules" layout="vertical" ref="createFormRef">
        <a-form-item label="关联订单" field="orderId" required>
          <a-select 
            v-model="createForm.orderId" 
            placeholder="请选择订单"
            @change="handleOrderChange"
          >
            <a-option v-for="order in availableOrders" :key="order.id" :value="order.id">
              {{ order.orderNo }} - {{ order.customerName }}
            </a-option>
          </a-select>
        </a-form-item>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配送公司" field="deliveryCompany" required>
              <a-select v-model="createForm.deliveryCompany" placeholder="请选择配送公司">
                <a-option v-for="company in deliveryCompanies" :key="company" :value="company">
                  {{ company }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配送单号" field="deliveryNo">
              <a-input v-model="createForm.deliveryNo" placeholder="配送单号（可选）" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收货人" field="deliveryName" required>
              <a-input v-model="createForm.deliveryName" placeholder="请输入收货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" field="deliveryPhone" required>
              <a-input v-model="createForm.deliveryPhone" placeholder="请输入联系电话" />
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
        
        <a-form-item label="邮政编码" field="deliveryPostcode">
          <a-input v-model="createForm.deliveryPostcode" placeholder="请输入邮政编码" />
        </a-form-item>
        
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="createForm.remark" 
            placeholder="配送备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑配送模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      title="编辑配送"
      width="600px"
      @ok="handleUpdate"
      @cancel="resetEditForm"
    >
      <a-form :model="editForm" :rules="editFormRules" layout="vertical" ref="editFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="配送公司" field="deliveryCompany" required>
              <a-select v-model="editForm.deliveryCompany" placeholder="请选择配送公司">
                <a-option v-for="company in deliveryCompanies" :key="company" :value="company">
                  {{ company }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="配送单号" field="deliveryNo">
              <a-input v-model="editForm.deliveryNo" placeholder="配送单号" />
            </a-form-item>
          </a-col>
        </a-row>
        
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
        
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="editForm.remark" 
            placeholder="配送备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 配送详情抽屉 -->
    <a-drawer 
      v-model:visible="detailVisible" 
      title="配送详情"
      placement="right"
      width="600px"
    >
      <div v-if="currentDelivery" class="delivery-detail">
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="配送单号">{{ currentDelivery.deliveryNo || '-' }}</a-descriptions-item>
          <a-descriptions-item label="订单号">{{ currentDelivery.orderNo }}</a-descriptions-item>
          <a-descriptions-item label="配送公司">{{ currentDelivery.deliveryCompany }}</a-descriptions-item>
          <a-descriptions-item label="配送状态">
            <a-tag :color="getStatusColor(currentDelivery.status)">
              {{ getStatusText(currentDelivery.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentDelivery.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ formatDateTime(currentDelivery.updateTime) }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 收货信息 -->
        <a-divider>收货信息</a-divider>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="收货人">{{ currentDelivery.deliveryName }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ currentDelivery.deliveryPhone }}</a-descriptions-item>
          <a-descriptions-item label="收货地址">{{ currentDelivery.deliveryAddress }}</a-descriptions-item>
          <a-descriptions-item label="邮政编码">{{ currentDelivery.deliveryPostcode || '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 时间信息 -->
        <a-divider>时间信息</a-divider>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentDelivery.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="开始配送时间">{{ currentDelivery.startTime ? formatDateTime(currentDelivery.startTime) : '-' }}</a-descriptions-item>
          <a-descriptions-item label="送达时间">{{ currentDelivery.deliveredTime ? formatDateTime(currentDelivery.deliveredTime) : '-' }}</a-descriptions-item>
          <a-descriptions-item label="完成时间">{{ currentDelivery.completeTime ? formatDateTime(currentDelivery.completeTime) : '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 备注信息 -->
        <a-divider>备注信息</a-divider>
        <p>{{ currentDelivery.remark || '无备注' }}</p>
        
        <!-- 物流跟踪 -->
        <a-divider>物流跟踪</a-divider>
        <div v-if="trackingInfo.length > 0">
          <a-timeline>
            <a-timeline-item 
              v-for="(item, index) in trackingInfo" 
              :key="index"
              :color="index === 0 ? 'blue' : 'gray'"
            >
              <div class="tracking-item">
                <div class="tracking-time">{{ item.time }}</div>
                <div class="tracking-desc">{{ item.description }}</div>
                <div class="tracking-location">{{ item.location }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
        <div v-else class="empty-tracking">
          <a-empty description="暂无物流信息" />
          <a-button 
            v-if="currentDelivery.deliveryNo" 
            type="primary" 
            @click="trackDelivery(currentDelivery)"
          >
            获取物流信息
          </a-button>
        </div>
      </div>
    </a-drawer>
    
    <!-- 批量状态更新模态框 -->
    <a-modal 
      v-model:visible="batchStatusModalVisible" 
      title="批量更新状态"
      width="400px"
      @ok="confirmBatchUpdateStatus"
    >
      <a-form layout="vertical">
        <a-form-item label="选择状态">
          <a-select v-model="batchStatus" placeholder="请选择新状态">
            <a-option :value="2">配送中</a-option>
            <a-option :value="3">已送达</a-option>
            <a-option :value="4">配送失败</a-option>
            <a-option :value="5">已取消</a-option>
          </a-select>
        </a-form-item>
        <p class="batch-tip">将更新 {{ selectedRowKeys.length }} 个配送记录的状态</p>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getDeliveriesApi,
  searchDeliveriesApi,
  getDeliveryDetailApi,
  createDeliveryApi,
  updateDeliveryApi,
  deleteDeliveryApi,
  updateDeliveryStatusApi,
  batchDeleteDeliveriesApi,
  batchUpdateDeliveryStatusApi,
  getDeliveryStatsApi,
  getDeliveryCompaniesApi,
  trackDeliveryApi,
  exportDeliveriesApi
} from '@/api/delivery'
import { getOrdersApi } from '@/api/order'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const deliveries = ref([])
const availableOrders = ref([])
const deliveryCompanies = ref([])
const trackingInfo = ref([])
const stats = ref({
  totalDeliveries: 0,
  deliveringCount: 0,
  completedCount: 0,
  successRate: 0
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
  deliveryNo: '',
  deliveryName: '',
  deliveryPhone: '',
  status: '',
  deliveryCompany: '',
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
const batchStatusModalVisible = ref(false)
const currentDelivery = ref(null)
const currentEditDelivery = ref(null)
const batchStatus = ref(null)

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 创建配送表单
const createForm = reactive({
  orderId: null,
  deliveryCompany: '',
  deliveryNo: '',
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryPostcode: '',
  remark: ''
})

// 编辑配送表单
const editForm = reactive({
  deliveryCompany: '',
  deliveryNo: '',
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  deliveryPostcode: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  orderId: [{ required: true, message: '请选择订单' }],
  deliveryCompany: [{ required: true, message: '请选择配送公司' }],
  deliveryName: [{ required: true, message: '请输入收货人姓名' }],
  deliveryPhone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  deliveryAddress: [{ required: true, message: '请输入收货地址' }]
}

const editFormRules = {
  deliveryCompany: [{ required: true, message: '请选择配送公司' }],
  deliveryName: [{ required: true, message: '请输入收货人姓名' }],
  deliveryPhone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  deliveryAddress: [{ required: true, message: '请输入收货地址' }]
}

// 初始化
onMounted(() => {
  fetchDeliveries()
  fetchDeliveryCompanies()
  fetchStats()
})

// 获取配送统计
const fetchStats = async () => {
  try {
    const { data } = await getDeliveryStatsApi()
    stats.value = data
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取配送列表
const fetchDeliveries = async () => {
  loading.value = true
  try {
    const { data } = await getDeliveriesApi({
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    
    deliveries.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('获取配送列表失败')
  } finally {
    loading.value = false
  }
}

// 获取配送公司列表
const fetchDeliveryCompanies = async () => {
  try {
    const { data } = await getDeliveryCompaniesApi()
    deliveryCompanies.value = data
  } catch (error) {
    Message.error('获取配送公司列表失败')
  }
}

// 获取可用订单列表
const fetchAvailableOrders = async () => {
  try {
    const { data } = await getOrdersApi({ status: 3 }) // 待发货订单
    availableOrders.value = data.list || []
  } catch (error) {
    Message.error('获取订单列表失败')
  }
}

// 搜索配送
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
    
    const { data } = await searchDeliveriesApi(params)
    
    deliveries.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('搜索配送失败')
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
  fetchDeliveries()
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
  fetchAvailableOrders()
  createModalVisible.value = true
}

// 处理订单选择
const handleOrderChange = (orderId) => {
  const order = availableOrders.value.find(o => o.id === orderId)
  if (order) {
    createForm.deliveryName = order.deliveryName
    createForm.deliveryPhone = order.deliveryPhone
    createForm.deliveryAddress = order.deliveryAddress
    createForm.deliveryPostcode = order.deliveryPostcode
  }
}

// 创建配送
const handleCreate = async () => {
  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return
    
    await createDeliveryApi(createForm)
    Message.success('创建成功')
    createModalVisible.value = false
    resetCreateForm()
    fetchDeliveries()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '创建失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    if (key === 'orderId') {
      createForm[key] = null
    } else {
      createForm[key] = ''
    }
  })
  createFormRef.value?.resetFields()
}

// 显示编辑模态框
const showEditModal = (delivery) => {
  currentEditDelivery.value = delivery
  Object.assign(editForm, {
    deliveryCompany: delivery.deliveryCompany,
    deliveryNo: delivery.deliveryNo,
    deliveryName: delivery.deliveryName,
    deliveryPhone: delivery.deliveryPhone,
    deliveryAddress: delivery.deliveryAddress,
    deliveryPostcode: delivery.deliveryPostcode,
    remark: delivery.remark
  })
  editModalVisible.value = true
}

// 更新配送
const handleUpdate = async () => {
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    await updateDeliveryApi(currentEditDelivery.value.id, editForm)
    Message.success('更新成功')
    editModalVisible.value = false
    resetEditForm()
    fetchDeliveries()
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

// 删除配送
const deleteDelivery = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该配送记录吗？删除后无法恢复。',
    onOk: async () => {
      try {
        await deleteDeliveryApi(id)
        Message.success('删除成功')
        fetchDeliveries()
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
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个配送记录吗？`,
    onOk: async () => {
      try {
        await batchDeleteDeliveriesApi(selectedRowKeys.value)
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchDeliveries()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '批量删除失败')
      }
    }
  })
}

// 批量更新状态
const handleBatchUpdateStatus = () => {
  batchStatus.value = null
  batchStatusModalVisible.value = true
}

const confirmBatchUpdateStatus = async () => {
  if (!batchStatus.value) {
    Message.error('请选择状态')
    return
  }
  
  try {
    await batchUpdateDeliveryStatusApi(selectedRowKeys.value, batchStatus.value)
    Message.success('批量更新成功')
    batchStatusModalVisible.value = false
    selectedRowKeys.value = []
    fetchDeliveries()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '批量更新失败')
  }
}

// 更新配送状态
const updateDeliveryStatus = async (delivery, status) => {
  try {
    await updateDeliveryStatusApi(delivery.id, status)
    Message.success('状态更新成功')
    fetchDeliveries()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '状态更新失败')
  }
}

// 判断是否可以更新状态
const canUpdateStatus = (currentStatus, targetStatus) => {
  const statusFlow = {
    1: [2, 5], // 待配送 -> 配送中、已取消
    2: [3, 4, 5], // 配送中 -> 已送达、配送失败、已取消
    3: [],     // 已送达
    4: [2],    // 配送失败 -> 配送中
    5: []      // 已取消
  }
  return statusFlow[currentStatus]?.includes(targetStatus) || false
}

// 查看详情
const showDetail = async (delivery) => {
  try {
    const { data } = await getDeliveryDetailApi(delivery.id)
    currentDelivery.value = data
    trackingInfo.value = []
    detailVisible.value = true
  } catch (error) {
    Message.error('获取详情失败')
  }
}

// 查看订单
const viewOrder = (orderId) => {
  // 这里可以跳转到订单详情页面或打开订单详情模态框
  Message.info(`查看订单 ID: ${orderId}`)
}

// 物流跟踪
const trackDelivery = async (delivery) => {
  if (!delivery.deliveryNo) {
    Message.error('配送单号为空，无法跟踪')
    return
  }
  
  try {
    const { data } = await trackDeliveryApi(delivery.deliveryNo, delivery.deliveryCompany)
    trackingInfo.value = data.tracks || []
    Message.success('获取物流信息成功')
  } catch (error) {
    Message.error('获取物流信息失败')
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
    
    const response = await exportDeliveriesApi(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `配送数据_${dayjs().format('YYYY-MM-DD')}.xlsx`
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
    1: 'orange',   // 待配送
    2: 'blue',     // 配送中
    3: 'green',    // 已送达
    4: 'red',      // 配送失败
    5: 'gray'      // 已取消
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    1: '待配送',
    2: '配送中',
    3: '已送达',
    4: '配送失败',
    5: '已取消'
  }
  return texts[status] || '未知'
}

const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.delivery-management {
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

.delivery-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.delivery-phone {
  font-size: 12px;
  color: #86909c;
}

.address-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  font-weight: 500;
}

.delivery-detail {
  padding: 16px 0;
}

.tracking-item {
  padding: 8px 0;
}

.tracking-time {
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 4px;
}

.tracking-desc {
  margin-bottom: 2px;
}

.tracking-location {
  font-size: 12px;
  color: #86909c;
}

.empty-tracking {
  text-align: center;
  padding: 40px 0;
}

.batch-tip {
  color: #86909c;
  font-size: 12px;
  margin-top: 8px;
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