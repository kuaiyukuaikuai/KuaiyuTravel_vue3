import request from '@/utils/request'

/**
 * 上传博客图片
 * @param {FormData} formData - 表单数据，包含 file
 */
export const uploadBlogImage = (formData) => {
  return request.post('/upload/blog', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
