import { ref, watch, watchEffect } from 'vue'
import { showLoginModel } from '@renderer/components/LoginModel'
import { useUserStore } from '@renderer/stores/user'
export function useCheckLogin() {
  const userStore = useUserStore()
  const isLogin = ref(false)
  if (!userStore.token) {
    showLoginModel()
    isLogin.value = false
  } else {
    isLogin.value = true
  }
  watch(
    () => userStore.token,
    (newToken) => {
      if (!newToken) {
        isLogin.value = false
      } else {
        isLogin.value = true
      }
    }
  )
  // 通过返回值暴露所管理的状态
  return isLogin
}
export function useUserInfo() {
  const userStore = useUserStore()
  const userInfo = ref(userStore.user)
  watchEffect(() => {
    userInfo.value = userStore.user
  })
  return userInfo
}
