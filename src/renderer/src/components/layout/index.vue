<template>
  <div class="layout-box">
    <Sidebar ref="sidebarRef"></Sidebar>
    <div class="main-container">
      <MainContent ref="mainContentRef"></MainContent>
    </div>
    <TextSelectionToolbar />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { on, off } from '@renderer/utils/eventBus'
// 获取MainContent组件的引用
const mainContentRef = ref(null)
const sidebarRef = ref(null)
// 提供全局添加标签的方法
const addNewTabGlobal = (config = {}) => {
  if (mainContentRef.value && mainContentRef.value.addNewTab) {
    mainContentRef.value.addNewTab(config)
  } else {
    console.warn('MainContent组件未加载或addNewTab方法不存在')
  }
}
// 提供全局替换当前活动标签的方法
const replaceActiveTab = (config = {}) => {
  if (mainContentRef.value && mainContentRef.value.replaceActiveTab) {
    mainContentRef.value.replaceActiveTab(config)
  } else {
    console.warn('MainContent组件未加载或replaceActiveTab方法不存在')
  }
}
// 提供全局处理标签操作的方法
const handleTabAction = (action) => {
  if (mainContentRef.value && mainContentRef.value.handleTabAction) {
    mainContentRef.value.handleTabAction(action)
    sidebarRef.value?.refreshData()
  } else {
    console.warn('MainContent组件未加载或handleTabAction方法不存在')
  }
}
// 使用provide将方法提供给所有子组件
provide('addNewTab', addNewTabGlobal)
// 提供全局替换当前活动标签的方法
provide('replaceActiveTab', replaceActiveTab)
// 提供全局处理标签操作的方法
provide('handleTabAction', handleTabAction)
const handleLoginSuccess = () => {
  handleTabAction('close-all')
}
const handleMainWindowNewWindow = (event) => {
  const details = event.detail
  console.log('新窗口请求:', details)

  // 根据details中的URL打开新tab
  if (details.url) {
    // 调用你的打开新tab的方法
    addNewTabGlobal({
      url: details.url,
      title: details.title || '',
      icon: details.icon || '',
      isInternal: false
    })
  }
}
onMounted(() => {
  // 注册登录成功事件监听
  on('login-success', handleLoginSuccess)
  window.addEventListener('main-window-new-window', handleMainWindowNewWindow)

})

onUnmounted(() => {
  // 移除事件监听
  off('login-success', handleLoginSuccess)
  window.removeEventListener('main-window-new-window', handleMainWindowNewWindow)
})
</script>

<style scoped lang="scss">
.layout-box {
  width: 100%;
  height: 100%;
  display: flex;
  .main-container {
    flex: 1;
    overflow: hidden;
  }
}
</style>
