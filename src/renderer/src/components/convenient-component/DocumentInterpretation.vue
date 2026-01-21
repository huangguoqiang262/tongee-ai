<template>
  <div class="DocumentInterpretation">
    <div class="head-box">
      <div class="head-left">
        <img
          class="unscramble-icon"
          src="@renderer/assets/documentInterpretation/unscramble-icon.png"
          alt=""
        />
        <div>文档解读</div>
      </div>
      <el-icon class="close-icon" @click="closeMenu"><Close /></el-icon>
    </div>
    <el-upload
      v-show="!localfileList.length"
      ref="elUploadRef"
      class="upload-box"
      drag
      multiple
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleSelectChange"
      accept=".doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
    >
      <img
        class="document-icon"
        src="@renderer/assets/documentInterpretation/document-icon.png"
        alt=""
      />
      <div class="tip-title">将文档拖动至此或选择文档</div>
      <div class="tip-format">
        支持.doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式
      </div>
      <div class="btn-box">
        <div class="repository-btn" @click.stop="beforeUploadFiles('repository')">
          <img
            class="icon"
            src="@renderer/assets/documentInterpretation/repository-icon.png"
            alt=""
          />
          知识库文件
        </div>
        <div ref="uploadBtnRef" class="local-btn">
          <img class="icon" src="@renderer/assets/documentInterpretation/upload-icon.png" alt="" />
          本地文件
        </div>
      </div>
    </el-upload>
    <div
      v-if="localfileList.length"
      ref="attachListBox"
      class="attach-list-box"
      :class="showPrevBtn"
      @mouseenter="handleAttachBoxMouseEnter"
      @mouseleave="handleAttachBoxMouseLeave"
    >
      <div v-show="showPrevBtn && isHoveringAttachBox" class="pre-btn" @click="prevAttach">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div v-show="showNextBtn && isHoveringAttachBox" class="next-btn" @click="nextAttach">
        <el-icon><ArrowRight /></el-icon>
      </div>
      <div class="attach-list" @scroll="handleAttachListScroll">
        <div v-for="(item, index) in localfileList" :key="index" class="attach-item">
          <img
            class="del-icon"
            src="@renderer/assets/clear-icon1.png"
            alt=""
            @click.stop="clearAttach(index)"
          />
          <img class="attached-icon" :src="getFileIcon(item)" alt="" />
          <div class="attached-content">
            <div class="attach-name">
              {{ item.title }}
            </div>
            <div class="attach-type">
              <span class="file-extension">{{
                item.full_path?.split('.').pop()?.toUpperCase()
              }}</span>
              <span class="file-size">{{ formatFileSize(item.total_space) }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-popover
        ref="subActionPopoverRef"
        popper-class="sub-action-box"
        trigger="click"
        placement="bottom-start"
      >
        <template #reference>
          <div class="continue-box">
            <img class="icon" src="@renderer/assets/documentInterpretation/link-icon.png" alt="" />
            继续添加
          </div>
        </template>
        <div class="sub-action-upload" @click="beforeUploadFiles('local')">
          <img class="icon" src="@renderer/assets/documentInterpretation/upload-icon.png" alt="" />
          本地文件
        </div>
        <div class="sub-action-upload" @click="beforeUploadFiles('repository')">
          <img
            class="icon"
            src="@renderer/assets/documentInterpretation/repository-icon.png"
            alt=""
          />
          知识库文件
        </div>
      </el-popover>
    </div>
    <div class="input-box">
      <el-input
        ref="inputRef"
        v-model="message.text"
        resize="none"
        :autofocus="true"
        class="input"
        type="textarea"
        placeholder="询问关于该文档的任何问题"
        @keydown.enter.prevent="handleEnterSend"
      ></el-input>
      <!-- <img
        v-if="message.text.trim().length"
        class="send-icon"
        src="@renderer/assets/send-icon.png"
        alt=""
        @click="handleSendClick"
      /> -->
      <sendSvgIcon v-if="message.text.trim().length" class="send-icon" @click="handleSendClick" />
      <img v-else class="send-icon disabled" src="@renderer/assets/disabled-send-icon.png" alt="" />
    </div>
  </div>
  <OnlineFileSelection
    v-model="onlineFileVisible"
    @submit-import="handleSubmitImport"
  ></OnlineFileSelection>
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { useUserStore } from '@renderer/stores/user'
import { ref, watch, nextTick, onMounted, inject } from 'vue'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
import sendSvgIcon from '@renderer/assets/send-icon.svg'
let replaceActiveTab = inject('replaceActiveTab')
const message = ref({
  text: '',
  image: ''
})
const emit = defineEmits(['closeMenu'])
const closeMenu = () => {
  emit('closeMenu')
}
let inputRef = ref(null)
let subActionPopoverRef = ref(null)
let elUploadRef = ref(null)
let uploadBtnRef = ref(null)
let attachListBox = ref(null)
let showPrevBtn = ref(false)
let showNextBtn = ref(false)
let isHoveringAttachBox = ref(false)
let onlineFileVisible = ref(false)
// 文件列表
const localfileList = ref([])
// 处理发送点击
const handleSendClick = () => {
  if (message.value.text.trim().length) {
    replaceActiveTab({
      title: message.value.text,
      url: 'ChatPage',
      isInternal: true,
      attrs: {
        attach_files: cloneDeep(localfileList.value),
        message_text: message.value.text
      }
    })
    message.value.text = ''
    message.value.image = ''
    localfileList.value = []
  }
}
const handleEnterSend = (event) => {
  event.preventDefault()
  if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
    message.value.text += '\n'
    return false
  }
  if (!message.value.text.trim().length) {
    // eslint-disable-next-line no-undef
    ElMessage({
      message: '请输入消息',
      type: 'warning'
    })
    message.value.text = ''
    return false
  }
  handleSendClick()
}
// 处理导入文件
const handleSubmitImport = (files) => {
  localfileList.value.push(...files)
}
const handleSelectChange = (file) => {
  // 如果是文件夹，使用新的目录树结构
  if (file.webkitRelativePath) {
    // // 处理文件夹上传
    // file.type = 'directory'
    // file.uploadStatus = 'pending'
    // localfileList.value.push(file)
  } else {
    // 处理单个文件
    file.type = 'file'
    file.uploadStatus = 'pending'
    // localfileList.value.push(file)
    let fileItem = {
      ...file,
      file: file.raw
    }
    uploadSingleFile(fileItem)
    // ReadyUploadList.push({
    //   type: 'directory',
    //   name: directoryTree.name,
    //   path: directoryTree.path,
    //   fileCount: directoryTree.fileCount,
    //   children: directoryTree.children,
    //   uploadStatus: 'pending'
    // })
  }
}
// 上传单个文件（简化版本，去掉重试机制）
const uploadSingleFile = async (fileItem) => {
  const userStore = useUserStore()
  // eslint-disable-next-line no-undef
  let loadcontext = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.3)',
    customClass: 'upload-loading'
  })
  const formData = new FormData()
  formData.append('uniacid', userStore.uniacid)
  formData.append('file[]', fileItem.file) // 实际使用时需要真实文件数据
  const xhr = new XMLHttpRequest()

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const progress = (event.loaded / event.total) * 100
      fileItem.progress = Math.round(progress)
    }
  }

  xhr.onload = () => {
    loadcontext.close()
    let response = JSON.parse(xhr.response)
    if (xhr.status == 200 && response.code == 200) {
      var uploadedFile = {
        full_path: response.data[0].url,
        title: response.data[0].file_name,
        total_space: response.data[0].file_size,
        fileId: response.data[0].fileId
      }
      localfileList.value.push(uploadedFile)
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: response.msg || '上传失败',
        type: 'error'
      })
    }
  }

  xhr.onerror = () => {
    loadcontext.close()
  }

  // 实际使用时需要配置正确的上传地址
  xhr.open('POST', import.meta.env.VITE_API_BASE_URL + '/api/common/upload')
  xhr.setRequestHeader('Authorization', userStore.token)
  xhr.send(formData)
}
const beforeUploadFiles = (type) => {
  if (subActionPopoverRef.value) {
    subActionPopoverRef.value.hide()
  }
  if (type === 'repository') {
    // 知识库文件上传
    onlineFileVisible.value = true
  } else if (type === 'local') {
    // 本地文件上传
    elUploadRef.value.clearFiles()
    uploadBtnRef.value.click()
  }
}
// 更新滚动按钮显示状态
const updateScrollButtons = () => {
  const attachList = attachListBox.value?.querySelector('.attach-list')

  if (!attachListBox.value || !attachList) return

  // 检查是否需要显示滚动按钮
  const isOverflow = attachList.scrollWidth > attachListBox.value.offsetWidth
  const scrollLeft = attachList.scrollLeft
  const maxScrollLeft = attachList.scrollWidth - attachListBox.value.offsetWidth

  // 更新按钮显示状态
  showPrevBtn.value = isOverflow && scrollLeft > 0
  showNextBtn.value = isOverflow && scrollLeft < maxScrollLeft
}

// 向左滚动
const prevAttach = () => {
  const attachList = attachListBox.value?.querySelector('.attach-list')
  if (!attachListBox.value || !attachList) return
  const scrollAmount = 200 // 每次滚动200px
  attachList.scrollLeft -= scrollAmount

  // 滚动结束后更新按钮状态
  setTimeout(() => {
    updateScrollButtons()
  }, 300)
}

// 向右滚动
const nextAttach = () => {
  const attachList = attachListBox.value?.querySelector('.attach-list')
  if (!attachListBox.value || !attachList) return

  const scrollAmount = 210 // 每次滚动200px
  attachList.scrollLeft += scrollAmount

  // 滚动结束后更新按钮状态
  setTimeout(() => {
    updateScrollButtons()
  }, 300)
}

// 鼠标进入 attach-list-box
const handleAttachBoxMouseEnter = () => {
  isHoveringAttachBox.value = true
}

// 鼠标离开 attach-list-box
const handleAttachBoxMouseLeave = () => {
  isHoveringAttachBox.value = false
}

// 监听滚动事件
const handleAttachListScroll = () => {
  updateScrollButtons()
}
onMounted(() => {
  updateScrollButtons()
  nextTick(() => {
    inputRef.value.focus()
  })
  watch(
    localfileList,
    () => {
      nextTick(() => {
        updateScrollButtons()
      })
    },
    { deep: true }
  )
})
const clearAttach = (i) => {
  localfileList.value.splice(i, 1)
}
// 获取文件图标
const getFileIcon = (item) => {
  // 根据文件扩展名返回不同的图标
  const ext = item.full_path?.split('.').pop()?.toLowerCase()
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
    csv: csvIcon,
    ppt: pptIcon,
    pptx: pptIcon,
    txt: txtIcon,
    png: imgIcon,
    jpg: imgIcon,
    jpeg: imgIcon,
    gif: imgIcon
  }

  return iconMap[ext] || wordIcon
}
const formatFileSize = (kb) => {
  if (!kb) return '0 KB'
  if (kb < 1024) {
    return kb + ' KB'
  } else if (kb < 1024 * 1024) {
    return (kb / 1024).toFixed(2) + ' MB'
  } else if (kb < 1024 * 1024 * 1024) {
    return (kb / (1024 * 1024)).toFixed(2) + ' GB'
  } else {
    return (kb / (1024 * 1024 * 1024)).toFixed(2) + ' TB'
  }
}
defineExpose({
  uploadSingleFile
})
</script>

<style scoped lang="scss">
.DocumentInterpretation {
  box-sizing: border-box;
  padding: 0 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 850px;
  max-height: 442px;
  background: #ffffff;
  box-shadow: 0px 2px 60px 8px rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  user-select: none;

  .head-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 54px;

    .head-left {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: var(--default-font-color);
      line-height: 22px;

      .unscramble-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }

    .close-icon {
      color: #737475;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s linear;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .upload-box {
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 320px;
      background: #f9f9f9;
      border-radius: 10px;
    }

    .document-icon {
      margin-bottom: 20px;
      width: 28px;
      height: 33px;
    }

    .tip-title {
      margin-bottom: 10px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
    }

    .tip-format {
      margin-bottom: 40px;
      font-size: 14px;
      color: #aeaeae;
      line-height: 20px;
    }

    .btn-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0 10px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;

      .repository-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0 2px;
        width: 118px;
        height: 32px;
        background: #eeeeee;
        border-radius: 4px;

        &:hover {
          background: rgba(0, 0, 0, 0.07);
        }
      }

      .local-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0 2px;
        width: 104px;
        height: 32px;
        background: #eeeeee;
        border-radius: 4px;

        &:hover {
          background: rgba(0, 0, 0, 0.07);
        }
      }

      .icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
    }
  }

  .attach-list-box {
    position: relative;
    box-sizing: border-box;
    padding: 0 20px;
    min-height: 150px;
    max-height: 300px;
    background: #f9f9f9;
    border-radius: 10px;
    .pre-btn {
      position: absolute;
      height: 58px;
      left: 0;
      top: 20px;
      z-index: 2;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      background: #fff;
      border-radius: 0 8px 8px 0;
    }
    .next-btn {
      position: absolute;
      height: 58px;
      right: 0;
      top: 20px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      background: #fff;
      z-index: 2;
      border-radius: 8px 0 0 8px;
    }
    .attach-list {
      margin-bottom: 14px;
      padding: 20px 10px 20px 0;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow-x: auto;
      gap: 10px;
      &::-webkit-scrollbar {
        display: none;
      }
      /* 对于IE和Edge的旧版浏览器 */
      -ms-overflow-style: none;
      border-bottom: 1px solid #efefef;

      .attach-item {
        flex-shrink: 0;
        position: relative;
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        align-items: center;
        width: 200px;
        height: 58px;
        border-radius: 4px;
        border: 1px solid #efefef;
        &:hover {
          background: var(--primary-bg-color);
          .del-icon {
            display: block;
          }
        }
        .del-icon {
          display: none;
          position: absolute;
          top: -6px;
          right: -6px;
          z-index: 1;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .attached-icon {
          flex-shrink: 0;
          display: block;
          margin-right: 4px;
          width: 36px;
          height: 36px;
        }
        .attached-content {
          flex: 1;
          overflow: hidden;
          .attach-name {
            margin-bottom: 4px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            font-size: 14px;
            line-height: 20px;
            color: var(--default-font-color);
          }
          .attach-type {
            display: flex;
            align-items: center;
            font-size: 10px;
            color: #909090;
            line-height: 12px;
            .file-extension {
              margin-right: 4px;
              display: inline-block;
            }
            .file-size {
              display: inline-block;
            }
          }
        }
      }
    }

    .continue-box {
      display: inline-flex;
      align-items: center;
      gap: 0 4px;
      font-size: 16px;
      color: var(--el-color-primary);
      line-height: 22px;
      cursor: pointer;
      .icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        display: block;
      }
    }
  }

  .input-box {
    min-height: 68px;
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .input {
      width: calc(100% - 40px);
      // flex: 1;
      flex-shrink: 0;
      font-size: 16px;

      :deep(.el-textarea__inner) {
        // width: 100%;
        height: 34px;
        border: none;
        box-shadow: none;
        overflow-y: auto;
        // transition: all 0.3s ease;
        /* 隐藏滚动条轨道 */
        // &::-webkit-scrollbar {
        //   display: none;
        // }
        // /* 对于IE和Edge的旧版浏览器 */
        // -ms-overflow-style: none;
      }
    }

    .send-icon {
      margin-left: 5px;
      flex-shrink: 0;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: var(--el-color-primary);
      cursor: pointer;

      &.disabled {
        cursor: not-allowed;
        box-shadow: none !important;
      }

      &:hover {
        box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>
<style lang="scss">
.sub-action-box {
  padding: 16px 18px !important;
  box-shadow: 0px 2px 20px 8px rgba(0, 0, 0, 0.07) !important;
  border-radius: 8px !important;

  .sub-action-upload {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 14px;
    line-height: 22px;
    color: var(--default-font-color);
    cursor: pointer;

    &:nth-last-of-type(1) {
      margin-bottom: 0;
    }

    .icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
    }
  }
}
</style>
