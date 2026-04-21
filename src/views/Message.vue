<template>
  <div class="message-container">
    <van-nav-bar title="消息" left-arrow @click-left="goBack" />
    
    <div class="message-content">
      <van-cell-group inset>
        <van-cell title="私信" is-link @click="handlePrivateMessage" />
        <van-cell title="新动态" is-link @click="goToFollowBlogs" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const handlePrivateMessage = () => {
  // 私信功能暂时不用做
}

const goToFollowBlogs = () => {
  router.push('/follow-blogs')
}
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.message-content {
  padding-top: 16px;
}
</style>
