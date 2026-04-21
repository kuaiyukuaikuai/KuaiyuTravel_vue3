<template>
  <div class="password-login-container">
    <van-nav-bar title="密码登录" left-arrow @click-left="goBack" />
    <div class="login-content">
      <van-form @submit="onSubmit">
        <van-field
          v-model="phone"
          name="phone"
          placeholder="请输入手机号"
          type="tel"
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="password"
          name="password"
          type="password"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <div class="agreement-wrapper">
          <van-radio-group v-model="agreed">
            <van-radio name="true" class="agreement-radio">
              <span class="agreement-text">我已阅读并同意</span>
              <span class="agreement-link">《快鱼旅行用户服务协议》</span>
              <span class="agreement-text">、</span>
              <span class="agreement-link">《隐私政策》</span>
              <span class="agreement-text">等，接受免除或者限制责任、诉讼管辖约定等粗体标示条款</span>
            </van-radio>
          </van-radio-group>
        </div>
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          class="login-btn"
          :disabled="!agreed"
          :loading="loading"
        >
          登录
        </van-button>
        <div class="sms-login" @click="goToSmsLogin">验证码登录</div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { loginByPassword } from '@/api/user'

const router = useRouter()
const phone = ref('')
const password = ref('')
const agreed = ref('')
const loading = ref(false)

const goBack = () => {
  router.back()
}

const goToSmsLogin = () => {
  router.push('/login')
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('请先同意用户协议')
    return
  }

  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    loading.value = true
    const res = await loginByPassword({
      phone: phone.value,
      password: password.value
    })
    localStorage.setItem('token', res.data)
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    console.error(error)
    if (error.response?.data?.message) {
      showToast(error.response.data.message)
    } else {
      showToast('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-login-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-content {
  padding: 20px;
}

.agreement-wrapper {
  margin: 20px 0;
  padding: 0 5px;
}

.agreement-radio {
  align-items: flex-start;
}

.agreement-text {
  font-size: 12px;
  color: #323233;
  line-height: 1.6;
}

.agreement-link {
  font-size: 12px;
  color: #1989fa;
  line-height: 1.6;
}

.login-btn {
  margin-top: 20px;
  background-color: #ff6a00;
  border-color: #ff6a00;
  height: 48px;
  font-size: 16px;
}

.login-btn:disabled {
  background-color: #ffc8a3;
  border-color: #ffc8a3;
}

.sms-login {
  text-align: right;
  color: #7232dd;
  font-size: 14px;
  margin-top: 15px;
}
</style>
