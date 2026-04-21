<template>
  <div class="profile-container">
    <van-nav-bar title="个人主页" left-arrow @click-left="goBack" />
    
    <div class="user-info-section">
      <div class="logout-btn" @click="handleLogout">
        退出登录
      </div>
      
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
      
      <van-button round size="small" class="edit-btn" @click="goToEditProfile">编辑资料</van-button>
      
      <div class="intro-text">添加个人简介，让大家更好的认识你 ✍️</div>
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
              <div v-for="item in myBlogs" :key="item.id" class="note-card">
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
              
              <div v-if="myBlogs.length === 0 && !loading" class="empty-state">
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getCurrentUser, logout } from '@/api/user'
import { getMyBlogs } from '@/api/blog'

const router = useRouter()
const activeTab = ref('notes')
const userInfo = ref({})

const myBlogs = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const current = ref(1)
const PAGE_SIZE = 10

const goBack = () => {
  router.back()
}

const goToEditProfile = () => {
  router.push('/edit-profile')
}

const loadUserInfo = async () => {
  try {
    const res = await getCurrentUser()
    if (res.data) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const onLoad = async () => {
  try {
    const res = await getMyBlogs({
      current: current.value
    })
    
    if (res.data && res.data.length > 0) {
      const newBlogs = res.data.map(item => ({
        id: item.id,
        image: item.images ? item.images.split(',')[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        title: item.title,
        comments: item.comments || 0,
        liked: item.liked || 0
      }))
      
      myBlogs.value.push(...newBlogs)
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
  // 1. 先开启 loading，锁住并发请求
  loading.value = true
  
  // 2. 重置分页参数
  current.value = 1
  finished.value = false
  
  // 3. 清空数据
  myBlogs.value = []
  
  // 4. 手动拉取数据
  await onLoad()
  
  // 5. 关闭下拉动画
  refreshing.value = false
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('退出登录失败:', error)
  }
  localStorage.removeItem('token')
  showToast('已退出登录')
  router.push('/login')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.user-info-section {
  background-color: #fff;
  padding: 16px;
  position: relative;
}

.logout-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  color: #fff;
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 16px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
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

.edit-btn {
  margin-top: 12px;
  width: 100%;
  color: #323233;
  background-color: #fff;
  border: 1px solid #ebedf0;
}

.intro-text {
  margin-top: 12px;
  font-size: 13px;
  color: #969799;
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
