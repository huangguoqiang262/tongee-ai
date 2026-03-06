<template>
  <div class="document-detail">
    <el-splitter>
      <el-splitter-panel min="50%" class="center-box" :class="{ 'mr-chat': chatVisible }">
        <div class="center-head">
          <div class="title">{{ fileName }}</div>
          <div class="right-handle-box">
            <template v-if="user_status == 0 || user_status == 2">
              <template v-if="user_status == 0">
                <el-button class="btn" size="small" @click="confirmFeedback">确认反馈</el-button>
                <el-button class="btn" size="small" type="primary" @click="confirmPass"
                  >确认通过</el-button
                >
              </template>
              <el-button
                v-else-if="user_status == 2"
                class="btn"
                size="small"
                @click="approverInbound"
                >批准入库</el-button
              >
            </template>
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
        <onlyofficePreview
          v-if="fileUrl && loading"
          class="center-content"
          :src="fileUrl"
          :file-name="fileName"
          :file-key="fileKey"
          :download="download"
          :mode="user_status == 0 ? 'edit' : 'view'"
        />
      </el-splitter-panel>
      <el-splitter-panel v-if="chatVisible" :min="375" :size="375" class="right-box">
        <CommonChat
          :is-active-tab="props.isActiveTab"
          :attach-files="attach_files"
          :chat-key="props.attrs.chat_key"
          @close-chat="chatVisible = false"
        />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import {
  get_project_user_status,
  synergia_simple_feedback,
  synergia_task_complete,
  synergia_complete_approve
} from '@renderer/api/repository'
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
let loading = ref(false)
let fileUrl = ref('')
let fileName = ref('')
let fileKey = ref('')
let download = ref(false)
let chatVisible = ref(false)
let attach_files = ref([
  {
    title: props.attrs.fileName,
    full_path: props.attrs.fileUrl,
    fileId: props.attrs.fileId || '',
    itemId: props.attrs.itemId || ''
  }
])
let user_status = ref(null)
const getDetailStatus = () => {
  loading.value = false
  get_project_user_status({ item_id: props.attrs.itemId })
    .then((res) => {
      if (res.code == 200) {
        user_status.value = res.data.user_status
      }
    })
    .finally(() => {
      loading.value = true
    })
}
// 确认反馈
const confirmFeedback = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认反馈吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 确认反馈
      synergia_simple_feedback({
        item_id: props.attrs.itemId || ''
      }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('反馈成功')
          getDetailStatus()
        }
      })
    })
    .catch(() => {})
}
// 确认通过
const confirmPass = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认通过吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 确认反馈
      synergia_task_complete({
        item_id: props.attrs.itemId || ''
      }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('通过成功')
          getDetailStatus()
        }
      })
    })
    .catch(() => {})
}
// 批准入库
const approverInbound = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认批准入库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 批准入库
      // 确认反馈
      synergia_complete_approve({
        item_id: props.attrs.itemId || ''
      }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('批准成功')
          getDetailStatus()
        }
      })
    })
    .catch(() => {})
}
const openChat = () => {
  chatVisible.value = true
}
watchEffect(() => {
  fileUrl.value = props.attrs.fileUrl || ''
  fileName.value = props.attrs.fileName || ''
  fileKey.value = props.attrs.fileId || ''
  download.value = props.attrs.download || false
  if (props.attrs.itemId) {
    getDetailStatus()
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
        .btn {
          flex-shrink: 0;
          width: 76px;
          height: 26px;
          border-radius: 6px;
          margin-left: 0;
        }

        .open-chat {
          flex-shrink: 0;
          margin-left: 10px;
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
