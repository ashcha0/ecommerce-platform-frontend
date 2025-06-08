import axios from './request'

// 订单管理API
const ORDER_API = '/api/orders'

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @returns {Promise}
 */
export const getOrdersApi = (params = {}) => {
  return axios.get(ORDER_API, {
    params: {
      pageNum: 1,
      pageSize: 10,
      ...params
    }
  })
}

/**
 * 搜索订单
 * @param {Object} params - 搜索参数
 * @param {string} params.orderNo - 订单号
 * @param {string} params.customerName - 客户姓名
 * @param {string} params.customerPhone - 客户电话
 * @param {number} params.status - 订单状态
 * @param {number} params.minAmount - 最低金额
 * @param {number} params.maxAmount - 最高金额
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @returns {Promise}
 */
export const searchOrdersApi = (params) => {
  return axios.get(`${ORDER_API}/search`, { params })
}

/**
 * 获取订单详情
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export const getOrderDetailApi = (id) => {
  return axios.get(`${ORDER_API}/${id}`)
}

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @param {number} orderData.customerId - 客户ID
 * @param {Array} orderData.orderItems - 订单商品列表
 * @param {string} orderData.deliveryName - 收货人姓名
 * @param {string} orderData.deliveryPhone - 收货人电话
 * @param {string} orderData.deliveryAddress - 收货地址
 * @param {string} orderData.deliveryPostcode - 邮政编码
 * @param {string} orderData.paymentMethod - 支付方式
 * @param {string} orderData.remark - 备注
 * @returns {Promise}
 */
export const createOrderApi = (orderData) => {
  return axios.post(ORDER_API, orderData)
}

/**
 * 更新订单信息
 * @param {number} id - 订单ID
 * @param {Object} orderData - 订单数据
 * @returns {Promise}
 */
export const updateOrderApi = (id, orderData) => {
  return axios.put(`${ORDER_API}/${id}`, orderData)
}

/**
 * 删除订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export const deleteOrderApi = (id) => {
  return axios.delete(`${ORDER_API}/${id}`)
}

/**
 * 更新订单状态
 * @param {number} id - 订单ID
 * @param {number} status - 订单状态
 * @returns {Promise}
 */
export const updateOrderStatusApi = (id, status) => {
  return axios.patch(`${ORDER_API}/${id}/status`, null, {
    params: { status }
  })
}

/**
 * 获取客户列表
 * @returns {Promise}
 */
export const getCustomersApi = () => {
  return axios.get('/api/customers')
}

/**
 * 获取简化商品列表
 * @returns {Promise}
 */
export const getSimpleProductsApi = () => {
  return axios.get('/api/products/simple')
}

/**
 * 批量删除订单
 * @param {Array} ids - 订单ID数组
 * @returns {Promise}
 */
export const batchDeleteOrdersApi = (ids) => {
  return axios.delete(`${ORDER_API}/batch`, {
    data: { ids }
  })
}

/**
 * 批量更新订单状态
 * @param {Array} ids - 订单ID数组
 * @param {number} status - 订单状态
 * @returns {Promise}
 */
export const batchUpdateOrderStatusApi = (ids, status) => {
  return axios.patch(`${ORDER_API}/batch/status`, {
    ids,
    status
  })
}

/**
 * 获取订单统计信息
 * @returns {Promise}
 */
export const getOrderStatsApi = () => {
  return axios.get(`${ORDER_API}/stats`)
}

/**
 * 导出订单数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportOrdersApi = (params) => {
  return axios.get(`${ORDER_API}/export`, {
    params,
    responseType: 'blob'
  })
}