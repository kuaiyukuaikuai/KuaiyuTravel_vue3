<template>
  <div class="home-container">
    <div class="search-bar">
      <div class="location" @click="retryLocation">
        <span class="location-text">{{ currentLocation.city || currentLocation.name }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="search-input">
        <van-icon name="search" size="16" color="#999" />
        <span class="search-placeholder">请输入商户名、地点</span>
      </div>
      <div class="message-btn" @click="goToMessage">
        <van-icon name="chat-o" size="20" color="#fff" />
      </div>
      <div class="user-avatar" @click="goToProfile">
        <van-icon name="user-o" size="20" color="#fff" />
      </div>
    </div>

    <div class="category-section">
      <van-grid :column-num="5" :border="false" class="category-grid">
        <van-grid-item
          v-for="item in categoryList"
          :key="item.id"
          :icon="item.icon || 'apps-o'"
          :text="item.name"
          @click="onCategoryClick(item)"
        />
      </van-grid>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="waterfall-container">
          <div class="waterfall-column">
            <div
              v-for="(item, index) in leftList"
              :key="item.id"
              class="card-item"
              @click="goToBlogDetail(item.id)"
            >
              <img :src="item.image" class="card-image" alt="" />
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-footer">
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
          <div class="waterfall-column">
            <div
              v-for="(item, index) in rightList"
              :key="item.id"
              class="card-item"
              @click="goToBlogDetail(item.id)"
            >
              <img :src="item.image" class="card-image" alt="" />
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-footer">
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
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPoiTypeList } from '@/api/poiType'
import { getHotBlogs, likeBlog } from '@/api/blog'
import { getCurrentUser } from '@/api/user'
import locationUtil from '@/utils/location'
import { showToast } from 'vant'

const router = useRouter()
const categoryList = ref([])
const blogList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const current = ref(1)
const currentLocation = ref({})
const currentUser = ref(null) // 当前登录用户
const PAGE_SIZE = 10

const defaultCategories = [
  { id: 1, name: '美食', icon: 'apps-o' },
  { id: 2, name: 'KTV', icon: 'apps-o' },
  { id: 3, name: '丽人·美发', icon: 'apps-o' },
  { id: 4, name: '美甲·美睫', icon: 'apps-o' },
  { id: 5, name: '按摩·足疗', icon: 'apps-o' },
  { id: 6, name: '美容SPA', icon: 'apps-o' },
  { id: 7, name: '亲子游乐', icon: 'apps-o' },
  { id: 8, name: '酒吧', icon: 'apps-o' },
  { id: 9, name: '轰趴馆', icon: 'apps-o' },
  { id: 10, name: '健身运动', icon: 'apps-o' }
]

const leftList = computed(() => {
  return blogList.value.filter((_, index) => index % 2 === 0)
})

const rightList = computed(() => {
  return blogList.value.filter((_, index) => index % 2 !== 0)
})

const loadLocation = async () => {
  try {
    const location = await locationUtil.getCurrentLocation()
    currentLocation.value = location
  } catch (error) {
    console.error('加载位置失败:', error)
    currentLocation.value = locationUtil.getDefaultLocation()
  }
}

const retryLocation = () => {
  showToast('正在重新定位...')
  loadLocation()
}

const loadCategoryList = async () => {
  try {
    const res = await getPoiTypeList()
    if (res.data && res.data.length > 0) {
      categoryList.value = res.data.map((item, index) => ({
        ...item,
        icon: defaultCategories[index]?.icon || 'apps-o'
      }))
    } else {
      categoryList.value = defaultCategories
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    categoryList.value = defaultCategories
  }
}

const onLoad = async () => {
  try {
    const res = await getHotBlogs({
      current: current.value
    })

    if (res.data && res.data.length > 0) {
      const newBlogs = res.data.map(item => ({
        ...item,
        image: item.images ? item.images.split(',')[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop'
      }))

      // 核心修复1：数组去重（只把当前 blogList 里没有的 id 加进去）
      const uniqueBlogs = newBlogs.filter(newBlog => 
        !blogList.value.some(existingBlog => existingBlog.id === newBlog.id)
      )

      // 🚨 修复点A：这里一定要改成 push 过滤后的 uniqueBlogs！
      blogList.value.push(...uniqueBlogs)
      
      // 🚨 修复点B：彻底打断死循环的终极防线
      // 如果去重后的数组是空的（说明后端全返回了重复数据），或者返回数据少于一页，就宣告加载完毕
      if (uniqueBlogs.length === 0 || res.data.length < PAGE_SIZE) {
        finished.value = true
      } else {
        // 只有真的加载到了新的不重复数据，才允许页码 +1
        current.value++
      }

    } else {
      // 后端直接返回空数据，也宣告结束
      finished.value = true
    }
  } catch (error) {
    console.error('加载博客失败:', error)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  // 【核心修复：防并发】先手动开启 loading，阻止 van-list 自动触发
  loading.value = true
  
  current.value = 1
  finished.value = false
  
  // 然后再清空数据
  blogList.value = []
  
  // 手动拉取第一页数据
  await onLoad()
  
  // 关闭下拉刷新动画
  refreshing.value = false
}

const onCategoryClick = (item) => {
  router.push({
    path: '/poi-list',
    query: {
      typeId: item.id,
      title: item.name
    }
  })
}

const goToBlogDetail = (id) => {
  if (id) {
    router.push(`/blog-detail/${id}`)
  }
}

const goToMessage = () => {
  router.push('/message')
}

const goToProfile = () => {
  router.push('/profile')
}

const loadCurrentUser = async () => {
  try {
    const res = await getCurrentUser()
    currentUser.value = res.data
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
}

const goToUserProfile = (userId) => {
  if (userId) {
    // 检查是否是自己
    if (currentUser.value && currentUser.value.id === userId) {
      // 跳转到个人主页
      router.push('/profile')
    } else {
      // 跳转到通用用户主页
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
  loadCategoryList()
  loadLocation()
  loadCurrentUser()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.search-bar {
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  padding: 10px 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.location {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
}

.location-text {
  margin-right: 4px;
}

.search-input {
  flex: 1;
  background-color: #fff;
  border-radius: 20px;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.search-placeholder {
  color: #969799;
  font-size: 14px;
}

.message-btn,
.user-avatar {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.message-btn {
  margin-right: 8px;
}

.category-section {
  background-color: #fff;
  padding: 16px 0;
}

.category-grid :deep(.van-grid-item__content) {
  padding: 8px 0;
}

.category-grid :deep(.van-grid-item__icon) {
  margin-bottom: 6px;
}

.category-grid :deep(.van-grid-item__text) {
  font-size: 12px;
  color: #323233;
}

.waterfall-container {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  /* 👇 加上这两行保底配置 */
  min-height: 150px; 
  background-color: #f2f3f5; 
  
  display: block;
  object-fit: cover; /* 保证图片不变形 */
}

.card-content {
  padding: 10px;
}

.card-title {
  font-size: 13px;
  color: #323233;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
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
</style>
