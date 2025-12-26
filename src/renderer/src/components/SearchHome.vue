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
    <div class="search-box">
      <MessageInput
        ref="messageInput"
        key="input"
        :is-active-tab="props.isActiveTab"
        class="message-input"
      >
      </MessageInput>
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
const messageInput = ref(null)
const handleClick = (e) => {
  messageInput.value?.focusChange(e)
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
  .search-box {
    width: 100%;
    .message-input {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
    }
  }
}
</style>
