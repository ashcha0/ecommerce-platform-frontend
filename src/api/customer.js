import request from './request'

/**
 * 获取客户列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getCustomersApi = (params = {}) => {
  return request({
    url: '/api/customers',
    method: 'get',
    params
  })
}

/**
 * 搜索客户
 * @param {Object} params - 搜索参数
 * @param {string} params.name - 客户姓名
 * @param {string} params.phone - 客户电话
 * @param {string} params.email - 客户邮箱
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const searchCustomersApi = (params) => {
  return request({
    url: '/api/customers/search',
    method: 'get',
    params
  })
}

/**
 * 获取客户详情
 * @param {number} id - 客户ID
 * @returns {Promise}
 */
export const getCustomerDetailApi = (id) => {
  return request({
    url: `/api/customers/${id}`,
    method: 'get'
  })
}

/**
 * 创建客户
 * @param {Object} data - 客户数据
 * @param {string} data.name - 客户姓名
 * @param {string} data.phone - 客户电话
 * @param {string} data.email - 客户邮箱
 * @param {string} data.address - 客户地址
 * @param {string} data.remark - 备注
 * @returns {Promise}
 */
export const createCustomerApi = (data) => {
  return request({
    url: '/api/customers',
    method: 'post',
    data
  })
}

/**
 * 更新客户
 * @param {number} id - 客户ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateCustomerApi = (id, data) => {
  return request({
    url: `/api/customers/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除客户
 * @param {number} id - 客户ID
 * @returns {Promise}
 */
export const deleteCustomerApi = (id) => {
  return request({
    url: `/api/customers/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除客户
 * @param {Array} ids - 客户ID数组
 * @returns {Promise}
 */
export const batchDeleteCustomersApi = (ids) => {
  return request({
    url: '/api/customers/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 获取客户统计信息
 * @returns {Promise}
 */
export const getCustomerStatsApi = () => {
  return request({
    url: '/api/customers/stats',
    method: 'get'
  })
}

/**
 * 获取客户订单历史
 * @param {number} customerId - 客户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getCustomerOrdersApi = (customerId, params = {}) => {
  return request({
    url: `/api/customers/${customerId}/orders`,
    method: 'get',
    params
  })
}

/**
 * 导出客户数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportCustomersApi = (params = {}) => {
  return request({
    url: '/api/customers/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}