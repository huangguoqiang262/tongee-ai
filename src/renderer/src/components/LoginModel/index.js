import { createApp } from 'vue'
import LoginComponent from './Login.vue'

let currentInstance = null

export function showLoginModel() {
  if (currentInstance) {
    return
  }
  // 创建div容器
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建Vue应用实例
  const app = createApp(LoginComponent, {
    onClose: () => {
      app.unmount()
      document.body.removeChild(container)
      currentInstance = null
    }
  })
  // app.use(createPinia())
  // 挂载应用
  const instance = app.mount(container)
  currentInstance = instance

  return {
    close: () => {
      if (currentInstance) {
        instance.handleClose()
      }
    }
  }
}

// 全局注册
export function registryLogin(app) {
  app.config.globalProperties.$LoginModel = showLoginModel
  app.provide('$LoginModel', showLoginModel)
}

export default {
  install(app) {
    registryLogin(app)
  }
}
