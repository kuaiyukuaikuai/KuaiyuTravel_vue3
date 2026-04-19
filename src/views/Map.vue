<template>
  <div class="map-container">
    <van-nav-bar title="地图" />
    <div class="map-content">
      <div class="placeholder-text">地图页面</div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.map-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.map-content {
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
