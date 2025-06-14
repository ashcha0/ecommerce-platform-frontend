<template>
  <div class="customer-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>客户管理</h1>
    </div>



    <!-- 搜索区域 -->
    <a-card class="search-card" title="客户搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="用户名">
          <a-input v-model="searchForm.username" placeholder="输入用户名" allow-clear />
        </a-form-item>
        <a-form-item label="客户电话">
          <a-input v-model="searchForm.phone" placeholder="输入客户电话" allow-clear />
        </a-form-item>
        <a-form-item label="客户邮箱">
          <a-input v-model="searchForm.email" placeholder="输入客户邮箱" allow-clear />
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
          <a-table-column title="用户名" data-index="username" :width="120">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.username }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="真实姓名" data-index="realName" :width="120">
            <template #cell="{ record }">
              {{ record.realName || '-' }}
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
          <a-table-column title="注册时间" data-index="createTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.updateTime) }}
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
            <a-form-item label="用户名" field="username" required>
              <a-input v-model="createForm.username" placeholder="请输入用户名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="密码" field="password" required>
              <a-input-password v-model="createForm.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="确认密码" field="confirmPassword" required>
          <a-input-password v-model="createForm.confirmPassword" placeholder="请再次输入密码" />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="真实姓名" field="realName">
              <a-input v-model="createForm.realName" placeholder="请输入真实姓名" />
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
      <a-form :model="editForm" :rules="editFormRules" layout="vertical" ref="editFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="真实姓名" field="realName">
              <a-input v-model="editForm.realName" placeholder="请输入真实姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" field="phone">
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
      </a-form>
    </a-modal>
    
    <!-- 客户详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      title="客户详情"
      width="500px"
      :footer="false"
    >
      <div v-if="currentCustomer" class="customer-detail">
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="1" bordered>
          <a-descriptions-item label="用户名">
            {{ currentCustomer.username }}
          </a-descriptions-item>
          <a-descriptions-item label="真实姓名">
            {{ currentCustomer.realName || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="联系电话">
            {{ currentCustomer.phone }}
          </a-descriptions-item>
          <a-descriptions-item label="邮箱">
            {{ currentCustomer.email || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="地址">
            {{ currentCustomer.address || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="注册时间">
            {{ formatDateTime(currentCustomer.createTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ formatDateTime(currentCustomer.updateTime) }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 操作按钮 -->
        <div style="margin-top: 20px; text-align: center">
          <a-space>
            <a-button type="primary" @click="showEditModal(currentCustomer)">
              编辑客户
            </a-button>
            <a-button 
              type="outline" 
              status="danger" 
              @click="deleteCustomer(currentCustomer.id)"
            >
              删除客户
            </a-button>
          </a-space>
        </div>
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
  exportCustomersApi
} from '@/api/customer'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const customers = ref([])

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
  username: '',
  phone: '',
  email: ''
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
const currentCustomer = ref(null)
const currentEditCustomer = ref(null)

// 表单引用
const createFormRef = ref()
const editFormRef = ref()

// 创建客户表单
const createForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  address: ''
})

// 编辑客户表单
const editForm = reactive({
  realName: '',
  phone: '',
  email: '',
  address: ''
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 50, message: '用户名长度为3-50字符' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字、下划线' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '密码长度为6-20字符' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码' },
    { 
      validator: (rule, value) => {
        if (value !== createForm.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      }
    }
  ],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址' }
  ]
}

// 编辑表单验证规则
const editFormRules = {
  realName: [
    { required: true, message: '请输入真实姓名' },
    { min: 2, max: 20, message: '真实姓名长度为2-20字符' }
  ],
  phone: [
    { required: true, message: '请输入联系电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址' },
    { type: 'email', message: '请输入正确的邮箱地址' }
  ],
  address: [
    { required: true, message: '请输入客户地址' },
    { min: 5, max: 200, message: '客户地址长度为5-200字符' }
  ]
}

// 初始化
onMounted(() => {
  fetchCustomers()
})



// 获取客户列表
const fetchCustomers = async () => {
  loading.value = true
  try {
    const { data } = await getCustomersApi({
    page: pagination.current,
    size: pagination.pageSize
  })
    
    customers.value = data.list || []
    pagination.total = data.total || 0
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
      page: pagination.current,
      size: pagination.pageSize
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const { data } = await searchCustomersApi(params)
    
    customers.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    Message.error('搜索客户失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
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
    
    // 调用注册接口
    await createCustomerApi(createForm)
    Message.success('创建成功')
    createModalVisible.value = false
     resetCreateForm()
     await fetchCustomers()
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
    realName: customer.realName || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || ''
  })
  editModalVisible.value = true
  detailVisible.value = false
}

// 更新客户
const handleUpdate = async () => {
  try {
    // 检查表单引用是否存在
    if (!editFormRef.value) {
      Message.error('表单引用错误，请刷新页面重试')
      return
    }
    
    // 检查validate方法是否存在
    if (typeof editFormRef.value.validate !== 'function') {
      Message.error('表单验证方法不存在，请刷新页面重试')
      return
    }

    try {
      const valid = await editFormRef.value.validate()
    } catch (error) {
      return
    }
    
    // 构建更新数据，包含客户ID
    const updateData = {
      id: currentEditCustomer.value.id,
      realName: editForm.realName,
      phone: editForm.phone,
      email: editForm.email,
      address: editForm.address
    }
    
    const response = await updateCustomerApi(currentEditCustomer.value.id, updateData)

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