<template>
  <div class="document-detail">
    <div class="center-box" :class="{ 'mr-chat': chatVisible }">
      <div class="center-head">
        <div class="title"></div>
        <div class="right-handle-box">
          <div v-if="!chatVisible" class="open-chat" @click="openChat">
            <img class="logo" src="@renderer/assets/logo.png" alt="" />
            问问糖源
          </div>
        </div>
      </div>
      <FilePreview
        v-if="fileUrl"
        class="center-content"
        :file-url="fileUrl"
        :file-name="fileName"
      />
    </div>
    <div v-if="chatVisible" class="right-box">
      <CommonChat
        :is-active-tab="props.isActiveTab"
        :attach-files="attach_files"
        @close-chat="chatVisible = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  attrs: {
    type: Object,
    default: () => ({})
  },
  isActiveTab: {
    type: Boolean,
    default: false
  }
})
let fileUrl = ref('')
let fileName = ref('')
let chatVisible = ref(false)
let attach_files = ref([
  {
    title: props.attrs.fileName,
    full_path: props.attrs.fileUrl
  }
])
const openChat = () => {
  chatVisible.value = true
}
watchEffect(() => {
  fileUrl.value = props.attrs.fileUrl || ''
  fileName.value = props.attrs.fileName || ''
})
</script>
<style scoped lang="scss">
.document-detail {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: start;
  overflow: hidden;
  background: var(--primary-bg-color);
  .center-box {
    flex: 1;
    min-width: 65%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    background: #fff;
    border-radius: 0 12px 12px 0;
    &.mr-chat {
      margin-right: 10px;
    }
    .center-head {
      flex-shrink: 0;
      width: 100%;
      padding-right: 10px;
      margin: 0 auto 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #fff;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--default-font-color);
        line-height: 22px;
      }

      .right-handle-box {
        display: flex;
        align-items: center;
        gap: 10px;

        .add-icon {
          flex-shrink: 0;
          margin-right: 10px;
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        :deep(.search-input) {
          width: 240px;
          height: 36px;

          .el-input__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 1px #efefef inset;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }

        .open-chat {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 99px;
          height: 36px;
          font-size: 14px;
          color: var(--default-font-color);
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9e9e9;
          }

          .logo {
            flex-shrink: 0;
            display: block;
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    .center-content {
      flex: 1;
      user-select: text;
      height: 100%;
      overflow-y: auto;
      margin: 0 auto;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1);
    }
  }
  .right-box {
    flex: 1;
    height: 100%;
    overflow: hidden;
    // display: flex;
    // flex-direction: column;
    // border-left: 1px solid #efefef;
  }
}
</style>
