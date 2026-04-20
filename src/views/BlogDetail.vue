<template>
  <div class="blog-detail-container">
    <van-nav-bar title="笔记详情" left-arrow @click-left="goBack" fixed placeholder />
    
    <div class="blog-content" v-if="blog">
      <!-- 用户信息 -->
      <div class="user-section">
        <img v-if="blog.icon" :src="blog.icon" class="user-avatar" alt="" />
        <div v-else class="user-avatar-placeholder">
          <van-icon name="user-o" size="20" color="#fff" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ blog.name || '用户' }}</div>
        </div>
      </div>
      
      <!-- 标题 -->
      <div class="blog-title">{{ blog.title }}</div>
      
      <!-- 图片列表 -->
      <div class="image-list" v-if="blog.images">
        <img 
          v-for="(img, index) in imageList" 
          :key="index" 
          :src="img" 
          class="detail-image" 
          alt="" 
        />
      </div>
      
      <!-- 内容 -->
      <div class="blog-text">{{ blog.content }}</div>
      
      <!-- 关联地点 -->
      <div class="poi-section" v-if="blog.poiId">
        <van-cell 
          :title="blog.poiId" 
          :value="blog.poiId" 
          is-link 
          @click="goToPoi(blog.poiId)"
        />
      </div>
      
      <!-- 互动区域 -->
      <div class="interaction-section">
        <div class="like-btn" @click="toggleLike">
          <van-icon :name="blog.isLike ? 'like' : 'like-o'" :color="blog.isLike ? '#ff6a00' : '#969799'" size="20" />
          <span>{{ blog.liked || 0 }}</span>
        </div>
      </div>
    </div>
    
    <van-loading v-else size="24px">加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlogById } from '@/api/blog'

const route = useRoute()
const router = useRouter()

const blog = ref(null)

const imageList = computed(() => {
  if (!blog.value?.images) return []
  return blog.value.images.split(',').filter(img => img)
})

const loadBlogDetail = async () => {
  try {
    const id = route.params.id
    const res = await getBlogById(id)
    blog.value = res.data
  } catch (error) {
    console.error('加载博客详情失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const goToPoi = (id) => {
  if (id) {
    router.push(`/poi-detail/${id}`)
  }
}

const toggleLike = () => {
  // 点赞功能后续实现
  console.log('点赞')
}

onMounted(() => {
  loadBlogDetail()
})
</script>

<style scoped>
.blog-detail-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.blog-content {
  background-color: #fff;
  padding: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.blog-title {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.5;
  margin-bottom: 16px;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-image {
  width: 100%;
  border-radius: 8px;
}

.blog-text {
  font-size: 15px;
  color: #323233;
  line-height: 1.8;
  margin-bottom: 16px;
}

.poi-section {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.interaction-section {
  display: flex;
  justify-content: flex-start;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #f7f8fa;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #323233;
}
</style>
