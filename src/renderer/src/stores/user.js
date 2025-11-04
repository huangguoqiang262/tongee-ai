import { defineStore } from 'pinia'
import { getToken } from '@renderer/utils/auth'
// 监听theme变化 然后更改主题
export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      name: '张三',
      age: 18
    },
    token: getToken() || '',
    uniacid: 2,
    userId: localStorage.getItem('userId') || ''
  }),
  actions: {
    updateUser(user) {
      this.user = user
    }
  }
})
