import request from '@/utils/request'

/**
 * 根据地点ID查询优惠券列表
 * @param {number} poiId - 地点ID
 */
export const getVoucherListByPoiId = (poiId) => {
  return request.get(`/voucher/list/${poiId}`)
}

/**
 * 购买普通优惠券
 * @param {number} voucherId - 优惠券ID
 */
export const buyCommonVoucher = (voucherId) => {
  return request.post(`/voucher-order/common/${voucherId}`)
}

/**
 * 购买秒杀优惠券
 * @param {number} voucherId - 优惠券ID
 */
export const buySeckillVoucher = (voucherId) => {
  return request.post(`/voucher-order/seckill/${voucherId}`)
}
