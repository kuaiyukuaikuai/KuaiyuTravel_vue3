import request from '@/utils/request'

/**
 * 上传博客图片
 * @param {FormData} formData - 表单数据，包含 file
 */
export const uploadBlogImage = (formData) => {
  return request.post('/upload/blogs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传头像
 * @param {FormData} formData - 表单数据，包含 file
 */
export const uploadIcon = (formData) => {
  return request.post('/upload/icons', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
