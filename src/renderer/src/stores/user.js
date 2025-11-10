import { defineStore } from 'pinia'
// 监听theme变化 然后更改主题
export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
    token: '',
    uniacid: 2,
  }),
  persist: {
    enabled: true,
    storage: localStorage
  },
  actions: {
    updateUser(user) {
      this.user = user
      console.log(user);

    },
    updateToken(token) {
      this.token = token
    },
    reset() {
      this.user = {}
      this.token = ''
      this.uniacid = 2
    }
  }
})
