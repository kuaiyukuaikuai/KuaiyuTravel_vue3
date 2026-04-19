<template>
  <div class="layout-container">
    <div class="main-content">
      <router-view />
    </div>
    <van-tabbar v-model="active" class="custom-tabbar">
      <van-tabbar-item name="0" icon="home-o" @click="router.push('/')">首页</van-tabbar-item>
      <van-tabbar-item name="1" icon="location-o" @click="router.push('/map')">地图</van-tabbar-item>
      <van-tabbar-item class="publish-btn" @click="goPublish">
        <div class="publish-icon">
          <van-icon name="plus" size="28" color="#fff" />
        </div>
      </van-tabbar-item>
      <van-tabbar-item name="3" icon="chat-o" @click="router.push('/message')">消息</van-tabbar-item>
      <van-tabbar-item name="4" icon="user-o" @click="router.push('/profile')">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const active = ref(0)

const goPublish = () => {
  router.push('/publish')
}

watch(() => route.path, (newPath) => {
  if (newPath === '/') active.value = 0
  else if (newPath === '/map') active.value = 1
  else if (newPath === '/message') active.value = 3
  else if (newPath === '/profile') active.value = 4
}, { immediate: true })
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.publish-btn {
  position: relative;
}

.publish-btn :deep(.van-tabbar-item__icon) {
  display: none;
}

.publish-icon {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 106, 0, 0.4);
  border: 4px solid #fff;
}
</style>
