<template>
  <div class="message-input focus">
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
          placeholder="@知识库或直接提问"
          type="textarea"
          :options="mentionOptions"
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
          >
            <el-option v-for="item in cities" :key="item.value" :value="item.value">
              <div class="value-text">{{ item.value }}</div>
              <div class="value-label">{{ item.label }}</div>
            </el-option>
          </el-select>
          <div class="line"></div>
          <div class="networking" :class="{ 'is-network': isNetwork }" @click.stop="networkChange">
            联网
            <div class="circle-icon"></div>
          </div>
          <div class="histore-issue-box">
            <div v-for="(item, index) in historyIssueList" :key="index" class="issue-item">
              <img class="issue-img" :src="item.icon" alt="" />
              <div class="issue-text">{{ item.label }}</div>
            </div>
          </div>
        </div>
        <div class="btn-box">
          <el-tooltip effect="light" content="" placement="top">
            <template #content>
              上传附件（doc、docx、xls、xlsx、pdf、txt、<br />ppt、pptx、jpg、jpeg、png、gif格式）
            </template>
            <el-upload
              class="upload-box"
              name="file[]"
              :disabled="isChatting"
              :show-file-list="false"
              :on-change="handleFileChange"
              :http-request="customUpload"
              :multiple="true"
              accept=".doc,.xls,.xlsx,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            >
              <img
                class="attachment-icon"
                src="@renderer/assets/home/link-icon.png"
                alt=""
                :style="{ cursor: isChatting ? 'not-allowed' : 'pointer' }"
              />
            </el-upload>
          </el-tooltip>
          <el-tooltip effect="light" content="" placement="top">
            <template #content> 快速截图 Alt + J </template>
            <img
              class="attachment-icon screenshot-icon"
              src="@renderer/assets/home/screenshot-icon.png"
              alt=""
              :style="{ cursor: isChatting ? 'not-allowed' : 'pointer' }"
              @click="screenshot"
            />
          </el-tooltip>
          <!-- <div class="line"></div> -->
          <!-- <el-button
            v-if="!isChatting"
            type="primary"
            size="large"
            :disabled="soldOut || isChatting"
            class="enter-btn"
            @click="sendMessage"
          >
            <img class="btn-icon" src="@renderer/assets/up-icon.png" alt="" />
          </el-button>
          <div v-else class="stop-btn-box">
            <el-tooltip class="item" effect="dark" content="停止回答" placement="top">
              <el-button
                type="primary"
                :disabled="soldOut"
                class="enter-btn stop-btn"
                @click="stopChat"
              >
                <span class="stop-icon"> </span>
              </el-button>
            </el-tooltip>
          </div> -->
        </div>
      </div>
    </div>
    <div class="tips">内容由AI生成仅供参考</div>
  </div>
</template>
<script>
import { getToken } from '@renderer/utils/auth'
import modelIcon from '@renderer/assets/modelSelected.png'
import repositoryIcon from '@renderer/assets/repositorySelected.png'
import knowledgeBaseSquareIcon from '@renderer/assets/home/knowledgeBaseSquare-icon.png'
import documentInterpretationIcon from '@renderer/assets/home/documentInterpretation-icon.png'
import updateNotificationIcon from '@renderer/assets/home/updateNotification-icon.png'
import quickAccessIcon from '@renderer/assets/home/quickAccess-icon.png'
import imageProductionIcon from '@renderer/assets/home/imageProduction-icon.png'
import IntelligentWriting from '@renderer/assets/home/intelligentWriting-icon.png'
export default {
  name: 'MessageInput',
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
    // eslint-disable-next-line vue/prop-name-casing
    knowledge_ids: {
      type: [Number, String],
      default: ''
    },
    sourceKnows: {
      type: Array,
      default: () => []
    },
    //是否正在对话
    isChatting: {
      type: Boolean,
      default: false
    }
  },
  emits: ['stopChat', 'selectModel', 'selectLibrary', 'uploadedAttachment', 'send'],
  data() {
    return {
      mentionOptions: [
        {
          value: '知识库',
          label: '知识库'
        },
        {
          value: '问题',
          label: '问题'
        }
      ],
      modelTempId: '',
      knowledge_id: '',
      message: { text: '', image: '' },
      showModel: false,
      showRepository: false,
      ossUpload: import.meta.env.VITE_BASE_URL + '/intelligence/upload_attach',
      token: getToken(),
      firsetType: [
        {
          name: '选模型',
          icon: modelIcon,
          type: 'model',
          modelList: []
        },
        {
          name: '知识库',
          icon: repositoryIcon,
          type: 'repository',
          libraryList: []
        }
      ],
      loading: false,
      uniacid: 2,
      modelValue: undefined,
      cities: [
        {
          value: 'DS V3.1-Think',
          label: 'DeepSeek更快深度推理(最新)'
        },
        {
          value: 'DeepSeek V3.1',
          label: '多种场景回答更精炼(最新)'
        },
        {
          value: 'DeepSeek',
          label: 'V3适用多种应用场景'
        },
        {
          value: 'DeepSeek R1',
          label: '深度思考推理'
        },
        {
          value: 'Hunyuan',
          label: '适合大部分任务'
        }
      ],
      historyIssueList: [
        {
          icon: modelIcon,
          label: '长安投研【持续更新】近期投资需注意规避的风险'
        },
        {
          icon: modelIcon,
          label: '长安投研【持续更新】近期投资需注意规避的风险'
        },
        {
          icon: modelIcon,
          label: '长安投研【持续更新】近期投资需注意规避的风险'
        }
      ],
      menuList: [
        {
          url: 'Square',
          title: '知识库广场',
          icon: knowledgeBaseSquareIcon,
          isLink: true
        },
        {
          url: 'DocumentInterpretation',
          title: '文档解读',
          icon: documentInterpretationIcon,
          isLink: false
        },
        {
          url: 'MessageCenter',
          title: '更新通知',
          icon: updateNotificationIcon,
          isLink: true
        },
        {
          url: 'QuickAccess',
          title: '快捷访问',
          icon: quickAccessIcon,
          isLink: false
        },
        {
          url: 'ImageProduction',
          title: '图像生成',
          icon: imageProductionIcon,
          isLink: false
        },
        {
          url: 'IntelligentWriting',
          title: '智能写作',
          icon: IntelligentWriting,
          isLink: false
        }
      ],
      activeMenu: '',
      fileList: [],
      showPrevBtn: false,
      showNextBtn: false,
      isHoveringAttachBox: false,
      isNetwork: false
    }
  },
  computed: {
    modelList() {
      var list = []
      this.models.map((item) => {
        item.models.map((item) => {
          list.push(item)
        })
      })
      return list
    }
  },
  watch: {
    models(val) {
      if (val.length) {
        this.firsetType[0].modelList = val
      }
    },
    sourceKnows(val) {
      if (val.length) {
        this.firsetType[1].libraryList = val
      } else {
        this.firsetType[1].libraryList = []
      }
      if (this.knowledge_id) {
        var behalf = [this.knowledge_id.split(',')[0]]
        this.firsetType[1].libraryList.forEach((item) => {
          item.knows.map((childrenItem) => {
            if (behalf.includes(childrenItem.id + '')) {
              this.firsetType[1].name = childrenItem.title + '...'
            }
          })
        })
      } else {
        this.firsetType[1].name = '知识库'
      }
    },
    model_id(val) {
      this.modelTempId = val
      this.modelList.forEach((item) => {
        if (item.id == val) {
          this.firsetType[0].name = item.title
        }
      })
    },
    knowledge_ids(val) {
      this.knowledge_id = val + ''
      if (val) {
        var behalf = [val.split(',')[0]]
        this.firsetType[1].libraryList.forEach((item) => {
          item.knows.map((childrenItem) => {
            if (behalf.includes(childrenItem.id + '')) {
              this.firsetType[1].name = childrenItem.title + '...'
            }
          })
        })
      } else {
        this.firsetType[1].name = '知识库'
      }
    }
  },
  mounted() {
    this.modelTempId = this.model_id
    this.modelList.forEach((item) => {
      if (item.id == this.modelTempId) {
        this.firsetType[0].name = item.title
      }
    })
    this.knowledge_id = this.knowledge_ids
    if (this.knowledge_id) {
      var behalf = [this.knowledge_id.split(',')[0]]
      this.firsetType[1].libraryList.forEach((item) => {
        item.knows.map((childrenItem) => {
          if (behalf.includes(childrenItem.id + '')) {
            this.firsetType[1].name = childrenItem.title + '...'
          }
        })
      })
    } else {
      this.firsetType[1].name = '知识库'
    }
    this.setupScreenshotListeners()
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
      this.isNetwork = !this.isNetwork
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
    handlePaste(event) {
      if (this.isChatting) {
        // ElMessage.warning('正在对话中，无法粘贴图片')
        return
      }

      const clipboardData = event.clipboardData || window.clipboardData
      if (!clipboardData) return

      // 检查是否有图片数据
      const items = clipboardData.items
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          // 阻止默认的粘贴行为
          event.preventDefault()

          const file = item.getAsFile()
          if (file) {
            this.handleImageFile(file)
          }
          break
        }
      }
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
        type: 'success',
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
    formatFileSize(bytes) {
      if (bytes < 1024) {
        return bytes + ' B'
      } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB'
      } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
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
          // 如果是逗号分隔的数字字符串，转换为 base64
          const byteArray = new Uint8Array(data.buffer.split(',').map(Number))
          const binaryString = String.fromCharCode(...byteArray)
          base64String = btoa(binaryString)
        } else {
          // 如果是正常的 base64 字符串
          base64String = data.buffer
        }

        // 将 base64 转换为 Blob
        const byteCharacters = atob(base64String)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })

        // 创建 File 对象
        const file = new File([blob], `screenshot_${new Date().getTime()}.png`, {
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
    selectModel(model, provider_appid) {
      this.$emit('selectModel', model, provider_appid)
      this.closeModel('model')
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },
    selectLibrary(item) {
      this.$emit('selectLibrary', item)
      this.closeModel('repository')
    },
    closeModel(type) {
      if (type == 'model') {
        this.showModel = false
      } else if (type == 'repository') {
        this.showRepository = false
      }
    },
    showPop(type) {
      if (this.isChatting) {
        return false
      }
      if (!this.$verifyHasToken()) {
        return false
      }
      if (type == 'model') {
        this.showModel = true
      } else if (type == 'repository') {
        this.showRepository = true
      }
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
    },
    // ... existing code ...
    toSetting() {
      this.closeModel('repository')
      this.$router.push({ path: '/ai/repository' })
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
  min-height: 58px;
  user-select: none;
  &.focus {
    .input-wrapper {
      min-height: 99px;
      max-height: 311px;
      flex-direction: column;
      border-color: var(--el-color-primary);
      .action-box {
        flex: 1;
        padding-top: 15px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
  .input-wrapper {
    margin-bottom: 12px;
    padding: 15px;
    min-height: 60px;
    max-height: 60px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    background: #f9f9f9;
    border-radius: 16px;
    border: 1px solid #dfdfdf;
    transition:
      min-height 0.3s linear,
      max-height 0.6s linear;
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
          font-size: 16px;
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
            font-size: 16px;
          }
        }
      }
    }
    .action-box {
      gap: 0 60px;
      overflow: hidden;
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
        .upload-box {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .attachment-icon {
          flex-shrink: 0;
          padding: 4px;
          margin-right: 18px;
          width: 28px;
          height: 28px;
          vertical-align: middle;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.3s;
          &.screenshot-icon {
            margin-right: 3px;
          }
          &:hover {
            background: var(--primary-bg-color);
          }
        }
        .line {
          flex-shrink: 0;
          width: 1px;
          height: 16px;
          background: #ccc;
          margin: 0 12px;
        }
        .enter-btn {
          flex-shrink: 0;
          padding: 8px !important;
          border-radius: 8px !important;
          .stop-icon {
            position: relative;
            z-index: 1;
            box-sizing: border-box;
            display: inline-block;
            width: 13px;
            height: 13px;
            background: red;
            border-radius: 4px;
            vertical-align: middle;
          }
          .btn-icon {
            width: 20px;
            height: 20px;
            vertical-align: middle;
          }
        }
      }
    }
  }
  .menu-box {
    margin-top: 80px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    .menu-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #555555;
      cursor: pointer;
      &:hover {
        color: var(--el-color-primary);
      }
      .icon {
        margin-bottom: 10px;
        width: 60px;
        height: 60px;
      }
      .text {
        font-size: 12px;
      }
    }
  }
  .common-issue {
    padding: 0 20px;
    transition: all 0.3s ease-in-out;
    .common-issue-title {
      margin-bottom: 11px;
      font-size: 12px;
      color: #737475;
    }
    .common-issue-content {
      .common-issue-item {
        margin-bottom: 19px;
        overflow: hidden;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0 10px;
        cursor: pointer;
        color: #555555;
        &:hover {
          color: var(--el-color-primary);
        }
        .issue-item-left {
          overflow: hidden;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0 10px;
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
        .issue-item-right {
          flex-shrink: 0;
          font-size: 16px;
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
