<template>
  <div class="delivery-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>配送管理</h1>
    </div>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="配送搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="订单ID">
          <a-input-number v-model="searchForm.orderId" placeholder="输入订单ID" allow-clear />
        </a-form-item>
        <a-form-item label="物流单号">
          <a-input v-model="searchForm.trackingNo" placeholder="输入物流单号" allow-clear />
        </a-form-item>
        <a-form-item label="物流公司">
          <a-input v-model="searchForm.shipper" placeholder="输入物流公司" allow-clear />
        </a-form-item>
        <a-form-item label="配送状态">
          <a-select v-model="searchForm.status" placeholder="选择配送状态" allow-clear>
            <a-option value="">全部状态</a-option>
            <a-option v-for="(text, status) in DELIVERY_STATUS_TEXT" :key="status" :value="status">
              {{ text }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="发货时间">
          <a-range-picker 
            v-model="searchForm.shipTimeRange" 
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            @change="handleShipTimeRangeChange"
          />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker 
            v-model="searchForm.createTimeRange" 
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            @change="handleCreateTimeRangeChange"
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
          创建配送
        </a-button>
        <a-button @click="showStatsModal">
          <template #icon><icon-bar-chart /></template>
          配送统计
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
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="配送ID" data-index="id" :width="100">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.id }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="订单ID" data-index="orderId" :width="100" />
          <a-table-column title="物流单号" data-index="trackingNo" :width="150">
            <template #cell="{ record }">
              <span v-if="record.trackingNo">{{ record.trackingNo }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="物流公司" data-index="shipper" :width="120">
            <template #cell="{ record }">
              <span v-if="record.shipper">{{ record.shipper }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="配送状态" data-index="status" :width="120">
            <template #cell="{ record }">
              <a-tag :color="DELIVERY_STATUS_COLOR[record.status]">
                {{ DELIVERY_STATUS_TEXT[record.status] || record.status }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="预计送达" data-index="estimateTime" :width="160">
            <template #cell="{ record }">
              <span v-if="record.estimateTime">{{ formatDateTime(record.estimateTime) }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="发货时间" data-index="shipTime" :width="160">
            <template #cell="{ record }">
              <span v-if="record.shipTime">{{ formatDateTime(record.shipTime) }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="送达时间" data-index="deliveryTime" :width="160">
            <template #cell="{ record }">
              <span v-if="record.deliveryTime">{{ formatDateTime(record.deliveryTime) }}</span>
              <span v-else class="text-gray">-</span>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-dropdown>
                <a-button type="text">
                  操作
                  <template #icon><icon-down /></template>
                </a-button>
                <template #content>
                  <a-doption @click="showDetail(record)">
                    <template #icon><icon-eye /></template>
                    查看详情
                  </a-doption>
                  <a-doption @click="handleAction('edit', record)">
                    <template #icon><icon-edit /></template>
                    编辑配送
                  </a-doption>
                  <a-doption @click="handleAction('ship', record)" v-if="record.status === 'PENDING'">
                    <template #icon><icon-send /></template>
                    发货
                  </a-doption>
                  <a-doption @click="handleAction('updateStatus', record)">
                    <template #icon><icon-settings /></template>
                    更新状态
                  </a-doption>
                  <a-doption @click="handleAction('track', record)" v-if="record.trackingNo">
                    <template #icon><icon-location /></template>
                    物流跟踪
                  </a-doption>
                  <a-doption @click="handleAction('confirm', record)" v-if="record.status === 'DELIVERED'">
                    <template #icon><icon-check /></template>
                    确认收货
                  </a-doption>
                  <a-doption @click="handleAction('delete', record)" class="danger">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 创建配送模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="创建配送信息" 
      width="600px"
      @ok="handleCreateDelivery"
      @cancel="resetCreateForm"
    >
      <a-form 
        ref="createFormRef" 
        :model="createForm" 
        :rules="createRules" 
        layout="vertical"
      >
        <a-form-item label="订单ID" field="orderId">
          <a-input-number v-model="createForm.orderId" placeholder="输入订单ID" :min="1" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑配送模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      title="编辑配送信息" 
      width="600px"
      @ok="handleUpdateDelivery"
      @cancel="resetEditForm"
    >
      <a-form 
        ref="editFormRef" 
        :model="editForm" 
        :rules="editRules" 
        layout="vertical"
      >
        <a-form-item label="物流单号" field="trackingNo">
          <a-input v-model="editForm.trackingNo" placeholder="输入物流单号" />
        </a-form-item>
        <a-form-item label="物流公司" field="shipper">
          <a-input v-model="editForm.shipper" placeholder="输入物流公司" />
        </a-form-item>
        <a-form-item label="预计送达时间" field="estimateTime">
          <a-date-picker 
            v-model="editForm.estimateTime" 
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择预计送达时间"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 发货模态框 -->
    <a-modal 
      v-model:visible="shipModalVisible" 
      title="发货" 
      width="500px"
      @ok="handleShip"
      @cancel="resetShipForm"
    >
      <a-form 
        ref="shipFormRef" 
        :model="shipForm" 
        :rules="shipRules" 
        layout="vertical"
      >
        <a-form-item label="物流单号" field="trackingNo">
          <a-input v-model="shipForm.trackingNo" placeholder="输入物流单号" />
        </a-form-item>
        <a-form-item label="物流公司" field="shipper">
          <a-input v-model="shipForm.shipper" placeholder="输入物流公司" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 状态更新模态框 -->
    <a-modal 
      v-model:visible="statusModalVisible" 
      title="更新配送状态" 
      width="400px"
      @ok="handleUpdateStatus"
      @cancel="resetStatusForm"
    >
      <a-form 
        ref="statusFormRef" 
        :model="statusForm" 
        :rules="statusRules" 
        layout="vertical"
      >
        <a-form-item label="配送状态" field="status">
          <a-select v-model="statusForm.status" placeholder="选择配送状态">
            <a-option v-for="(text, status) in DELIVERY_STATUS_TEXT" :key="status" :value="status">
              {{ text }}
            </a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 配送详情抽屉 -->
    <a-drawer 
      v-model:visible="detailDrawerVisible" 
      title="配送详情" 
      width="600px"
    >
      <div v-if="currentDelivery" class="delivery-detail">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="配送ID">{{ currentDelivery.id }}</a-descriptions-item>
          <a-descriptions-item label="订单ID">{{ currentDelivery.orderId }}</a-descriptions-item>
          <a-descriptions-item label="物流单号">
            <span v-if="currentDelivery.trackingNo">{{ currentDelivery.trackingNo }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="物流公司">
            <span v-if="currentDelivery.shipper">{{ currentDelivery.shipper }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="配送状态">
            <a-tag :color="DELIVERY_STATUS_COLOR[currentDelivery.status]">
              {{ DELIVERY_STATUS_TEXT[currentDelivery.status] || currentDelivery.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="预计送达时间">
            <span v-if="currentDelivery.estimateTime">{{ formatDateTime(currentDelivery.estimateTime) }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="发货时间">
            <span v-if="currentDelivery.shipTime">{{ formatDateTime(currentDelivery.shipTime) }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="送达时间">
            <span v-if="currentDelivery.deliveryTime">{{ formatDateTime(currentDelivery.deliveryTime) }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="确认时间">
            <span v-if="currentDelivery.confirmTime">{{ formatDateTime(currentDelivery.confirmTime) }}</span>
            <span v-else class="text-gray">-</span>
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentDelivery.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ formatDateTime(currentDelivery.updateTime) }}</a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>

    <!-- 配送统计模态框 -->
    <a-modal 
      v-model:visible="statsModalVisible" 
      title="配送统计" 
      width="800px"
      :footer="false"
    >
      <div v-if="deliveryStats" class="stats-content">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic title="总配送数" :value="deliveryStats.total" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="待发货" :value="deliveryStats.pending" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="已发货" :value="deliveryStats.shipped" />
          </a-col>
          <a-col :span="6">
            <a-statistic title="已送达" :value="deliveryStats.delivered" />
          </a-col>
        </a-row>
      </div>
    </a-modal>

    <!-- 物流跟踪模态框 -->
    <a-modal 
      v-model:visible="trackModalVisible" 
      title="物流跟踪" 
      width="600px"
      :footer="false"
    >
      <div v-if="trackingInfo" class="tracking-info">
        <a-timeline>
          <a-timeline-item v-for="(item, index) in trackingInfo" :key="index">
            <div class="tracking-item">
              <div class="tracking-time">{{ item.time }}</div>
              <div class="tracking-desc">{{ item.description }}</div>
              <div class="tracking-location" v-if="item.location">{{ item.location }}</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
      <div v-else class="no-tracking">
        <a-empty description="暂无物流信息" />
      </div>
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
  IconBarChart,
  IconDownload,
  IconDown,
  IconEye,
  IconEdit,
  IconSend,
  IconSettings,
  IconLocation,
  IconCheck,
  IconDelete
} from '@arco-design/web-vue/es/icon'
import {
  getDeliveriesApi,
  searchDeliveriesApi,
  getDeliveryDetailApi,
  getDeliveryByOrderIdApi,
  createDeliveryApi,
  updateDeliveryApi,
  deleteDeliveryApi,
  updateDeliveryStatusApi,
  shipDeliveryApi,
  confirmDeliveryApi,
  getDeliveryStatsApi,
  trackDeliveryApi,
  exportDeliveriesApi
} from '@/api/delivery'

// 配送状态映射
const DELIVERY_STATUS_TEXT = {
  PENDING: '待发货',
  SHIPPED: '已发货',
  DELIVERED: '已送达',
  CONFIRMED: '已确认',
  CANCELLED: '已取消'
}

const DELIVERY_STATUS_COLOR = {
  PENDING: 'orange',
  SHIPPED: 'blue',
  DELIVERED: 'green',
  CONFIRMED: 'arcoblue',
  CANCELLED: 'red'
}

// 响应式数据
const loading = ref(false)
const deliveries = ref([])

// 搜索表单
const searchForm = reactive({
  orderId: null,
  trackingNo: '',
  shipper: '',
  status: '',
  shipTimeRange: [],
  createTimeRange: [],
  shipTimeStart: '',
  shipTimeEnd: '',
  createTimeStart: '',
  createTimeEnd: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// 创建配送模态框
const createModalVisible = ref(false)
const createFormRef = ref()
const createForm = reactive({
  orderId: null
})

const createRules = {
  orderId: [
    { required: true, message: '请输入订单ID' },
    { type: 'number', min: 1, message: '订单ID必须大于0' }
  ]
}

// 编辑配送模态框
const editModalVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: null,
  orderId: null,
  trackingNo: '',
  shipper: '',
  estimateTime: ''
})

const editRules = {
  trackingNo: [
    { required: false, message: '请输入物流单号' }
  ],
  shipper: [
    { required: false, message: '请输入物流公司' }
  ]
}

// 发货模态框
const shipModalVisible = ref(false)
const shipFormRef = ref()
const shipForm = reactive({
  orderId: null,
  trackingNo: '',
  shipper: ''
})

const shipRules = {
  trackingNo: [
    { required: true, message: '请输入物流单号' }
  ],
  shipper: [
    { required: true, message: '请输入物流公司' }
  ]
}

// 状态更新模态框
const statusModalVisible = ref(false)
const statusFormRef = ref()
const statusForm = reactive({
  orderId: null,
  status: ''
})

const statusRules = {
  status: [
    { required: true, message: '请选择配送状态' }
  ]
}

// 配送详情抽屉
const detailDrawerVisible = ref(false)
const currentDelivery = ref(null)

// 配送统计模态框
const statsModalVisible = ref(false)
const deliveryStats = ref(null)

// 物流跟踪模态框
const trackModalVisible = ref(false)
const trackingInfo = ref(null)

// 加载配送列表
const loadDeliveries = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    console.log('发送配送列表请求，参数:', params)
    const response = await getDeliveriesApi(params)
    console.log('配送列表响应:', response)
    
    if (response.code === 200) {
      // 检查数据结构
      console.log('响应数据结构:', response.data)
      
      // 根据后端实际返回的数据结构调整
      if (response.data && response.data.data && response.data.data.list) {
        // 如果是嵌套的PageInfo结构
        deliveries.value = response.data.data.list || []
        pagination.total = response.data.data.total || 0
      } else if (response.data && response.data.records) {
        // 如果是直接的records结构
        deliveries.value = response.data.records || []
        pagination.total = response.data.total || 0
      } else if (response.data && Array.isArray(response.data)) {
        // 如果直接返回数组
        deliveries.value = response.data || []
        pagination.total = response.data.length || 0
      } else {
        // 其他情况
        deliveries.value = []
        pagination.total = 0
        console.warn('未知的数据结构:', response.data)
      }
      
      console.log('设置的配送列表:', deliveries.value)
      console.log('设置的总数:', pagination.total)
    } else {
      Message.error(response.message || '获取配送列表失败')
    }
  } catch (error) {
    console.error('获取配送列表失败:', error)
    Message.error('获取配送列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  pagination.current = 1
  await loadDeliveries()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    orderId: null,
    trackingNo: '',
    shipper: '',
    status: '',
    shipTimeRange: [],
    createTimeRange: [],
    shipTimeStart: '',
    shipTimeEnd: '',
    createTimeStart: '',
    createTimeEnd: ''
  })
  pagination.current = 1
  loadDeliveries()
}

// 时间范围变化处理
const handleShipTimeRangeChange = (value) => {
  if (value && value.length === 2) {
    searchForm.shipTimeStart = value[0]
    searchForm.shipTimeEnd = value[1]
  } else {
    searchForm.shipTimeStart = ''
    searchForm.shipTimeEnd = ''
  }
}

const handleCreateTimeRangeChange = (value) => {
  if (value && value.length === 2) {
    searchForm.createTimeStart = value[0]
    searchForm.createTimeEnd = value[1]
  } else {
    searchForm.createTimeStart = ''
    searchForm.createTimeEnd = ''
  }
}

// 分页处理
const handlePageChange = (page) => {
  pagination.current = page
  loadDeliveries()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  loadDeliveries()
}

// 显示创建模态框
const showCreateModal = () => {
  createModalVisible.value = true
}

// 重置创建表单
const resetCreateForm = () => {
  Object.assign(createForm, {
    orderId: null
  })
  createFormRef.value?.resetFields()
}

// 创建配送
const handleCreateDelivery = async () => {
  try {
    const valid = await createFormRef.value?.validate()
    if (!valid) return
    
    const response = await createDeliveryApi(createForm.orderId)
    if (response.code === 200) {
      Message.success('创建配送信息成功')
      createModalVisible.value = false
      resetCreateForm()
      await loadDeliveries()
    } else {
      Message.error(response.message || '创建配送信息失败')
    }
  } catch (error) {
    console.error('创建配送信息失败:', error)
    Message.error('创建配送信息失败')
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: null,
    orderId: null,
    trackingNo: '',
    shipper: '',
    estimateTime: ''
  })
  editFormRef.value?.resetFields()
}

// 编辑配送
const handleUpdateDelivery = async () => {
  try {
    const valid = await editFormRef.value?.validate()
    if (!valid) return
    
    const data = {
      trackingNo: editForm.trackingNo,
      shipper: editForm.shipper,
      estimateTime: editForm.estimateTime
    }
    
    const response = await updateDeliveryApi(editForm.orderId, data)
    if (response.code === 200) {
      Message.success('更新配送信息成功')
      editModalVisible.value = false
      resetEditForm()
      await loadDeliveries()
    } else {
      Message.error(response.message || '更新配送信息失败')
    }
  } catch (error) {
    console.error('更新配送信息失败:', error)
    Message.error('更新配送信息失败')
  }
}

// 重置发货表单
const resetShipForm = () => {
  Object.assign(shipForm, {
    orderId: null,
    trackingNo: '',
    shipper: ''
  })
  shipFormRef.value?.resetFields()
}

// 发货
const handleShip = async () => {
  try {
    const valid = await shipFormRef.value?.validate()
    if (!valid) return
    
    const response = await shipDeliveryApi(shipForm.orderId, shipForm.trackingNo, shipForm.shipper)
    if (response.code === 200) {
      Message.success('发货成功')
      shipModalVisible.value = false
      resetShipForm()
      await loadDeliveries()
    } else {
      Message.error(response.message || '发货失败')
    }
  } catch (error) {
    console.error('发货失败:', error)
    Message.error('发货失败')
  }
}

// 重置状态表单
const resetStatusForm = () => {
  Object.assign(statusForm, {
    orderId: null,
    status: ''
  })
  statusFormRef.value?.resetFields()
}

// 更新状态
const handleUpdateStatus = async () => {
  try {
    const valid = await statusFormRef.value?.validate()
    if (!valid) return
    
    const response = await updateDeliveryStatusApi(statusForm.orderId, statusForm.status)
    if (response.code === 200) {
      Message.success('更新配送状态成功')
      statusModalVisible.value = false
      resetStatusForm()
      await loadDeliveries()
    } else {
      Message.error(response.message || '更新配送状态失败')
    }
  } catch (error) {
    console.error('更新配送状态失败:', error)
    Message.error('更新配送状态失败')
  }
}

// 显示详情
const showDetail = async (delivery) => {
  try {
    const response = await getDeliveryDetailApi(delivery.id)
    if (response.code === 200) {
      currentDelivery.value = response.data
      detailDrawerVisible.value = true
    } else {
      Message.error(response.message || '获取配送详情失败')
    }
  } catch (error) {
    console.error('获取配送详情失败:', error)
    Message.error('获取配送详情失败')
  }
}

// 处理操作
const handleAction = (action, delivery) => {
  switch (action) {
    case 'edit':
      Object.assign(editForm, {
        id: delivery.id,
        orderId: delivery.orderId,
        trackingNo: delivery.trackingNo || '',
        shipper: delivery.shipper || '',
        estimateTime: delivery.estimateTime || ''
      })
      editModalVisible.value = true
      break
    case 'ship':
      Object.assign(shipForm, {
        orderId: delivery.orderId,
        trackingNo: '',
        shipper: ''
      })
      shipModalVisible.value = true
      break
    case 'updateStatus':
      Object.assign(statusForm, {
        orderId: delivery.orderId,
        status: ''
      })
      statusModalVisible.value = true
      break
    case 'track':
      handleTrack(delivery)
      break
    case 'confirm':
      handleConfirm(delivery)
      break
    case 'delete':
      handleDelete(delivery)
      break
  }
}

// 物流跟踪
const handleTrack = async (delivery) => {
  try {
    const response = await trackDeliveryApi(delivery.trackingNo, delivery.shipper)
    if (response.code === 200) {
      trackingInfo.value = response.data
      trackModalVisible.value = true
    } else {
      Message.error(response.message || '获取物流信息失败')
    }
  } catch (error) {
    console.error('获取物流信息失败:', error)
    Message.error('获取物流信息失败')
  }
}

// 确认收货
const handleConfirm = async (delivery) => {
  try {
    const response = await confirmDeliveryApi(delivery.orderId)
    if (response.code === 200) {
      Message.success('确认收货成功')
      await loadDeliveries()
    } else {
      Message.error(response.message || '确认收货失败')
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    Message.error('确认收货失败')
  }
}

// 删除配送
const handleDelete = (delivery) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除配送ID为 ${delivery.id} 的配送信息吗？`,
    onOk: async () => {
      try {
        const response = await deleteDeliveryApi(delivery.id)
        if (response.code === 200) {
          Message.success('删除成功')
          await loadDeliveries()
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        Message.error('删除失败')
      }
    }
  })
}

// 显示统计模态框
const showStatsModal = async () => {
  try {
    const response = await getDeliveryStatsApi()
    if (response.code === 200) {
      deliveryStats.value = response.data
      statsModalVisible.value = true
    } else {
      Message.error(response.message || '获取配送统计失败')
    }
  } catch (error) {
    console.error('获取配送统计失败:', error)
    Message.error('获取配送统计失败')
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const response = await exportDeliveriesApi(searchForm)
    // 处理文件下载
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `配送数据_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    Message.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败')
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadDeliveries()
})
</script>

<style scoped>
.delivery-management {
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
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-bar > div {
  display: flex;
  gap: 12px;
}

.amount-text {
  font-weight: 600;
  color: #f53f3f;
}

.text-gray {
  color: #86909c;
}

.danger {
  color: #f53f3f;
}

.delivery-detail {
  padding: 16px 0;
}

.stats-content {
  padding: 20px 0;
}

.tracking-info {
  padding: 16px 0;
}

.tracking-item {
  margin-bottom: 8px;
}

.tracking-time {
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 4px;
}

.tracking-desc {
  color: #4e5969;
  margin-bottom: 2px;
}

.tracking-location {
  color: #86909c;
  font-size: 12px;
}

.no-tracking {
  padding: 40px 0;
  text-align: center;
}
</style>