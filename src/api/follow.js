import request from '@/utils/request'

/**
 * 关注/取消关注用户
 * @param {number} followUserId - 要关注的用户ID
 * @param {boolean} isFollow - true表示关注，false表示取消关注
 */
export const followUser = (followUserId, isFollow) => {
  return request.put(`/follow/${followUserId}/${isFollow}`)
}

/**
 * 查询是否已关注某用户
 * @param {number} followUserId - 要查询的用户ID
 */
export const isFollowUser = (followUserId) => {
  return request.get(`/follow/or/not/${followUserId}`)
}

/**
 * 查询共同关注的用户
 * @param {number} id - 用户ID
 */
export const getCommonFollows = (id) => {
  return request.get(`/follow/common/${id}`)
}
