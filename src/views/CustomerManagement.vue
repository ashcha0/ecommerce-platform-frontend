<template>
  <div class="customer-management">
    <!-- 统计卡片区域 -->
    <a-row :gutter="16" class="mb-20">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总客户数"
            :value="stats.totalCustomers"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="新增客户"
            :value="stats.newCustomers"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <icon-user-add />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="活跃客户"
            :value="stats.activeCustomers"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <icon-heart />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="客户消费总额"
            :value="stats.totalAmount"
            :precision="2"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              ¥
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="客户搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="客户姓名">
          <a-input v-model="searchForm.name" placeholder="输入客户姓名" allow-clear />
        </a-form-item>
        <a-form-item label="客户电话">
          <a-input v-model="searchForm.phone" placeholder="输入客户电话" allow-clear />
        </a-form-item>
        <a-form-item label="客户邮箱">
          <a-input v-model="searchForm.email" placeholder="输入客户邮箱" allow-clear />
        </a-form-item>
        <a-form-item label="注册时间">
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
          新建客户
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

    <!-- 客户表格 -->
    <a-card>
      <a-table 
        :data="customers" 
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="客户姓名" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.name }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="联系电话" data-index="phone" :width="140" />
          <a-table-column title="邮箱地址" data-index="email" :width="200">
            <template #cell="{ record }">
              {{ record.email || '-' }}
            </template>
          </a-table-column>
          <a-table-column title="地址" data-index="address" :width="250">
            <template #cell="{ record }">
              <a-tooltip :content="record.address" :disabled="!record.address">
                <span class="address-text">{{ record.address || '-' }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="订单数量" data-index="orderCount" :width="100">
            <template #cell="{ record }">
              <a-link @click="showCustomerOrders(record)">
                {{ record.orderCount || 0 }}
              </a-link>
            </template>
          </a-table-column>
          <a-table-column title="消费总额" data-index="totalAmount" :width="120">
            <template #cell="{ record }">
              <span class="amount">¥{{ (record.totalAmount || 0).toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="注册时间" data-index="createTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="showDetail(record)" size="small">
                  <icon-eye /> 查看
                </a-link>
                <a-link @click="showEditModal(record)" size="small">
                  <icon-edit /> 编辑
                </a-link>
                <a-link @click="deleteCustomer(record.id)" size="small" status="danger">
                  <icon-delete /> 删除
                </a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建客户模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="新建客户"
      width="600px"
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="formRules" layout="vertical" ref="createFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户姓名" field="name" required>
              <a-input v-model="createForm.name" placeholder="请输入客户姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" field="phone" required>
              <a-input v-model="createForm.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="邮箱地址" field="email">
          <a-input v-model="createForm.email" placeholder="请输入邮箱地址" />
        </a-form-item>
        <a-form-item label="客户地址" field="address">
          <a-textarea 
            v-model="createForm.address" 
            placeholder="请输入客户地址" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="createForm.remark" 
            placeholder="客户备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑客户模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      title="编辑客户"
      width="600px"
      @ok="handleUpdate"
      @cancel="resetEditForm"
    >
      <a-form :model="editForm" :rules="formRules" layout="vertical" ref="editFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="客户姓名" field="name" required>
              <a-input v-model="editForm.name" placeholder="请输入客户姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" field="phone" required>
              <a-input v-model="editForm.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="邮箱地址" field="email">
          <a-input v-model="editForm.email" placeholder="请输入邮箱地址" />
        </a-form-item>
        <a-form-item label="客户地址" field="address">
          <a-textarea 
            v-model="editForm.address" 
            placeholder="请输入客户地址" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea 
            v-model="editForm.remark" 
            placeholder="客户备注信息" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 客户详情抽屉 -->
    <a-drawer 
      v-model:visible="detailVisible" 
      title="客户详情"
      placement="right"
      width="600px"
    >
      <div v-if="currentCustomer" class="customer-detail">
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="客户姓名">{{ currentCustomer.name }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ currentCustomer.phone }}</a-descriptions-item>
          <a-descriptions-item label="邮箱地址">{{ currentCustomer.email || '-' }}</a-descriptions-item>
          <a-descriptions-item label="注册时间">{{ formatDateTime(currentCustomer.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="客户地址" :span="2">{{ currentCustomer.address || '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 消费统计 -->
        <a-divider>消费统计</a-divider>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="订单数量">{{ currentCustomer.orderCount || 0 }}</a-descriptions-item>
          <a-descriptions-item label="消费总额">
            <span class="amount">¥{{ (currentCustomer.totalAmount || 0).toFixed(2) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="平均订单金额">
            <span class="amount">¥{{ currentCustomer.avgOrderAmount ? currentCustomer.avgOrderAmount.toFixed(2) : '0.00' }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="最后消费时间">{{ currentCustomer.lastOrderTime ? formatDateTime(currentCustomer.lastOrderTime) : '-' }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 备注信息 -->
        <a-divider>备注信息</a-divider>
        <p>{{ currentCustomer.remark || '无备注' }}</p>
        
        <!-- 操作按钮 -->
        <a-divider>操作</a-divider>
        <a-space>
          <a-button type="primary" @click="showCustomerOrders(currentCustomer)">
            <icon-file-text /> 查看订单
          </a-button>
          <a-button @click="showEditModal(currentCustomer)">
            <icon-edit /> 编辑客户
          </a-button>
        </a-space>
      </div>
    </a-drawer>
    
    <!-- 客户订单抽屉 -->
    <a-drawer 
      v-model:visible="ordersVisible" 
      title="客户订单"
      placement="right"
      width="800px"
    >
      <div v-if="customerOrders.length > 0">
        <a-table :data="customerOrders" :pagination="false">
          <template #columns>
            <a-table-column title="订单号" data-index="orderNo" :width="160" />
            <a-table-column title="订单金额" data-index="totalAmount" :width="120">
              <template #cell="{ record }">
                <span class="amount">¥{{ record.totalAmount.toFixed(2) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="订单状态" data-index="status" :width="100">
              <template #cell="{ record }">
                <a-tag :color="getOrderStatusColor(record.status)">
                  {{ getOrderStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column title="创建时间" data-index="createTime" :width="160">
              <template #cell="{ record }">
                {{ formatDateTime(record.createTime) }}
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      <div v-else class="empty-state">
        <a-empty description="该客户暂无订单" />
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getCustomersApi,
  searchCustomersApi,
  getCustomerDetailApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  batchDeleteCustomersApi,
  getCustomerStatsApi,
  getCustomerOrdersApi,
  exportCustomersApi
} from '@/api/customer'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const customers = ref([])
const customerOrders = ref([])
const stats = ref({
  totalCustomers: 0,
  newCustomers: 0,
  activeCustomers: 0,
  totalAmount: 0
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
  name: '',
  phone: '',
  email: '',
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
const ordersVisible = ref(false)
const currentCustomer = ref(null)
const currentEditCustomer = ref(null)

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 创建客户表单
const createForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  remark: ''
})

// 编辑客户表单
const editForm = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入客户姓名' }],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址' }
  ]
}

// 初始化
onMounted(() => {
  fetchCustomers()
  fetchStats()
})

// 获取客户统计
const fetchStats = async () => {
  try {
    const { data } = await getCustomerStatsApi()
    stats.value = data
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取客户列表
const fetchCustomers = async () => {
  loading.value = true
  try {
    const { data } = await getCustomersApi({
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    
    customers.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('获取客户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索客户
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
    
    const { data } = await searchCustomersApi(params)
    
    customers.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('搜索客户失败')
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
  fetchCustomers()
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

// 创建客户
const handleCreate = async () => {
  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return
    
    await createCustomerApi(createForm)
    Message.success('创建成功')
    createModalVisible.value = false
    resetCreateForm()
    fetchCustomers()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '创建失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    createForm[key] = ''
  })
  createFormRef.value?.resetFields()
}

// 显示编辑模态框
const showEditModal = (customer) => {
  currentEditCustomer.value = customer
  Object.assign(editForm, {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    remark: customer.remark
  })
  editModalVisible.value = true
  detailVisible.value = false
}

// 更新客户
const handleUpdate = async () => {
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    await updateCustomerApi(currentEditCustomer.value.id, editForm)
    Message.success('更新成功')
    editModalVisible.value = false
    resetEditForm()
    fetchCustomers()
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

// 删除客户
const deleteCustomer = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该客户吗？删除后无法恢复。',
    onOk: async () => {
      try {
        await deleteCustomerApi(id)
        Message.success('删除成功')
        fetchCustomers()
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
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个客户吗？`,
    onOk: async () => {
      try {
        await batchDeleteCustomersApi(selectedRowKeys.value)
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchCustomers()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '批量删除失败')
      }
    }
  })
}

// 查看详情
const showDetail = async (customer) => {
  try {
    const { data } = await getCustomerDetailApi(customer.id)
    currentCustomer.value = data
    detailVisible.value = true
  } catch (error) {
    Message.error('获取详情失败')
  }
}

// 查看客户订单
const showCustomerOrders = async (customer) => {
  try {
    const { data } = await getCustomerOrdersApi(customer.id)
    customerOrders.value = data.list || []
    ordersVisible.value = true
    detailVisible.value = false
  } catch (error) {
    Message.error('获取客户订单失败')
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
    
    const response = await exportCustomersApi(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `客户数据_${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    Message.success('导出成功')
  } catch (error) {
    Message.error('导出失败')
  }
}

// 工具函数
const getOrderStatusColor = (status) => {
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

const getOrderStatusText = (status) => {
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
.customer-management {
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

.address-text {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount {
  font-weight: 600;
  color: #f53f3f;
}

.customer-detail {
  padding: 16px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.stat-card {
  text-align: center;
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