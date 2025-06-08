import request from './request'

/**
 * 获取销售统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 统计类型 (day/week/month/year)
 * @returns {Promise}
 */
export const getSalesStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/sales',
    method: 'get',
    params
  })
}

/**
 * 获取商品销量统计
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getProductSalesApi = (params = {}) => {
  return request({
    url: '/api/statistics/product-sales',
    method: 'get',
    params
  })
}

/**
 * 获取商品销量占比
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getProductSalesRatioApi = (params = {}) => {
  return request({
    url: '/api/statistics/product-sales-ratio',
    method: 'get',
    params
  })
}

/**
 * 获取销量趋势数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 统计类型 (day/week/month)
 * @returns {Promise}
 */
export const getSalesTrendApi = (params = {}) => {
  return request({
    url: '/api/statistics/sales-trend',
    method: 'get',
    params
  })
}

/**
 * 获取客户统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getCustomerStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/customers',
    method: 'get',
    params
  })
}

/**
 * 获取订单统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getOrderStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/orders',
    method: 'get',
    params
  })
}

/**
 * 获取库存统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getInventoryStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/inventory',
    method: 'get',
    params
  })
}

/**
 * 获取店铺统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getShopStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/shops',
    method: 'get',
    params
  })
}

/**
 * 获取配送统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getDeliveryStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/deliveries',
    method: 'get',
    params
  })
}

/**
 * 获取热销商品排行
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getHotProductsApi = (params = {}) => {
  return request({
    url: '/api/statistics/hot-products',
    method: 'get',
    params
  })
}

/**
 * 获取客户消费排行
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getTopCustomersApi = (params = {}) => {
  return request({
    url: '/api/statistics/top-customers',
    method: 'get',
    params
  })
}

/**
 * 获取实时数据
 * @returns {Promise}
 */
export const getRealTimeDataApi = () => {
  return request({
    url: '/api/statistics/realtime',
    method: 'get'
  })
}

/**
 * 获取综合报表数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 报表类型
 * @returns {Promise}
 */
export const getReportDataApi = (params = {}) => {
  return request({
    url: '/api/statistics/report',
    method: 'get',
    params
  })
}

/**
 * 获取商品销售统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getProductSalesStatsApi = (params = {}) => {
  return request({
    url: '/api/statistics/product-sales-stats',
    method: 'get',
    params
  })
}

/**
 * 获取商品销售份额数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.limit - 限制数量
 * @returns {Promise}
 */
export const getProductSalesShareApi = (params = {}) => {
  return request({
    url: '/api/statistics/product-sales-share',
    method: 'get',
    params
  })
}

/**
 * 获取综合报表数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.type - 报表类型
 * @returns {Promise}
 */
export const getComprehensiveReportApi = (params = {}) => {
  return request({
    url: '/api/statistics/comprehensive-report',
    method: 'get',
    params
  })
}

/**
 * 导出统计报表
 * @param {Object} params - 导出参数
 * @param {string} params.type - 报表类型
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const exportStatisticsReportApi = (params = {}) => {
  return request({
    url: '/api/statistics/export-report',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 导出统计报表
 * @param {Object} params - 导出参数
 * @param {string} params.type - 报表类型
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const exportReportApi = (params = {}) => {
  return request({
    url: '/api/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}