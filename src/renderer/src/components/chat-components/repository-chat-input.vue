<template>
  <div class="message-input" :class="{ focus: focus }">
    <div v-if="isChatting" class="stop-chat-box" @click="stopChat">
      <img class="stop-icon" src="@renderer/assets/chat-icon/stop-icon.png" alt="" />
      停止回答
    </div>
    <div ref="inputWrapper" class="input-wrapper">
      <div
        v-if="fileList.length"
        ref="attachListBox"
        class="attach-list-box"
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
          <div v-for="(item, index) in fileList" :key="index" class="attach-item">
            <img
              class="del-icon"
              src="@renderer/assets/clear-icon1.png"
              alt=""
              @click.stop="clearAttach(index)"
            />
            <img class="attached-icon" src="@renderer/assets/attached-icon.png" alt="" />
            <div class="attached-content">
              <div class="attach-name">
                {{ item.name }}
              </div>
              <div class="attach-type">
                <span class="file-extension">{{ getFileExtension(item.type).toUpperCase() }}</span>
                <!-- <span class="file-size">{{ formatFileSize(item.size) }}</span> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="input-box">
        <!-- 按回车键发送，输入框高度三行 -->
        <el-mention
          v-model="message.text"
          :disabled="isChatting"
          autosize
          class="input"
          resize="none"
          placeholder="基于知识库提问"
          type="textarea"
          @focus="focus = true"
          @blur="focus = false"
          @keydown.enter.prevent="sendMessage"
          @paste="handlePaste"
        >
        </el-mention>
      </div>
      <div class="action-box">
        <div class="action-left">
          <el-select
            v-model="modelValue"
            size="small"
            popper-class="message-input-model-select"
            placeholder="选择模型"
            @change="selectModel"
          >
            <el-option
              v-for="item in models"
              :key="item.model_name + '/' + item.provider_key + '/' + item.id"
              :label="item.model_name"
              :value="
                item.model_name + '/' + item.provider_key + '/' + item.id + '/' + item.net_status
              "
            >
              <div class="value-text">{{ item.model_name }}</div>
              <div class="value-label">{{ item.desc }}</div>
            </el-option>
          </el-select>
          <template v-if="enableSearch == 1">
            <div class="line"></div>
            <div
              class="networking"
              :class="{ 'is-network': isNetwork }"
              @click.stop="networkChange"
            >
              联网
              <div class="circle-icon"></div>
            </div>
          </template>
        </div>
        <div class="btn-box">
          <!-- <img
            v-if="message.text.trim().length && !isChatting"
            class="send-icon"
            src="@renderer/assets/send-icon.png"
            alt=""
            @click="sendMessage"
          /> -->
          <sendSvgIcon
            v-if="message.text.trim().length && !isChatting"
            class="send-icon"
            @click="sendMessage"
          />
          <img
            v-else
            class="send-icon disabled"
            src="@renderer/assets/disabled-send-icon.png"
            alt=""
          />
        </div>
      </div>
    </div>
    <div class="tips">内容由AI生成仅供参考</div>
  </div>
</template>
<script>
import sendSvgIcon from '@renderer/assets/send-icon.svg'
export default {
  name: 'RepositoryChatInput',
  components: {
    sendSvgIcon
  },
  inject: ['addNewTab'],
  props: {
    // eslint-disable-next-line vue/prop-name-casing
    attach_file: {
      type: Array,
      default: () => []
    },
    models: {
      type: Array,
      default: () => []
    },
    // eslint-disable-next-line vue/prop-name-casing
    model_id: {
      type: [Number, String],
      default: ''
    },
    //是否正在对话
    isChatting: {
      type: Boolean,
      default: false
    },
    isNetwork: {
      type: Boolean,
      default: false
    },
    // 是否联网
    enableSearch: {
      type: [Number, String],
      default: 2
    }
  },
  emits: ['stopChat', 'networkChange', 'selectModel', 'uploadedAttachment', 'send'],
  data() {
    return {
      knowledge_id: '',
      message: { text: '', image: '' },
      showModel: false,
      showRepository: false,
      ossUpload: import.meta.env.VITE_BASE_URL + '/intelligence/upload_attach',
      token: '',
      loading: false,
      uniacid: 2,
      modelValue: undefined,
      focus: false,
      fileList: [],
      showPrevBtn: false,
      showNextBtn: false,
      isHoveringAttachBox: false
    }
  },
  watch: {
    model_id: {
      handler(newVal, oldVal) {
        if (newVal != oldVal) {
          this.modelValue = newVal
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.modelValue = this.model_id
    // this.setupScreenshotListeners()
    this.$watch(
      'fileList',
      () => {
        this.$nextTick(() => {
          this.updateScrollButtons()
        })
      },
      { deep: true }
    )
  },
  methods: {
    // 是否联网
    networkChange() {
      if (!this.enableSearch || this.enableSearch == 2) return
      this.$emit('networkChange', this.isNetwork)
    },
    // 更新滚动按钮显示状态
    updateScrollButtons() {
      const attachListBox = this.$refs.attachListBox
      const attachList = attachListBox?.querySelector('.attach-list')

      if (!attachListBox || !attachList) return

      // 检查是否需要显示滚动按钮
      const isOverflow = attachList.scrollWidth > attachListBox.offsetWidth
      const scrollLeft = attachList.scrollLeft
      const maxScrollLeft = attachList.scrollWidth - attachListBox.offsetWidth

      // 更新按钮显示状态
      this.showPrevBtn = isOverflow && scrollLeft > 0
      this.showNextBtn = isOverflow && scrollLeft < maxScrollLeft
    },

    // 向左滚动
    prevAttach() {
      const attachList = this.$refs.attachListBox?.querySelector('.attach-list')
      if (!attachList) return

      const scrollAmount = 200 // 每次滚动200px
      attachList.scrollLeft -= scrollAmount

      // 滚动结束后更新按钮状态
      setTimeout(() => {
        this.updateScrollButtons()
      }, 300)
    },

    // 向右滚动
    nextAttach() {
      const attachList = this.$refs.attachListBox?.querySelector('.attach-list')
      if (!attachList) return

      const scrollAmount = 210 // 每次滚动200px
      attachList.scrollLeft += scrollAmount

      // 滚动结束后更新按钮状态
      setTimeout(() => {
        this.updateScrollButtons()
      }, 300)
    },

    // 鼠标进入 attach-list-box
    handleAttachBoxMouseEnter() {
      this.isHoveringAttachBox = true
    },

    // 鼠标离开 attach-list-box
    handleAttachBoxMouseLeave() {
      this.isHoveringAttachBox = false
    },

    // 监听滚动事件
    handleAttachListScroll() {
      this.updateScrollButtons()
    },
    // 处理粘贴事件
    handlePaste() {
      return false
      // if (this.isChatting) {
      //   // ElMessage.warning('正在对话中，无法粘贴图片')
      //   return
      // }

      // const clipboardData = event.clipboardData || window.clipboardData
      // if (!clipboardData) return

      // // 检查是否有图片数据
      // const items = clipboardData.items
      // for (let i = 0; i < items.length; i++) {
      //   const item = items[i]
      //   if (item.type.indexOf('image') !== -1) {
      //     // 阻止默认的粘贴行为
      //     event.preventDefault()

      //     const file = item.getAsFile()
      //     if (file) {
      //       this.handleImageFile(file)
      //     }
      //     break
      //   }
      // }
    },
    // 自定义上传逻辑
    customUpload(options) {
      console.log(options, 88888)
      return
      // const xhr = new XMLHttpRequest()
      // const formData = new FormData()
      // formData.append('file[]', options.file)
      // var otherParams = {
      //   type: 'file',
      //   uniacid: this.uniacid
      // }
      // // 添加其他参数到formData
      // for (const key in otherParams) {
      //   formData.append(key, otherParams[key])
      // }

      // xhr.open('POST', this.aiFileUpload, true)

      // // 设置请求头
      // xhr.setRequestHeader('Authorization', this.importHeader.token)
      // xhr.upload.addEventListener('progress', (event) => {
      //   if (event.lengthComputable) {
      //     const percent = (event.loaded / event.total) * 100
      //     this.handleUploadProgress({ percent }, options.file, this.fileList)
      //   }
      // })

      // xhr.addEventListener('load', () => {
      //   var response = JSON.parse(xhr.response)
      //   if (xhr.status == 200 && response.code == 200) {
      //     this.handleUploadSuccess(response, options.file, this.fileList)
      //   } else {
      //     this.handleUploadError(response, options.file, this.fileList)
      //   }
      // })

      // xhr.addEventListener('error', (err) => {
      //   this.handleUploadError(err, options.file, this.fileList)
      // })

      // xhr.send(formData)
    },
    handleFileChange(file, fileListArr) {
      fileListArr.forEach((f) => {
        if (!f.progress) f.progress = 0
        if (!f.status) f.status = 'pending'
        if (!f.serial_key) f.serial_key = ''
        if (!f.is_zy_success) f.is_zy_success = 0
      })
      this.fileList = fileListArr
    },
    handleUploadProgress(event, file) {
      const targetFile = this.fileList.find((f) => f.uid === file.uid)
      if (targetFile) {
        targetFile.status = 'uploading'
        targetFile.progress = Math.floor(event.percent)
      }
    },
    handleUploadSuccess(response, file) {
      const targetFile = this.fileList.find((f) => f.uid === file.uid)
      if (targetFile) {
        targetFile.status = 'success'
        targetFile.progress = 100
        targetFile.serial_key = response.data[0]
      }
      this.$refs.fileList.scrollTo(0, this.$refs.fileList.scrollHeight)
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'primary',
        message: '上传成功'
      })
    },

    // 处理上传失败事件
    handleUploadError(error, file) {
      const i = this.fileList.findIndex((f) => f.uid === file.uid)
      // if (targetFile) {
      //   targetFile.status = "error";
      //   targetFile.progress = 0;
      // }
      if (i !== -1) {
        this.fileList.splice(i, 1)
      }
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'error',
        message: error.msg || '上传失败'
      })
    },
    formatFileSize(kb) {
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
    },
    // 处理图片文件
    handleImageFile(file) {
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return
      }
      var tempFile = {
        uid: Date.now() + '-' + Math.random().toString(36).substring(2, 10),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        serial_key: ''
      }
      this.fileList.push(tempFile)
      this.customUpload(tempFile)
    },

    // 获取文件扩展名
    getFileExtension(mimeType) {
      // doc、docx、xls、xlsx、pdf、txt、ppt、pptx、jpg、jpeg、png、gif
      const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
      }
      return extensions[mimeType] || 'jpg'
    },
    // 设置截图事件监听
    setupScreenshotListeners() {
      // 截图开始事件
      // window.customApi?.onScreenshotStart(() => {
      //   console.log('截图开始')
      // })

      // 截图确定事件
      window.customApi?.onScreenshotOk((event, data) => {
        this.handleScreenshotAsPaste(data)
      })

      // 截图保存事件
      // window.customApi?.onScreenshotSave((event, data) => {
      //   console.log('收到截图保存事件:', data)
      //   // this.handleScreenshotData(data)
      // })

      // 截图取消事件
      // window.customApi?.onScreenshotCancel(() => {
      //   console.log('截图已取消')
      // })
    },
    handleScreenshotAsPaste(data) {
      try {
        // 处理截图数据并创建文件对象
        let base64String

        // 检查 data.buffer 的类型
        if (typeof data.buffer === 'string' && data.buffer.includes(',')) {
          // 如果是逗号分隔的数字字符串，转换为 base64（分批处理避免栈溢出）
          const byteArray = new Uint8Array(data.buffer.split(',').map(Number))
          // 分批处理，避免栈溢出
          const chunkSize = 8192
          let binaryString = ''
          for (let i = 0; i < byteArray.length; i += chunkSize) {
            const chunk = byteArray.slice(i, i + chunkSize)
            binaryString += String.fromCharCode.apply(null, chunk)
          }
          base64String = btoa(binaryString)
        } else {
          // 如果是正常的 base64 字符串
          base64String = data.buffer
        }

        // 将 base64 转换为 Blob（优化大图处理）
        const byteCharacters = atob(base64String)
        const byteArray = new Uint8Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: 'image/png' })

        // 创建 File 对象
        const file = new File([blob], `${new Date().getTime()}.png`, {
          type: 'image/png',
          lastModified: new Date().getTime()
        })

        // 创建模拟的粘贴事件对象
        const mockEvent = {
          clipboardData: {
            items: [
              {
                kind: 'file',
                type: 'image/png',
                getAsFile: () => file
              }
            ]
          },
          preventDefault: () => {} // 空函数
        }

        // 直接调用 handlePaste 方法
        this.handlePaste(mockEvent)
      } catch (error) {
        console.error('处理截图粘贴失败:', error)
      }
    },
    // 在methods中添加screenshot方法
    screenshot() {
      if (this.isChatting) {
        // eslint-disable-next-line no-undef
        ElMessage.warning('正在对话中，无法截图')
        return
      }
      window.customApi?.triggerScreenshot()
    },
    clearAttach(i) {
      this.fileList.splice(i, 1)
    },
    beforeUpload() {
      this.loading = this.$loading({
        text: '上传中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      return true
    },
    // 暂停会话
    stopChat() {
      this.$emit('stopChat')
    },
    selectModel(e) {
      this.$emit('selectModel', e)
    },
    // ... existing code ...
    sendMessage(event) {
      if (event.type == 'keydown') {
        if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
          this.message.text += '\n'
        } else {
          if (!this.message.text.trim().length) {
            // eslint-disable-next-line no-undef
            ElMessage({
              message: '请输入消息',
              type: 'warning'
            })
            return
          }
          this.$emit('send', this.message)
          this.message = { text: '', image: '' }
        }
      } else {
        if (!this.message.text.trim().length) {
          // eslint-disable-next-line no-undef
          ElMessage({
            message: '请输入消息',
            type: 'warning'
          })
          return
        }
        this.$emit('send', this.message)
        this.message = { text: '', image: '' }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.tips {
  font-size: 12px;
  color: #909090;
  text-align: center;
}
.empty {
  box-sizing: border-box;
  max-width: 420px;
  padding: 20px 50px !important;
  font-size: 16px;
  color: #221815;
  line-height: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .btn {
    margin-top: 20px;
    width: 88px;
    height: 30px;
    line-height: 30px !important;
    padding: 0 !important;
    font-size: 14px;
  }
}
.message-input {
  position: relative;
  min-height: 58px;
  user-select: none;
  .stop-chat-box {
    position: absolute;
    left: 50%;
    top: -58px;
    transform: translateX(-50%);
    z-index: 1;
    width: 116px;
    height: 38px;
    background: #fff;
    box-shadow: 0px 2px 18px 2px rgba(0, 0, 0, 0.07);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 14px;
    color: var(--default-font-color);
    line-height: 20px;
    cursor: pointer;
    .stop-icon {
      flex-shrink: 0;
      width: 14px;
      height: 14px;
    }
    &:active {
      opacity: 0.6;
    }
  }
  &.focus {
    .input-wrapper {
      border-color: var(--el-color-primary);
    }
  }
  .input-wrapper {
    margin-bottom: 12px;
    padding: 15px;
    min-height: 99px;
    max-height: 311px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background: #f9f9f9;
    border-radius: 16px;
    border: 1px solid #dfdfdf;
    transition: border-color 0.1s linear;
    .attach-list-box {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      padding: 0 0 12px;
      margin-bottom: 15px;
      border-bottom: 1px solid #efefef;
      .pre-btn {
        position: absolute;
        height: 58px;
        left: 0;
        top: 0;
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
        top: 0;
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
        padding-top: 10px;
        margin-top: -10px;
        box-sizing: border-box;
        padding-right: 10px;
        width: 100%;
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
    }

    .input-box {
      flex: 1;
      flex-shrink: 0;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      .circle-logo {
        flex-shrink: 0;
        margin-right: 10px;
        width: 24px;
        height: 24px;
      }
      :deep(.input) {
        .el-textarea__inner {
          padding: 0;
          min-height: 22px;
          max-height: 150px;
          background: transparent;
          border: none;
          font-size: 14px;
          outline: none;
          box-shadow: none;
          color: #221815;
          /* 隐藏滚动条轨道 */
          &::-webkit-scrollbar {
            display: none;
          }
          /* 对于IE和Edge的旧版浏览器 */
          -ms-overflow-style: none;
          &::placeholder {
            color: #909090;
            font-size: 14px;
          }
        }
      }
    }
    .action-box {
      gap: 0 60px;
      overflow: hidden;
      flex: 1;
      padding-top: 15px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .action-left {
        flex: 1;
        display: flex;
        align-items: center;
        overflow: hidden;
        :deep(.el-select) {
          flex-shrink: 0;
          width: fit-content !important;
          .el-select__wrapper {
            padding: 4px 6px;
            box-shadow: none;
            background: transparent;
            font-size: 14px !important;
            .el-select__placeholder {
              position: relative;
              transform: none;
              color: var(--el-color-primary);
            }
            &.is-focused {
              box-shadow: none;
            }
            .el-select__caret {
              color: var(--el-color-primary);
            }
            &:hover {
              background: var(--primary-bg-color);
            }
          }
        }
        .line {
          flex-shrink: 0;
          width: 1px;
          height: 12px;
          background: #efefef;
          margin: 0 3px;
        }
        .networking {
          flex-shrink: 0;
          width: fit-content;
          min-height: 28px;
          padding: 4px 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          gap: 0 4px;
          font-weight: 500;
          font-size: 14px;
          color: #909090;
          cursor: pointer;
          transition: all 0.3s;
          &.is-network {
            color: var(--el-color-primary);
            .circle-icon {
              background: var(--el-color-primary);
            }
          }
          &:hover {
            background: var(--primary-bg-color);
          }
          .circle-icon {
            flex-shrink: 0;
            width: 4px;
            height: 4px;
            background: #909090;
            border-radius: 50%;
          }
        }
        .histore-issue-box {
          margin-left: 30px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0 10px;
          overflow: hidden;
          .issue-item {
            overflow: hidden;
            display: flex;
            align-items: center;
            gap: 0 6px;
            cursor: pointer;
            color: #555555;
            transition: all 0.3s;
            &:hover {
              color: var(--el-color-primary);
            }
            .issue-img {
              flex-shrink: 0;
              width: 18px;
              height: 18px;
              object-fit: cover;
            }
            .issue-text {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 14px;
            }
          }
        }
      }
      .btn-box {
        flex-shrink: 0;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
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
  }
}
.stop-btn-box {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  padding: 2px;
  &::before {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    content: '';
    width: 130%;
    height: 130%;
    // background: conic-gradient(from 45deg, #fff, #e7f1e6, #ab92f7, red);
    background: conic-gradient(from 45deg, #fff, #e9dadb, #e2838a, #f5222d);

    animation: flowing 2s infinite linear;
  }
  .stop-btn {
    position: relative;
    z-index: 1;
    border: 1px solid transparent !important;
    background: #fff !important;
  }
}

// 当按钮禁用时隐藏动画
.stop-btn[disabled]::before {
  display: none;
}
@keyframes flowing {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>
<style lang="scss">
.message-input-model-select {
  .el-select-dropdown__list {
    padding: 10px;
    .el-select-dropdown__item {
      border-radius: 4px;
      height: 64px;
      padding: 5px 10px;
      line-height: 27px;
      color: var(--default-font-color);
      &.is-hovering {
        .value-text {
          color: var(--el-color-primary);
        }
      }
      &.is-selected {
        .value-text {
          color: var(--el-color-primary);
        }
      }
      .value-text {
        font-style: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .value-label {
        font-style: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #909090;
      }
    }
  }
}
</style>
