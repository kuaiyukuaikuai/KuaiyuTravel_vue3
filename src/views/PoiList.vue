<template>
  <div class="poi-list-container">
    <van-nav-bar :title="title" left-arrow @click-left="goBack" />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="poi-list">
          <div v-for="item in poiList" :key="item.id" class="poi-item">
            <img v-if="item.images" :src="item.images.split(',')[0]" class="poi-image" alt="" />
            <img v-else src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" class="poi-image" alt="" />
            <div class="poi-info">
              <div class="poi-name">{{ item.name }}</div>
              <div class="poi-area">{{ item.area }} · {{ item.address }}</div>
              <div class="poi-stats">
                <span class="poi-score">评分 {{ item.score || 4.5 }}</span>
                <span class="poi-sold">已售 {{ item.sold || 0 }}</span>
                <span class="poi-price">人均 ¥{{ item.avgPrice || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const poiList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const current = ref(1)
const PAGE_SIZE = 10

const title = computed(() => {
  return route.query.title || '分类列表'
})

const typeId = computed(() => {
  return route.query.typeId
})

const goBack = () => {
  router.back()
}

const onLoad = async () => {
  try {
    const res = await request.get('/poi/of/type', {
      params: {
        typeId: typeId.value,
        current: current.value
      }
    })
    
    const newRecords = res.data?.records || res.data || []
    
    poiList.value.push(...newRecords)
    
    if (newRecords.length === 0 || newRecords.length < PAGE_SIZE) {
      finished.value = true
    } else {
      current.value++
    }
  } catch (error) {
    console.error('加载列表失败', error)
    finished.value = true
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  current.value = 1
  poiList.value = []
  finished.value = false
  await onLoad()
  refreshing.value = false
}

watch(() => route.query.typeId, () => {
  poiList.value = []
  current.value = 1
  finished.value = false
})
</script>

<style scoped>
.poi-list-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.poi-list {
  padding: 12px;
}

.poi-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}

.poi-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.poi-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.poi-name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
}

.poi-area {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poi-stats {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.poi-score,
.poi-sold,
.poi-price {
  font-size: 12px;
  color: #ff6a00;
}
</style>
