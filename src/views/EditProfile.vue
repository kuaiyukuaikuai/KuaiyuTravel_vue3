<template>
  <div class="edit-profile-container">
    <van-nav-bar title="编辑资料" left-arrow @click-left="goBack" />
    
    <div class="form-content">
      <van-cell-group inset>
        <!-- 头像 -->
        <van-cell title="头像">
          <template #right-icon>
            <div class="avatar-upload-wrapper" @click="selectAvatar">
              <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" alt="头像" />
              <div v-else class="avatar-placeholder">
                <van-icon name="photograph" size="24" color="#fff" />
              </div>
            </div>
          </template>
        </van-cell>
        
        <!-- 昵称 -->
        <van-cell title="昵称">
          <template #right-icon>
            <van-field
              v-model="nickName"
              type="text"
              placeholder="请输入昵称"
              class="nickname-input"
              :maxlength="20"
            />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-button
        round
        block
        type="primary"
        class="save-btn"
        :loading="savingInfo"
        :disabled="!nickName"
        @click="handleSaveInfo"
      >
        保存资料
      </van-button>
      
      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-text">修改密码</div>
        <div class="divider-line"></div>
      </div>
      
      <!-- 密码修改 -->
      <van-form @submit="handleUpdatePassword">
        <van-cell-group inset>
          <van-field
            v-model="oldPassword"
            name="oldPassword"
            type="password"
            placeholder="请输入当前密码"
            :rules="[{ required: true, message: '请输入当前密码' }]"
          />
          <van-field
            v-model="newPassword"
            name="newPassword"
            type="password"
            placeholder="请输入新密码"
            :rules="[{ required: true, message: '请输入新密码' }]"
            @input="checkPasswordStrength"
          />
          <div v-if="newPassword" class="password-strength">
            <div v-for="(level, index) in passwordLevels" :key="index" class="strength-bar">
              <div
                class="strength-bar-inner"
                :class="passwordStrength > index ? 'active' : ''"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrengthText }}</span>
          </div>
          <van-field
            v-model="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="请确认新密码"
            :rules="passwordMatchRule"
          />
        </van-cell-group>
        
        <van-button
          round
          block
          type="primary"
          class="password-btn"
          native-type="submit"
          :loading="updatingPassword"
          :disabled="!oldPassword || !newPassword || !confirmPassword || passwordStrength < 2"
        >
          修改密码
        </van-button>
      </van-form>
    </div>
    
    <!-- 隐藏的文件输入框 -->
    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      @change="handleAvatarChange"
      style="display: none"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getCurrentUser, updateUserInfo, updatePassword } from '@/api/user'
import { uploadIcon } from '@/api/upload'

const router = useRouter()

const avatarInput = ref(null)
const userInfo = ref({})
const nickName = ref('')
const avatarPreview = ref('')
const currentAvatar = ref('')
const avatarFile = ref(null)
const savingInfo = ref(false)

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordStrength = ref(0)
const updatingPassword = ref(false)

const passwordLevels = [0, 1, 2, 3]
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0:
      return ''
    case 1:
      return '弱'
    case 2:
      return '中'
    case 3:
      return '强'
    default:
      return ''
  }
})

const passwordMatchRule = [
  { required: true, message: '请确认新密码' },
  {
    validator: (val) => {
      return val === newPassword.value
    },
    message: '两次输入的密码不一致'
  }
]

const goBack = () => {
  router.back()
}

const selectAvatar = () => {
  avatarInput.value.click()
}

const handleAvatarChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB')
    return
  }

  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const checkPasswordStrength = () => {
  const pwd = newPassword.value
  let strength = 0

  if (pwd.length >= 6) strength++
  if (pwd.length >= 8) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  passwordStrength.value = Math.min(strength, 3)
}

const loadUserInfo = async () => {
  try {
    const res = await getCurrentUser()
    if (res.data) {
      userInfo.value = res.data
      nickName.value = res.data.nickName || ''
      currentAvatar.value = res.data.icon || ''
      avatarPreview.value = res.data.icon || ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const handleSaveInfo = async () => {
  if (!nickName.value.trim()) {
    showToast('请输入昵称')
    return
  }

  try {
    savingInfo.value = true

    let iconUrl = currentAvatar.value
    if (avatarFile.value) {
      const formData = new FormData()
      formData.append('file', avatarFile.value)
      const uploadRes = await uploadIcon(formData)
      iconUrl = uploadRes.data
    }

    const updateData = {
      nickName: nickName.value.trim()
    }
    if (iconUrl) {
      updateData.icon = iconUrl
    }

    await updateUserInfo(updateData)
    showToast('保存成功')
    
    setTimeout(() => {
      router.back()
    }, 500)
  } catch (error) {
    console.error('保存失败:', error)
    if (error.response?.data?.message) {
      showToast(error.response.data.message)
    } else {
      showToast('保存失败，请稍后重试')
    }
  } finally {
    savingInfo.value = false
  }
}

const handleUpdatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    showToast('两次输入的密码不一致')
    return
  }

  if (passwordStrength.value < 2) {
    showToast('密码强度太弱')
    return
  }

  try {
    updatingPassword.value = true
    await updatePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    showToast('密码修改成功，请重新登录')
    
    setTimeout(() => {
      localStorage.removeItem('token')
      router.push('/login')
    }, 1000)
  } catch (error) {
    console.error('密码修改失败:', error)
    if (error.response?.data?.message) {
      showToast(error.response.data.message)
    } else {
      showToast('密码修改失败，请稍后重试')
    }
  } finally {
    updatingPassword.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.edit-profile-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.form-content {
  padding: 16px 0;
}

.avatar-upload-wrapper {
  cursor: pointer;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nickname-input {
  flex: 1;
  margin: 0;
}

.nickname-input :deep(.van-field__control) {
  text-align: right;
}

.save-btn {
  margin: 24px 16px;
  background-color: #ff6a00;
  border-color: #ff6a00;
  height: 44px;
  font-size: 16px;
}

.save-btn:disabled {
  background-color: #ffc8a3;
  border-color: #ffc8a3;
}

.divider {
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #ebedf0;
}

.divider-text {
  padding: 0 16px;
  font-size: 14px;
  color: #969799;
}

.password-strength {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #ebedf0;
  border-radius: 2px;
  margin-right: 4px;
}

.strength-bar-inner {
  height: 100%;
  width: 100%;
  border-radius: 2px;
  background-color: #ebedf0;
  transition: background-color 0.3s;
}

.strength-bar-inner.active {
  &:first-child {
    background-color: #ee0a24;
  }
  &:nth-child(2) {
    background-color: #ff976a;
  }
  &:nth-child(3) {
    background-color: #07c160;
  }
  &:nth-child(4) {
    background-color: #07c160;
  }
}

.strength-text {
  font-size: 12px;
  color: #969799;
  margin-left: 8px;
}

.password-btn {
  margin: 24px 16px;
  background-color: #ff6a00;
  border-color: #ff6a00;
  height: 44px;
  font-size: 16px;
}

.password-btn:disabled {
  background-color: #ffc8a3;
  border-color: #ffc8a3;
}
</style>
