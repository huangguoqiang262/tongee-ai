<template>
  <div class="note-detail-box disabled-tools-chat">
    <el-dialog
      v-model="noteVisible"
      :close-on-click-modal="false"
      align-center
      :show-close="false"
      destroy-on-close
      modal-class="note-detail-box-dialog"
    >
      <div class="parent-box">
        <div class="detail-box">
          <div class="head">
            <div class="head-left">
              <img
                class="dialog-header-del-icon"
                src="@renderer/assets/notebook/notebook-icon.png"
                alt=""
              />
              <div class="">{{ noteTitle }}</div>
            </div>
            <div class="head-right">
              <div
                v-if="deepData.type !== 'add' && !chatVisible"
                class="open-chat"
                @click="openChat"
              >
                <img class="logo" src="@renderer/assets/logo.png" alt="" />
                问问糖源
              </div>
              <img
                class="save"
                src="@renderer/assets/notebook/save-icon.png"
                alt=""
                @click="submitNote"
              />
              <el-icon class="close-icon" @click="close"><Close /></el-icon>
            </div>
          </div>
          <div class="detail-content-box">
            <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" />
            <el-input
              v-model="deepData.title"
              type="input"
              size="large"
              class="title-input"
              placeholder="请输入标题"
            ></el-input>
            <Editor
              v-model="deepData.content"
              class="editor-content"
              :default-config="editorConfig"
              mode="default"
              @on-created="handleCreated"
            />
          </div>
          <div class="dialog-footer">
            <div class="last-save">最后保存：{{ formatTimeFun() }}</div>
            <div class="words">字数：{{ size || 0 }}</div>
          </div>
        </div>
        <div v-if="chatVisible" class="chat-box">
          <ToolChat
            :notebook-id="notebookId"
            :note-id="noteDetail.id"
            @close-chat="chatVisible = false"
            @submit-import="submitImport"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { useUserStore } from '@renderer/stores/user'
import { formatTime } from '@renderer/utils/index.js'
import { convertToPlainText } from '@renderer/utils/convertToPlainText.js'
import { ref, shallowRef, watchEffect, computed } from 'vue'
const noteVisible = defineModel({ type: Boolean })
const props = defineProps({
  noteDetail: {
    type: Object,
    default: () => ({})
  },
  notebookId: {
    type: [Number, String],
    default: ''
  }
})
let defaultConfig = {
  excludeKeys: [
    'insertImage',
    'group-video',
    'insertVideo',
    'unFullScreen',
    'fullScreen',
    'viewLink',
    'todo',
    'codeBlock',
    'emotion',
    'group-indent'
  ]
}
let chatVisible = ref(false)
let noteTitle = ref('新增笔记')
const emits = defineEmits(['save', 'submitImport'])
const close = () => {
  noteVisible.value = false
}
let editorRef = shallowRef(null)
const userStore = useUserStore()
let editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_API_BASE_URL + '/api/common/upload',
      headers: {
        Authorization: userStore.token,
        uniacid: userStore.uniacid
      },
      fieldName: 'file[]',
      meta: {
        uniacid: userStore.uniacid
      },
      allowedFileTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'],
      customInsert(res, insertFn) {
        insertFn(res.data[0].url, res.data[0].file_type || '', res.data[0].url || '')
      }
    }
  }
}
const handleCreated = (editor) => {
  editorRef.value = editor
}
let deepData = ref({})
let size = computed(
  () => convertToPlainText(deepData.value.content).length + (deepData.value.title || '').length
)
const formatTimeFun = () => {
  return deepData.value?.updatetime ? formatTime(deepData.value.updatetime) : ''
}
watchEffect(() => {
  deepData.value = cloneDeep(props.noteDetail)
  if (deepData.value.type === 'add') {
    noteTitle.value = '新增笔记'
  } else {
    noteTitle.value = '编辑笔记'
  }
})
let isEmpty = (value, callback) => {
  // 匹配<p><br></p>
  let reg = /^<p><br><\/p>$/
  if (value.trim() === '') {
    callback('请输入笔记内容')
  } else if (reg.test(value)) {
    callback('请输入笔记内容')
  } else {
    callback()
  }
}
// 打开聊天窗口
const openChat = () => {
  chatVisible.value = true
}
// 提交导入的笔记
const submitImport = () => {
  emits('submitImport')
}
// 提交
const submitNote = () => {
  isEmpty(deepData.value.content, (msg) => {
    if (msg) {
      // eslint-disable-next-line no-undef
      ElMessage.error(msg)
      return
    } else {
      emits('save', deepData.value)
    }
  })
}
</script>

<style scoped lang="scss">
.note-detail-box {
  :deep(.note-detail-box-dialog) > .el-overlay-dialog > .el-dialog {
    padding: 0;
    max-width: 80vw;
    min-width: 850px;
    width: fit-content;
    background: transparent;
    > .el-dialog__header {
      padding-bottom: 0;
    }
    > .el-dialog__body {
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      overflow: hidden;
      height: 660px;
      border-radius: 10px;
      .parent-box {
        height: 100%;
        display: flex;
        align-items: flex-start;
        gap: 0 10px;
        .detail-box {
          padding: 10px 20px;
          flex: 1;
          box-sizing: border-box;
          width: 850px;
          min-width: 560px;
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          background: #fff;
          .head {
            flex-shrink: 0;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            font-weight: 500;
            font-size: 14px;
            color: var(--default-font-color);
            line-height: 22px;
            .head-left {
              display: flex;
              align-items: center;
              gap: 10px;
              .dialog-header-del-icon {
                width: 16px;
                height: 16px;
              }
            }
            .head-right {
              display: flex;
              align-items: center;
              gap: 20px;
              .close-icon {
                color: #737475;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.2s linear;
                &:hover {
                  color: var(--el-color-primary);
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
              .save {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                cursor: pointer;
              }
            }
          }
          .detail-content-box {
            box-sizing: border-box;
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #f9f9f9;
            overflow: hidden;
          }
          .w-e-toolbar {
            flex-shrink: 0;
            background: transparent !important;
          }
          .title-input {
            flex-shrink: 0;
            width: calc(100% - 10px);
            margin: 10px auto 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--default-font-color);
            .el-input__wrapper {
              padding: 1px 10px;
              box-shadow: none;
              background: transparent;
              &.is-focus {
                background: #f8fafc;
              }
              .el-input__inner {
                font-weight: 600;
                font-size: 16px;
                &::placeholder {
                  font-size: 16px;
                  font-weight: 600;
                  color: #909090;
                }
              }
            }
          }
          .editor-content {
            flex: 1;
            padding: 0 5px;
            background: transparent !important;
            overflow: hidden;
            .w-e-text-container {
              background: transparent !important;
              .w-e-text-placeholder {
                color: #909090;
              }
            }
          }
          .dialog-footer {
            flex-shrink: 0;
            padding-top: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            color: #909090;
            line-height: 20px;
          }
        }
        .chat-box {
          flex: 1;
          flex-shrink: 0;
          min-width: 375px;
          height: 100%;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
