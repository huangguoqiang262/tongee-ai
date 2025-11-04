<template>
  <el-color-picker
    v-model="theme"
    :predefine="[
      '#1AA19B',
      '#1890ff',
      '#304156',
      '#212121',
      '#11a983',
      '#13c2c2',
      '#6959CD',
      '#f5222d'
    ]"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script setup>
import { inject } from 'vue'
import { ref, watch } from 'vue'
import { useThemeStore } from '@renderer/stores/theme'
const themeStore = useThemeStore()
var theme = ref(themeStore.theme)
const $LoginModel = inject('$LoginModel')
watch(theme, (newTheme) => {
  themeStore.theme = newTheme
  $LoginModel()
})
</script>

<style scoped lang="scss">
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
