<template>
  <div class="poi-detail-container">
    <van-nav-bar title="店铺详情" left-arrow @click-left="goBack" fixed placeholder />
    
    <div v-if="poi" class="poi-detail-content">
      <!-- 图片轮播 -->
      <div class="image-carousel">
        <van-swipe :autoplay="3000" indicator-color="white" class="my-swipe">
          <van-swipe-item v-for="(img, index) in imageList" :key="index">
            <img :src="img" class="carousel-image" alt="" />
          </van-swipe-item>
        </van-swipe>
      </div>
      
      <!-- 基本信息 -->
      <div class="poi-info-section">
        <div class="poi-name">{{ poi.name }}</div>
        <div class="poi-tags">
          <span class="tag">人均 ¥{{ poi.avgPrice || 0 }}</span>
          <span class="tag">{{ poi.area }}</span>
        </div>
        <div class="poi-stats">
          <span class="stat">
            <van-icon name="star" color="#ff6a00" />
            {{ poi.score || 4.5 }}分
          </span>
          <span class="stat">已售 {{ poi.sold || 0 }}</span>
        </div>
        <div class="poi-address">
          <van-icon name="location-o" color="#ff6a00" />
          {{ poi.address }}
        </div>
      </div>
      
      <!-- 优惠券列表 -->
      <div class="voucher-section">
        <div class="section-title">优惠券</div>
        <div v-if="voucherList.length > 0" class="voucher-list">
          <div v-for="voucher in voucherList" :key="voucher.id" class="voucher-item">
            <div class="voucher-left">
              <div class="voucher-price">
                <span class="currency">¥</span>
                <span class="value">{{ voucher.discountValue || voucher.denomination || 0 }}</span>
              </div>
              <div class="voucher-condition">
                满{{ voucher.conditions || voucher.condition || 0 }}元可用
              </div>
            </div>
            <div class="voucher-right">
              <div class="voucher-title">{{ voucher.title || voucher.name }}</div>
              <div class="voucher-info">
                {{ voucher.type === 1 ? '普通券' : '秒杀券' }} · 
                剩余{{ voucher.stock || voucher.leftStock || 0 }}张
              </div>
              <van-button 
                type="danger" 
                size="small" 
                round 
                @click="buyVoucher(voucher)"
                :disabled="(voucher.stock || voucher.leftStock || 0) <= 0"
              >
                {{ (voucher.stock || voucher.leftStock || 0) <= 0 ? '已抢光' : '抢购' }}
              </van-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-voucher">
          <p class="empty-text">暂无优惠券</p>
        </div>
      </div>
    </div>
    
    <van-loading v-else size="24px">加载中...</van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPoiById } from '@/api/poi'
import { getVoucherListByPoiId } from '@/api/voucher'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()

const poi = ref(null)
const voucherList = ref([])

const imageList = computed(() => {
  if (!poi.value?.images) return ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop']
  return poi.value.images.split(',').filter(img => img)
})

const loadPoiDetail = async () => {
  try {
    const id = route.params.id
    const res = await getPoiById(id)
    poi.value = res.data
  } catch (error) {
    console.error('加载地点详情失败:', error)
  }
}

const loadVoucherList = async () => {
  try {
    const id = route.params.id
    const res = await getVoucherListByPoiId(id)
    voucherList.value = res.data || []
  } catch (error) {
    console.error('加载优惠券列表失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const buyVoucher = (voucher) => {
  showToast('购买功能开发中...')
}

onMounted(() => {
  loadPoiDetail()
  loadVoucherList()
})
</script>

<style scoped>
.poi-detail-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.poi-detail-content {
  padding-bottom: 20px;
}

.image-carousel {
  width: 100%;
  height: 240px;
  overflow: hidden; /* 新增：裁剪掉任何意外溢出的部分 */
}

/* 新增：强制轮播图组件本身高度与父容器一致 */
.my-swipe {
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poi-info-section {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.poi-name {
  font-size: 20px;
  font-weight: 600;
  color: #323233;
  line-height: 1.4;
  margin-bottom: 12px;
}

.poi-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  font-size: 12px;
  color: #969799;
  background-color: #f7f8fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.poi-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #323233;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.poi-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #323233;
}

.voucher-section {
  background-color: #fff;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voucher-item {
  display: flex;
  background: linear-gradient(90deg, #ff6a00 0%, #ff8c00 100%);
  border-radius: 8px;
  overflow: hidden;
}

.voucher-left {
  width: 100px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 2px dashed rgba(255, 255, 255, 0.5);
}

.voucher-price {
  color: #fff;
  font-weight: 600;
}

.currency {
  font-size: 14px;
}

.value {
  font-size: 28px;
}

.voucher-condition {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.voucher-right {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.voucher-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.voucher-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.empty-voucher {
  padding: 20px 0;
  text-align: center;
}

.empty-text {
  color: #969799;
  font-size: 14px;
  margin: 0;
}
</style>
