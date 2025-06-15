<template>
  <div class="inventory-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>库存管理</h1>
    </div>

    <!-- 搜索区域 -->
    <a-card class="search-card" title="库存搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="商品ID">
          <a-input-number v-model="searchForm.productId" placeholder="输入商品ID" allow-clear />
        </a-form-item>
        <a-form-item label="最小库存">
          <a-input-number v-model="searchForm.minStock" placeholder="最小库存" allow-clear />
        </a-form-item>
        <a-form-item label="最大库存">
          <a-input-number v-model="searchForm.maxStock" placeholder="最大库存" allow-clear />
        </a-form-item>
        <a-form-item label="低库存预警">
          <a-select v-model="searchForm.isLowStock" placeholder="选择状态" allow-clear>
            <a-option :value="true">是</a-option>
            <a-option :value="false">否</a-option>
          </a-select>
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
          新建库存
        </a-button>
        <a-button 
          type="outline" 
          status="warning" 
          @click="showBatchUpdateModal"
          :disabled="selectedRowKeys.length === 0"
        >
          <template #icon><icon-edit /></template>
          批量更新
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
        <a-button @click="showStatsModal">
          <template #icon><icon-bar-chart /></template>
          库存统计
        </a-button>
        <a-button @click="showLowStockModal">
          <template #icon><icon-exclamation-circle /></template>
          低库存预警
        </a-button>
      </div>
    </div>

    <!-- 库存表格 -->
    <a-card>
      <a-table 
        :data="inventories" 
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedRowKeys"
        @selection-change="onSelectionChange"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="库存ID" data-index="id" :width="100" />
          <a-table-column title="商品ID" data-index="productId" :width="100">
            <template #cell="{ record }">
              <a-link @click="showDetail(record)">{{ record.productId }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="当前库存" data-index="stock" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStockColor(record)">{{ record.stock }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="低库存阈值" data-index="lowStockThreshold" :width="120" />
          <a-table-column title="库存状态" :width="120">
            <template #cell="{ record }">
              <a-tag v-if="record.stock <= record.lowStockThreshold" color="red">
                <icon-exclamation-circle /> 低库存
              </a-tag>
              <a-tag v-else color="green">
                <icon-check-circle /> 正常
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="更新时间" data-index="updateTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.updateTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="showDetail(record)" size="small">
                  <icon-eye /> 查看
                </a-link>
                <a-link @click="showStockUpdateModal(record)" size="small">
                  <icon-edit /> 调整库存
                </a-link>
                <a-link @click="showThresholdUpdateModal(record)" size="small">
                  <icon-settings /> 设置阈值
                </a-link>
                <a-link @click="deleteInventory(record.productId)" size="small" status="danger">
                  <icon-delete /> 删除
                </a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建库存模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="新建库存记录"
      width="500px"
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="createFormRules" layout="vertical" ref="createFormRef">
        <a-form-item label="商品ID" field="productId" required>
          <a-input-number v-model="createForm.productId" placeholder="请输入商品ID" :min="1" />
        </a-form-item>
        <a-form-item label="初始库存" field="initialStock" required>
          <a-input-number v-model="createForm.initialStock" placeholder="请输入初始库存" :min="0" />
        </a-form-item>
        <a-form-item label="低库存阈值" field="lowStockThreshold">
          <a-input-number v-model="createForm.lowStockThreshold" placeholder="请输入低库存阈值" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 库存调整模态框 -->
    <a-modal 
      v-model:visible="stockUpdateModalVisible" 
      title="调整库存"
      width="500px"
      @ok="handleStockUpdate"
      @cancel="resetStockUpdateForm"
    >
      <a-form :model="stockUpdateForm" :rules="stockUpdateFormRules" layout="vertical" ref="stockUpdateFormRef">
        <a-form-item label="商品ID">
          <a-input v-model="stockUpdateForm.productId" disabled />
        </a-form-item>
        <a-form-item label="当前库存">
          <a-input-number v-model="stockUpdateForm.currentStock" disabled />
        </a-form-item>
        <a-form-item label="库存变化量" field="stockChange" required>
          <a-input-number 
            v-model="stockUpdateForm.stockChange" 
            placeholder="正数为增加，负数为减少" 
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 阈值设置模态框 -->
    <a-modal 
      v-model:visible="thresholdUpdateModalVisible" 
      title="设置低库存阈值"
      width="500px"
      @ok="handleThresholdUpdate"
      @cancel="resetThresholdUpdateForm"
    >
      <a-form :model="thresholdUpdateForm" :rules="thresholdUpdateFormRules" layout="vertical" ref="thresholdUpdateFormRef">
        <a-form-item label="商品ID">
          <a-input v-model="thresholdUpdateForm.productId" disabled />
        </a-form-item>
        <a-form-item label="当前阈值">
          <a-input-number v-model="thresholdUpdateForm.currentThreshold" disabled />
        </a-form-item>
        <a-form-item label="新阈值" field="threshold" required>
          <a-input-number 
            v-model="thresholdUpdateForm.threshold" 
            placeholder="请输入新的低库存阈值" 
            :min="0"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 批量更新模态框 -->
    <a-modal 
      v-model:visible="batchUpdateModalVisible" 
      title="批量更新库存"
      width="600px"
      @ok="handleBatchUpdate"
      @cancel="resetBatchUpdateForm"
    >
      <a-form :model="batchUpdateForm" layout="vertical" ref="batchUpdateFormRef">
        <a-form-item label="选中的商品数量">
          <a-input v-model="batchUpdateForm.selectedCount" disabled />
        </a-form-item>
        <a-form-item label="选中的商品ID">
          <a-input v-model="batchUpdateForm.selectedProductIds" disabled />
        </a-form-item>
        <a-form-item label="库存变化量" required>
          <a-input-number 
            v-model="batchUpdateForm.stockChange" 
            placeholder="正数为增加，负数为减少" 
            style="width: 100%" 
          />
        </a-form-item>
        <a-divider />
        <div style="color: #666; font-size: 12px;">
          调试信息: {{ batchUpdateForm }}
        </div>
      </a-form>
    </a-modal>

    <!-- 库存详情抽屉 -->
    <a-drawer
      v-model:visible="detailVisible"
      title="库存详情"
      width="500px"
      :footer="false"
    >
      <div v-if="currentInventory" class="inventory-detail">
        <a-descriptions title="库存信息" :column="1" bordered>
          <a-descriptions-item label="库存ID">
            {{ currentInventory?.id || '' }}
          </a-descriptions-item>
          <a-descriptions-item label="商品ID">
            {{ currentInventory?.productId || '' }}
          </a-descriptions-item>
          <a-descriptions-item label="当前库存">
            <a-tag :color="getStockColor(currentInventory)">{{ currentInventory?.stock || 0 }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="低库存阈值">
            {{ currentInventory?.lowStockThreshold || 0 }}
          </a-descriptions-item>
          <a-descriptions-item label="库存状态">
            <a-tag v-if="currentInventory && currentInventory.stock <= currentInventory.lowStockThreshold" color="red">
              <icon-exclamation-circle /> 低库存预警
            </a-tag>
            <a-tag v-else color="green">
              <icon-check-circle /> 库存正常
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="更新时间">
            {{ currentInventory?.updateTime ? formatDateTime(currentInventory.updateTime) : '' }}
          </a-descriptions-item>
        </a-descriptions>

        <div style="margin-top: 20px; text-align: center">
          <a-space>
            <a-button type="primary" @click="showStockUpdateModal(currentInventory)">
              调整库存
            </a-button>
            <a-button @click="showThresholdUpdateModal(currentInventory)">
              设置阈值
            </a-button>
            <a-button 
              type="outline" 
              status="danger" 
              @click="deleteInventory(currentInventory.productId)"
            >
              删除记录
            </a-button>
          </a-space>
        </div>
      </div>
    </a-drawer>

    <!-- 库存统计模态框 -->
    <a-modal 
      v-model:visible="statsModalVisible" 
      title="库存统计"
      width="600px"
      :footer="false"
    >
      <div v-if="statsData" class="stats-content">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-statistic title="总商品数" :value="statsData.totalProducts" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="总库存量" :value="statsData.totalStock" />
          </a-col>
        </a-row>
        <a-row :gutter="16" style="margin-top: 20px">
          <a-col :span="12">
            <a-statistic title="低库存商品数" :value="statsData.lowStockCount" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="平均库存" :value="statsData.avgStock" :precision="2" />
          </a-col>
        </a-row>
      </div>
    </a-modal>

    <!-- 低库存预警模态框 -->
    <a-modal 
      v-model:visible="lowStockModalVisible" 
      title="低库存预警"
      width="800px"
      :footer="false"
    >
      <a-table 
        :data="lowStockList" 
        :loading="lowStockLoading"
        :pagination="lowStockPagination"
        @page-change="handleLowStockPageChange"
        @page-size-change="handleLowStockPageSizeChange"
      >
        <template #columns>
          <a-table-column title="商品ID" data-index="productId" :width="100" />
          <a-table-column title="当前库存" data-index="stock" :width="120">
            <template #cell="{ record }">
              <a-tag color="red">{{ record.stock }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="低库存阈值" data-index="lowStockThreshold" :width="120" />
          <a-table-column title="更新时间" data-index="updateTime" :width="160">
            <template #cell="{ record }">
              {{ formatDateTime(record.updateTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="showStockUpdateModal(record)" size="small">
                  <icon-edit /> 补货
                </a-link>
                <a-link @click="showThresholdUpdateModal(record)" size="small">
                  <icon-settings /> 调整阈值
                </a-link>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  createInventoryApi,
  getInventoryByProductIdApi,
  updateInventoryStockApi,
  updateInventoryThresholdApi,
  batchUpdateInventoryApi,
  deleteInventoryApi,
  queryInventoryApi,
  getInventoryStatsApi,
  getLowStockInventoryApi,
  checkInventoryExistsApi
} from '@/api/inventory'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const inventories = ref([])

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
  productId: null,
  minStock: null,
  maxStock: null,
  isLowStock: null
})

// 表格选择
const selectedRowKeys = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})

// 模态框控制
const createModalVisible = ref(false)
const stockUpdateModalVisible = ref(false)
const thresholdUpdateModalVisible = ref(false)
const batchUpdateModalVisible = ref(false)
const detailVisible = ref(false)
const statsModalVisible = ref(false)
const lowStockModalVisible = ref(false)

// 当前操作的库存记录
const currentInventory = ref(null)

// 表单引用
const createFormRef = ref()
const stockUpdateFormRef = ref()
const thresholdUpdateFormRef = ref()
const batchUpdateFormRef = ref()

// 创建库存表单
const createForm = reactive({
  productId: null,
  initialStock: null,
  lowStockThreshold: 10
})

// 库存调整表单
const stockUpdateForm = reactive({
  productId: null,
  currentStock: null,
  stockChange: null
})

// 阈值设置表单
const thresholdUpdateForm = reactive({
  productId: null,
  currentThreshold: null,
  threshold: null
})

// 批量更新表单
const batchUpdateForm = reactive({
  selectedProductIds: [],
  selectedCount: 0,
  stockChange: null
})

// 统计数据
const statsData = ref(null)

// 低库存数据
const lowStockList = ref([])
const lowStockLoading = ref(false)
const lowStockPagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showTotal: true,
  showPageSize: true,
})

// 表单验证规则
const createFormRules = {
  productId: [
    { required: true, message: '请输入商品ID' },
    { type: 'number', min: 1, message: '商品ID必须大于0' }
  ],
  initialStock: [
    { required: true, message: '请输入初始库存' },
    { type: 'number', min: 0, message: '初始库存不能小于0' }
  ],
  lowStockThreshold: [
    { type: 'number', min: 0, message: '低库存阈值不能小于0' }
  ]
}

const stockUpdateFormRules = {
  stockChange: [
    { required: true, message: '请输入库存变化量' },
    { type: 'number', message: '库存变化量必须是数字' }
  ]
}

const thresholdUpdateFormRules = {
  threshold: [
    { required: true, message: '请输入新阈值' },
    { type: 'number', min: 0, message: '阈值不能小于0' }
  ]
}

// 初始化
onMounted(() => {
  fetchInventories()
})

// 获取库存列表
const fetchInventories = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: 'updateTime',
      sortOrder: 'DESC'
    }
    
    const { data } = await queryInventoryApi(params)
    
    // 修复：PageInfo对象使用list字段而不是records字段
    inventories.value = data.list || []
    pagination.total = data.total || 0
  } catch (error) {
    Message.error('获取库存列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索库存
const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: 'updateTime',
      sortOrder: 'DESC',
      ...searchForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })
    
    const { data } = await queryInventoryApi(params)
    
    // 修复：PageInfo对象使用list字段而不是records字段
    inventories.value = data.list || []
    pagination.total = data.total || 0
  } catch (error) {
    Message.error('搜索库存失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = null
  })
  pagination.current = 1
  fetchInventories()
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

// 创建库存
const handleCreate = async () => {
  try {
    const valid = await createFormRef.value.validate()
    
    if (valid === false) {
      return
    }
    
    await createInventoryApi(createForm)
    
    Message.success('创建成功')
    createModalVisible.value = false
    resetCreateForm()
    await fetchInventories()
  } catch (error) {
    Message.error(error.message || '创建失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    if (key === 'lowStockThreshold') {
      createForm[key] = 10
    } else {
      createForm[key] = null
    }
  })
  createFormRef.value?.resetFields()
}

// 显示库存调整模态框
const showStockUpdateModal = async (inventory) => {
  currentInventory.value = inventory
  
  // 设置表单初始值
  stockUpdateForm.productId = inventory.productId
  stockUpdateForm.currentStock = inventory.stock
  stockUpdateForm.stockChange = null
  
  await nextTick() // 确保响应式更新
  
  stockUpdateModalVisible.value = true
  detailVisible.value = false
}

// 调整库存
const handleStockUpdate = async () => {
  try {
    const valid = await stockUpdateFormRef.value.validate()
    
    if (valid === false) {
      return
    }
    
    await updateInventoryStockApi(currentInventory.value.productId, stockUpdateForm.stockChange)
    
    Message.success('库存调整成功')
    stockUpdateModalVisible.value = false
    resetStockUpdateForm()
    await fetchInventories()
  } catch (error) {
    Message.error(error.message || '库存调整失败')
  }
}

// 重置库存调整表单
const resetStockUpdateForm = () => {
  stockUpdateForm.productId = null
  stockUpdateForm.currentStock = null
  stockUpdateForm.stockChange = null
  stockUpdateFormRef.value?.resetFields()
}

// 显示阈值设置模态框
const showThresholdUpdateModal = async (inventory) => {
  currentInventory.value = inventory

  // 设置表单初始值
  thresholdUpdateForm.productId = inventory.productId
  thresholdUpdateForm.currentThreshold = inventory.lowStockThreshold
  thresholdUpdateForm.threshold = inventory.lowStockThreshold
  
  await nextTick() // 确保响应式更新
  
  thresholdUpdateModalVisible.value = true
  detailVisible.value = false
}

// 更新阈值
const handleThresholdUpdate = async () => {
  try {
    const valid = await thresholdUpdateFormRef.value.validate()
    
    if (valid === false) {
      return
    }
    
    await updateInventoryThresholdApi(currentInventory.value.productId, thresholdUpdateForm.threshold)
    
    Message.success('阈值设置成功')
    thresholdUpdateModalVisible.value = false
    resetThresholdUpdateForm()
    await fetchInventories()
  } catch (error) {
    Message.error(error.message || '阈值设置失败')
  }
}

// 重置阈值设置表单
const resetThresholdUpdateForm = () => {
  thresholdUpdateForm.productId = null
  thresholdUpdateForm.currentThreshold = null
  thresholdUpdateForm.threshold = null
  thresholdUpdateFormRef.value?.resetFields()
}

// 显示批量更新模态框
const showBatchUpdateModal = () => {
  // 获取选中的商品ID
  const selectedInventories = inventories.value.filter(item => selectedRowKeys.value.includes(item.id))
  
  // 设置表单初始值
  batchUpdateForm.selectedProductIds = selectedInventories.map(item => item.productId)
  batchUpdateForm.selectedCount = selectedRowKeys.value.length
  batchUpdateForm.stockChange = null
  
  console.log('📦 批量更新 - 选中的库存记录:', selectedInventories)
  console.log('📝 批量更新 - 表单初始值:', batchUpdateForm)
  
  batchUpdateModalVisible.value = true
}

// 批量更新
const handleBatchUpdate = async () => {
  try {
    if (!batchUpdateForm.stockChange) {
      Message.error('请输入库存变化量')
      return
    }
    
    // 使用商品ID而不是库存记录ID
    const stockChanges = new Array(batchUpdateForm.selectedProductIds.length).fill(batchUpdateForm.stockChange)
    
    console.log('📦 批量更新 - 使用商品IDs:', batchUpdateForm.selectedProductIds)
    console.log('📦 批量更新 - 库存变化量:', stockChanges)
    
    await batchUpdateInventoryApi(batchUpdateForm.selectedProductIds, stockChanges)
    
    Message.success('批量更新成功')
    batchUpdateModalVisible.value = false
    resetBatchUpdateForm()
    selectedRowKeys.value = []
    await fetchInventories()
  } catch (error) {
    Message.error(error.message || '批量更新失败')
  }
}

// 重置批量更新表单
const resetBatchUpdateForm = () => {
  batchUpdateForm.selectedProductIds = []
  batchUpdateForm.selectedCount = 0
  batchUpdateForm.stockChange = null
  batchUpdateFormRef.value?.resetFields()
}

// 删除库存
const deleteInventory = (productId) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该库存记录吗？删除后无法恢复。',
    onOk: async () => {
      try {
        await deleteInventoryApi(productId)
        Message.success('删除成功')
        await fetchInventories()
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
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个库存记录吗？`,
    onOk: async () => {
      try {
        // 批量删除需要逐个调用删除接口
        for (const productId of selectedRowKeys.value) {
          await deleteInventoryApi(productId)
        }
        
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        await fetchInventories()
      } catch (error) {
        Message.error(error.message || '批量删除失败')
      }
    }
  })
}

// 查看详情
const showDetail = async (inventory) => {
  try {
    const { data } = await getInventoryByProductIdApi(inventory.productId)
    currentInventory.value = data
    detailVisible.value = true
  } catch (error) {
    Message.error('获取详情失败')
  }
}

// 显示统计模态框
const showStatsModal = async () => {
  try {
    const { data } = await getInventoryStatsApi()
    statsData.value = data
    statsModalVisible.value = true
  } catch (error) {
    Message.error('获取统计数据失败')
  }
}

// 显示低库存预警模态框
const showLowStockModal = async () => {
  lowStockModalVisible.value = true
  await fetchLowStockList()
}

// 获取低库存列表
const fetchLowStockList = async () => {
  lowStockLoading.value = true
  try {
    const { data } = await getLowStockInventoryApi({
      page: lowStockPagination.current,
      size: lowStockPagination.pageSize
    })
    
    lowStockList.value = data.records || []
    lowStockPagination.total = data.total || 0
  } catch (error) {
    Message.error('获取低库存列表失败')
  } finally {
    lowStockLoading.value = false
  }
}

// 低库存分页处理
const handleLowStockPageChange = (pageNum) => {
  lowStockPagination.current = pageNum
  fetchLowStockList()
}

const handleLowStockPageSizeChange = (pageSize) => {
  lowStockPagination.pageSize = pageSize
  lowStockPagination.current = 1
  fetchLowStockList()
}

// 表格选择变化处理
const onSelectionChange = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys
  console.log('🔄 选择变化:', selectedKeys)
}

// 工具函数
const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}

const getStockColor = (record) => {
  if (!record || record.stock === undefined || record.lowStockThreshold === undefined) {
    return 'gray'
  }
  if (record.stock <= record.lowStockThreshold) {
    return 'red'
  } else if (record.stock <= record.lowStockThreshold * 2) {
    return 'orange'
  } else {
    return 'green'
  }
}
</script>

<style scoped>
.inventory-management {
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

.inventory-detail {
  padding: 16px;
}

.stats-content {
  padding: 16px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.search-form .arco-form-item {
  margin-bottom: 0;
}
</style>