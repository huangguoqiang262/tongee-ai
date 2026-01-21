<template>
  <div class="IntelligentWriting">
    <div class="head-box">
      <div class="head-left">
        <img
          class="unscramble-icon"
          src="@renderer/assets/intelligentWriting/writing-icon.png"
          alt=""
        />
        <div>智能写作</div>
      </div>
      <el-icon class="close-icon" @click="closeMenu"><Close /></el-icon>
    </div>
    <div class="statistics-box">
      <div class="statistics-item">
        <div class="num">{{ statistics.month_create_count || 0 }}</div>
        <div class="name">本月生成文档</div>
        <div class="trend">
          <img
            v-if="statistics.month_create_type == 'up'"
            class="trend-icon"
            src="@renderer/assets/intelligentWriting/go-up-icon.png"
            alt=""
          />
          <div>{{ statistics.month_create_change_percent || 0 }}%较上月</div>
        </div>
      </div>
      <div class="statistics-item center-item">
        <div class="num">{{ statistics.avg_create_count || 0 }}min</div>
        <div class="name">平均生成时间</div>
        <div class="trend">
          <img
            v-if="statistics.avg_create_type == 'up'"
            class="trend-icon"
            src="@renderer/assets/intelligentWriting/go-up-icon.png"
            alt=""
          />
          <div>{{ statistics.avg_create_percent || 0 }}%效率提升</div>
        </div>
      </div>
      <div class="statistics-item">
        <div class="num">{{ statistics.group_use_count || 0 }}%</div>
        <div class="name">团队使用率</div>
        <div class="trend">
          <img
            v-if="statistics.group_use_type == 'up'"
            class="trend-icon"
            src="@renderer/assets/intelligentWriting/go-up-icon.png"
            alt=""
          />
          <div>{{ statistics.group_use_change_percent || 0 }}%较上月</div>
        </div>
      </div>
    </div>
    <div class="form-box">
      <div class="form-head-label">选择文档类型并输入要求</div>
      <div class="first-tab-box">
        <div
          v-for="item in firstTypeList"
          :key="item.id"
          class="tab-item"
          :class="{ active: item.id === activeFirstTab.id }"
          @click="firstTypeClick(item)"
        >
          {{ item.title }}
        </div>
      </div>
      <div class="tab-content">
        <div class="label">{{ activeFirstTab.child_type_title || '' }}</div>
        <div class="content-tabs">
          <div
            v-for="item in activeFirstTab.children"
            :key="item.id"
            class="tab-item"
            :class="{ active: item.checked }"
            @click="tabClick(item)"
          >
            {{ item.title }}
          </div>
        </div>
        <template v-if="activeFirstTab.standards && activeFirstTab.standards.length">
          <div class="label">适用标准</div>
          <div class="content-tabs">
            <div
              v-for="item in activeFirstTab.standards.split(',')"
              :key="item"
              class="tab-item"
              :class="{ active: item == activeFirstTab.activeStandard }"
              @click="standardClick(item)"
            >
              {{ item }}
            </div>
          </div>
        </template>
        <div class="label">{{ activeFirstTab.theme_title || '' }}</div>
        <el-input
          v-model="theme_value"
          size="large"
          class="content-input"
          :placeholder="activeFirstTab.theme_tip || ''"
        />
        <div class="label">知识库引用</div>
        <div class="quote-box">
          <el-mention
            v-model="activeRepository"
            size="large"
            class="quote-input"
            :options="mentionOptions"
            :whole="true"
            placeholder="@知识库，输入关键词引用相关知识"
            @select="handleMentionSelect"
            @whole-remove="handleWholeRemove"
          >
          </el-mention>
          <div class="icon">@</div>
        </div>
        <div class="label">{{ activeFirstTab.require_title || '' }}</div>
        <div class="textarea-container">
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
          </div>
          <el-input
            v-model="message.text"
            resize="none"
            class="input"
            type="textarea"
            :placeholder="activeFirstTab.require_tip || ''"
            @keydown.enter.prevent="handleEnterSend"
          ></el-input>
          <div class="textarea-actions">
            <el-popover
              ref="subActionPopoverRef"
              popper-class="sub-action-box"
              trigger="click"
              placement="bottom-start"
            >
              <template #reference>
                <el-button class="reference-btn">
                  <img
                    class="icon"
                    src="@renderer/assets/documentInterpretation/link-disable-icon.png"
                    alt=""
                  />
                  参考文档
                </el-button>
              </template>
              <div class="sub-action-upload" @click="beforeUploadFiles('local')">
                <img
                  class="icon"
                  src="@renderer/assets/documentInterpretation/upload-icon.png"
                  alt=""
                />
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

            <!-- <img
              v-if="message.text.trim().length"
              class="send-icon"
              src="@renderer/assets/send-icon.png"
              alt=""
              @click="handleSendClick"
            /> -->
            <sendSvgIcon
              v-if="message.text.trim().length"
              class="send-icon"
              @click="handleSendClick"
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
    </div>
    <el-upload
      v-show="false"
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
  </div>
  <OnlineFileSelection
    v-model="onlineFileVisible"
    @submit-import="handleSubmitImport"
  ></OnlineFileSelection>
</template>

<script setup>
import { doc_create_count, doc_type_tree } from '@renderer/api/IntelligentWriting'
import { useUserStore } from '@renderer/stores/user'
import { get_user_knows } from '@renderer/api/chat'
import cloneDeep from 'lodash.clonedeep'
import { ref, watch, nextTick, onMounted, inject } from 'vue'
import sendSvgIcon from '@renderer/assets/send-icon.svg'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
let theme_value = ref('')
const statistics = ref({})
const getStatistics = () => {
  doc_create_count({}).then((res) => {
    if (res.code == 200) {
      statistics.value = res.data || {}
    }
  })
}
let firstTypeList = ref([])
let activeFirstTab = ref({})
const firstTypeClick = (item) => {
  activeFirstTab.value = item
  if (activeFirstTab.value.children.length) {
    var flag = activeFirstTab.value.children.find((item) => item.checked)
    if (!flag) {
      activeFirstTab.value.children[0].checked = true
    }
  }
  if (activeFirstTab.value.standards && activeFirstTab.value.standards.length) {
    if (!activeFirstTab.value.activeStandard) {
      activeFirstTab.value.activeStandard = activeFirstTab.value.standards.split(',')[0]
    }
  }
}
const tabClick = (item) => {
  activeFirstTab.value.children.forEach((item) => {
    item.checked = false
  })
  item.checked = true
}
const standardClick = (item) => {
  activeFirstTab.value.activeStandard = item
}
let mentionOptions = ref([])
let mentioned = ref([])
const getKnows = () => {
  get_user_knows().then((res) => {
    var list = []
    if (res.data.length) {
      res.data.map((item) => {
        item.knows.map((children) => {
          list.push({
            value: children.title,
            know_key: children.know_key,
            label: children.title,
            model_name: children.vector_model?.model_name || '',
            provider_key: children.vector_model?.provider_key || ''
          })
        })
      })
    }
    mentionOptions.value = list
  })
}
const handleWholeRemove = (e) => {
  // 匹配提及内容并删除
  // var reg = new RegExp('@' + e, 'g')
  // this.message.text = this.message.text.replace(reg, '')
  mentioned.value = mentioned.value.filter((item) => item.label !== e)
}
const handleMentionSelect = (item) => {
  mentioned.value.push(item)
}
let activeRepository = ref('')
let replaceActiveTab = inject('replaceActiveTab')
const message = ref({
  text: '',
  image: ''
})
const emit = defineEmits(['closeMenu'])
const closeMenu = () => {
  emit('closeMenu')
}
let subActionPopoverRef = ref(null)
let elUploadRef = ref(null)
let uploadBtnRef = ref(null)
let attachListBox = ref(null)
let showPrevBtn = ref(false)
let showNextBtn = ref(false)
let isHoveringAttachBox = ref(false)
let onlineFileVisible = ref(false)
const getTree = () => {
  doc_type_tree({}).then((res) => {
    if (res.code == 200) {
      firstTypeList.value = res.data || []
      if (firstTypeList.value.length) {
        activeFirstTab.value = firstTypeList.value[0]
        if (activeFirstTab.value.children.length) {
          var flag = activeFirstTab.value.children.find((item) => item.checked)
          if (!flag) {
            activeFirstTab.value.children[0].checked = true
          }
        }
        if (activeFirstTab.value.standards && activeFirstTab.value.standards.length) {
          if (!activeFirstTab.value.activeStandard) {
            activeFirstTab.value.activeStandard = activeFirstTab.value.standards.split(',')[0]
          }
        }
      }
    }
  })
}
// 文件列表
const localfileList = ref([])
// 处理发送点击
const handleSendClick = () => {
  if (message.value.text.trim().length) {
    var prompt = `
    ${activeFirstTab.value.title}
    1、${activeFirstTab.value.child_type_title}：${activeFirstTab.value.children.find((item) => item.checked).title}；
    2、 ${activeFirstTab.value.theme_title}：${theme_value.value}；`
    if (activeFirstTab.value.standards && activeFirstTab.value.activeStandard) {
      prompt += `
      3、${'适用标准'}：${activeFirstTab.value.activeStandard} `
    }
    replaceActiveTab({
      title: message.value.text,
      url: 'IntelligentWritingChat',
      isInternal: true,
      attrs: {
        attach_files: cloneDeep(localfileList.value),
        message_text: message.value.text,
        knows: cloneDeep(mentioned.value),
        prompt: prompt
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
  watch(
    localfileList,
    () => {
      nextTick(() => {
        updateScrollButtons()
      })
    },
    { deep: true }
  )
  getStatistics()
  getTree()
  getKnows()
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
.IntelligentWriting {
  box-sizing: border-box;
  padding: 0 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 65vw;
  min-width: 1060px;
  height: 686px;
  background: #ffffff;
  box-shadow: 0px 2px 60px 8px rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  user-select: none;
  overflow-y: auto;
  .head-box {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
    background: #fff;
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
  .statistics-box {
    margin-bottom: 20px;
    padding: 18px;
    height: 120px;
    border-radius: 6px;
    display: flex;
    justify-content: space-evenly;
    background: #f9f9f9;
    .statistics-item {
      text-align: center;
      color: var(--default-font-color);
      &.center-item {
        margin: 0 30px;
      }
      .num {
        margin-bottom: 10px;
        font-size: 24px;
        line-height: 32px;
        font-family: DOUYINSANSBOLD;
      }
      .name {
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 18px;
      }
      .trend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 12px;
        color: #81889b;
        .trend-icon {
          flex-shrink: 0;
          width: 12px;
          height: 12px;
        }
      }
    }
  }
  .form-box {
    .form-head-label {
      margin-bottom: 15px;
      font-weight: 500;
      font-size: 16px;
      color: var(--default-font-color);
      line-height: 24px;
    }
    .first-tab-box {
      padding: 9px 30px;
      border-bottom: 1px solid #efefef;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px 40px;
      .tab-item {
        flex-shrink: 0;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 24px;
        cursor: pointer;
        &.active {
          color: var(--el-color-primary);
        }
      }
    }
    .tab-content {
      .label {
        margin: 16px 0 10px;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 24px;
      }
      .content-tabs {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        .tab-item {
          flex-shrink: 0;
          padding: 0 16px;
          height: 40px;
          font-size: 14px;
          border: 1px solid #f9f9f9;
          color: var(--default-font-color);
          line-height: 38px;
          background: #f9f9f9;
          border-radius: 6px;
          text-transform: uppercase;
          cursor: pointer;
          &.active {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
          }
        }
      }
      :deep(.content-input) {
        .el-input__wrapper {
          background-color: #f9f9f9 !important;
          border-radius: 6px !important;
          box-shadow: none;

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }
      }
      :deep(.quote-box) {
        position: relative;
        .el-input__wrapper {
          padding-left: 27px;
          background-color: #f9f9f9 !important;
          border-radius: 6px !important;
          box-shadow: none;

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }
        .icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
      .textarea-container {
        margin-bottom: 20px;
        position: relative;
        background: #f9f9f9;
        border-radius: 12px;
        .input {
          width: 100%;
          // flex: 1;
          flex-shrink: 0;
          font-size: 14px;

          :deep(.el-textarea__inner) {
            padding: 16px 16px;
            // width: 100%;
            height: 58px;
            overflow-y: auto;
            box-shadow: none;
            border-radius: 12px;
            background: #f9f9f9;
            // transition: all 0.3s ease;
            /* 隐藏滚动条轨道 */
            // &::-webkit-scrollbar {
            //   display: none;
            // }
            // /* 对于IE和Edge的旧版浏览器 */
            // -ms-overflow-style: none;
          }
        }
        .textarea-actions {
          padding: 0 16px;
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .reference-btn {
            flex-shrink: 0;
            padding: 0;
            height: 28px;
            width: 96px;
            color: #737475;
            font-size: 14px;
            background: #eee;
            border-style: none;
            &:hover {
              filter: brightness(0.96);
            }
            .icon {
              margin-right: 4px;
              width: 16px;
              height: 16px;
            }
          }
          .send-icon {
            margin-left: 5px;
            flex-shrink: 0;
            width: 34px;
            height: 34px;
            color: var(--el-color-primary);
            border-radius: 50%;
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
    padding: 0 16px;
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
      padding: 20px 10px 20px 0;
      display: flex;
      align-items: center;
      gap: 12px;
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
