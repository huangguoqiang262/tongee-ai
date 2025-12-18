<script setup>
import { ref, onMounted, provide } from 'vue'
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 更新组件引用
const updateNotificationRef = ref()

// 提供更新功能给子组件
provide('updateApi', {
  checkForUpdates: () => {
    if (updateNotificationRef.value) {
      updateNotificationRef.value.checkForUpdates()
    }
  }
})

// 应用启动时检查版本和更新
onMounted(() => {
  // 显示当前版本信息
  if (window.customApi?.getAppVersion) {
    window.customApi
      .getAppVersion()
      .then((version) => {
        console.log(`🎉 同格应用 v${version}`)
      })
      .catch((error) => {
        console.error('获取版本信息失败:', error)
      })
  }

  // 自动检查更新（每天一次）
  setTimeout(() => {
    autoCheckForUpdates()
  }, 5000) // 延迟5秒检查，避免影响启动速度
})

// 自动检查更新
const autoCheckForUpdates = () => {
  const lastCheck = localStorage.getItem('lastUpdateCheck')
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000

  // 如果从未检查过或超过24小时，则检查更新
  if (!lastCheck || now - parseInt(lastCheck) > oneDay) {
    if (updateNotificationRef.value) {
      updateNotificationRef.value.checkForUpdates(true) // 静默检查
    }
    localStorage.setItem('lastUpdateCheck', now.toString())
  }
}

// 暴露更新检查方法
const checkForUpdates = () => {
  if (updateNotificationRef.value) {
    updateNotificationRef.value.checkForUpdates()
  }
}

// 定义暴露的方法
defineExpose({
  checkForUpdates
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
    <!-- 更新通知组件 -->
    <UpdateNotification ref="updateNotificationRef" />
  </el-config-provider>
</template>

<style>
/* 全局样式 */
#app {
  width: 100%;
  height: 100vh;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 更新通知相关样式 */
.update-notification {
  font-family: inherit;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
