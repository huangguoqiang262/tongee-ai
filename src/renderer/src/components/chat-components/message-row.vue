<script setup>
import { computed, ref, inject } from 'vue'
// import { handleCopyMsg } from '@renderer/utils/index'
import LOGO from '@renderer/assets/logo.png'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
const props = defineProps({
  //是否正在对话
  isChatting: {
    type: Boolean,
    default: false
  },
  direction: {
    type: String,
    default: 'left'
  },
  imageSize: {
    type: String,
    default: '246px'
  },
  chatType: {
    type: String,
    default: 'text'
  },
  fontSize: {
    type: Number,
    default: 16
  },
  serif: {
    type: Boolean,
    default: false
  },
  lineNumber: {
    type: Boolean,
    default: true
  },
  message: {
    type: Object,
    default: () => ({})
  },
  avatar: {
    type: String,
    default: ''
  },
  isPreView: {
    type: Boolean,
    default: false
  },
  showUser: {
    type: Boolean,
    default: false
  },
  hideAttachFiles: {
    type: Boolean,
    default: false
  }
})
const addNewTab = inject('addNewTab')
const emit = defineEmits(['newChat', 'retrievedDocumen', 'lookOver', 'handleAction'])
const localSpread = ref(props.message.spread || false)
const markdownMessage = ref(null)

const logo = LOGO

const images = computed(() => {
  const medias = props.message.medias || []
  var list = []
  medias
    .filter((media) => media.type === 'image')
    .map((media) => {
      list.push(...media.data)
    })
  return list
})

const issueContentItems = computed(() => {
  let content = JSON.parse(JSON.stringify(props.message.issueContentText)) || ''
  if (content) {
    content = content.replace(/(\d?&\|)|(\n\n)*/g, '')
    content = content.replace(/^\s*/, '')
  }
  // 根据分隔符类型拆分内容
  return content.split('\n')
})

const newChat = (item) => {
  if (props.isChatting && item) {
    return false
  }
  emit('newChat', item)
}

// //下载引用文件
// const retrievedDocumen = (fileId) => {
//   emit('retrievedDocumen', fileId)
// }

const lookOver = (file, type = 1) => {
  if (type == 1) {
    addNewTab({
      title: file.title,
      url: 'DocumentDetail',
      isInternal: true,
      attrs: {
        fileUrl: file.full_path,
        fileName: file.title
      }
    })
  } else {
    addNewTab({
      title: file.filename,
      url: 'DocumentDetail',
      isInternal: true,
      attrs: {
        fileUrl: file.url,
        fileName: file.filename
      }
    })
  }
}
const getFileIcon1 = (item) => {
  // 根据文件扩展名返回不同的图标
  const ext = item.filename?.split('.').pop()?.toLowerCase()
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
// 获取文件图标
const getFileIcon = (item) => {
  // 根据文件扩展名返回不同的图标
  const ext = item.title?.split('.').pop()?.toLowerCase()
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
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
const handleAction = (acticon, message) => {
  if (props.isChatting) {
    return
  }
  var content = ''
  if (props.chatType == 'text') {
    content = message.textContent
  } else {
    content = images.value
      .map((item) => `<p><img src="${item.full_path}" alt="${item.title}" /></p>`)
      .join('\n')
  }
  emit('handleAction', acticon, content)
}
// const exportToMd = (msg) => {
//   if (!msg.textContent?.trim()) {
//     ElMessage.warning('暂无AI回复内容可保存')
//     return
//   }
//   // 直接使用原始Markdown内容
//   const mdContent = `## AI对话记录 ${msg.dateline}\n\n${
//     msg.textContent
//   }\n\n${'本回答由 AI 生成，内容仅供参考，请仔细甄别。'}`

//   // 创建Markdown文件
//   const blob = new Blob([mdContent], { type: 'text/markdown' })
//   const link = document.createElement('a')
//   link.href = URL.createObjectURL(blob)
//   link.download = `AI对话记录_${new Date().toISOString().slice(0, 10)}.md`
//   link.click()
//   URL.revokeObjectURL(link.href)
// }
// const popoverFile = (i) => {
//   var obj = {}
//   props.message.retrievedDocumentList[i].filter(item => {
//     if (item.index == i) {
//       obj = item
//     }
//   })
//   return obj
// }
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
const download = (index, images) => {
  const url = images[index].full_path
  const suffix = url.slice(url.lastIndexOf('.'))
  const filename = suffix + Date.now()
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // fetch(url)
  //   .then((response) => response.blob())
  //   .then((blob) => {
  //     const blobUrl = URL.createObjectURL(new Blob([blob]))
  //     const link = document.createElement('a')
  //     link.href = blobUrl
  //     link.download = filename
  //     document.body.appendChild(link)
  //     link.click()
  //     URL.revokeObjectURL(blobUrl)
  //     link.remove()
  //   })
}
</script>

<!-- 整个div是用来调整内部消息的位置，每条消息占的空间都是一整行，然后根据right还是left来调整内部的消息是靠右边还是靠左边 -->
<template>
  <div
    :class="[
      'message-row',
      props.message.type === 'USER' && props.direction === 'right' ? 'right' : 'left'
    ]"
  >
    <!-- 消息展示，分为上下，上面是头像，下面是消息 -->
    <div v-if="props.message.type === 'USER'" class="row">
      <!-- 发送的消息或者回复的消息 -->
      <div
        class="message"
        :class="{ 'message-user': props.direction == 'right' }"
        :style="{
          fontFamily: props.serif ? 'serif' : 'sans-serif'
        }"
      >
        <div class="message-content">
          <!-- 如果消息是文本，用markdown展示 -->
          <MarkdownMessage
            :type="props.message.type"
            :message="props.message.textContent"
            :retrieved-document-list="props.message.retrievedDocumentList"
          ></MarkdownMessage>
          <div v-if="props.direction != 'right'" class="empty-message">
            {{ props.message.dateline }}
          </div>
          <!-- 附件 -->
          <div v-if="!hideAttachFiles" class="attachment">
            <div
              v-for="(item, index) in props.message.attach_file_ids"
              :key="index"
              class="attach-item"
              @click="lookOver(item, 1)"
            >
              <img class="attached-icon" :src="getFileIcon(item)" alt="" />
              <div class="attached-content">
                <div class="attach-name">
                  {{ item.title }}
                </div>
                <div class="attach-type">
                  <span class="file-extension">{{
                    item.title?.split('.').pop()?.toUpperCase()
                  }}</span>
                  <span v-if="item.total_space" class="file-size">{{
                    formatFileSize(item.total_space)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 如果消息的内容是图片，则显示图片  -->
          <div class="image-user-box">
            <el-image
              v-for="(image, index) in images"
              :key="'image' + index"
              class="image-user"
              crossorigin="anonymous"
              fit="cover"
              :preview-src-list="images.map((item) => item.full_path)"
              :src="image.full_path"
            >
              <template #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }">
                <el-icon @click="prev"><Back /></el-icon>
                <el-icon @click="next"><Right /></el-icon>
                <el-icon @click="setActiveItem(images.length - 1)">
                  <DArrowRight />
                </el-icon>
                <el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
                <el-icon @click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })">
                  <ZoomIn />
                </el-icon>
                <el-icon @click="actions('clockwise', { rotateDeg: 180, enableTransition: false })">
                  <RefreshRight />
                </el-icon>
                <el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
                <el-icon @click="reset"><Refresh /></el-icon>
                <el-icon @click="download(activeIndex, images)"><Download /></el-icon>
              </template>
            </el-image>
          </div>
        </div>
      </div>
    </div>
    <div v-if="props.message.type !== 'USER'" class="row">
      <div class="avatar-wrapper">
        <el-avatar :size="18" fit="contain" :src="logo" class="avatar" shape="square" />
        <span>糖源AI</span>
      </div>
      <!-- 发送的消息或者回复的消息 -->
      <div
        class="message"
        :style="{
          fontSize: props.fontSize + 'px',
          fontFamily: props.serif ? 'serif' : 'sans-serif'
        }"
      >
        <div class="message-content" :class="{ 'no-line-number': !props.lineNumber }">
          <!-- 如果消息的内容为空则显示加载动画 -->
          <TextLoading
            v-if="
              props.message.textContent !== '系统错误，请稍后再试' &&
              ((props.message.reasoningContentText && props.message.textContent) ||
                !props.message.textContent) &&
              !images.length
            "
            v-model:spread="localSpread"
            :reasoning-content-text="props.message.reasoningContentText"
            :loading-text="
              props.message.textContent
                ? props.message.textContent == '已取消回答'
                  ? '已取消'
                  : '已思考完成'
                : '思考中'
            "
          >
          </TextLoading>
          <div
            v-if="props.message.reasoningContentText && localSpread"
            class="reasoningContentText"
          >
            <div class="line"></div>
            <div class="reasoning-content">
              {{ props.message.reasoningContentText }}
            </div>
          </div>
          <MarkdownMessage
            v-if="props.message.textContent"
            ref="markdownMessage"
            :type="props.message.type"
            :message="props.message.textContent"
            :retrieved-document-list="props.message.retrievedDocumentList"
          ></MarkdownMessage>
          <!-- 返回附件 -->
          <div v-if="props.message?.file_info?.length" class="attachment" style="margin-top: 10px">
            <div
              v-for="(item, index) in props.message.file_info"
              :key="index"
              class="attach-item"
              @click="lookOver(item, 2)"
            >
              <img class="attached-icon" :src="getFileIcon1(item)" alt="" />
              <div class="attached-content">
                <div class="attach-name">
                  {{ item.filename }}
                </div>
                <div class="attach-type">
                  <span class="file-extension">{{
                    item.filename?.split('.').pop()?.toUpperCase()
                  }}</span>
                  <!-- <span class="file-size">{{ formatFileSize(item.total_space) }}</span> -->
                </div>
              </div>
            </div>
          </div>
          <div class="image-box">
            <el-image
              v-for="(image, index) in images"
              :key="'image' + index"
              class="image"
              fit="cover"
              crossorigin="anonymous"
              :preview-src-list="images.map((item) => item.full_path)"
              :src="image.full_path"
            >
              <template #toolbar="{ actions, prev, next, reset, activeIndex, setActiveItem }">
                <el-icon @click="prev"><Back /></el-icon>
                <el-icon @click="next"><Right /></el-icon>
                <el-icon @click="setActiveItem(images.length - 1)">
                  <DArrowRight />
                </el-icon>
                <el-icon @click="actions('zoomOut')"><ZoomOut /></el-icon>
                <el-icon @click="actions('zoomIn', { enableTransition: false, zoomRate: 2 })">
                  <ZoomIn />
                </el-icon>
                <el-icon @click="actions('clockwise', { rotateDeg: 180, enableTransition: false })">
                  <RefreshRight />
                </el-icon>
                <el-icon @click="actions('anticlockwise')"><RefreshLeft /></el-icon>
                <el-icon @click="reset"><Refresh /></el-icon>
                <el-icon @click="download(activeIndex, images)"><Download /></el-icon>
              </template>
              <template #error>
                <el-skeleton class="load-img" :loading="true" animated>
                  <template #template>
                    <el-skeleton-item
                      variant="image"
                      :style="{ width: props.imageSize, height: props.imageSize }"
                    />
                  </template>
                </el-skeleton>
              </template>
            </el-image>
          </div>
          <div
            v-if="!props.isPreView"
            class="empty-message download-message"
            :class="{ 'not-allowed': props.isChatting }"
          >
            <el-tooltip
              v-if="props.message.char_id"
              effect="light"
              content="记笔记"
              placement="bottom"
            >
              <img
                class="chat-icon"
                src="@renderer/assets/chat-icon/note-icon.png"
                alt=""
                @click="handleAction('takeNote', props.message)"
              />
            </el-tooltip>
            <el-tooltip
              v-if="props.message.char_id"
              effect="light"
              content="分享"
              placement="bottom"
            >
              <img
                class="chat-icon"
                src="@renderer/assets/chat-icon/share-icon.png"
                alt=""
                @click="handleAction('share', props.message)"
              />
            </el-tooltip>
            <el-tooltip effect="light" content="反馈" placement="bottom">
              <img
                class="chat-icon"
                src="@renderer/assets/chat-icon/feedback-icon.png"
                alt=""
                @click="handleAction('feedback', props.message)"
              />
            </el-tooltip>
          </div>
          <div
            v-if="props.message.issueContentText && props.message.issueContentText.length"
            class="question-box"
          >
            <div
              v-for="(item, index) in issueContentItems"
              :key="index"
              class="question-item"
              :style="{ cursor: props.isChatting ? 'not-allowed' : 'pointer' }"
              @click.stop="newChat(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.question-box {
  box-sizing: border-box;
  overflow: hidden;
  .question-item {
    margin: 10px 0;
    width: fit-content;
    padding: 15px;
    background: #fff;
    color: #2c3e50;
    font-size: 14px;
    line-height: 24px;
    border-radius: 8px;
    cursor: pointer;
  }
}
.file-list {
  margin: 10px 0;
  width: 100%;
  box-sizing: border-box;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  .file-label {
    font-size: 14px;
    margin-bottom: 15px;
    color: #2c3e50;
  }
  .file-item {
    box-sizing: border-box;
    padding: 0 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0 10px;
    height: 40px;
    width: 100%;
    overflow: hidden;
    background-color: #f9f9f9;
    border-radius: 6px;
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    .file-name {
      max-width: 100%;
      font-size: 14px;
      color: #8b8b8b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      &:hover {
        color: var(--primary-bg-color);
      }
    }
    // .down {
    //   font-size: 18px;
    //   color: #000000;
    //   font-size: 18px;
    //   cursor: pointer;
    // }
  }
}
.attachment {
  display: flex;
  // flex-direction: column;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
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
.message-row {
  display: flex;
  margin-bottom: 20px;
  &.right {
    // 消息显示在右侧
    justify-content: flex-end;

    .row {
      display: flex;
      justify-content: flex-end;
      // 头像也要靠右侧
      .avatar-wrapper {
        margin-left: 10px;
        justify-content: flex-end;
        align-items: flex-start;
      }

      // 用户回复的消息和ChatGPT回复的消息背景颜色做区分
      .message {
        &.message-user {
          .markdown-container[type='user'] {
            :deep(.v-md-editor-preview) {
              margin-bottom: 10px;
              width: fit-content;
              .vuepress-markdown-body {
                font-size: 14px;
                color: #fff;
                background-color: var(--el-color-primary);
                line-height: 20px;
                padding: 10px 14px;
              }
              // max-width: 100%;
            }
          }
        }
        // background-color: rgb(231, 248, 255);

        .message-content {
          float: right;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          .image-user-box {
            justify-content: flex-end;
          }
        }
      }
    }
  }
  &.left {
    // 消息显示在左侧
    justify-content: flex-start;
    .row {
      // 头像也要靠右侧
      .avatar-wrapper {
        margin-bottom: 20px;
        justify-content: flex-start;
        align-items: center;
        color: var(--default-font-color);
        font-size: 14px;
        font-weight: bold;
      }
      .message {
        box-sizing: border-box;
        width: 100%;
      }
    }
  }

  // 默认靠左边显示
  .row {
    width: 100%;
    .avatar-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
      .avatar {
        background: transparent;
      }
    }

    .message {
      width: 100%;
      // padding: 0px 5px;
      // 限制消息展示的最大宽度
      // max-width: 800px;
      // 圆润一点
      // 给消息框加一些描边，看起来更加实一些，要不然太扁了轻飘飘的。
      // border: 1px solid rgba(black, 0.1);
      // 背景颜色
      // background-color: #fff;
      overflow: hidden;
      .message-content {
        width: 100%;
        float: left;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .image-user-box {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-start;
          .image-user {
            flex-shrink: 0;
            width: 100px;
            height: 58px;
            border-radius: 4px;
          }
        }
        .reasoningContentText {
          position: relative;
          margin-bottom: 10px;
          .line {
            position: absolute;
            top: 50%;
            left: 0;
            width: 0;
            transform: translateY(-50%);
            height: calc(100% - 1em);
            border-left: 2px solid #e5e5e5;
          }
          .reasoning-content {
            color: #8b8b8b;
            line-height: 26px;
            padding: 0 0 0 13px;
            font-size: 14px;
            word-break: break-all;
          }
        }
        &.no-line-number {
          :deep(.line-numbers-mode) {
            &::after {
              display: none !important;
            }
            .line-numbers-wrapper {
              display: none !important;
            }
          }
        }
      }
      .v-md-editor-preview {
        width: 100%;
      }
      .markdown-container[type='user'] {
        :deep(.v-md-editor-preview) {
          width: 100%;
          margin-bottom: 10px;
          .vuepress-markdown-body {
            font-size: 22px;
            color: var(--default-font-color);
            font-weight: 600 !important;
            line-height: 30px;
          }
          // max-width: 100%;
        }
      }

      :deep(.vuepress-markdown-body) {
        font-size: 14px;
        line-height: 20px;
        color: var(--default-font-color);
        font-family: inherit !important;
      }
      :deep(.vuepress-markdown-body:not(.custom)) {
        padding: 0;
        border-radius: 8px;
      }
      .image-box {
        width: 100%;
        margin: 10px 0;
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 10px;
        .image {
          width: v-bind('imageSize');
          height: v-bind('imageSize');
          border-radius: 6px;
        }
      }
    }
  }
}

.footer {
  .options {
    .op-item {
      .name {
        margin-left: 5px;
        font-size: 14px;
      }
    }
  }
}
.empty-message {
  font-size: 14px;
  line-height: 20px;
  color: #909090;
  margin-bottom: 10px;
  &.empty-message1 {
    margin-top: 0;
  }
  &.download-message {
    padding: 18px 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
    width: 100%;
    border-bottom: 1px solid #e5e5e5;
    &.not-allowed {
      .chat-icon {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
    .chat-icon {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
  .fan-creation-icon {
    margin-left: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
}
.load-img {
  width: v-bind('imageSize');
  height: v-bind('imageSize');
  border-radius: 6px;
  &.is-animated .el-skeleton__item {
    background: linear-gradient(
      -45deg,
      color-mix(in srgb, var(--el-color-primary) 5%, #ffffff) 25%,
      var(--el-color-primary-light-9) 37%,
      color-mix(in srgb, var(--el-color-primary) 5%, #ffffff) 63%
    );
    background-size: 400% 100%;
  }
}
</style>
