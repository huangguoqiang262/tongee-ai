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
        <div class="num">100</div>
        <div class="name">本月生成文档</div>
        <div class="trend">
          <img class="trend-icon" src="@renderer/assets/intelligentWriting/go-up-icon.png" alt="" />
          <div>12%较上月</div>
        </div>
      </div>
      <div class="statistics-item center-item">
        <div class="num">3.2min</div>
        <div class="name">平均生成时间</div>
        <div class="trend">
          <img class="trend-icon" src="@renderer/assets/intelligentWriting/go-up-icon.png" alt="" />
          <div>12%效率提升</div>
        </div>
      </div>
      <div class="statistics-item">
        <div class="num">98%</div>
        <div class="name">团队使用率</div>
        <div class="trend">
          <img class="trend-icon" src="@renderer/assets/intelligentWriting/go-up-icon.png" alt="" />
          <div>12%较上月</div>
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
          :class="{ active: item.id === activeFirstTab }"
          @click="firstTypeClick(item.id)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="tab-content">
        <div class="label">文档类型</div>
        <div class="content-tabs">
          <div
            v-for="item in tabList"
            :key="item.id"
            class="tab-item"
            :class="{ active: item.checked }"
            @click="tabClick(item)"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="label">文档主题</div>
        <el-input
          v-model="inputValue"
          size="large"
          class="content-input"
          placeholder="请输入文档主题"
        />
        <div class="label">知识库引用</div>
        <div class="quote-box">
          <el-mention
            v-model="activeRepository"
            size="large"
            class="quote-input"
            :options="repositoryList"
            placeholder="@知识库，输入关键词引用相关知识"
          >
          </el-mention>
          <div class="icon">@</div>
        </div>
        <div class="label">详细要求</div>
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
                <img class="attached-icon" :src="getFileIcon(item.type)" alt="" />
                <div class="attached-content">
                  <div class="attach-name">
                    {{ item.name }}
                  </div>
                  <div class="attach-type">
                    <span class="file-extension">{{ item.type.toUpperCase() }}</span>
                    <span class="file-size">{{ formatFileSize(item.size) }}</span>
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
            placeholder="询问关于该文档的任何问题"
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

            <img
              v-if="message.text.trim().length"
              class="send-icon"
              src="@renderer/assets/send-icon.png"
              alt=""
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
      accept=".doc,.xls,.xlsx,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
    >
      <img
        class="document-icon"
        src="@renderer/assets/documentInterpretation/document-icon.png"
        alt=""
      />
      <div class="tip-title">将文档拖动至此或选择文档</div>
      <div class="tip-format">
        支持.doc,.xls,.xlsx,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式 (每个30MB以内)
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
    :files="onlineFileList"
    @submit-import="handleSubmitImport"
  ></OnlineFileSelection>
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { ref, watch, nextTick, onMounted, inject } from 'vue'
import Logo from '@renderer/assets/logo.png'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
let firstTypeList = ref([
  {
    name: '技术文档',
    id: 1
  },
  {
    name: '临床评价',
    id: 2
  },
  {
    name: '注册资料',
    id: 3
  },
  {
    name: '合规报告',
    id: 4
  },
  {
    name: '质量管理',
    id: 5
  },
  {
    name: '生产运营',
    id: 6
  },
  {
    name: '商业化服务',
    id: 7
  },
  {
    name: '项目申报',
    id: 8
  },
  {
    name: '人力资源',
    id: 9
  }
])
let activeFirstTab = ref(1)
const firstTypeClick = (id) => {
  activeFirstTab.value = id
}
let tabList = ref([
  {
    name: '产品技术要求',
    id: 1
  },
  {
    name: '产品说明书',
    id: 2
  },
  {
    name: '风险管理报告',
    id: 3
  },
  {
    name: '专利技术交底书',
    id: 4
  },
  {
    name: 'dhf文档',
    id: 5
  },
  {
    name: '设计验证',
    id: 6
  },
  {
    name: '研发历程',
    id: 7
  },
  {
    name: '理化性能',
    id: 8
  }
])
const tabClick = (item) => {
  tabList.value.forEach((item) => {
    item.checked = false
  })
  item.checked = true
}

let repositoryList = ref([
  {
    label: '糖吉医疗知识库',
    value: 1
  },
  {
    label: '糖吉医疗知识库2',
    value: 2
  }
])
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
const onlineFileList = ref([
  {
    name: '糖吉医疗最新文献更新.docx',
    cover: Logo,
    id: '1',
    type: 'docx'
  },
  {
    name: '糖吉医疗最新文献更新.ppt',
    cover: Logo,
    id: '2',
    type: 'ppt'
  },
  {
    name: '糖吉医疗最新文献更新.xlsx',
    cover: Logo,
    id: '3',
    type: 'xlsx'
  }
])
// 文件列表
const localfileList = ref([
  // {
  //   type: 'docx',
  //   name: '糖源医疗',
  //   count: 3,
  //   size: 326,
  //   create_time: '2025/09/09',
  //   id: 2,
  //   checked: false
  // },
  // {
  //   type: 'xlsx',
  //   name: '糖源医疗',
  //   count: 3,
  //   size: 3699,
  //   create_time: '2025/09/09',
  //   id: 3,
  //   checked: false
  // },
  // {
  //   type: 'img',
  //   name: '糖源医疗',
  //   count: 3,
  //   size: 123,
  //   create_time: '2025/09/09',
  //   id: 4,
  //   checked: false
  // },
])
// 处理发送点击
const handleSendClick = () => {
  if (message.value.text.trim().length) {
    replaceActiveTab({
      title: message.value.text,
      url: 'ChatPage',
      isInternal: true,
      attrs: {
        files: cloneDeep(localfileList.value)
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
  console.log(files, '导入文件')
  localfileList.value.push(...files)
}
const handleSelectChange = (file) => {
  // 如果是文件夹，使用新的目录树结构
  if (file.webkitRelativePath) {
    // 处理文件夹上传
    file.type = 'directory'
    file.uploadStatus = 'pending'
    localfileList.value.push(file)
  } else {
    // 处理单个文件
    file.type = 'file'
    file.uploadStatus = 'pending'
    localfileList.value.push(file)
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
const beforeUploadFiles = (type) => {
  if (subActionPopoverRef.value) {
    subActionPopoverRef.value.hide()
  }
  if (type === 'repository') {
    // 知识库文件上传
    onlineFileVisible.value = true
    console.log('知识库文件上传')
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
})
const clearAttach = (i) => {
  localfileList.value.splice(i, 1)
}
// 获取文件图标
const getFileIcon = (item) => {
  // 根据文件扩展名返回不同的图标
  // const ext = item.name?.split('.').pop()?.toLowerCase()
  const ext = item
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
    ppt: pptIcon,
    pptx: pptIcon,
    txt: txtIcon,
    img: imgIcon
  }

  return iconMap[ext] || wordIcon
}
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
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
  height: 726px;
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
