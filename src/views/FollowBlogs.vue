<template>
  <div class="follow-blogs-container">
    <van-nav-bar title="新动态" left-arrow @click-left="goBack" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-if="blogList.length === 0 && !loading" class="empty-state">
          <van-icon name="description" size="64" color="#ddd" />
          <div class="empty-text">暂无新动态</div>
        </div>
        
        <div class="blog-list">
          <div
            v-for="item in blogList"
            :key="item.id"
            class="blog-card"
            @click="goToBlogDetail(item.id)"
          >
            <img :src="item.image" class="blog-image" alt="" />
            <div class="blog-content">
              <div class="blog-title">{{ item.title }}</div>
              <div class="blog-footer">
                <div class="user-info" @click.stop="goToUserProfile(item.userId)">
                  <img v-if="item.icon" :src="item.icon" class="user-avatar-img" alt="" />
                  <div v-else class="user-avatar-small">
                    <van-icon name="user-o" size="14" color="#fff" />
                  </div>
                  <span class="user-name">{{ item.name || '用户' }}</span>
                </div>
                <div class="likes" @click.stop="handleLike(item)">
                  <van-icon :name="item.isLike ? 'like' : 'like-o'" :size="14" :color="item.isLike ? '#ff6a00' : '#969799'" />
                  <span>{{ item.liked || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFollowBlogs, likeBlog } from '@/api/blog'
import { getCurrentUser } from '@/api/user'
import { showToast } from 'vant'

const router = useRouter()

const blogList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const lastId = ref(0)
const offset = ref(0)
const currentUser = ref(null)
const PAGE_SIZE = 10

const goBack = () => {
  router.back()
}

const loadCurrentUser = async () => {
  try {
    const res = await getCurrentUser()
    currentUser.value = res.data
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
}

const onLoad = async () => {
  try {
    // 【修复1】第一次请求时，lastId 默认为 0，我们把它替换为当前时间戳
    const currentMax = lastId.value === 0 ? Date.now() : lastId.value;

    const res = await getFollowBlogs({
      lastId: currentMax,
      offset: offset.value
    })

    // 【修复2】后端返回的是 ScrollResult 对象，数组存放在 res.data.list 中
    if (res.data && res.data.list && res.data.list.length > 0) {
      const newBlogs = res.data.list.map(item => ({
        ...item,
        image: item.images ? item.images.split(',')[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop'
      }))
      blogList.value.push(...newBlogs)
      
      // 【修复3】ZSet 分页必须使用后端计算好的 minTime 和 offset！！！
      lastId.value = res.data.minTime; // 下一次查询的最高分数（时间戳）
      offset.value = res.data.offset;  // 相同分数偏移量

      if (newBlogs.length < PAGE_SIZE) {
        finished.value = true
      }
    } else {
      // 没查到数据，结束加载
      finished.value = true
    }
  } catch (error) {
    console.error('加载关注博客失败:', error)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  // 【核心修复：防止 van-list 自动触发导致并发请求】
  // 必须先把 loading 设为 true，封死 van-list 的自动检测机制
  loading.value = true;
  
  // 重置分页参数（使用 Date.now() 或者 0 都可以，因为 onLoad 里有兜底）
  lastId.value = 0; 
  offset.value = 0;
  finished.value = false;
  
  // 清空原有数据
  blogList.value = [];
  
  // 手动调用加载获取最新数据
  await onLoad();
  
  // 关闭顶部下拉刷新的加载圈
  refreshing.value = false;
}

const goToBlogDetail = (id) => {
  if (id) {
    router.push(`/blog-detail/${id}`)
  }
}

const goToUserProfile = (userId) => {
  if (userId) {
    if (currentUser.value && currentUser.value.id === userId) {
      router.push('/profile')
    } else {
      router.push(`/user-profile/${userId}`)
    }
  }
}

const handleLike = async (item) => {
  try {
    const res = await likeBlog(item.id)
    if (res.success) {
      item.isLike = !item.isLike
      if (item.isLike) {
        item.liked = (item.liked || 0) + 1
      } else {
        item.liked = Math.max(0, (item.liked || 0) - 1)
      }
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    showToast(error.message || '操作失败，请稍后重试')
  }
}

onMounted(() => {
  loadCurrentUser()
})
</script>

<style scoped>
.follow-blogs-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.blog-list {
  padding: 8px;
}

.blog-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.blog-image {
  width: 100%;
  display: block;
}

.blog-content {
  padding: 10px;
}

.blog-title {
  font-size: 13px;
  color: #323233;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-avatar-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-small {
  width: 20px;
  height: 20px;
  background-color: #ff6a00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 12px;
  color: #969799;
}

.likes {
  display: flex;
  align-items: center;
  gap: 2px;
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
