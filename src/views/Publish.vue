<template>
  <div class="publish-container">
    <van-nav-bar>
      <template #left>
        <span class="nav-cancel" @click="goBack">取消</span>
      </template>
      <template #title>发笔记</template>
      <template #right>
        <van-button 
          class="nav-publish" 
          type="primary" 
          round 
          size="small" 
          :loading="isUploading"
          :disabled="isUploading"
          loading-text="处理中"
          @click="handlePublish"
        >发布</van-button>
      </template>
    </van-nav-bar>

    <div class="publish-content">
      <van-uploader
        v-model="fileList"
        multiple
        :max-count="9"
        :after-read="afterRead"
      >
        <div class="uploader-btn">
          <van-icon name="photograph" size="36" color="#969799" />
          <div class="uploader-text">上传图片</div>
        </div>
      </van-uploader>

      <van-field
        v-model="title"
        placeholder="填写标题更容易上首页哦~"
        class="title-field"
        :border="false"
      />

      <van-field
        v-model="content"
        type="textarea"
        placeholder="最近打卡了什么地方，有什么新奇体验呢？"
        class="content-field"
        :border="false"
        autosize
      />
    </div>

    <div class="publish-footer">
      <van-cell
        title="关联地点"
        is-link
        :value="selectedPoi.name || '去选择'"
        @click="showPoiPopup = true"
      />
    </div>

    <van-popup
      v-model:show="showPoiPopup"
      position="bottom"
      :style="{ height: '100%' }"
      round
    >
      <div class="poi-search-container">
        <van-nav-bar title="选择地点" left-text="取消" @click-left="showPoiPopup = false" />

        <van-search
          v-model="searchKeyword"
          placeholder="搜索地点名称"
          shape="round"
          background="transparent"
          @search="onSearchPoi"
        />

        <div class="poi-list-container">
          <van-list
            v-model:loading="poiLoading"
            :finished="poiFinished"
            @load="onLoadPoi"
          >
            <van-cell
              v-for="item in poiList"
              :key="item.id"
              :title="item.name"
              :label="`${item.area} · ${item.address}`"
              @click="selectPoi(item)"
            />
          </van-list>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Compressor from 'compressorjs'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { uploadBlogImage } from '@/api/upload'
import { publishBlog } from '@/api/blog'
import { getPoiByName } from '@/api/poi'

const router = useRouter()

const fileList = ref([])
const title = ref('')
const content = ref('')
const showPoiPopup = ref(false)
const selectedPoi = ref({ id: null, name: '' })
const searchKeyword = ref('')
const poiList = ref([])
const poiLoading = ref(false)
const poiFinished = ref(false)
const poiCurrent = ref(1)

// 👇 新增：全局的上传/发布状态锁
const isUploading = ref(false)

watch(showPoiPopup, (val) => {
  if (val) {
    poiList.value = []
    poiCurrent.value = 1
    poiFinished.value = false
    poiLoading.value = true
    searchKeyword.value = ''
    onLoadPoi()
  }
})

const goBack = () => {
  router.back()
}

const afterRead = async (file) => {
  // 兼容多选图片返回数组的情况
  const files = Array.isArray(file) ? file : [file]
  
  // 开启全局锁，按钮变成“处理中”
  isUploading.value = true

  for (const item of files) {
    // 改变单张图片在界面的显示状态
    item.status = 'uploading'
    item.message = '压缩并上传中...'

    try {
      // 👇 核心新增：使用 Promise 包装的图片压缩逻辑
      const compressedBlob = await new Promise((resolve, reject) => {
        new Compressor(item.file, {
          quality: 0.6, // 压缩质量：0.6 是个非常完美的平衡点
          maxWidth: 1280, // 限制最大宽度（超过会自动等比缩放，小红书标准）
          success(result) {
            resolve(result)
          },
          error(err) {
            console.error('压缩报错:', err.message)
            reject(err)
          },
        })
      })

      // 构建表单，传入压缩后的 Blob 数据，并带上原来的文件名
      const formData = new FormData()
      formData.append('file', compressedBlob, item.file.name)

      // 请求后端接口
      const res = await uploadBlogImage(formData)

      item.url = res.data
      item.status = 'done' 
      item.message = '上传成功'
    } catch (error) {
      console.error('图片处理失败:', error)
      item.status = 'failed'
      item.message = '上传失败'
      showToast('图片处理或上传失败')
    }
  }

  // 所有图片循环传完后，解开全局锁
  isUploading.value = false
}

const getImagesString = () => {
  return fileList.value
    // 👇 兼容之前的 'uploaded' 和 标准的 'done' 状态
    .filter(file => (file.status === 'done' || file.status === 'uploaded') && file.url)
    .map(file => file.url)
    .join(',')
}

const handlePublish = async () => {
  if (!title.value.trim()) {
    showToast('请填写标题')
    return
  }

  if (!content.value.trim()) {
    showToast('请填写内容')
    return
  }
  
  // 👇 终极防线：检查是否还有图片处于上传状态（针对网络极其卡顿的情况）
  const uploadingFiles = fileList.value.filter(f => f.status === 'uploading')
  if (uploadingFiles.length > 0) {
    showToast('图片正在上传中，请稍后')
    return
  }

  try {
    // 调用发布接口时也上锁，防止用户手抖连击发布两条一样的博客
    isUploading.value = true 
    
    const images = getImagesString()
    await publishBlog({
      title: title.value,
      content: content.value,
      images: images,
      poiId: selectedPoi.value.id
    })

    showToast('发布成功')
    setTimeout(() => {
      router.replace('/')
    }, 1000)
  } catch (error) {
    console.error('发布失败:', error)
    showToast('发布失败')
  } finally {
    // 无论成功失败都解锁
    isUploading.value = false
  }
}

const onSearchPoi = () => {
  poiList.value = []
  poiCurrent.value = 1
  poiFinished.value = false
  poiLoading.value = true
  onLoadPoi()
}

const onLoadPoi = async () => {
  try {
    const res = await getPoiByName({
      name: searchKeyword.value,
      current: poiCurrent.value
    })
    const newRecords = res.data?.records || res.data || []

    const existingIds = new Set(poiList.value.map(item => item.id))
    const uniqueNewRecords = newRecords.filter(item => !existingIds.has(item.id))

    poiList.value.push(...uniqueNewRecords)

    if (uniqueNewRecords.length === 0) {
      poiFinished.value = true
    } else if (uniqueNewRecords.length < 10) {
      poiFinished.value = true
      poiCurrent.value++
    } else {
      poiCurrent.value++
    }
  } catch (error) {
    console.error('获取地点失败', error)
    poiFinished.value = true
  } finally {
    poiLoading.value = false
  }
}

const selectPoi = (item) => {
  selectedPoi.value = { id: item.id, name: item.name }
  showPoiPopup.value = false
}
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.nav-cancel {
  font-size: 14px;
  color: #323233;
}

.nav-publish {
  background-color: #ff6a00;
  border: none;
}

.publish-content {
  flex: 1;
  padding: 12px;
}

.uploader-btn {
  width: 100px;
  height: 100px;
  border: 1px dashed #1989fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.uploader-text {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.title-field {
  margin-top: 12px;
}

.title-field :deep(.van-field__control) {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.content-field {
  margin-top: 8px;
}

.content-field :deep(.van-field__control) {
  font-size: 14px;
  color: #323233;
  min-height: 150px;
}

.publish-footer {
  border-top: 1px solid #ebedf0;
}

.poi-search-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.poi-list-container {
  flex: 1;
  overflow-y: auto;
}
</style>