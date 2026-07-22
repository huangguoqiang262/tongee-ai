<template>
  <div
    class="search-home"
    @click="handleClick"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-show="showDragOverlay" class="drag-overlay">
      <div class="drag-overlay-content">
        <div class="drag-text">拖拽文件到这里</div>
        <div class="drag-type">
          支持.doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式
        </div>
      </div>
    </div>
    <div class="logo-box">
      <img class="logo" src="@renderer/assets/home/large-logo.png" alt="" />
    </div>
    <div class="tab-box">
      <div class="tab-item" :class="{'active-tab': homeTab === 'repository'}" @click="homeTab = 'repository'">
        <img v-show="homeTab == 'repository'" class="tab-icon" src="@renderer/assets/home/tab-repository-active-icon.png" alt=""/>
        <img v-show="homeTab != 'repository'" class="tab-icon" src="@renderer/assets/home/tab-repository-icon.png" alt=""/>
        AI知识库
      </div>
      <div class="tab-item" :class="{'active-tab': homeTab === 'searchFile'}" @click="homeTab = 'searchFile'">
        <img v-show="homeTab == 'searchFile'" class="tab-icon" src="@renderer/assets/home/tab-file-active-icon.png" alt=""/>
        <img v-show="homeTab != 'searchFile'" class="tab-icon" src="@renderer/assets/home/tab-file-icon.png" alt=""/>
        文件检索
      </div>
    </div>
    <div class="search-box">
      <MessageInput
        v-if="homeTab == 'repository'"
        ref="messageInput"
        key="input"
        :is-active-tab="props.isActiveTab"
        class="message-input"
      >
      </MessageInput>
      <SearchAllFile
        v-else
        key="searchFile"
        ref="searchAllFile"
        :is-active-tab="props.isActiveTab"
        class="search-all-file"
      >
      </SearchAllFile>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  isActiveTab: {
    type: Boolean,
    default: false
  }
})
const homeTab = ref('repository')
const messageInput = ref(null)
const searchAllFile = ref(null)
const handleClick = (e) => {
  messageInput.value?.focusChange(e)
  searchAllFile.value?.focusChange(e)
}
// 拖拽相关数据
const showDragOverlay = ref(false)

// 拖拽事件处理
const handleDragEnter = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = true
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  // 只有当拖拽离开整个容器时才隐藏遮罩
  if (!event.currentTarget.contains(event.relatedTarget)) {
    showDragOverlay.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = false

  const files = event.dataTransfer.files
  if (!files || !files.length) return
  if (messageInput.value) {
    for (const file of files) {
      var tempFile = {
        file: file
      }
      // 调用上传文件的方法
      messageInput.value.customUpload(tempFile)
    }
  }
}
</script>

<style scoped lang="scss">
.search-home {
  height: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .drag-overlay {
    position: absolute;
    inset: 6px;
    background: rgba(249, 249, 249, 0.96);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #efefef;
    border-radius: 12px;
    .drag-overlay-content {
      padding: 40px;
      text-align: center;
      .drag-text {
        margin-bottom: 20px;
        font-weight: 600;
        font-size: 24px;
        color: var(--default-font-color);
        line-height: 32px;
      }
      .drag-type {
        font-size: 16px;
        color: #909090;
        line-height: 22px;
      }
    }
  }
  .logo-box {
    margin-bottom: 58px;
    text-align: center;
    flex-shrink: 0;
    .logo {
      width: 274px;
      height: 77px;
      object-fit: contain;
    }
    .logo-text {
      font-weight: 700;
      font-size: 32px;
      color: var(--default-font-color);
    }
  }
  .tab-box {
    width: 100%;
    max-width: 770px;
    margin-bottom: 10px;
    height: 34px;
    display: flex;
    align-items: center;
    gap: 8px;
    .tab-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 106px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #DFDFDF;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
      cursor: pointer;
      &:hover {
        background: #f6f6f6;
      }
      &.active-tab {
        background: var(--el-color-primary);
        color: #fff;
      }
      .tab-icon {
        width: 14px;
        height: 14px;
      }
    }
  }
  .search-box {
    width: 100%;
    .message-input, .search-all-file {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
      min-height: 226px;
    }
  }
}
</style>
