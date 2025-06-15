import request from './request'

/**
 * 创建商品库存记录
 * @param {Object} data - 库存数据
 * @param {number} data.productId - 商品ID
 * @param {number} data.initialStock - 初始库存数量
 * @param {number} data.lowStockThreshold - 低库存阈值
 * @returns {Promise}
 */
export const createInventoryApi = (data) => {
  return request({
    url: '/inventory/create',
    method: 'post',
    data
  })
}

/**
 * 获取商品库存信息
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export const getInventoryByProductIdApi = (productId) => {
  return request({
    url: `/inventory/product/${productId}`,
    method: 'get'
  })
}

/**
 * 更新商品库存
 * @param {number} productId - 商品ID
 * @param {number} stockChange - 库存变化量
 * @returns {Promise}
 */
export const updateInventoryStockApi = (productId, stockChange) => {
  return request({
    url: `/inventory/product/${productId}/stock`,
    method: 'put',
    params: { stockChange }
  })
}

/**
 * 更新低库存阈值
 * @param {number} productId - 商品ID
 * @param {number} threshold - 低库存阈值
 * @returns {Promise}
 */
export const updateInventoryThresholdApi = (productId, threshold) => {
  return request({
    url: `/inventory/product/${productId}/threshold`,
    method: 'put',
    params: { threshold }
  })
}

/**
 * 批量更新库存
 * @param {Array} productIds - 商品ID列表
 * @param {Array} stockChanges - 对应的库存变化量列表
 * @returns {Promise}
 */
export const batchUpdateInventoryApi = (productIds, stockChanges) => {
  return request({
    url: '/inventory/batch-update',
    method: 'put',
    params: {
      productIds: productIds.join(','),
      stockChanges: stockChanges.join(',')
    }
  })
}

/**
 * 删除商品库存记录
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export const deleteInventoryApi = (productId) => {
  return request({
    url: `/inventory/product/${productId}`,
    method: 'delete'
  })
}

/**
 * 条件查询库存列表
 * @param {Object} params - 查询参数
 * @param {number} params.productId - 商品ID
 * @param {number} params.minStock - 最小库存数量
 * @param {number} params.maxStock - 最大库存数量
 * @param {boolean} params.isLowStock - 是否为低库存商品
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @param {string} params.sortBy - 排序字段
 * @param {string} params.sortOrder - 排序方向
 * @returns {Promise}
 */
export const queryInventoryApi = (params) => {
  return request({
    url: '/inventory/query',
    method: 'post',
    data: params
  })
}

/**
 * 获取库存统计信息
 * @returns {Promise}
 */
export const getInventoryStatsApi = () => {
  return request({
    url: '/inventory/stats',
    method: 'get'
  })
}

/**
 * 获取低库存商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页大小
 * @returns {Promise}
 */
export const getLowStockInventoryApi = (params) => {
  return request({
    url: '/inventory/low-stock',
    method: 'get',
    params
  })
}

/**
 * 检查商品库存记录是否存在
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export const checkInventoryExistsApi = (productId) => {
  return request({
    url: `/inventory/exists/${productId}`,
    method: 'get'
  })
}