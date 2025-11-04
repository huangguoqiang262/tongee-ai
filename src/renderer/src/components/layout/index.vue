<template>
  <div class="layout-box">
    <Sidebar></Sidebar>
    <div class="main-container">
      <MainContent ref="mainContentRef"></MainContent>
    </div>
    <TextSelectionToolbar />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
// 获取MainContent组件的引用
const mainContentRef = ref(null)

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
// 使用provide将方法提供给所有子组件
provide('addNewTab', addNewTabGlobal)
// 提供全局替换当前活动标签的方法
provide('replaceActiveTab', replaceActiveTab)
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
