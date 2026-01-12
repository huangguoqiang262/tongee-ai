<template>
  <div class="preview-message-page-box">
    <div class="close-box">
      <el-icon class="close-icon" @click="closePreview"><Close /></el-icon>
    </div>
    <div class="chat-content">
      <PreviewMessageRow
        v-for="(message, index) in deepMessages"
        :key="message.dateline + index"
        :message="message"
        :direction="props.direction"
        @handle-check="handleCheck"
      />
    </div>
    <div class="bottom-action-box">
      <div class="bottom-action">
        <el-button
          class="cancel-btn"
          :disabled="!shareMessages.length ? true : false"
          @click="handleLongImage"
          >生成长图</el-button
        >
        <el-button
          class="confirm-btn"
          :disabled="!shareMessages.length ? true : false"
          type="primary"
          @click="handleCopyLink"
        >
          复制链接
        </el-button>
      </div>
    </div>
    <el-dialog
      v-model="longImageVisible"
      align-center
      destroy-on-close
      modal-class="before-share-dialog longImg-share-dialog"
      width="800"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/notebook/share-icon.png" alt="" />
        <div class="title">生成长图预览</div>
      </template>
      <div class="long-img-box">
        <div class="head-box">
          <img class="logo" src="@renderer/assets/home/large-logo.png" alt="" />
          <div v-if="props.repositoryName" class="author-box">
            <div class="author">对话基于知识库：{{ props.repositoryName }}</div>
            <el-divider direction="vertical" />
            <div class="time-box">{{ userInfo.name }}生成</div>
          </div>
        </div>
        <div class="long-view-box">
          <!-- <div class="note-title">春天到了</div> -->
          <MessageRow
            v-for="(message, index) in shareMessages"
            :key="index"
            :image-size="'156px'"
            :is-pre-view="true"
            :message="message"
            :direction="props.direction"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" :disabled="!baseUrl" @click="handleDownloadLongImage"
            >下载图片</el-button
          >
          <el-button class="confirm-btn" type="primary" :disabled="!baseUrl" @click="copyLongImage">
            复制图片
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import cloneDeep from 'lodash.clonedeep'
import html2Canvas from 'html2canvas'
import { useUserInfo } from '@renderer/hooks/checkLogin'
import { copyBase64ImageAsNormalImage, downloadBase64Image } from '@renderer/utils/imageCopy.js'
import { ref, watch, computed, nextTick } from 'vue'
import { getChatHtml } from '@renderer/api/chat'
let props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  direction: {
    type: String,
    default: 'left'
  },
  repositoryName: {
    type: String,
    default: ''
  }
})
let emits = defineEmits(['closePreview'])
let baseUrl = ref('')
let loading = ref(false)
const deepMessages = ref([])
watch(
  () => props.messages,
  (newMessages) => {
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
const userInfo = useUserInfo()
const longImageVisible = ref(false)
const shareMessages = computed(() => {
  return deepMessages.value.filter((item) => item.checked)
})
const handleCopyLink = () => {
  if (shareMessages.value.length) {
    var data = {
      chat_key: shareMessages.value[0].sessionId,
      chat_words_ids: shareMessages.value.filter((item) => item.char_id).map((item) => item.char_id)
    }
    getChatHtml(data).then(async (res) => {
      // 复制
      await window.navigator.clipboard.writeText(res.data.file_path)
      // eslint-disable-next-line no-undef
      ElMessage.primary('复制成功')
    })
  }
}
const handleLongImage = () => {
  if (shareMessages.value.length) {
    longImageVisible.value = true
    loading.value = true
    nextTick(() => {
      html2Canvas(document.querySelector('.long-img-box'), { scale: 3, allowTaint: true })
        .then((canvas) => {
          baseUrl.value = canvas.toDataURL('image/png')
          loading.value = baseUrl.value ? false : true
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
}
// 复制长图
const copyLongImage = async () => {
  // 利用剪切版剪切长图
  try {
    await copyBase64ImageAsNormalImage(baseUrl.value)
    // eslint-disable-next-line no-undef
    ElMessage.primary('复制成功')
  } catch (error) {
    console.log(error)
  }
}
const handleDownloadLongImage = () => {
  // 下载长图逻辑
  downloadBase64Image(baseUrl.value, `预览图${new Date().getTime()}.png`)
}
const handleCheck = (message) => {
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
    width: 100%;
    max-width: 830px;
    height: 60px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .close-icon {
      margin-right: 10px;
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
    width: 100%;
    max-width: 770px;
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
      width: 100%;
      max-width: 770px;
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
  :deep(.before-share-dialog) {
    &.longImg-share-dialog {
      .el-dialog {
        height: 486px;
      }
      .el-dialog__body {
        position: relative;
        height: 368px;
        background: #ededed;
        border-radius: 10px;
        overflow-y: auto;
        .long-img-box {
          padding: 50px 20px 20px;
          margin: 0 auto;
          width: 570px;
          min-height: 368px;
          background: #f9f9f9 url('@renderer/assets/notebook/share-long-img-bg.png') no-repeat
            center top/570px 368px;
          .head-box {
            .logo {
              display: block;
              margin: 0 auto 28px;
              width: 180px;
              height: 50px;
            }
            .author-box {
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #909090;
              line-height: 20px;
            }
          }
          .long-view-box {
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            .note-title {
              margin-bottom: 20px;
              font-size: 16px;
              font-weight: 600;
              color: var(--default-font-color);
              line-height: 22px;
            }
          }
        }
      }
      .el-dialog__footer {
        padding-top: 13px;
      }
    }
    .el-dialog {
      .el-dialog__header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;

        .dialog-header-del-icon {
          width: 16px;
          height: 16px;
        }
      }

      .el-dialog__body {
        .type-list {
          .type-item {
            margin-bottom: 10px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            height: 76px;
            background: #f9f9f9;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            &:last-of-type {
              margin-bottom: 0;
            }
            &:active {
              background: #e9e9e9;
            }
            .icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }
            .right-type {
              flex: 1;
              .title {
                margin-bottom: 8px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
              }
              .des {
                font-size: 12px;
                color: #909090;
                line-height: 16px;
              }
            }
          }
        }
      }

      .dialog-footer {
        .cancel-btn,
        .confirm-btn {
          height: 36px;
          width: 80px;
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
}
</style>
