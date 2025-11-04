import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { handleThemeStyle } from '@renderer/utils/theme-action'
// 监听theme变化 然后更改主题
export const useThemeStore = defineStore('theme', () => {
  var localTheme = localStorage.getItem('theme')
  const theme = ref(localTheme || '#1AA19B')
  if (localTheme) {
    handleThemeStyle(localTheme)
  }
  watch(theme, (newTheme) => {
    handleThemeStyle(newTheme)
    localStorage.setItem('theme', newTheme)
  })
  return { theme }
})
