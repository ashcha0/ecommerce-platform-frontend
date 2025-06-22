import request from './request'

// 订单管理API
const ORDER_API = '/orders'

/**
 * 查询订单列表
 * @param {Object} params - 查询参数
 * @param {string} params.orderNo - 订单号
 * @param {string} params.orderStatus - 订单状态
 * @param {number} params.customerId - 客户ID
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页大小
 * @returns {Promise}
 */
export const searchOrdersApi = (params) => {
  return request.get(ORDER_API, { params })
}

/**
 * 获取订单列表（兼容旧接口）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getOrdersApi = (params = {}) => {
  return searchOrdersApi({
    pageNum: 1,
    pageSize: 10,
    ...params
  })
}

/**
 * 获取订单详情
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const getOrderDetailApi = (orderId) => {
  return request.get(`${ORDER_API}/${orderId}`)
}

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @param {number} orderData.customerId - 客户ID
 * @param {Array} orderData.items - 订单商品列表
 * @param {string} orderData.deliveryAddress - 配送地址
 * @param {string} orderData.consigneeName - 收货人姓名
 * @param {string} orderData.consigneePhone - 收货人电话
 * @param {string} orderData.remark - 备注
 * @returns {Promise}
 */
export const createOrderApi = (orderData) => {
  return request.post(ORDER_API, orderData)
}

/**
 * 更新订单状态
 * @param {number} orderId - 订单ID
 * @param {string} status - 订单状态
 * @returns {Promise}
 */
export const updateOrderStatusApi = (orderId, status) => {
  return request.put(`${ORDER_API}/${orderId}/status`, null, {
    params: { status }
  })
}

/**
 * 支付订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const payOrderApi = (orderId) => {
  return request.put(`${ORDER_API}/${orderId}/pay`)
}

/**
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const confirmOrderApi = (orderId) => {
  return request.put(`${ORDER_API}/${orderId}/confirm`)
}

/**
 * 取消订单
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const cancelOrderApi = (orderId) => {
  return request.put(`${ORDER_API}/${orderId}/cancel`)
}

/**
 * 查询订单商品明细
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const getOrderItemsApi = (orderId) => {
  return request.get(`${ORDER_API}/${orderId}/items`)
}

/**
 * 查询订单配送信息
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const getOrderDeliveryInfoApi = (orderId) => {
  return request.get(`${ORDER_API}/${orderId}/delivery`)
}

/**
 * 订单状态统计
 * @returns {Promise}
 */
export const getOrderStatusStatsApi = () => {
  return request.get(`${ORDER_API}/stats/status`)
}

/**
 * 获取客户列表
 * @returns {Promise}
 */
export const getSimpleCustomersApi = () => {
  return request.get('/customers/simple')
}

/**
 * 获取简化商品列表
 * @returns {Promise}
 */
export const getSimpleProductsApi = () => {
  return request.get('/products/simple')
}

/**
 * 获取简化订单列表
 * @returns {Promise}
 */
export const getSimpleOrdersApi = () => {
  return request.get('/orders/simple')
}

/**
 * 导出订单数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportOrdersApi = (params) => {
  return request.get(`${ORDER_API}/export`, {
    params,
    responseType: 'blob'
  })
}

// 订单状态常量
export const ORDER_STATUS = {
  PAYING: 'PAYING',
  RECEIPTING: 'RECEIPTING', 
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED'
}

// 订单状态显示文本
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PAYING]: '待支付',
  [ORDER_STATUS.RECEIPTING]: '待收货',
  [ORDER_STATUS.SHIPPING]: '待发货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.PROCESSING]: '售后处理中',
  [ORDER_STATUS.PROCESSED]: '售后处理完成'
}

// 订单状态颜色
export const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.PAYING]: 'orange',
  [ORDER_STATUS.RECEIPTING]: 'blue',
  [ORDER_STATUS.SHIPPING]: 'cyan',
  [ORDER_STATUS.COMPLETED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
  [ORDER_STATUS.PROCESSING]: 'yellow',
  [ORDER_STATUS.PROCESSED]: 'arcoblue'
}