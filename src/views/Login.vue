<template>
  <div class="login-container">
    <van-nav-bar title="手机号码快捷登录" left-arrow @click-left="goBack" />
    <div class="login-content">
      <van-form @submit="onSubmit">
        <div class="phone-input-wrapper">
          <van-field
            v-model="phone"
            name="phone"
            placeholder="请输入手机号"
            type="tel"
            :rules="[{ required: true, message: '请输入手机号' }]"
          />
          <van-button
            :type="countDown === 0 ? 'primary' : 'default'"
            size="small"
            :disabled="countDown > 0"
            @click="sendVerificationCode"
            class="send-code-btn"
          >
            {{ countDown > 0 ? `${countDown}s` : '发送验证码' }}
          </van-button>
        </div>
        <van-field
          v-model="code"
          name="code"
          placeholder="请输入验证码"
          type="text"
          :rules="[{ required: true, message: '请输入验证码' }]"
        />
        <div class="hint-text">未注册的手机号验证码后自动创建账户</div>
        <div class="agreement-wrapper">
          <van-radio-group v-model="agreed">
            <van-radio name="true" class="agreement-radio">
              <span class="agreement-text">我已阅读并同意</span>
              <span class="agreement-link">《黑马点评用户服务协议》</span>
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
        >
          登录
        </van-button>
        <div class="password-login">密码登录</div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { sendCode, login } from '@/api/user'

const router = useRouter()
const phone = ref('')
const code = ref('')
const countDown = ref(0)
const agreed = ref('')
let timer = null

const goBack = () => {
  router.back()
}

const sendVerificationCode = async () => {
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    await sendCode({ phone: phone.value })
    showToast('验证码已发送')
    
    countDown.value = 60
    timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (error) {
    console.error(error)
  }
}

const onSubmit = async () => {
  if (!agreed.value) {
    showToast('请先同意用户协议')
    return
  }

  try {
    const res = await login({
      phone: phone.value,
      code: code.value
    })
    localStorage.setItem('token', res.data)
    showToast('登录成功')
    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-content {
  padding: 20px;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  padding-right: 10px;
}

.phone-input-wrapper :deep(.van-field) {
  flex: 1;
  margin-bottom: 0;
}

.send-code-btn {
  margin-left: 10px;
  background-color: #07c160;
  border-color: #07c160;
  color: #fff;
  white-space: nowrap;
}

.send-code-btn:disabled {
  background-color: #e0e0e0;
  border-color: #e0e0e0;
  color: #999;
}

.hint-text {
  text-align: center;
  color: #969799;
  font-size: 12px;
  margin: 10px 0;
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

.password-login {
  text-align: right;
  color: #7232dd;
  font-size: 14px;
  margin-top: 15px;
}
</style>
