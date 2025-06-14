import request from './request'

/**
 * 获取客户列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getCustomersApi = (params) => {
  return request({
    url: '/customers',
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
    url: '/customers/search',
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
    url: `/customers/${id}`,
    method: 'get'
  })
}

/**
 * 创建客户（注册）
 * @param {Object} data - 客户数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.confirmPassword - 确认密码
 * @param {string} data.phone - 客户电话
 * @param {string} data.email - 客户邮箱
 * @param {string} data.realName - 真实姓名
 * @param {string} data.address - 客户地址
 * @returns {Promise}
 */
export const createCustomerApi = (data) => {
  return request({
    url: '/customers/register',
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
    url: `/customers/${id}`,
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
    url: `/customers/${id}`,
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
    url: '/customers/batch',
    method: 'delete',
    data: { ids }
  })
}

/**
 * 检查用户名是否存在
 * @param {string} username - 用户名
 * @returns {Promise}
 */
export const checkUsernameApi = (username) => {
  return request({
    url: '/customers/check-username',
    method: 'get',
    params: { username }
  })
}

/**
 * 检查手机号是否存在
 * @param {string} phone - 手机号
 * @returns {Promise}
 */
export const checkPhoneApi = (phone) => {
  return request({
    url: '/customers/check-phone',
    method: 'get',
    params: { phone }
  })
}

/**
 * 检查邮箱是否存在
 * @param {string} email - 邮箱
 * @returns {Promise}
 */
export const checkEmailApi = (email) => {
  return request({
    url: '/customers/check-email',
    method: 'get',
    params: { email }
  })
}

/**
 * 导出客户数据
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportCustomersApi = (params = {}) => {
  return request({
    url: '/customers/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}