import { defineStore } from 'pinia'
import { showLoginModel } from '@renderer/components/LoginModel'
// 监听theme变化 然后更改主题
export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
    token: '',
    uniacid: 2,
    version: '1.0.0',
    msgtips: {
      total: 0,
      details: {
        1: 0, // 知识库反馈
        2: 0, // 文件更新
        3: 0, // 系统通知\
        4: 0// 协同通知
      }
    }
  }),
  persist: {
    enabled: true,
    storage: localStorage
  },
  actions: {
    updateUser(user) {
      this.user = user
    },
    updateTips(tips) {
      this.msgtips = tips
    },
    updateToken(token) {
      this.token = token
    },
    reset() {
      this.user = {}
      this.token = ''
      this.msgtips = {
        total: 0,
        details: {
          1: 0, // 知识库反馈
          2: 0, // 文件更新
          3: 0, // 系统通知\
          4: 0// 协同通知
        }
      }
      showLoginModel()
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
