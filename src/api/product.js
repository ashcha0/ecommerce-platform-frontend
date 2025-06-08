import axios from './request'

// 商品管理API
const PRODUCT_API = '/products'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @returns {Promise}
 */
export const getProductsApi = (params = {}) => {
  return axios.get(PRODUCT_API, {
    params: {
      pageNum: 1,
      pageSize: 10,
      ...params
    }
  })
}

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {string} params.name - 商品名称
 * @param {number} params.storeId - 店铺ID
 * @param {number} params.minPrice - 最低价格
 * @param {number} params.maxPrice - 最高价格
 * @param {number} params.status - 商品状态
 * @param {boolean} params.inStock - 是否有库存
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @returns {Promise}
 */
export const searchProductsApi = (params) => {
  return axios.get(`${PRODUCT_API}/search`, { params })
}

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export const getProductDetailApi = (id) => {
  return axios.get(`${PRODUCT_API}/${id}`)
}

/**
 * 创建商品
 * @param {Object} productData - 商品数据
 * @param {string} productData.name - 商品名称
 * @param {string} productData.description - 商品描述
 * @param {number} productData.price - 商品价格
 * @param {number} productData.storeId - 店铺ID
 * @param {string} productData.imageUrl - 商品图片URL
 * @returns {Promise}
 */
export const createProductApi = (productData) => {
  return axios.post(PRODUCT_API, productData)
}

/**
 * 更新商品信息
 * @param {number} id - 商品ID
 * @param {Object} productData - 商品数据
 * @returns {Promise}
 */
export const updateProductApi = (id, productData) => {
  return axios.put(`${PRODUCT_API}/${id}`, productData)
}

/**
 * 删除商品
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export const deleteProductApi = (id) => {
  return axios.delete(`${PRODUCT_API}/${id}`)
}

/**
 * 批量删除商品
 * @param {Array<number>} ids - 商品ID数组
 * @returns {Promise}
 */
export const batchDeleteProductsApi = (ids) => {
  return axios.delete(`${PRODUCT_API}/batch`, {
    data: { ids }
  })
}

/**
 * 切换商品状态
 * @param {number} id - 商品ID
 * @param {number} status - 商品状态
 * @returns {Promise}
 */
export const toggleProductStatusApi = (id, status) => {
  return axios.patch(`${PRODUCT_API}/${id}/status`, null, {
    params: { status }
  })
}

/**
 * 调整商品库存
 * @param {number} id - 商品ID
 * @param {Object} stockData - 库存调整数据
 * @param {number} stockData.quantity - 调整数量
 * @param {string} stockData.type - 调整类型 (increase/decrease)
 * @param {string} stockData.reason - 调整原因
 * @returns {Promise}
 */
export const adjustProductStockApi = (id, stockData) => {
  return axios.patch(`${PRODUCT_API}/${id}/stock`, stockData)
}

/**
 * 批量切换商品状态
 * @param {Array<number>} ids - 商品ID数组
 * @param {number} status - 商品状态
 * @returns {Promise}
 */
export const batchToggleProductStatusApi = (ids, status) => {
  return axios.patch(`${PRODUCT_API}/batch/status`, {
    ids,
    status
  })
}

/**
 * 获取商品统计数据
 * @returns {Promise}
 */
export const getProductStatsApi = () => {
  return axios.get(`${PRODUCT_API}/stats`)
}

/**
 * 导出商品数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportProductsApi = (params = {}) => {
  return axios.get(`${PRODUCT_API}/export`, {
    params,
    responseType: 'blob'
  })
}

/**
 * 获取店铺列表
 * @returns {Promise}
 */
export const getStoresApi = () => {
  return axios.get('/api/stores')
}