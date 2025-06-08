<template>
  <div class="product-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>商品管理</h1>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="search-section">
      <div class="search-form">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商品名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入商品名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="店铺ID">
            <el-input
              v-model="searchForm.storeId"
              placeholder="请输入店铺ID"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="价格范围">
            <el-input
              v-model="searchForm.minPrice"
              placeholder="最低价格"
              style="width: 120px"
            />
            <span style="margin: 0 10px">-</span>
            <el-input
              v-model="searchForm.maxPrice"
              placeholder="最高价格"
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item label="商品状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="库存状态">
            <el-select v-model="searchForm.inStock" placeholder="请选择库存状态" clearable style="width: 120px">
              <el-option label="有库存" :value="true" />
              <el-option label="无库存" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchProducts">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog">新增商品</el-button>
      </div>
    </div>

    <!-- 商品列表表格 -->
    <div class="table-section">
      <el-table
        :data="productList"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="商品ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="storeId" label="店铺ID" width="100" />
        <el-table-column prop="description" label="商品描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="salesCount" label="销量" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.imageUrl"
              :src="scope.row.imageUrl"
              style="width: 50px; height: 50px"
              fit="cover"
              :preview-src-list="[scope.row.imageUrl]"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewProduct(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="editProduct(scope.row)">编辑</el-button>
            <el-button
              size="small"
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProductsApi as getProducts,
  searchProductsApi as searchProducts,
  getProductDetailApi as getProductDetail,
  createProductApi as createProduct,
  updateProductApi as updateProduct,
  deleteProductApi as deleteProduct,
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
          ElMessage.error(response.message || '获取商品列表失败')
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        ElMessage.error('获取商品列表失败')
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
        
        const response = await searchProducts(params)
        if (response.code === 200) {
          productList.value = response.data.list
          pagination.total = response.data.total
        } else {
          ElMessage.error(response.message || '搜索商品失败')
        }
      } catch (error) {
        console.error('搜索商品失败:', error)
        ElMessage.error('搜索商品失败')
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
          ElMessage.error(response.message || '获取商品详情失败')
        }
      } catch (error) {
        console.error('获取商品详情失败:', error)
        ElMessage.error('获取商品详情失败')
      }
    }

    const deleteProduct = async (product) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除商品"${product.name}"吗？`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await deleteProduct(product.id)
        if (response.code === 200) {
          ElMessage.success('删除成功')
          getProductList()
        } else {
          ElMessage.error(response.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除商品失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }

    const toggleStatus = async (product) => {
      try {
        const newStatus = product.status === 1 ? 0 : 1
        const statusText = newStatus === 1 ? '上架' : '下架'
        
        await ElMessageBox.confirm(
          `确定要${statusText}商品"${product.name}"吗？`,
          '状态切换确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await toggleProductStatus(product.id, newStatus)
        if (response.code === 200) {
          ElMessage.success(`${statusText}成功`)
          getProductList()
        } else {
          ElMessage.error(response.message || `${statusText}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换商品状态失败:', error)
          ElMessage.error('操作失败')
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
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          getProductList()
        } else {
          ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
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

.search-form {
  flex: 1;
}

.action-buttons {
  margin-left: 20px;
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