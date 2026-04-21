<template>
  <div class="user-profile-container">
    <van-nav-bar title="用户主页" left-arrow @click-left="goBack" />
    
    <div class="user-info-section" v-if="userInfo">
      <div class="user-info">
        <div class="avatar-wrapper">
          <img v-if="userInfo.icon" :src="userInfo.icon" class="avatar" alt="头像" />
          <div v-else class="avatar-placeholder">
            <van-icon name="user-o" size="48" color="#fff" />
          </div>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userInfo.nickName || '用户' }}</div>
          <div class="location-tag">杭州</div>
        </div>
      </div>
      
      <van-button 
        v-if="!isCurrentUser"
        round 
        size="small" 
        class="follow-btn"
        :type="isFollow ? 'default' : 'danger'"
        @click="toggleFollow"
        :loading="followLoading"
      >
        {{ isFollow ? '已关注' : '+ 关注' }}
      </van-button>
      
      <van-button v-else round size="small" class="edit-btn">编辑资料</van-button>
      
      <div class="intro-text">{{ userInfo.intro || '这个人很懒，什么都没留下' }}</div>
      
      <!-- 共同关注区域 -->
      <div class="common-follows-section" v-if="!isCurrentUser && commonFollows.length > 0">
        <div class="section-title">共同关注（{{ commonFollows.length }}）</div>
        <div class="common-follows-list">
          <div v-for="user in commonFollows" :key="user.id" class="common-follow-item" @click="goToUserProfile(user.id)">
            <img v-if="user.icon" :src="user.icon" class="common-follow-avatar" alt="" />
            <div v-else class="common-follow-avatar-placeholder">
              <van-icon name="user-o" size="14" color="#fff" />
            </div>
            <span class="common-follow-name">{{ user.nickName || '用户' }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" class="profile-tabs">
      <van-tab title="笔记" name="notes">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div class="notes-list">
              <div v-for="item in blogs" :key="item.id" class="note-card" @click="goToBlogDetail(item.id)">
                <img :src="item.image" class="note-image" alt="" />
                <div class="note-content">
                  <div class="note-title">{{ item.title }}</div>
                  <div class="note-footer">
                    <div class="note-comment">
                      <van-icon name="chat-o" size="16" color="#969799" />
                      <span>{{ item.comments }}</span>
                    </div>
                    <div class="note-likes">
                      <van-icon name="like-o" size="16" color="#969799" />
                      <span>{{ item.liked }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="blogs.length === 0 && !loading" class="empty-state">
                <van-icon name="description" size="64" color="#ddd" />
                <div class="empty-text">暂无笔记</div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
      
      <van-tab title="评价" name="reviews">
        <div class="empty-state">
          <van-icon name="description" size="64" color="#ddd" />
          <div class="empty-text">暂无评价</div>
        </div>
      </van-tab>
      
      <van-tab title="粉丝" name="fans">
        <div class="empty-state">
          <van-icon name="description" size="64" color="#ddd" />
          <div class="empty-text">暂无粉丝</div>
        </div>
      </van-tab>
      
      <van-tab title="关注" name="following">
        <div class="empty-state">
          <van-icon name="description" size="64" color="#ddd" />
          <div class="empty-text">暂无关注</div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getCurrentUser, getUserById, getUserInfoById } from '@/api/user'
import { getMyBlogs, getBlogsByUserId } from '@/api/blog'
import { isFollowUser, followUser, getCommonFollows } from '@/api/follow'

const router = useRouter()
const route = useRoute()

const activeTab = ref('notes')
const userInfo = ref({})
const userDetailInfo = ref({})
const blogs = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const current = ref(1)
const isFollow = ref(false)
const followLoading = ref(false)
const commonFollows = ref([]) // 共同关注列表
const currentUser = ref(null) // 当前登录用户
const PAGE_SIZE = 10

const userId = computed(() => route.params.id)
const isCurrentUser = computed(() => !userId.value)

const goBack = () => {
  router.back()
}

const goToBlogDetail = (id) => {
  if (id) {
    router.push(`/blog-detail/${id}`)
  }
}

const goToUserProfile = (id) => {
  if (id) {
    // 检查是否是自己
    if (currentUser.value && currentUser.value.id === id) {
      // 跳转到个人主页
      router.push('/profile')
    } else {
      // 跳转到通用用户主页
      router.push(`/user-profile/${id}`)
    }
  }
}

const loadCommonFollows = async () => {
  try {
    if (!isCurrentUser.value && userId.value) {
      const res = await getCommonFollows(userId.value)
      commonFollows.value = res.data || []
    }
  } catch (error) {
    console.error('加载共同关注失败:', error)
  }
}

const loadUserInfo = async () => {
  try {
    // 加载当前登录用户信息
    const currentRes = await getCurrentUser()
    currentUser.value = currentRes.data
    
    let res
    if (isCurrentUser.value) {
      res = await getCurrentUser()
    } else {
      res = await getUserById(userId.value)
    }
    
    if (res.data) {
      userInfo.value = res.data
      
      // 加载用户详情信息
      const detailRes = await getUserInfoById(userInfo.value.id)
      if (detailRes.data) {
        userDetailInfo.value = detailRes.data
      }
      
      // 如果不是当前用户，查询关注状态和共同关注
      if (!isCurrentUser.value) {
        await loadFollowStatus()
        await loadCommonFollows()
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const loadFollowStatus = async () => {
  try {
    const res = await isFollowUser(userId.value)
    isFollow.value = res.data || false
  } catch (error) {
    console.error('获取关注状态失败:', error)
  }
}

const toggleFollow = async () => {
  try {
    followLoading.value = true
    const res = await followUser(userId.value, !isFollow.value)
    if (res.success) {
      isFollow.value = !isFollow.value
      showToast(isFollow.value ? '关注成功' : '取消关注')
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    showToast(error.message || '操作失败，请稍后重试')
  } finally {
    followLoading.value = false
  }
}

const onLoad = async () => {
  try {
    let res
    if (isCurrentUser.value) {
      res = await getMyBlogs({
        current: current.value
      })
    } else {
      res = await getBlogsByUserId({
        current: current.value,
        id: userId.value
      })
    }
    
    if (res.data && res.data.length > 0) {
      const newBlogs = res.data.map(item => ({
        id: item.id,
        image: item.images ? item.images.split(',')[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        title: item.title,
        comments: item.comments || 0,
        liked: item.liked || 0
      }))
      
      blogs.value.push(...newBlogs)
      current.value++
      
      if (res.data.length < PAGE_SIZE) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载用户博客失败:', error)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  current.value = 1
  blogs.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-info-section {
  background-color: #fff;
  padding: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.location-tag {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #969799;
  background-color: #f7f8fa;
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;
}

.follow-btn,
.edit-btn {
  margin-top: 12px;
  width: 100%;
  color: #323233;
  background-color: #fff;
  border: 1px solid #ebedf0;
}

.follow-btn.van-button--danger {
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  border: none;
  color: #fff;
}

.intro-text {
  margin-top: 12px;
  font-size: 13px;
  color: #969799;
}

.common-follows-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.common-follows-section .section-title {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.common-follows-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.common-follow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.common-follow-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.common-follow-avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.common-follow-name {
  font-size: 12px;
  color: #646566;
}

.profile-tabs {
  margin-top: 8px;
  background-color: #fff;
}

.profile-tabs :deep(.van-tabs__nav) {
  background-color: #fff;
}

.profile-tabs :deep(.van-tab) {
  color: #646566;
  font-size: 14px;
}

.profile-tabs :deep(.van-tab--active) {
  color: #323233;
  font-weight: 600;
}

.profile-tabs :deep(.van-tabs__line) {
  background-color: #ff6a00;
  width: 24px;
}

.notes-list {
  padding: 12px;
  background-color: #f7f8fa;
}

.note-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.note-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.note-content {
  padding: 12px;
}

.note-title {
  font-size: 14px;
  color: #323233;
  line-height: 1.5;
}

.note-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
}

.note-comment,
.note-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #969799;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background-color: #f7f8fa;
}

.empty-text {
  margin-top: 12px;
  font-size: 14px;
  color: #969799;
}
</style>
