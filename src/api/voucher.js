import request from '@/utils/request'

/**
 * 根据地点ID查询优惠券列表
 * @param {number} poiId - 地点ID
 */
export const getVoucherListByPoiId = (poiId) => {
  return request.get(`/voucher/list/${poiId}`)
}
