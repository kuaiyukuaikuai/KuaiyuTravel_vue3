import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000 // 增加超时时间
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', config.method.toUpperCase(), config.url, config.params || '')
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.authorization = token
    }
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', response.config.url, response.data)
    const res = response.data
    if (res.success) {
      return res
    } else {
      showToast(res.errorMsg || '请求失败')
      return Promise.reject(new Error(res.errorMsg || '请求失败'))
    }
  },
  (error) => {
    console.error('❌ 请求错误:', error)
    console.error('错误详情:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText
    })
    
    // 更友好的错误提示
    let errorMsg = '网络错误'
    if (error.code === 'ECONNABORTED') {
      errorMsg = '请求超时，请检查网络'
    } else if (!error.response) {
      errorMsg = '无法连接到服务器'
    } else if (error.response.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
      errorMsg = '登录已过期，请重新登录'
    } else if (error.response.status === 404) {
      errorMsg = '请求的资源不存在'
    } else if (error.response.status >= 500) {
      errorMsg = '服务器错误，请稍后重试'
    }
    
    showToast(errorMsg)
    return Promise.reject(error)
  }
)

export default request
