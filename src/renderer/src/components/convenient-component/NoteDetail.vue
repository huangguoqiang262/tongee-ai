<template>
  <div class="note-detail-box">
    <el-dialog
      v-model="noteVisible"
      :close-on-click-modal="false"
      align-center
      :show-close="false"
      destroy-on-close
      modal-class="note-detail-box-dialog"
      width="850"
    >
      <template #header>
        <div class="head-left">
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/notebook/notebook-icon.png"
            alt=""
          />
          <div class="">{{ noteTitle }}</div>
        </div>
        <div class="head-right">
          <div class="open-chat">
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
      </template>
      <div class="detail-box">
        <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" />
        <Editor
          v-model="deepData.content"
          class="editor-content"
          :default-config="editorConfig"
          mode="default"
          @on-created="handleCreated"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="last-save">最后保存：</div>
          <div class="words">字数：0</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { ref, shallowRef } from 'vue'
const noteVisible = defineModel({ type: Boolean })
const props = defineProps({
  noteDetail: {
    type: Object,
    default: () => ({})
  }
})
let defaultConfig = {
  excludeKeys: [
    'group-image',
    'group-video',
    'insertVideo',
    'unFullScreen',
    'fullScreen',
    'insertLink',
    'todo',
    'codeBlock',
    'emotion',
    'group-indent'
  ]
}
let noteTitle = ref('新增笔记')
const emits = defineEmits(['save'])
const close = () => {
  noteVisible.value = false
}
let editorRef = shallowRef(null)
let editorConfig = { placeholder: '请输入内容...' }
const handleCreated = (editor) => {
  editorRef.value = editor
  editorRef.value.clear()

  // editorRef.value.setContent(feedbackData.value.content)
}
let deepData = ref(cloneDeep(props.noteDetail))
let isEmpty = (rule, value, callback) => {
  // 匹配<p><br></p>
  let reg = /^<p><br><\/p>$/
  if (value.trim() === '') {
    callback('请输入内容')
  } else if (reg.test(value)) {
    callback('请输入内容')
  } else {
    callback()
  }
}
// 提交
const submitNote = () => {

  emits('save', props.noteDetail)
  noteVisible.value = false
}
</script>

<style scoped lang="scss">
.note-detail-box {
  :deep(.note-detail-box-dialog) {
    .el-dialog {
      padding: 13px 20px 14px;
      .el-dialog__header {
        padding-bottom: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-weight: 500;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;
        .head-left {
          display: flex;
          align-items: center;
          gap: 10px;
          .dialog-header-del-icon {
            width: 20px;
            height: 20px;
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

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;
        height: 660px;
        background: #f9f9f9;
        border-radius: 10px;
        .detail-box {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          .w-e-toolbar {
            flex-shrink: 0;
            background: transparent !important;
          }
          .editor-content {
            flex: 1;
            background: transparent !important;
            overflow: hidden;
            .w-e-text-container {
              background: transparent !important;
            }
          }
        }
      }
      .el-dialog__footer {
        .dialog-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #909090;
          line-height: 20px;
        }
      }
    }
  }
}
</style>
