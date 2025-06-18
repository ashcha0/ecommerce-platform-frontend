import request from './request'

/**
 * 获取配送列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getDeliveriesApi = (params = {}) => {
  return request({
    url: '/delivery',
    method: 'get',
    params
  })
}

/**
 * 搜索配送记录
 * @param {Object} params - 搜索参数
 * @param {string} params.orderNo - 订单号
 * @param {string} params.deliveryNo - 配送单号
 * @param {string} params.status - 配送状态
 * @param {string} params.deliveryName - 收货人姓名
 * @param {string} params.deliveryPhone - 收货人电话
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const searchDeliveriesApi = (params) => {
  return request({
    url: '/delivery',
    method: 'get',
    params
  })
}

/**
 * 获取配送详情
 * @param {number} id - 配送ID
 * @returns {Promise}
 */
export const getDeliveryDetailApi = (id) => {
  return request({
    url: `/delivery/${id}`,
    method: 'get'
  })
}

/**
 * 创建配送记录
 * @param {Object} data - 配送数据
 * @returns {Promise}
 */
export const createDeliveryApi = (data) => {
  return request({
    url: `/delivery`,
    method: 'post',
    data
  })
}

/**
 * 更新配送记录
 * @param {number} orderId - 订单ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateDeliveryApi = (orderId, data) => {
  return request({
    url: `/delivery/order/${orderId}`,
    method: 'put',
    data
  })
}

/**
 * 删除配送记录
 * @param {number} id - 配送ID
 * @returns {Promise}
 */
export const deleteDeliveryApi = (id) => {
  return request({
    url: `/delivery/${id}`,
    method: 'delete'
  })
}

/**
 * 更新配送状态
 * @param {number} orderId - 订单ID
 * @param {string} status - 新状态
 * @returns {Promise}
 */
export const updateDeliveryStatusApi = (orderId, status) => {
  return request({
    url: `/delivery/order/${orderId}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 发货
 * @param {number} orderId - 订单ID
 * @param {string} trackingNo - 物流单号
 * @param {string} shipper - 物流公司
 * @returns {Promise}
 */
export const shipDeliveryApi = (orderId, trackingNo, shipper) => {
  return request({
    url: `/delivery/order/${orderId}/ship`,
    method: 'post',
    params: { trackingNo, shipper }
  })
}

/**
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const confirmDeliveryApi = (orderId) => {
  return request({
    url: `/delivery/order/${orderId}/confirm`,
    method: 'post'
  })
}

/**
 * 根据订单ID查询配送信息
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export const getDeliveryByOrderIdApi = (orderId) => {
  return request({
    url: `/delivery/order/${orderId}`,
    method: 'get'
  })
}

/**
 * 批量删除配送记录
 * @param {Array} ids - 配送ID数组
 * @returns {Promise}
 */
export const batchDeleteDeliveriesApi = (ids) => {
  return request({
    url: '/delivery/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 批量更新配送状态
 * @param {Array} ids - 配送ID数组
 * @param {number} status - 新状态
 * @returns {Promise}
 */
export const batchUpdateDeliveryStatusApi = (ids, status) => {
  return request({
    url: '/delivery/batch/status',
    method: 'put',
    data: { ids, status }
  })
}

/**
 * 获取配送统计信息
 * @returns {Promise}
 */
export const getDeliveryStatsApi = () => {
  return request({
    url: '/delivery/stats',
    method: 'get'
  })
}

/**
 * 获取配送公司列表
 * @returns {Promise}
 */
export const getDeliveryCompaniesApi = () => {
  return request({
    url: '/delivery/companies',
    method: 'get'
  })
}

/**
 * 跟踪配送状态
 * @param {string} deliveryNo - 配送单号
 * @param {string} company - 配送公司
 * @returns {Promise}
 */
export const trackDeliveryApi = (deliveryNo, company) => {
  return request({
    url: '/delivery/track',
    method: 'get',
    params: { deliveryNo, company }
  })
}

/**
 * 导出配送数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportDeliveriesApi = (params = {}) => {
  return request({
    url: '/delivery/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}