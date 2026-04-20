<template>
  <div class="poi-list-container">
    <van-nav-bar :title="title" left-arrow @click-left="goBack" fixed placeholder />
    
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="listLoading"
        :finished="!hasMore"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="poi-list">
          <div v-for="item in poiList" :key="item.id" class="poi-item" @click="goToPoiDetail(item.id)">
            <img v-if="item.images" :src="item.images.split(',')[0]" class="poi-image" alt="" />
            <img v-else src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop" class="poi-image" alt="" />
            <div class="poi-info">
              <div class="poi-name">{{ item.name }}</div>
              <div class="poi-area">{{ item.area }} · {{ item.address }}</div>
              <div class="poi-stats">
                <span class="poi-score">评分 {{ item.score || 4.5 }}</span>
                <span class="poi-sold">已售 {{ item.sold || 0 }}</span>
                <span class="poi-price">人均 ¥{{ item.avgPrice || 0 }}</span>
                <span v-if="item.distance" class="poi-distance">距离 {{ item.distance.toFixed(2) }}km</span>
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
import { getPoiByType } from '@/api/poi'
import locationUtil from '@/utils/location'

const route = useRoute()
const router = useRouter()

const poiList = ref([])
const current = ref(1)
const listLoading = ref(false) // 专供 van-list 使用的 loading 状态
const hasMore = ref(true)
const refreshing = ref(false)
const PAGE_SIZE = 5

const title = computed(() => route.query.title || '分类列表')
const typeId = computed(() => route.query.typeId)

const goBack = () => {
  router.back()
}

const goToPoiDetail = (id) => {
  if (id) {
    router.push(`/poi-detail/${id}`)
  }
}

// 核心加载逻辑
const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    current.value = 1
    hasMore.value = true
  }
  
  try {
    const params = {
      typeId: typeId.value,
      current: current.value
    }

    try {
      const location = await locationUtil.getCurrentLocation()
      if (location && location.longitude && location.latitude) {
        params.x = location.longitude
        params.y = location.latitude
      }
    } catch (locError) {
      console.warn('获取位置失败:', locError)
    }

    const res = await getPoiByType(params)

    let newRecords = []
    if (res.data) {
      if (Array.isArray(res.data)) {
        newRecords = res.data
      } else if (res.data.records && Array.isArray(res.data.records)) {
        newRecords = res.data.records
      } else if (res.data.list && Array.isArray(res.data.list)) {
        newRecords = res.data.list
      }
    }

    if (isRefresh) {
      poiList.value = newRecords
    } else {
      const existingIds = new Set(poiList.value.map(item => item.id))
      const uniqueNewRecords = newRecords.filter(item => item && item.id && !existingIds.has(item.id))
      poiList.value.push(...uniqueNewRecords)
    }

    // 判断是否还有更多数据
    if (newRecords.length < PAGE_SIZE) {
      hasMore.value = false
    } else {
      current.value++
    }
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    listLoading.value = false // 必须手动置为 false，van-list 才能准备下一次加载
    refreshing.value = false
  }
}

// 供 van-list 调用的触底加载方法
const onLoad = () => {
  if (!hasMore.value) return
  loadData(false)
}

// 下拉刷新方法
const onRefresh = () => {
  refreshing.value = true
  hasMore.value = true
  listLoading.value = true
  loadData(true)
}

let lastTypeId = ref(null)

watch(() => route.query.typeId, (newTypeId) => {
  if (newTypeId && newTypeId !== lastTypeId.value) {
    lastTypeId.value = newTypeId
    poiList.value = [] // 清空旧数据
    // 切换分类时，让 van-list 自动触发第一次加载，这里无需手动调用 loadData
    hasMore.value = true
    listLoading.value = true
    loadData(true)
  }
}, { immediate: true })

// ⚠️ 注意：移除了 onMounted 和 onUnmounted 中的手写 scroll 监听！
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
  flex-wrap: wrap;
}

.poi-score,
.poi-sold,
.poi-price,
.poi-distance {
  font-size: 12px;
  color: #ff6a00;
}

.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #969799;
  font-size: 14px;
}
</style>
