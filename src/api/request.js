import axios from 'axios'
import { Message } from '@arco-design/web-vue'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载状态
    if (config.showLoading !== false) {
      // 可以在这里显示全局loading
    }
    
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 隐藏加载状态
    // 可以在这里隐藏全局loading
    
    // 对响应数据做点什么
    const { data } = response
    
    // 根据后端约定的响应格式处理
    if (data.code === 200) {
      return data
    } else {
      // 业务错误处理
      const errorMessage = data.message || '请求失败'
      Message.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error) => {
    // 隐藏加载状态
    // 可以在这里隐藏全局loading
    
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    let errorMessage = '网络错误，请稍后重试'
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 可以在这里处理登录过期，跳转到登录页
          localStorage.removeItem('token')
          // router.push('/login')
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 409:
          errorMessage = data.message || '操作冲突'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接超时，请检查网络设置'
    } else {
      // 其他错误
      errorMessage = error.message || '请求配置错误'
    }
    
    Message.error(errorMessage)
    return Promise.reject(error)
  }
)

export default request