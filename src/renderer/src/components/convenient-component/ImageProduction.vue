<template>
  <div class="ImageProduction">
    <div class="head-box">
      <div class="head-left">
        <img
          class="unscramble-icon"
          src="@renderer/assets/intelligentWriting/writing-icon.png"
          alt=""
        />
        <div>图像生成</div>
      </div>
      <el-icon class="close-icon" @click="closeMenu"><Close /></el-icon>
    </div>
    <div class="form-box">
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
              <el-image
                class="image-cover"
                fit="cover"
                :preview-teleported="true"
                :preview-src-list="localfileList.map((item) => item.full_path)"
                :src="item.full_path"
              >
                <template #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }">
                  <el-icon @click="prev"><Back /></el-icon>
                  <el-icon @click="next"><Right /></el-icon>
                  <el-icon @click="setActiveItem(localfileList.length - 1)">
                    <DArrowRight />
                  </el-icon>
                  <el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
                  <el-icon @click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })">
                    <ZoomIn />
                  </el-icon>
                  <el-icon
                    @click="actions('clockwise', { rotateDeg: 180, enableTransition: false })"
                  >
                    <RefreshRight />
                  </el-icon>
                  <el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
                  <el-icon @click="reset"><Refresh /></el-icon>
                  <el-icon @click="download(activeIndex, localfileList)"><Download /></el-icon>
                </template>
              </el-image>
              <!-- <img class="attached-icon" :src="getFileIcon(item)" alt="" />
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
              </div> -->
            </div>
          </div>
        </div>
        <el-input
          v-model="message.text"
          resize="none"
          class="input"
          autofocus
          type="textarea"
          placeholder="输入要生成的图片内容"
          @keydown.enter.prevent="handleEnterSend"
        ></el-input>
        <div class="textarea-actions">
          <div class="actions-left">
            <el-popover
              ref="sizePopoverRef"
              popper-class="custom-size-popover"
              trigger="click"
              placement="top-start"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="reference-btn size-btn">
                  {{ activeSize.title }}
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
              <div class="common-handle-box">
                <div
                  v-for="item in sizeLists"
                  :key="item.title"
                  class="item"
                  :class="{ active: item.id == activeSize.id }"
                  @click="setActiveSize(item)"
                >
                  <div class="item-left">
                    <img
                      class="icon"
                      :src="item.id == activeSize.id ? item.checkedIcon : item.icon"
                      alt=""
                    />
                    <div class="title">{{ item.title }}</div>
                  </div>
                  <el-icon class="check-icon"><Check /></el-icon>
                </div>
              </div>
            </el-popover>
            <el-popover
              ref="stylePopoverRef"
              popper-class="custom-style-popover"
              trigger="click"
              placement="top-start"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="reference-btn size-btn style-btn">
                  {{ activeStyle }}
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
              <div class="handle-box">
                <div class="item default-item" @click="setActiveStyle('风格不限')">
                  <img
                    class="cover"
                    src="@renderer/assets/ImageProduction/default-style.png"
                    alt=""
                  />
                  <div class="title default-title">风格不限</div>
                  <img
                    v-if="activeStyle == '风格不限'"
                    class="checked-icon"
                    src="@renderer/assets/ImageProduction/checked-icon.png"
                    alt=""
                  />
                </div>
                <div
                  v-for="item in styleLists"
                  :key="item.id"
                  class="item"
                  @click="setActiveStyle(item.title)"
                >
                  <img class="cover" :src="item.thumb" alt="" />
                  <div class="title">{{ item.title }}</div>
                  <img
                    v-if="item.title == activeStyle"
                    class="checked-icon"
                    src="@renderer/assets/ImageProduction/checked-icon.png"
                    alt=""
                  />
                </div>
              </div>
            </el-popover>
            <el-popover
              ref="callWordPopoverRef"
              popper-class="call-word-popover"
              trigger="click"
              placement="top-start"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="reference-btn size-btn style-btn">
                  提示词
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </template>
              <div class="call-word-box">
                <div v-for="item in callWordLists" :key="item.label" class="item-box">
                  <div class="label">{{ item.name }}</div>
                  <div class="children-box">
                    <div
                      v-for="child in item.children"
                      :key="child"
                      class="children-item"
                      :class="{ active: activeCallWord.includes(child.name) }"
                      @click="setActiveCallWord(child.name)"
                    >
                      {{ child.name }}
                    </div>
                  </div>
                </div>
              </div>
            </el-popover>
            <el-button class="reference-btn" @click="beforeUploadFiles('local')">
              参考图
            </el-button>
          </div>
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
    <el-upload
      v-show="false"
      ref="elUploadRef"
      class="upload-box"
      drag
      multiple
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleSelectChange"
      accept=".jpg,.jpeg,.png,.gif"
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
        <!-- <div class="repository-btn" @click.stop="beforeUploadFiles('repository')">
          <img
            class="icon"
            src="@renderer/assets/documentInterpretation/repository-icon.png"
            alt=""
          />
          知识库文件
        </div> -->
        <div ref="uploadBtnRef" class="local-btn">
          <img class="icon" src="@renderer/assets/documentInterpretation/upload-icon.png" alt="" />
          本地文件
        </div>
      </div>
    </el-upload>
  </div>
  <!-- <OnlineFileSelection
    v-model="onlineFileVisible"
    :files="onlineFileList"
    @submit-import="handleSubmitImport"
  ></OnlineFileSelection> -->
</template>

<script setup>
import cloneDeep from 'lodash.clonedeep'
import { ref, watch, nextTick, onMounted, inject } from 'vue'
import { useUserStore } from '@renderer/stores/user'
// import Logo from '@renderer/assets/logo.png'
// import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
// import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
// import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
// import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
// import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
// import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import img11 from '@renderer/assets//ImageProduction/1-1.png'
import img43 from '@renderer/assets//ImageProduction/4-3.png'
import img34 from '@renderer/assets//ImageProduction/3-4.png'
import img169 from '@renderer/assets//ImageProduction/16-9.png'
import img916 from '@renderer/assets//ImageProduction/9-16.png'
import img11Checked from '@renderer/assets//ImageProduction/1-1-checked.png'
import img43Checked from '@renderer/assets//ImageProduction/4-3-checked.png'
import img34Checked from '@renderer/assets//ImageProduction/3-4-checked.png'
import img169Checked from '@renderer/assets//ImageProduction/16-9-checked.png'
import img916Checked from '@renderer/assets//ImageProduction/9-16-checked.png'
import { get_image_style, get_image_cueword } from '@renderer/api/IntelligentWriting'
let replaceActiveTab = inject('replaceActiveTab')
const message = ref({
  text: '',
  image: ''
})
const emit = defineEmits(['closeMenu'])
const closeMenu = () => {
  emit('closeMenu')
}
let sizePopoverRef = ref(null)
const hidePopover = (popoverName) => {
  if (popoverName) {
    popoverName.hide()
  }
}
const download = (index, images) => {
  const url = images[index].full_path
  const suffix = url.slice(url.lastIndexOf('.'))
  const filename = suffix + Date.now()
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
const sizeLists = ref([
  {
    icon: img11,
    checkedIcon: img11Checked,
    title: '1:1',
    id: '512*512',
    width: 512,
    height: 512
  },
  {
    icon: img43,
    checkedIcon: img43Checked,
    title: '4:3',
    id: '682*512',
    width: 682,
    height: 512
  },
  {
    icon: img34,
    checkedIcon: img34Checked,
    title: '3:4',
    id: '512*682',
    width: 512,
    height: 682
  },
  {
    icon: img169,
    checkedIcon: img169Checked,
    title: '16:9',
    id: '910*512',
    width: 910,
    height: 512
  },
  {
    icon: img916,
    checkedIcon: img916Checked,
    title: '9:16',
    id: '512*910',
    width: 512,
    height: 910
  }
])
let activeSize = ref({
  title: '1:1',
  id: '512*512',
  width: 512,
  height: 512
})
const setActiveSize = (item) => {
  activeSize.value = item
  hidePopover(sizePopoverRef.value)
}
let stylePopoverRef = ref(null)
let activeStyle = ref('风格不限')
let styleLists = ref([])
let callWordPopoverRef = ref(null)
let activeCallWord = ref([])
let callWordLists = ref([])
const getStyles = () => {
  get_image_style({}).then((res) => {
    styleLists.value = res.data || []
  })
}
const setActiveStyle = (title) => {
  activeStyle.value = title
  hidePopover(stylePopoverRef.value)
}
const getCueword = () => {
  get_image_cueword({}).then((res) => {
    callWordLists.value = res.data || []
  })
}
const setActiveCallWord = (word) => {
  if (activeCallWord.value.includes(word)) {
    activeCallWord.value = activeCallWord.value.filter((item) => item !== word)
    message.value.text = message.value.text.replace(new RegExp('(，|,)?' + word, 'g'), '')
    message.value.text = message.value.text.replace(/^(，|,)/, '')
  } else {
    activeCallWord.value.push(word)
    message.value.text += message.value.text.trim().length
      ? (new RegExp('(，|,)$').test(message.value.text) ? '' : '，') + word
      : word
  }
}
let elUploadRef = ref(null)
let uploadBtnRef = ref(null)
let attachListBox = ref(null)
let showPrevBtn = ref(false)
let showNextBtn = ref(false)
let isHoveringAttachBox = ref(false)
// 文件列表
const localfileList = ref([])
// 处理发送点击
const handleSendClick = () => {
  if (message.value.text.trim().length) {
    replaceActiveTab({
      title: message.value.text,
      url: 'ImageProductionChat',
      isInternal: true,
      attrs: {
        attach_files: cloneDeep(localfileList.value),
        message_text: message.value.text,
        image_size: activeSize.value.id,
        image_style: activeStyle.value
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
// // 处理导入文件
// const handleSubmitImport = (files) => {
//   localfileList.value.push(...files)
// }
const handleSelectChange = (file) => {
  // 如果是文件夹，使用新的目录树结构
  if (file.webkitRelativePath) {
    // 处理文件夹上传
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
        total_space: response.data[0].file_size
      }
      localfileList.value = [uploadedFile]
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
  if (sizePopoverRef.value) {
    sizePopoverRef.value.hide()
  }
  if (type === 'repository') {
    // 知识库文件上传
    // onlineFileVisible.value = true
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
  const scrollAmount = 100 // 每次滚动100px
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

  const scrollAmount = 110 // 每次滚动100px
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
  getStyles()
  getCueword()
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
// const getFileIcon = (item) => {
//   // 根据文件扩展名返回不同的图标
//   const ext = item.full_path?.split('.').pop()?.toLowerCase()
//   const iconMap = {
//     doc: wordIcon,
//     docx: wordIcon,
//     pdf: pdfIcon,
//     xls: excelIcon,
//     xlsx: excelIcon,
//     ppt: pptIcon,
//     pptx: pptIcon,
//     txt: txtIcon,
//     png: imgIcon,
//     jpg: imgIcon,
//     jpeg: imgIcon,
//     gif: imgIcon
//   }
//   return iconMap[ext] || wordIcon
// }
// const formatFileSize = (kb) => {
//   if (!kb) return '0 KB'
//   if (kb < 1024) {
//     return kb + ' KB'
//   } else if (kb < 1024 * 1024) {
//     return (kb / 1024).toFixed(2) + ' MB'
//   } else if (kb < 1024 * 1024 * 1024) {
//     return (kb / (1024 * 1024)).toFixed(2) + ' GB'
//   } else {
//     return (kb / (1024 * 1024 * 1024)).toFixed(2) + ' TB'
//   }
// }
</script>

<style scoped lang="scss">
.ImageProduction {
  box-sizing: border-box;
  padding: 0 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 378px;
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
  .form-box {
    .textarea-container {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 304px;
      background: #f9f9f9;
      border-radius: 12px;
      .input {
        flex: 1;
        width: 100%;
        // flex: 1;
        flex-shrink: 0;
        font-size: 14px;
        overflow: hidden;
        :deep(.el-textarea__inner) {
          padding: 16px 16px 52px;
          // width: 100%;
          height: 100%;
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
        .actions-left {
          display: flex;
          align-items: center;
          .reference-btn {
            flex-shrink: 0;
            padding: 0;
            height: 34px;
            width: 74px;
            color: #737475;
            font-size: 14px;
            background: #eee;
            border-style: none;
            &.size-btn {
              padding: 0 10px 0 12px;
              width: 80px;
              display: flex;
              :deep(> span) {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              &.style-btn {
                width: auto;
                min-width: 100px;
              }
            }
            &:hover {
              filter: brightness(0.96);
            }
            .icon {
              margin-right: 4px;
              width: 16px;
              height: 16px;
            }
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
    flex-shrink: 0;
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
        // padding: 10px;
        display: flex;
        align-items: center;
        width: 120px;
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
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
        }
        .attached-icon {
          flex-shrink: 0;
          display: block;
          margin-right: 4px;
          width: 36px;
          height: 36px;
        }
        .image-cover {
          width: 100%;
          height: 100%;
          border-radius: 4px;
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
.custom-size-popover {
  border-radius: 8px !important;
  padding: 12px 8px !important;

  .common-handle-box {
    .item {
      padding: 5px 10px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 4px;
      cursor: pointer;
      &.active {
        background: var(--el-color-primary-light-9) !important;
        color: var(--el-color-primary);
        .check-icon {
          display: block;
        }
      }
      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: var(--primary-bg-color);
      }
      .item-left {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 9px;
        .icon {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
        }
        .title {
          flex: 1;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }

      .check-icon {
        display: none;
        color: var(--el-color-primary);
      }
      .icon {
        flex-shrink: 0;
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
.custom-style-popover {
  padding: 8px 2px 8px 8px !important;
  border-radius: 8px !important;
  width: 478px !important;
  height: 168px !important;
  .handle-box {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .item {
      box-sizing: border-box;
      position: relative;
      width: 70px;
      height: 70px;
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.2s linear;
      &.default-item {
        &::before {
          background: transparent;
        }
      }
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.8) 100%);
        z-index: 1;
      }
      &:hover {
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.03);
          z-index: 1;
        }
        .cover {
          transform: scale(1.1);
        }
      }
      .cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all 0.2s linear;
      }
      .title {
        width: 90%;
        position: absolute;
        left: 50%;
        bottom: 4px;
        transform: translateX(-50%);
        z-index: 1;
        font-size: 10px;
        color: #fff;
        text-align: center;
        line-height: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        &.default-title {
          color: var(--el-color-primary);
        }
      }
      .checked-icon {
        position: absolute;
        top: 2px;
        right: 2px;
        z-index: 1;
        width: 14px;
        height: 14px;
      }
    }
  }
}
.call-word-popover {
  padding: 10px !important;
  border-radius: 8px !important;
  width: 528px !important;
  height: 156px !important;
  .call-word-box {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .item-box {
      margin-bottom: 10px;
      &:last-of-type {
        margin-bottom: 0;
      }
      .label {
        margin-bottom: 10px;
        font-size: 12px;
        color: #737475;
        line-height: 16px;
      }
      .children-box {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .children-item {
          padding: 0px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--default-font-color);
          line-height: 22px;
          border-radius: 4px;
          background: #f9f9f9;
          cursor: pointer;
          &:hover {
            background: var(--primary-bg-color);
          }
          &.active {
            background: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
}
</style>
