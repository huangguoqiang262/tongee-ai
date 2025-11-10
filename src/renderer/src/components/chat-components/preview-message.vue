<template>
  <div class="preview-message-page-box">
    <div class="close-box">
      <el-icon class="close-icon" @click="closePreview"><Close /></el-icon>
    </div>
    <div class="chat-content">
      <PreviewMessageRow
        v-for="message in deepMessages"
        :key="message.dateline"
        :message="message"
        @handle-check="handleCheck"
      />
    </div>
    <div class="bottom-action-box">
      <div class="bottom-action">
        <el-button class="cancel-btn">生成长图</el-button>
        <el-button class="confirm-btn" type="primary"> 复制链接 </el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import cloneDeep from 'lodash.clonedeep'
import { ref, watch } from 'vue'
let props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})
let emits = defineEmits(['closePreview'])
const deepMessages = ref([])
watch(
  () => props.messages,
  (newMessages) => {
    console.log('newMessages', newMessages)

    deepMessages.value = cloneDeep(newMessages)
  },
  {
    immediate: true,
    deep: true
  }
)
const closePreview = () => {
  emits('closePreview')
}
const handleCheck = (message) => {
  console.log(888888)

  message.checked = !message.checked
}
</script>
<style scoped lang="scss">
.preview-message-page-box {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 0 20px;
  height: 100%;
  width: 100%;
  min-width: 375px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  .close-box {
    width: 830px;
    height: 60px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .close-icon {
      z-index: 1;
      font-size: 20px;
      color: var(--default-font-color);
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
  .chat-content {
    flex: 1;
    padding: 0 0 20px;
    width: 770px;
    margin: 0 auto;
    overflow-y: auto;
  }
  .empty-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty-img {
      margin-bottom: 30px;
      width: 78px;
      height: 55px;
    }
    .empty-text {
      font-size: 14px;
      color: #737475;
    }
  }
  .bottom-action-box {
    width: 100%;
    height: 76px;
    border-top: 1px solid #e5e5e5;
    .bottom-action {
      width: 770px;
      height: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      .cancel-btn,
      .confirm-btn {
        height: 36px;
        width: 110px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
      }

      .cancel-btn {
        background: #efefef;
        color: var(--default-font-color);
        &:hover {
          opacity: 0.7;
        }
      }
    }
  }
}
</style>
