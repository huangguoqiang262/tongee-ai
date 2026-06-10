<template>
  <div class="document-detail">
    <el-splitter>
      <el-splitter-panel min="50%" class="center-box" :class="{ 'mr-chat': chatVisible }">
        <div class="center-head">
          <div class="title">{{ fileName }}</div>
          <div v-if="!IS_VIDEO" class="right-handle-box">
            <div v-if="!chatVisible" class="open-chat" @click="openChat">
              <img class="logo" src="@renderer/assets/logo.png" alt="" />
              问问糖源
            </div>
          </div>
        </div>
        <!-- <FilePreview
          v-if="fileUrl"
          class="center-content"
          :file-url="fileUrl"
          :file-name="fileName"
        /> -->
        <div v-if="IS_VIDEO" id="video-player"></div>
        <template v-else>
          <onlyofficePreview v-if="fileUrl && !IS_NOTE && !IS_WEB" class="center-content" :src="fileUrl" :file-name="fileName"
            :file-key="fileKey" :download="download" :mode="'view'" />
          <div v-if="IS_NOTE" class="note-box">
            <div class="note-content">
              <v-md-preview :text="noteInfo.content"></v-md-preview>
            </div>
          </div>
          <div v-else-if="IS_WEB" class="note-box">
              <webview class="note-content" allowpopups :src="webUrl"></webview>
          </div>
        </template>
      </el-splitter-panel>
      <el-splitter-panel v-if="chatVisible" :min="375" :size="375" class="right-box">
        <CommonChat :is-active-tab="props.isActiveTab" :attach-files="attach_files" :chat-key="props.attrs.chat_key"
          @close-chat="chatVisible = false" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { I18N } from 'xgplayer'
import ZH from 'xgplayer/es/lang/zh-cn'
import { nextTick, ref, watchEffect } from 'vue'
import { get_note_info } from '@renderer/api/note'
// 启用中文
I18N.use(ZH)
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
let fileKey = ref('')
let download = ref(false)
let chatVisible = ref(false)
let IS_VIDEO = ref(false) //如果是视频，则使用xgplayer播放器 只做播放  不能进行问一问
let IS_NOTE = ref(false)
let note_id = ref('')
let noteInfo = ref({})
let IS_WEB = ref(false)
let webUrl = ref('')
let attach_files = ref([
  {
    title: props.attrs.fileName,
    full_path: props.attrs.fileUrl,
    fileId: props.attrs.fileId || ''
  }
])
const openChat = () => {
  chatVisible.value = true
}
const getNote = () => {
  get_note_info({ note_id: note_id.value }).then(res => {
    if (res.code == 200) {
      noteInfo.value = res.data
    }
  })
}
watchEffect(() => {
  fileUrl.value = props.attrs.fileUrl || ''
  fileName.value = props.attrs.fileName || ''
  fileKey.value = props.attrs.fileId || ''
  download.value = props.attrs.download || false
  var allowedTypes = ['.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.mkv',
    '.rmvb',
    '.webm',
    '.3gp',
    '.mpeg',
    '.mpg']
  const fileExt = '.' + fileUrl.value.split('.').pop().toLowerCase()
  if (allowedTypes.includes(fileExt)) {
    IS_VIDEO.value = true
    nextTick(() => {
      let player = new Player({
        id: 'video-player',
        url: fileUrl.value,
        height: '100%',
        width: '100%',
      });
    })
  } else if (props.attrs.note_id && props.attrs.note_id != 0) {
    note_id.value = props.attrs.note_id
    IS_NOTE.value = true
    getNote()
  } else if (props.attrs.webUrl) {
    IS_WEB.value = true
    webUrl.value = props.attrs.webUrl
  }

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

  :deep(.center-box) {
    flex: 1;
    min-width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    background: #fff;
    border-radius: 0 12px 12px 0;

    &.mr-chat {
      margin-right: 5px;
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
      overflow: hidden;

      .title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--default-font-color);
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

        .search-input {
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
      width: 100%;
      overflow-y: auto;
      margin: 0 auto;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1);
    }

    .note-box {
      flex: 1;
      user-select: text;
      width: 100%;
      overflow: hidden;
      margin: 0 auto;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;

      .note-content {
        overflow-y: auto;
        height: 100%;
        width: 100%;
      }
    }

    #video-player {
      flex: 1;
      width: 100%;
    }
  }

  :deep(.right-box) {
    flex: 1;
    height: 100%;
    overflow: hidden;
    margin-left: 5px;
    // display: flex;
    // flex-direction: column;
    // border-left: 1px solid #efefef;
  }
}
</style>
