<template>
  <div class="app-container" @click.stop>
    <div class="login-box">
      <div class="login-left-box">
        <div class="hd-title-box">
          <img class="logo" src="@renderer/assets/login-logo.png" alt="" />
          <div class="sub-title">糖吉医疗AI知识库智能平台</div>
        </div>
        <div class="broadcast-box">
          <div v-for="(item, index) in broadcastLists" :key="index" class="broadcast-item">
            <img class="icon" :src="item.icon" alt="" />
            <div class="title">{{ item.title }}</div>
          </div>
        </div>
      </div>
      <img src="@renderer/assets/close-icon.png" class="close-icon" @click.stop="handleClose" />
      <div class="ms-login" @click.stop>
        <template v-if="!isforgetPassword">
          <div class="welcome-box">
            <div class="title">欢迎登录</div>
            <div class="sub-title">糖源因你，智慧积累每天多一点</div>
          </div>
          <div class="tabs">
            <div
              v-for="(item, index) in tabs"
              :key="index"
              class="tab-item"
              :class="{ 'active-tab': item.id == switchType }"
              @click="switchChange(item)"
            >
              {{ item.title }}
            </div>
          </div>
          <el-form
            ref="loginFormRef"
            label-position="top"
            :model="loginForm"
            :rules="loginRules"
            hide-required-asterisk
            :scroll-to-error="true"
            class="ms-content"
          >
            <template v-if="switchType == 'password'">
              <el-form-item prop="mobile" label="手机号">
                <el-input
                  v-model="loginForm.mobile"
                  class="input"
                  placeholder="请输入您的手机号"
                  autocomplete="new-password"
                  @keyup.enter="handleLogin"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="password" label="密码">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  class="input"
                  autocomplete="new-password"
                  placeholder="请输入您的密码"
                  show-password
                  @keyup.enter="handleLogin"
                >
                </el-input>
              </el-form-item>
              <div class="rememberOrforget">
                <el-checkbox
                  v-model="rememberPassword"
                  class="remember-checkbox"
                  @keyup.enter="handleLogin"
                  >记住密码</el-checkbox
                >
                <div class="forget-password" @click="forgetPassword">忘记密码？</div>
              </div>
            </template>
            <template v-else>
              <el-form-item prop="mobile" label="手机号">
                <el-input
                  v-model="loginForm.mobile"
                  class="input"
                  placeholder="请输入您的手机号"
                  autocomplete="new-password"
                  @keyup.enter="handleLogin"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="msg_code" label="验证码">
                <div class="msg_code_box">
                  <el-input
                    v-model="loginForm.msg_code"
                    type="text"
                    autocomplete="new-password"
                    class="msg_code"
                    placeholder="请输入手机验证码"
                    @keyup.enter="handleLogin"
                  >
                  </el-input>
                  <div class="send-code" @click.stop="getCode">
                    {{ codeTitle }}
                  </div>
                </div>
              </el-form-item>
            </template>

            <div class="login-btn">
              <el-button type="primary" style="font-size: 16px" @click="handleLogin"
                >登录知识库</el-button
              >
            </div>
          </el-form>
        </template>
        <template v-else>
          <div class="register-box">
            <img class="back" src="@renderer/assets/back.png" alt="" @click="backLogin" />
            <div class="title">忘记密码</div>
          </div>
          <el-form
            ref="loginFormRef"
            label-position="top"
            :model="loginForm"
            :rules="loginRules"
            hide-required-asterisk
            :scroll-to-error="true"
            class="ms-content"
          >
            <template v-if="isforgetPassword && !nextForget">
              <el-form-item prop="mobile" label="手机号">
                <el-input
                  v-model="loginForm.mobile"
                  class="input"
                  placeholder="请输入您的手机号"
                  autocomplete="new-password"
                  @keyup.enter="handleNext"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="msg_code" label="验证码">
                <div class="msg_code_box">
                  <el-input
                    v-model="loginForm.msg_code"
                    type="text"
                    autocomplete="new-password"
                    class="msg_code"
                    placeholder="请输入手机验证码"
                    @keyup.enter="handleLogin"
                  >
                  </el-input>
                  <div class="send-code" @click.stop="getCode">
                    {{ codeTitle }}
                  </div>
                </div>
              </el-form-item>
              <div class="login-btn">
                <el-button type="primary" style="font-size: 16px" @click="handleNext"
                  >下一步</el-button
                >
              </div>
            </template>
            <template v-else-if="isforgetPassword && nextForget">
              <el-form-item prop="password" label="新密码">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  class="input"
                  autocomplete="new-password"
                  placeholder="设置您的新密码"
                  show-password
                  @keyup.enter="handleForget"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="re_password" label="确认密码">
                <el-input
                  v-model="loginForm.re_password"
                  type="password"
                  class="input"
                  autocomplete="new-password"
                  placeholder="再次输入新密码"
                  show-password
                  @keyup.enter="handleForget"
                >
                </el-input>
              </el-form-item>
              <div class="login-btn">
                <el-button type="primary" style="font-size: 16px" @click="handleForget"
                  >修改并登录</el-button
                >
              </div>
            </template>
          </el-form>
        </template>

        <div class="copyRight">© 2025 糖源Tongo AI知识库</div>
      </div>
    </div>
    <!-- <div v-show="puzzle" class="puzzle-box">
      <div class="puzzle-body">
        <div>
          <puzzleVerification
            v-model="puzzle"
            block-type="puzzle"
            width="300"
            height="200"
            :deviation="10"
            :on-success="handlePuzzleSuccess"
          />
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { login, passlogin, send_code, user_info } from '@renderer/api/user'
import { get_login_item } from '@renderer/api/index'
let broadcastLists = ref([])
onMounted(() => {
  get_login_item({}).then((res) => {
    if (res.code == 200) {
      broadcastLists.value = res.data
    }
  })
})
const userStore = useUserStore()
const loginFormRef = ref()
let rememberPassword = ref(false)
// 响应式数据
const loginForm = reactive({
  mobile: '',
  password: '',
  msg_code: '',
  re_password: '',
  uniqid: ''
})

const switchType = ref('msg_code')
const puzzle = ref(false)
const codeTime = ref(0)
const codeTitle = ref('获取验证码')
const loginData = ref(null)
const tabs = ref([
  { id: 'msg_code', title: '验证码登录' },
  { id: 'password', title: '账号密码登录' }
])

const loginRules = {
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  msg_code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  re_password: [{ required: true, message: '请再次输入密码', trigger: 'blur' }]
}
let nextForget = ref(false)
let isforgetPassword = ref(false)
const forgetPassword = () => {
  isforgetPassword.value = true
}
// 方法定义
const handlePuzzleSuccess = () => {
  puzzle.value = false
  if (codeTime.value > 0) return
  if (!validata()) return

  send_code({ mobile: loginForm.mobile }).then((res) => {
    if (res.code == 200) {
      // eslint-disable-next-line no-undef
      ElMessage.success('验证码发送成功')
      codeTime.value = 60
      const timer = setInterval(() => {
        if (codeTime.value >= 1) {
          codeTitle.value = '重新发送(' + codeTime.value + ')'
          codeTime.value--
        } else {
          codeTime.value = 0
          codeTitle.value = '获取验证码'
          clearInterval(timer)
        }
      }, 1000)
    }
  })
}

const backLogin = () => {
  if (nextForget.value) {
    nextForget.value = false
  } else {
    isforgetPassword.value = false
  }
  nextTick(() => {
    loginFormRef.value?.resetFields()
  })
}

const switchChange = (item) => {
  switchType.value = item.id
  nextTick(() => {
    loginFormRef.value?.resetFields()
  })
}

const validata = () => {
  const mPattern = /^1[345789]\d{9}$/
  if (!mPattern.test(loginForm.mobile)) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('请输入正确的手机号')
    return false
  }
  return true
}

const getCode = () => {
  if (codeTime.value > 0) return
  if (!validata()) return
  handlePuzzleSuccess()
  // puzzle.value = true
}

const handleClose = () => {
  emit('close')
}

const handleNext = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      if (isforgetPassword.value) {
        nextForget.value = true
      }
      // register(loginForm)
      //   .then((response) => {
      //     if (response.code == 200) {
      //       // eslint-disable-next-line no-undef
      //       ElMessage.success('注册成功，请登录')
      //       backLogin()
      //     }
      //   })
      //   .catch(() => {})
    }
  })
}
const handleForget = () => {
  if (nextForget.value) {
    handleLogin()
  }
}
const handleLogin = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      if (switchType.value == 'msg_code') {
        login(loginForm)
          .then(async (response) => {
            if (response.code == 200) {
              // eslint-disable-next-line no-undef
              ElMessage.success('登录成功')
              const { data } = response
              loginData.value = data
              userStore.token = loginData.value.token
              userStore.updateToken(loginData.value.token)
              getUserInfo()
              const timer = setTimeout(() => {
                handleClose()
                clearTimeout(timer)
              }, 1000)
            }
          })
          .catch(() => {})
      } else {
        passlogin(loginForm)
          .then(async (response) => {
            if (response.code == 200) {
              // eslint-disable-next-line no-undef
              ElMessage.success('登录成功')
              const { data } = response
              loginData.value = data
              userStore.token = loginData.value.token
              userStore.updateToken(loginData.value.token)
              getUserInfo()
              const timer = setTimeout(() => {
                handleClose()
                clearTimeout(timer)
              }, 1000)
            }
          })
          .catch(() => {})
      }
    } else {
      nextTick(() => {
        // 这里可以添加表单错误滚动逻辑
      })
    }
  })
}
const getUserInfo = () => {
  user_info({}).then((res) => {
    if (res.code == 200) {
      userStore.updateUser(res.data?.user_info)
    }
  })
}
// 定义事件
const emit = defineEmits(['close'])

// 暴露方法给父组件
defineExpose({
  handleClose
})
</script>

<style lang="scss">
input:-webkit-autofill {
  box-shadow: 0 0 0 1000px transparent inset !important;
}
input:-internal-autofill-previewed,
input:-internal-autofill-selected {
  transition: background-color 5000s ease-in-out 0s !important;
}
</style>
<style lang="scss" scoped>
.puzzle-box {
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  .puzzle-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
:deep(.el-form-item) {
  margin-bottom: 24px !important;
  .el-form-item__label {
    color: var(--default-font-color);
  }
  .el-input-group__prepend {
    background: transparent !important;
    border: none !important;
  }
  .el-input__wrapper {
    height: 48px;
    border: none;
    border-radius: 8px;
  }
  .msg_code_box {
    position: relative;
    display: flex;
    align-items: center;
    height: 48px;
    width: 100%;
    border-radius: 6px;
    .send-code {
      position: absolute;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      flex-shrink: 0;
      width: 110px;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      color: var(--el-color-primary);
    }
  }
}
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: rgba(216, 216, 216, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  .login-box {
    position: absolute;
    width: 1040px;
    height: 560px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    .login-left-box {
      flex-shrink: 0;
      padding: 70px 50px;
      width: 470px;
      height: 100%;
      background: url('@renderer/assets/login-img.png') no-repeat center/100% 100%;
      user-select: none;
      .hd-title-box {
        margin-bottom: 60px;
        .logo {
          margin-bottom: 10px;
          width: auto;
          height: 58px;
        }
        .sub-title {
          font-size: 16px;
          color: var(--el-color-primary-light-5);
          line-height: 22px;
        }
      }
      .broadcast-box {
        .broadcast-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          &:last-child {
            margin-bottom: 0;
          }
          .icon {
            width: 22px;
            height: 22px;
            object-fit: cover;
            border-radius: 50%;
          }
          .title {
            font-size: 14px;
            color: #fff;
            line-height: 20px;
          }
        }
      }
    }
    .close-icon {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 20px;
      height: 20px;
      z-index: 9999;
      cursor: pointer;
      &::selection {
        user-select: none;
      }
    }
  }
  .ms-login {
    width: 570px;
    height: 100%;
    background: #fff;
    box-sizing: border-box;
    padding: 50px 95px 10px;
    position: relative;
    .copyRight {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #737475;
      line-height: 17px;
      text-align: center;
    }
    .welcome-box {
      margin-bottom: 30px;
      .title {
        margin-bottom: 10px;
        font-weight: 600;
        font-size: 26px;
        color: var(--default-font-color);
        line-height: 34px;
      }
      .sub-title {
        font-size: 14px;
        color: #737475;
        line-height: 24px;
      }
    }
    .tabs {
      padding-bottom: 9px;
      margin-bottom: 23px;
      display: flex;
      align-items: center;
      gap: 0 30px;
      font-weight: 400;
      font-size: 16px;
      color: var(--default-font-color);
      line-height: 22px;
      border-bottom: 1px solid #efefef;
      .tab-item {
        cursor: pointer;
        user-select: none;
      }
      .active-tab {
        position: relative;
        font-weight: 500;
        color: var(--el-color-primary);
        &::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 80px;
          height: 1px;
          background: var(--el-color-primary);
        }
      }
    }
    .rememberOrforget {
      display: flex;
      align-items: center;
      justify-content: space-between;
      transform: translateY(-8px);
      .remember-checkbox {
        height: 20px;
      }
      .forget-password {
        font-size: 14px;
        color: var(--el-color-primary);
        line-height: 20px;
        cursor: pointer;
        user-select: none;
      }
    }
    .register-box {
      margin-bottom: 50px;
      display: flex;
      align-items: center;
      gap: 0 20px;
      font-weight: 600;
      font-size: 22px;
      color: var(--default-font-color);
      line-height: 34px;
      .back {
        width: 30px;
        height: 30px;
        cursor: pointer;
      }
    }
  }
  .login-btn button {
    margin-top: 16px;
    width: 100%;
    height: 50px;
    border-radius: 8px;
    text-align: center;
    background: linear-gradient(
      179deg,
      var(--el-color-primary) 0%,
      var(--el-color-primary-dark-2) 100%
    );
  }
  .switch-type {
    margin-top: 10px;
    font-size: 14px;
    color: var(--el-color-primary);
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    user-select: none;
  }
}
</style>
