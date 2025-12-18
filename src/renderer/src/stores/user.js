import { defineStore } from 'pinia'
// 监听theme变化 然后更改主题
export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
    token: '',
    uniacid: 2,
    version: '1.0.0'
  }),
  persist: {
    enabled: true,
    storage: localStorage
  },
  actions: {
    updateUser(user) {
      this.user = user
    },
    updateToken(token) {
      this.token = token
    },
    reset() {
      this.user = {}
      this.token = ''
    }
  }
})
export const useToolBarStore = defineStore('toolBar', {
  state: () => ({
    toolbarShow: true
  }),
  persist: {
    enabled: true,
    storage: localStorage
  }
})
