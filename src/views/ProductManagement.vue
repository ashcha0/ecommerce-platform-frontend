<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>商品管理</h1>
    </div>

    <!-- 搜索和操作区域 -->
    <a-card class="search-card" title="订单搜索">
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="商品名称">
          <a-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="店铺ID">
          <a-input
            v-model="searchForm.storeId"
            placeholder="请输入店铺ID"
            clearable
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="价格范围">
          <a-input
            v-model="searchForm.minPrice"
            placeholder="最低价格"
            style="width: 120px"
          />
          <span style="margin: 0 10px">-</span>
          <a-input
            v-model="searchForm.maxPrice"
            placeholder="最高价格"
            style="width: 120px"
          />
        </a-form-item>
        <a-form-item label="商品状态">
          <a-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width:120px">
            <a-option label="上架" :value="1" />
            <a-option label="下架" :value="0" />
          </a-select>
        </a-form-item>
        <a-form-item label="库存状态">
          <a-select v-model="searchForm.inStock" placeholder="请选择库存状态" clearable style="width:120px">
            <a-option label="有库存" :value="true" />
            <a-option label="无库存" :value="false" />
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="searchProducts">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮区域 -->
    <div class="action-bar">
        <a-button type="primary" @click="showAddDialog">
          <template #icon><icon-plus /></template>
          新增商品
        </a-button>
    </div>

    <!-- 商品列表表格 -->
    <a-card>
      <a-table 
        :data="productList" 
        :loading="loading"
        :pagination="pagination"
        @page-change="handleCurrentChange"
        @page-size-change="handleSizeChange"
        row-key="id"
      >
        <template #columns>
          <a-table-column title="商品ID" data-index="id" :width="100">
            <template #cell="{ record }">
              <a-link @click="viewProduct(record)">{{ record.id }}</a-link>
            </template>
          </a-table-column>
          <a-table-column title="商品名称" data-index="name" :width="180">
            <template #cell="{ record }">
              <a-tooltip :content="record.name" :disabled="!record.name">
                <span class="product-name">{{ record.name || '-' }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="店铺ID" data-index="storeId" :width="100" />
          <a-table-column title="商品描述" data-index="description" :width="200">
            <template #cell="{ record }">
              <a-tooltip :content="record.description" :disabled="!record.description">
                <span class="description-text">{{ record.description || '-' }}</span>
              </a-tooltip>
            </template>
          </a-table-column>
          <a-table-column title="价格" data-index="price" :width="120">
            <template #cell="{ record }">
              <span class="amount-text">¥{{ record.price?.toFixed(2) || '0.00' }}</span>
            </template>
          </a-table-column>
          <a-table-column title="销量" data-index="salesCount" :width="100">
            <template #cell="{ record }">
              {{ record.salesCount || 0 }}
            </template>
          </a-table-column>
          <a-table-column title="商品图片" :width="120">
            <template #cell="{ record }">
              <div class="product-image">
                <a-image
                  v-if="record.imageUrl"
                  :src="record.imageUrl"
                  width="50"
                  height="50"
                  fit="cover"
                  :preview="true"
                />
                <span v-else class="no-image">无图片</span>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="状态" data-index="status" :width="100">
            <template #cell="{ record }">
              <a-tag :color="record.status === 1 ? 'green' : 'red'">
                {{ record.status === 1 ? '上架' : '下架' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="创建时间" data-index="createTime" :width="180">
            <template #cell="{ record }">
              {{ formatDateTime(record.createTime) }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="250" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button size="small" @click="viewProduct(record)">
                  查看
                </a-button>
                <a-button size="small" type="primary" @click="editProduct(record)">
                  编辑
                </a-button>
                <a-button
                  size="small"
                  :type="record.status === 1 ? 'outline' : 'primary'"
                  @click="toggleStatus(record)"
                >
                  {{ record.status === 1 ? '下架' : '上架' }}
                </a-button>
                <a-button size="small" status="danger" @click="deleteProduct(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑商品对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0.01"
            :max="999999.99"
            :precision="2"
            placeholder="请输入商品价格"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="店铺ID" prop="storeId">
          <el-input-number
            v-model="productForm.storeId"
            :min="1"
            placeholder="请输入店铺ID"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="商品图片" prop="imageUrl">
          <el-input v-model="productForm.imageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status" v-if="isEdit">
          <el-radio-group v-model="productForm.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 商品详情对话框 -->
    <el-dialog
      title="商品详情"
      v-model="detailDialogVisible"
      width="500px"
    >
      <div v-if="currentProduct" class="product-detail">
        <div class="detail-item">
          <label>商品ID：</label>
          <span>{{ currentProduct.id }}</span>
        </div>
        <div class="detail-item">
          <label>商品名称：</label>
          <span>{{ currentProduct.name }}</span>
        </div>
        <div class="detail-item">
          <label>店铺ID：</label>
          <span>{{ currentProduct.storeId }}</span>
        </div>
        <div class="detail-item">
          <label>商品描述：</label>
          <span>{{ currentProduct.description }}</span>
        </div>
        <div class="detail-item">
          <label>商品价格：</label>
          <span>¥{{ currentProduct.price }}</span>
        </div>
        <div class="detail-item">
          <label>销量：</label>
          <span>{{ currentProduct.salesCount }}</span>
        </div>
        <div class="detail-item">
          <label>商品状态：</label>
          <el-tag :type="currentProduct.status === 1 ? 'success' : 'danger'">
            {{ currentProduct.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </div>
        <div class="detail-item" v-if="currentProduct.imageUrl">
          <label>商品图片：</label>
          <el-image
            :src="currentProduct.imageUrl"
            style="width: 200px; height: 200px"
            fit="cover"
            :preview-src-list="[currentProduct.imageUrl]"
          />
        </div>
        <div class="detail-item">
          <label>创建时间：</label>
          <span>{{ formatDateTime(currentProduct.createTime) }}</span>
        </div>
        <div class="detail-item">
          <label>更新时间：</label>
          <span>{{ formatDateTime(currentProduct.updateTime) }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import {
  getProductsApi as getProducts,
  searchProductsApi as searchProductsApi,
  getProductDetailApi as getProductDetail,
  createProductApi as createProduct,
  updateProductApi as updateProduct,
  deleteProductApi as deleteProductApi,
  toggleProductStatusApi as toggleProductStatus
} from '@/api/product'

export default {
  name: 'ProductManagement',
  setup() {
    // 响应式数据
    const loading = ref(false)
    const productList = ref([])
    const dialogVisible = ref(false)
    const detailDialogVisible = ref(false)
    const isEdit = ref(false)
    const currentProduct = ref(null)
    const productFormRef = ref(null)

    // 搜索表单
    const searchForm = reactive({
      name: '',
      storeId: '',
      minPrice: '',
      maxPrice: '',
      status: '',
      inStock: ''
    })

    // 分页数据
    const pagination = reactive({
      pageNum: 1,
      pageSize: 10,
      total: 0
    })

    // 商品表单
    const productForm = reactive({
      id: null,
      name: '',
      description: '',
      price: null,
      storeId: null,
      imageUrl: '',
      status: 1
    })

    // 表单验证规则
    const productRules = {
      name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 1, max: 255, message: '商品名称长度在1到255个字符', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入商品描述', trigger: 'blur' },
        { min: 1, max: 2000, message: '商品描述长度在1到2000个字符', trigger: 'blur' }
      ],
      price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', min: 0.01, max: 999999.99, message: '价格范围在0.01到999999.99之间', trigger: 'blur' }
      ],
      storeId: [
        { required: true, message: '请输入店铺ID', trigger: 'blur' },
        { type: 'number', min: 1, message: '店铺ID必须是正数', trigger: 'blur' }
      ],
      imageUrl: [
        { max: 500, message: '图片URL长度不能超过500个字符', trigger: 'blur' }
      ]
    }

    // 计算属性
    const dialogTitle = ref('')

    // 方法
    const getProductList = async () => {
      try {
        loading.value = true
        const params = {
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize
        }
        const response = await getProducts(params)
        if (response.code === 200) {
          productList.value = response.data.list
          pagination.total = response.data.total
        } else {
          Message.error(response.message || '获取商品列表失败')
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        Message.error('获取商品列表失败')
      } finally {
        loading.value = false
      }
    }

    const searchProducts = async () => {
      try {
        loading.value = true
        const params = {
          ...searchForm,
          pageNum: pagination.pageNum,
          pageSize: pagination.pageSize
        }
        // 清理空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null || params[key] === undefined) {
            delete params[key]
          }
        })
        
        const response = await searchProductsApi(params)
        if (response.code === 200) {
          productList.value = response.data.list
          pagination.total = response.data.total
        } else {
          Message.error(response.message || '搜索商品失败')
        }
      } catch (error) {
        console.error('搜索商品失败:', error)
        Message.error('搜索商品失败')
      } finally {
        loading.value = false
      }
    }

    const resetSearch = () => {
      Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
      })
      pagination.pageNum = 1
      getProductList()
    }

    const showAddDialog = () => {
      isEdit.value = false
      dialogTitle.value = '新增商品'
      resetForm()
      dialogVisible.value = true
    }

    const editProduct = (product) => {
      isEdit.value = true
      dialogTitle.value = '编辑商品'
      Object.keys(productForm).forEach(key => {
        productForm[key] = product[key]
      })
      dialogVisible.value = true
    }

    const viewProduct = async (product) => {
      try {
        const response = await getProductDetail(product.id)
        if (response.code === 200) {
          currentProduct.value = response.data
          detailDialogVisible.value = true
        } else {
          Message.error(response.message || '获取商品详情失败')
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        Message.error('获取商品详情失败')
      }
    }

    const deleteProduct = async (product) => {
      try {
        await new Promise((resolve, reject) => {
          Modal.confirm({
            title: '删除确认',
            content: `确定要删除商品"${product.name}"吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: resolve,
            onCancel: reject
          })
        })
        
        const response = await deleteProductApi(product.id)
        if (response.code === 200) {
          Message.success('删除成功')
          getProductList()
        } else {
          Message.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除商品失败:', error)
          Message.error('删除失败')
        }
      }
    }

    const toggleStatus = async (product) => {
      try {
        const newStatus = product.status === 1 ? 0 : 1
        const statusText = newStatus === 1 ? '上架' : '下架'
        
        await new Promise((resolve, reject) => {
          Modal.confirm({
            title: '状态切换确认',
            content: `确定要${statusText}商品"${product.name}"吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: resolve,
            onCancel: reject
          })
        })
        
        const response = await toggleProductStatus(product.id, newStatus)
        if (response.code === 200) {
          Message.success(`${statusText}成功`)
          getProductList()
        } else {
          Message.error(response.message || `${statusText}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换商品状态失败:', error)
          Message.error('操作失败')
        }
      }
    }

    const submitForm = async () => {
      try {
        await productFormRef.value.validate()
        
        let response
        if (isEdit.value) {
           response = await updateProduct(productForm.id, productForm)
         } else {
           response = await createProduct(productForm)
         }
        
        if (response.code === 200) {
          // 检查是否有警告信息
          let hasWarning = false
          if (isEdit.value) {
            // 更新商品时，警告信息在response.data中
            if (response.data && response.data.includes('URL格式无效')) {
              hasWarning = true
              Modal.warning({
                title: '警告',
                content: response.data,
                okText: '确定'
              })
            }
          } else {
            // 创建商品时，警告信息在response.message中
            if (response.message && response.message.includes('URL格式无效')) {
              hasWarning = true
              Modal.warning({
                title: '警告',
                content: response.message,
                okText: '确定'
              })
            }
          }
          Message.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          getProductList()
        } else {
          Message.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        Message.error(isEdit.value ? '更新失败' : '创建失败')
      }
    }

    const resetForm = () => {
      Object.keys(productForm).forEach(key => {
        if (key === 'status') {
          productForm[key] = 1
        } else {
          productForm[key] = key === 'id' ? null : ''
        }
      })
      if (productFormRef.value) {
        productFormRef.value.clearValidate()
      }
    }

    const handleDialogClose = () => {
      resetForm()
      dialogVisible.value = false
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      pagination.pageNum = 1
      if (hasSearchConditions()) {
        searchProducts()
      } else {
        getProductList()
      }
    }

    const handleCurrentChange = (page) => {
      pagination.pageNum = page
      if (hasSearchConditions()) {
        searchProducts()
      } else {
        getProductList()
      }
    }

    const hasSearchConditions = () => {
      return Object.values(searchForm).some(value => value !== '' && value !== null && value !== undefined)
    }

    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // 生命周期
    onMounted(() => {
      getProductList()
    })

    return {
      loading,
      productList,
      dialogVisible,
      detailDialogVisible,
      isEdit,
      currentProduct,
      productFormRef,
      searchForm,
      pagination,
      productForm,
      productRules,
      dialogTitle,
      getProductList,
      searchProducts,
      resetSearch,
      showAddDialog,
      editProduct,
      viewProduct,
      deleteProduct,
      toggleStatus,
      submitForm,
      resetForm,
      handleDialogClose,
      handleSizeChange,
      handleCurrentChange,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.product-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  gap: 16px;
}

.action-buttons {
  margin-left: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.product-detail {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  line-height: 1.5;
}

.detail-item label {
  font-weight: 500;
  color: #606266;
  width: 100px;
  flex-shrink: 0;
}

.detail-item span {
  color: #303133;
  flex: 1;
  word-break: break-all;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .action-buttons {
    margin-left: 0;
    margin-top: 15px;
  }
  
  .search-form .el-form-item {
    margin-bottom: 10px;
  }
}
</style>