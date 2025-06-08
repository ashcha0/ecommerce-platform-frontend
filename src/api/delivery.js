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
    url: '/api/deliveries',
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
    url: '/api/deliveries/search',
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
    url: `/api/deliveries/${id}`,
    method: 'get'
  })
}

/**
 * 创建配送记录
 * @param {Object} data - 配送数据
 * @param {number} data.orderId - 订单ID
 * @param {string} data.deliveryNo - 配送单号
 * @param {string} data.deliveryCompany - 配送公司
 * @param {string} data.deliveryName - 收货人姓名
 * @param {string} data.deliveryPhone - 收货人电话
 * @param {string} data.deliveryAddress - 收货地址
 * @param {string} data.deliveryPostcode - 邮政编码
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const createDeliveryApi = (data) => {
  return request({
    url: '/api/deliveries',
    method: 'post',
    data
  })
}

/**
 * 更新配送记录
 * @param {number} id - 配送ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateDeliveryApi = (id, data) => {
  return request({
    url: `/api/deliveries/${id}`,
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
    url: `/api/deliveries/${id}`,
    method: 'delete'
  })
}

/**
 * 更新配送状态
 * @param {number} id - 配送ID
 * @param {number} status - 新状态
 * @returns {Promise}
 */
export const updateDeliveryStatusApi = (id, status) => {
  return request({
    url: `/api/deliveries/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 批量删除配送记录
 * @param {Array} ids - 配送ID数组
 * @returns {Promise}
 */
export const batchDeleteDeliveriesApi = (ids) => {
  return request({
    url: '/api/deliveries/batch',
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
    url: '/api/deliveries/batch/status',
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
    url: '/api/deliveries/stats',
    method: 'get'
  })
}

/**
 * 获取配送公司列表
 * @returns {Promise}
 */
export const getDeliveryCompaniesApi = () => {
  return request({
    url: '/api/deliveries/companies',
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
    url: '/api/deliveries/track',
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
    url: '/api/deliveries/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}