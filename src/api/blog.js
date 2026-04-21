import request from '@/utils/request'

/**
 * 获取热门博客列表
 * @param {Object} params - 请求参数
 * @param {number} params.current - 页码
 */
export const getHotBlogs = (params) => {
  return request.get('/blog/hot', { params })
}

/**
 * 获取当前用户的博客列表
 * @param {Object} params - 请求参数
 * @param {number} params.current - 页码
 */
export const getMyBlogs = (params) => {
  return request.get('/blog/of/me', { params })
}

/**
 * 发布博客
 * @param {Object} data - 博客数据
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {string} data.images - 图片
 * @param {number} data.poiId - 关联地点ID
 */
export const publishBlog = (data) => {
  return request.post('/blog', data)
}

/**
 * 根据ID获取博客详情
 * @param {number} id - 博客ID
 */
export const getBlogById = (id) => {
  return request.get(`/blog/${id}`)
}

/**
 * 点赞/取消点赞博客
 * @param {number} id - 博客ID
 */
export const likeBlog = (id) => {
  return request.put(`/blog/like/${id}`)
}

/**
 * 查询博客点赞列表
 * @param {number} id - 博客ID
 */
export const getBlogLikes = (id) => {
  return request.get(`/blog/likes/${id}`)
}

/**
 * 根据用户ID获取博客列表
 * @param {Object} params - 请求参数
 * @param {number} params.current - 页码
 * @param {number} params.id - 用户ID
 */
export const getBlogsByUserId = (params) => {
  return request.get('/blog/of/user', { params })
}

/**
 * 获取关注用户的博客列表
 * @param {Object} params - 请求参数
 * @param {number} params.lastId - 上次查询的最后一个ID
 * @param {number} params.offset - 偏移量
 */
export const getFollowBlogs = (params) => {
  return request.get('/blog/of/follow', { params })
}
