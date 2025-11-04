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
const addNewTabGlobal = (url = 'SearchHome', isInternal = true) => {
  if (mainContentRef.value && mainContentRef.value.addNewTab) {
    mainContentRef.value.addNewTab(url, isInternal)
  } else {
    console.warn('MainContent组件未加载或addNewTab方法不存在')
  }
}

// 使用provide将方法提供给所有子组件
provide('addNewTab', addNewTabGlobal)
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
