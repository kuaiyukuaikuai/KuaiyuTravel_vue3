import request from '@/utils/request'

/**
 * 获取POI类型列表
 */
export const getPoiTypeList = () => {
  return request.get('/poi-type/list')
}
