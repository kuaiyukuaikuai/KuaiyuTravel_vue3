import request from '@/utils/request'

/**
 * 根据类型查询POI列表
 * @param {Object} params - 请求参数
 * @param {number} params.typeId - 类型ID
 * @param {number} params.current - 页码
 * @param {number} params.x - 经度（可选）
 * @param {number} params.y - 纬度（可选）
 */
export const getPoiByType = (params) => {
  return request.get('/poi/of/type', { params })
}

/**
 * 根据ID查询POI详情
 * @param {number} id - POI ID
 */
export const getPoiById = (id) => {
  return request.get(`/poi/${id}`)
}

/**
 * 新增POI
 * @param {Object} data - POI数据
 */
export const savePoi = (data) => {
  return request.post('/poi', data)
}

/**
 * 更新POI
 * @param {Object} data - POI数据
 */
export const updatePoi = (data) => {
  return request.put('/poi', data)
}

/**
 * 根据名称查询POI
 * @param {Object} params - 请求参数
 * @param {string} params.name - 名称关键字
 * @param {number} params.current - 页码
 */
export const getPoiByName = (params) => {
  return request.get('/poi/of/name', { params })
}
