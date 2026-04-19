<template>
  <div class="message-container">
    <van-nav-bar title="消息" />
    <div class="message-content">
      <div class="placeholder-text">消息页面</div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.message-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
}

.placeholder-text {
  font-size: 20px;
  color: #969799;
}
</style>
