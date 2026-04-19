<template>
  <div class="home-container">
    <div class="search-bar">
      <div class="location">
        <span class="location-text">杭州</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="search-input">
        <van-icon name="search" size="16" color="#999" />
        <span class="search-placeholder">请输入商户名、地点</span>
      </div>
      <div class="user-avatar">
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
            >
              <img :src="item.image" class="card-image" alt="" />
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-footer">
                  <div class="user-info">
                    <img v-if="item.icon" :src="item.icon" class="user-avatar-img" alt="" />
                    <div v-else class="user-avatar-small">
                      <van-icon name="user-o" size="14" color="#fff" />
                    </div>
                    <span class="user-name">{{ item.name || '用户' }}</span>
                  </div>
                  <div class="likes">
                    <van-icon name="like-o" :size="14" :color="item.isLike ? '#ff6a00' : '#969799'" />
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
            >
              <img :src="item.image" class="card-image" alt="" />
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-footer">
                  <div class="user-info">
                    <img v-if="item.icon" :src="item.icon" class="user-avatar-img" alt="" />
                    <div v-else class="user-avatar-small">
                      <van-icon name="user-o" size="14" color="#fff" />
                    </div>
                    <span class="user-name">{{ item.name || '用户' }}</span>
                  </div>
                  <div class="likes">
                    <van-icon name="like-o" :size="14" :color="item.isLike ? '#ff6a00' : '#969799'" />
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
import request from '@/utils/request'

const router = useRouter()
const categoryList = ref([])
const blogList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const current = ref(1)
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

const loadCategoryList = async () => {
  try {
    const res = await request.get('/poi-type/list')
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
    const res = await request.get('/blog/hot', {
      params: {
        current: current.value
      }
    })

    if (res.data && res.data.length > 0) {
      const newBlogs = res.data.map(item => ({
        ...item,
        image: item.images ? item.images.split(',')[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop'
      }))
      blogList.value.push(...newBlogs)
      current.value++

      if (res.data.length < PAGE_SIZE) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('加载博客失败:', error)
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  current.value = 1
  blogList.value = []
  finished.value = false
  await onLoad()
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

onMounted(() => {
  loadCategoryList()
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

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: block;
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
