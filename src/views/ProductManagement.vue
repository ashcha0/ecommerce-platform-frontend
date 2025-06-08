<template>
  <div class="product-management">
    <!-- 商品统计卡片 - 后端接口未完成，暂时注释 -->
    <!-- <a-row :gutter="16" class="mb-20">
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="商品总数"
            :value="stats.totalProducts"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <icon-gift />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="在售商品"
            :value="stats.activeProducts"
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
            title="库存不足"
            :value="stats.lowStockProducts"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <icon-exclamation-circle />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <a-statistic
            title="总库存值"
            :value="stats.totalStockValue"
            :precision="2"
            suffix="元"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <icon-dollar />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row> -->

    <!-- 搜索区域 -->
    <a-card class="search-card" title="商品搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="商品名称">
          <a-input v-model="searchForm.productName" placeholder="输入商品名称" allow-clear />
        </a-form-item>
        <a-form-item label="商品编码">
          <a-input v-model="searchForm.productCode" placeholder="输入商品编码" allow-clear />
        </a-form-item>
        <a-form-item label="商品分类">
          <a-select v-model="searchForm.category" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="电子产品">电子产品</a-option>
            <a-option value="服装鞋帽">服装鞋帽</a-option>
            <a-option value="家居用品">家居用品</a-option>
            <a-option value="食品饮料">食品饮料</a-option>
            <a-option value="图书文具">图书文具</a-option>
            <a-option value="运动户外">运动户外</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="商品状态">
          <a-select v-model="searchForm.status" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option :value="1">在售</a-option>
            <a-option :value="0">下架</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="价格范围">
          <a-input-group>
            <a-input v-model="searchForm.minPrice" placeholder="最低价" style="width: 100px" />
            <a-input style="width: 30px; text-align: center; pointer-events: none" placeholder="~" disabled />
            <a-input v-model="searchForm.maxPrice" placeholder="最高价" style="width: 100px" />
          </a-input-group>
        </a-form-item>
        <a-form-item label="库存状态">
          <a-select v-model="searchForm.stockStatus" placeholder="请选择" allow-clear>
            <a-option value="">全部</a-option>
            <a-option value="sufficient">库存充足</a-option>
            <a-option value="low">库存不足</a-option>
            <a-option value="out">缺货</a-option>
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
          新建商品
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
          @click="handleBatchToggleStatus"
        >
          <template #icon><icon-swap /></template>
          批量上下架
        </a-button>
      </div>
      <div>
        <a-button @click="handleExport">
          <template #icon><icon-download /></template>
          导出数据
        </a-button>
      </div>
    </div>

    <!-- 商品表格 -->
    <a-card>
      <a-table 
        :data="products" 
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="商品图片" :width="80">
            <template #cell="{ record }">
              <a-image
                :src="record.productImage || '/placeholder.jpg'"
                :width="60"
                :height="60"
                fit="cover"
                class="product-image"
              />
            </template>
          </a-table-column>
          <a-table-column title="商品信息" :width="250">
            <template #cell="{ record }">
              <div class="product-info">
                <div class="product-name">{{ record.productName }}</div>
                <div class="product-code">编码: {{ record.productCode }}</div>
                <div class="product-category">分类: {{ record.category }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="价格" data-index="price" :width="100">
            <template #cell="{ record }">
              <span class="price-text">¥{{ record.price.toFixed(2) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="库存" data-index="stock" :width="100">
            <template #cell="{ record }">
              <span :class="getStockClass(record.stock, record.minStock)">
                {{ record.stock }}
              </span>
              <div class="stock-warning" v-if="record.stock <= record.minStock">
                <icon-exclamation-circle-fill class="warning-icon" />
                库存不足
              </div>
            </template>
          </a-table-column>
          <a-table-column title="销量" data-index="salesCount" :width="80" />
          <a-table-column title="状态" data-index="status" :width="80">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'" class="status-tag">
                {{ record.status === 1 ? '在售' : '下架' }}
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
                <a-link @click="showEditModal(record)" size="small">
                  <icon-edit /> 编辑
                </a-link>
                <a-dropdown>
                  <a-link size="small">
                    <icon-more /> 更多
                  </a-link>
                  <template #content>
                    <a-doption @click="toggleProductStatus(record)">
                      {{ record.status === 1 ? '下架商品' : '上架商品' }}
                    </a-doption>
                    <a-doption @click="viewOrders(record)">
                      查看订单
                    </a-doption>
                    <a-doption @click="adjustStock(record)">
                      调整库存
                    </a-doption>
                    <a-doption @click="deleteProduct(record.id)" class="danger">
                      删除商品
                    </a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新建商品模态框 -->
    <a-modal 
      v-model:visible="createModalVisible" 
      title="新建商品"
      width="800px"
      @ok="handleCreate"
      @cancel="resetCreateForm"
    >
      <a-form :model="createForm" :rules="formRules" layout="vertical" ref="createFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品名称" field="productName" required>
              <a-input v-model="createForm.productName" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品编码" field="productCode" required>
              <a-input v-model="createForm.productCode" placeholder="请输入商品编码" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品分类" field="category" required>
              <a-select v-model="createForm.category" placeholder="请选择商品分类">
                <a-option value="电子产品">电子产品</a-option>
                <a-option value="服装鞋帽">服装鞋帽</a-option>
                <a-option value="家居用品">家居用品</a-option>
                <a-option value="食品饮料">食品饮料</a-option>
                <a-option value="图书文具">图书文具</a-option>
                <a-option value="运动户外">运动户外</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品品牌" field="brand">
              <a-input v-model="createForm.brand" placeholder="请输入商品品牌" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="商品价格" field="price" required>
              <a-input-number 
                v-model="createForm.price" 
                placeholder="请输入价格" 
                :precision="2"
                :min="0"
                style="width: 100%"
              >
                <template #suffix>元</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="库存数量" field="stock" required>
              <a-input-number 
                v-model="createForm.stock" 
                placeholder="请输入库存" 
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最低库存" field="minStock" required>
              <a-input-number 
                v-model="createForm.minStock" 
                placeholder="库存预警值" 
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="商品图片" field="productImage">
          <a-upload
            :custom-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="upload-area">
                <div v-if="createForm.productImage" class="image-preview">
                  <a-image :src="createForm.productImage" :width="100" :height="100" fit="cover" />
                  <div class="image-overlay">
                    <icon-camera class="upload-icon" />
                    <div>点击更换</div>
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <icon-camera class="upload-icon" />
                  <div>点击上传图片</div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        
        <a-form-item label="商品描述" field="description">
          <a-textarea 
            v-model="createForm.description" 
            placeholder="请输入商品描述" 
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
        
        <a-form-item label="商品规格" field="specifications">
          <a-textarea 
            v-model="createForm.specifications" 
            placeholder="请输入商品规格参数" 
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑商品模态框 -->
    <a-modal 
      v-model:visible="editModalVisible" 
      title="编辑商品"
      width="800px"
      @ok="handleUpdate"
      @cancel="resetEditForm"
    >
      <a-form :model="editForm" :rules="editFormRules" layout="vertical" ref="editFormRef">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品名称" field="productName" required>
              <a-input v-model="editForm.productName" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品编码" field="productCode" required>
              <a-input v-model="editForm.productCode" placeholder="请输入商品编码" disabled />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品分类" field="category" required>
              <a-select v-model="editForm.category" placeholder="请选择商品分类">
                <a-option value="电子产品">电子产品</a-option>
                <a-option value="服装鞋帽">服装鞋帽</a-option>
                <a-option value="家居用品">家居用品</a-option>
                <a-option value="食品饮料">食品饮料</a-option>
                <a-option value="图书文具">图书文具</a-option>
                <a-option value="运动户外">运动户外</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品品牌" field="brand">
              <a-input v-model="editForm.brand" placeholder="请输入商品品牌" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="商品价格" field="price" required>
              <a-input-number 
                v-model="editForm.price" 
                placeholder="请输入价格" 
                :precision="2"
                :min="0"
                style="width: 100%"
              >
                <template #suffix>元</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="库存数量" field="stock" required>
              <a-input-number 
                v-model="editForm.stock" 
                placeholder="请输入库存" 
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="最低库存" field="minStock" required>
              <a-input-number 
                v-model="editForm.minStock" 
                placeholder="库存预警值" 
                :min="0"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="商品图片" field="productImage">
          <a-upload
            :custom-request="handleEditImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <template #upload-button>
              <div class="upload-area">
                <div v-if="editForm.productImage" class="image-preview">
                  <a-image :src="editForm.productImage" :width="100" :height="100" fit="cover" />
                  <div class="image-overlay">
                    <icon-camera class="upload-icon" />
                    <div>点击更换</div>
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <icon-camera class="upload-icon" />
                  <div>点击上传图片</div>
                </div>
              </div>
            </template>
          </a-upload>
        </a-form-item>
        
        <a-form-item label="商品描述" field="description">
          <a-textarea 
            v-model="editForm.description" 
            placeholder="请输入商品描述" 
            :auto-size="{ minRows: 3, maxRows: 6 }"
          />
        </a-form-item>
        
        <a-form-item label="商品规格" field="specifications">
          <a-textarea 
            v-model="editForm.specifications" 
            placeholder="请输入商品规格参数" 
            :auto-size="{ minRows: 2, maxRows: 4 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 商品详情抽屉 -->
    <a-drawer 
      v-model:visible="detailVisible" 
      title="商品详情"
      placement="right"
      width="600px"
    >
      <div v-if="currentProduct" class="product-detail">
        <!-- 商品图片 -->
        <div class="detail-image">
          <a-image
            :src="currentProduct.productImage || '/placeholder.jpg'"
            :width="200"
            :height="200"
            fit="cover"
          />
        </div>
        
        <!-- 基本信息 -->
        <a-descriptions title="基本信息" :column="2" bordered>
          <a-descriptions-item label="商品名称">{{ currentProduct.productName }}</a-descriptions-item>
          <a-descriptions-item label="商品编码">{{ currentProduct.productCode }}</a-descriptions-item>
          <a-descriptions-item label="商品分类">{{ currentProduct.category }}</a-descriptions-item>
          <a-descriptions-item label="商品品牌">{{ currentProduct.brand || '-' }}</a-descriptions-item>
          <a-descriptions-item label="商品价格">
            <span class="price-text">¥{{ currentProduct.price.toFixed(2) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="商品状态">
            <a-tag :color="currentProduct.status === 1 ? 'green' : 'red'">
              {{ currentProduct.status === 1 ? '在售' : '下架' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
        
        <!-- 库存信息 -->
        <a-divider>库存信息</a-divider>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="当前库存">
            <span :class="getStockClass(currentProduct.stock, currentProduct.minStock)">
              {{ currentProduct.stock }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="最低库存">{{ currentProduct.minStock }}</a-descriptions-item>
          <a-descriptions-item label="销售数量">{{ currentProduct.salesCount }}</a-descriptions-item>
          <a-descriptions-item label="库存价值">
            ¥{{ (currentProduct.stock * currentProduct.price).toFixed(2) }}
          </a-descriptions-item>
        </a-descriptions>
        
        <!-- 时间信息 -->
        <a-divider>时间信息</a-divider>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="创建时间">{{ formatDateTime(currentProduct.createTime) }}</a-descriptions-item>
          <a-descriptions-item label="更新时间">{{ formatDateTime(currentProduct.updateTime) }}</a-descriptions-item>
        </a-descriptions>
        
        <!-- 商品描述 -->
        <a-divider>商品描述</a-divider>
        <p>{{ currentProduct.description || '暂无描述' }}</p>
        
        <!-- 商品规格 -->
        <a-divider>商品规格</a-divider>
        <pre class="specifications">{{ currentProduct.specifications || '暂无规格信息' }}</pre>
      </div>
    </a-drawer>
    
    <!-- 库存调整模态框 -->
    <a-modal 
      v-model:visible="stockModalVisible" 
      title="调整库存"
      width="400px"
      @ok="handleStockAdjust"
    >
      <a-form :model="stockForm" layout="vertical" ref="stockFormRef">
        <a-form-item label="商品信息">
          <div class="stock-product-info">
            <div class="product-name">{{ stockForm.productName }}</div>
            <div class="current-stock">当前库存: {{ stockForm.currentStock }}</div>
          </div>
        </a-form-item>
        <a-form-item label="调整类型" field="adjustType" required>
          <a-radio-group v-model="stockForm.adjustType">
            <a-radio value="increase">增加库存</a-radio>
            <a-radio value="decrease">减少库存</a-radio>
            <a-radio value="set">设置库存</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="数量" field="quantity" required>
          <a-input-number 
            v-model="stockForm.quantity" 
            :placeholder="getStockPlaceholder()"
            :min="stockForm.adjustType === 'decrease' ? 1 : 0"
            :max="stockForm.adjustType === 'decrease' ? stockForm.currentStock : undefined"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="调整原因" field="reason">
          <a-textarea 
            v-model="stockForm.reason" 
            placeholder="请输入调整原因" 
            :auto-size="{ minRows: 2 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getProductsApi,
  searchProductsApi,
  getProductDetailApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  toggleProductStatusApi,
  batchDeleteProductsApi,
  batchToggleProductStatusApi,
  getProductStatsApi,
  adjustProductStockApi,
  exportProductsApi
} from '@/api/product'
import { Message, Modal } from '@arco-design/web-vue'
import dayjs from 'dayjs'

// 数据状态
const loading = ref(false)
const products = ref([])
// 统计数据 - 后端接口未完成，暂时注释
// const stats = ref({
//   totalProducts: 0,
//   activeProducts: 0,
//   lowStockProducts: 0,
//   totalStockValue: 0
// })

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
  productName: '',
  productCode: '',
  category: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  stockStatus: ''
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
const stockModalVisible = ref(false)
const currentProduct = ref(null)
const currentEditProduct = ref(null)

// 表单引用
const createFormRef = ref()
const editFormRef = ref()
const stockFormRef = ref()

// 创建商品表单
const createForm = reactive({
  productName: '',
  productCode: '',
  category: '',
  brand: '',
  price: null,
  stock: null,
  minStock: null,
  productImage: '',
  description: '',
  specifications: ''
})

// 编辑商品表单
const editForm = reactive({
  productName: '',
  productCode: '',
  category: '',
  brand: '',
  price: null,
  stock: null,
  minStock: null,
  productImage: '',
  description: '',
  specifications: ''
})

// 库存调整表单
const stockForm = reactive({
  productId: null,
  productName: '',
  currentStock: 0,
  adjustType: 'increase',
  quantity: null,
  reason: ''
})

// 表单验证规则
const formRules = {
  productName: [{ required: true, message: '请输入商品名称' }],
  productCode: [{ required: true, message: '请输入商品编码' }],
  category: [{ required: true, message: '请选择商品分类' }],
  price: [{ required: true, message: '请输入商品价格' }],
  stock: [{ required: true, message: '请输入库存数量' }],
  minStock: [{ required: true, message: '请输入最低库存' }]
}

const editFormRules = {
  productName: [{ required: true, message: '请输入商品名称' }],
  category: [{ required: true, message: '请选择商品分类' }],
  price: [{ required: true, message: '请输入商品价格' }],
  stock: [{ required: true, message: '请输入库存数量' }],
  minStock: [{ required: true, message: '请输入最低库存' }]
}

// 初始化
onMounted(() => {
  fetchProducts()
  // fetchStats() // 后端接口未完成，暂时注释
})

// 获取商品统计 - 后端接口未完成，暂时注释
// const fetchStats = async () => {
//   try {
//     // 获取所有商品数据来计算统计信息
//     const { data } = await getProductsApi({
//       pageNum: 1,
//       pageSize: 1000 // 获取足够多的数据来计算统计
//     })
//     
//     const productList = data.list || []
//     
//     // 计算统计数据
//     stats.value = {
//       totalProducts: productList.length,
//       activeProducts: productList.filter(p => p.status === 1).length,
//       lowStockProducts: productList.filter(p => (p.stock || 0) < (p.minStock || 10)).length,
//       totalStockValue: productList.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
//     }
//   } catch (error) {
//     console.error('获取统计信息失败:', error)
//     // 设置默认值
//     stats.value = {
//       totalProducts: 0,
//       activeProducts: 0,
//       lowStockProducts: 0,
//       totalStockValue: 0
//     }
//   }
// }

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const { data } = await getProductsApi({
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    })
    
    products.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索商品
const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    
    const { data } = await searchProductsApi(params)
    
    products.value = data.list
    pagination.total = data.total
  } catch (error) {
    Message.error('搜索商品失败')
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
  fetchProducts()
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

// 创建商品
const handleCreate = async () => {
  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return
    
    await createProductApi(createForm)
    Message.success('创建成功')
    createModalVisible.value = false
    resetCreateForm()
    fetchProducts()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '创建失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  Object.keys(createForm).forEach(key => {
    if (typeof createForm[key] === 'number') {
      createForm[key] = null
    } else {
      createForm[key] = ''
    }
  })
  createFormRef.value?.resetFields()
}

// 显示编辑模态框
const showEditModal = (product) => {
  currentEditProduct.value = product
  Object.assign(editForm, {
    productName: product.productName,
    productCode: product.productCode,
    category: product.category,
    brand: product.brand,
    price: product.price,
    stock: product.stock,
    minStock: product.minStock,
    productImage: product.productImage,
    description: product.description,
    specifications: product.specifications
  })
  editModalVisible.value = true
}

// 更新商品
const handleUpdate = async () => {
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return
    
    await updateProductApi(currentEditProduct.value.id, editForm)
    Message.success('更新成功')
    editModalVisible.value = false
    resetEditForm()
    fetchProducts()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '更新失败')
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.keys(editForm).forEach(key => {
    if (typeof editForm[key] === 'number') {
      editForm[key] = null
    } else {
      editForm[key] = ''
    }
  })
  editFormRef.value?.resetFields()
}

// 删除商品
const deleteProduct = (id) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该商品吗？删除后无法恢复。',
    onOk: async () => {
      try {
        await deleteProductApi(id)
        Message.success('删除成功')
        fetchProducts()
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
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个商品吗？`,
    onOk: async () => {
      try {
        await batchDeleteProductsApi(selectedRowKeys.value)
        Message.success('批量删除成功')
        selectedRowKeys.value = []
        fetchProducts()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '批量删除失败')
      }
    }
  })
}

// 切换商品状态
const toggleProductStatus = async (product) => {
  try {
    await toggleProductStatusApi(product.id)
    Message.success(`${product.status === 1 ? '下架' : '上架'}成功`)
    fetchProducts()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '操作失败')
  }
}

// 批量切换状态
const handleBatchToggleStatus = () => {
  Modal.confirm({
    title: '确认批量操作',
    content: `确定要批量切换选中的 ${selectedRowKeys.value.length} 个商品的状态吗？`,
    onOk: async () => {
      try {
        await batchToggleProductStatusApi(selectedRowKeys.value)
        Message.success('批量操作成功')
        selectedRowKeys.value = []
        fetchProducts()
        fetchStats()
      } catch (error) {
        Message.error(error.message || '批量操作失败')
      }
    }
  })
}

// 查看详情
const showDetail = async (product) => {
  try {
    const { data } = await getProductDetailApi(product.id)
    currentProduct.value = data
    detailVisible.value = true
  } catch (error) {
    Message.error('获取详情失败')
  }
}

// 查看订单
const viewOrders = (product) => {
  // 这里可以跳转到订单管理页面并筛选该商品的订单
  Message.info(`查看商品 ${product.productName} 的相关订单`)
}

// 调整库存
const adjustStock = (product) => {
  Object.assign(stockForm, {
    productId: product.id,
    productName: product.productName,
    currentStock: product.stock,
    adjustType: 'increase',
    quantity: null,
    reason: ''
  })
  stockModalVisible.value = true
}

// 处理库存调整
const handleStockAdjust = async () => {
  try {
    if (!stockForm.quantity) {
      Message.error('请输入调整数量')
      return
    }
    
    await adjustProductStockApi(stockForm.productId, {
      adjustType: stockForm.adjustType,
      quantity: stockForm.quantity,
      reason: stockForm.reason
    })
    
    Message.success('库存调整成功')
    stockModalVisible.value = false
    fetchProducts()
    fetchStats()
  } catch (error) {
    Message.error(error.message || '库存调整失败')
  }
}

// 图片上传处理
const handleImageUpload = (option) => {
  // 这里应该实现真实的图片上传逻辑
  // 模拟上传成功
  setTimeout(() => {
    createForm.productImage = URL.createObjectURL(option.fileItem.file)
    Message.success('图片上传成功')
  }, 1000)
}

const handleEditImageUpload = (option) => {
  // 这里应该实现真实的图片上传逻辑
  // 模拟上传成功
  setTimeout(() => {
    editForm.productImage = URL.createObjectURL(option.fileItem.file)
    Message.success('图片上传成功')
  }, 1000)
}

// 导出数据
const handleExport = async () => {
  try {
    const params = { ...searchForm }
    const response = await exportProductsApi(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `商品数据_${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    Message.success('导出成功')
  } catch (error) {
    Message.error('导出失败')
  }
}

// 工具函数
const getStockClass = (stock, minStock) => {
  if (stock === 0) return 'stock-out'
  if (stock <= minStock) return 'stock-low'
  return 'stock-normal'
}

const getStockPlaceholder = () => {
  switch (stockForm.adjustType) {
    case 'increase': return '请输入增加数量'
    case 'decrease': return '请输入减少数量'
    case 'set': return '请输入设置数量'
    default: return '请输入数量'
  }
}

const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.product-management {
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

.product-image {
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.product-info {
  line-height: 1.5;
}

.product-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.product-code,
.product-category {
  font-size: 12px;
  color: #86909c;
  margin-bottom: 2px;
}

.price-text {
  font-weight: 500;
  color: #f53f3f;
  font-size: 14px;
}

.stock-normal {
  color: #52c41a;
  font-weight: 500;
}

.stock-low {
  color: #faad14;
  font-weight: 500;
}

.stock-out {
  color: #f53f3f;
  font-weight: 500;
}

.stock-warning {
  font-size: 10px;
  color: #faad14;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
}

.warning-icon {
  font-size: 10px;
}

.status-tag {
  font-weight: 500;
}

.upload-area {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.product-detail {
  padding: 16px 0;
}

.detail-image {
  text-align: center;
  margin-bottom: 24px;
}

.specifications {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.stock-product-info {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.current-stock {
  font-size: 12px;
  color: #86909c;
  margin-top: 4px;
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