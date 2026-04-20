import request from '@/utils/request'

/**
 * 发送验证码
 * @param {Object} params - 请求参数
 * @param {string} params.phone - 手机号
 */
export const sendCode = (params) => {
  return request.post('/user/code', null, { params })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 */
export const login = (data) => {
  return request.post('/user/login', data)
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get('/user/me')
}

/**
 * 用户退出登录
 */
export const logout = () => {
  return request.post('/user/logout')
}
