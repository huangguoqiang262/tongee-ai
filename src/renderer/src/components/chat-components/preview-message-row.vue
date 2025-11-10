<script setup>
import { computed, ref } from 'vue'
// import { handleCopyMsg } from '@renderer/utils/index'
import LOGO from '@renderer/assets/logo.png'
const props = defineProps({
  direction: {
    type: String,
    default: 'left'
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
  showUser: {
    type: Boolean,
    default: false
  },
  isFanCreation: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['newChat', 'retrievedDocumen', 'lookOver', 'handleAction', 'handleCheck'])
const localSpread = ref(props.message.spread || false)
const markdownMessage = ref(null)

const logo = LOGO

const images = computed(() => {
  const medias = props.message.medias || []
  return medias.filter((media) => media.type === 'image').map((media) => media.data)
})

const lookOver = (file) => {
  emit('lookOver', file)
}
const handleClick = () => {
  emit('handleCheck', props.message)
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
</script>

<!-- 整个div是用来调整内部消息的位置，每条消息占的空间都是一整行，然后根据right还是left来调整内部的消息是靠右边还是靠左边 -->
<template>
  <div
    :class="[
      'message-row',
      props.message.type === 'USER' && props.direction === 'right' ? 'right' : 'left'
    ]"
    @click="handleClick"
  >
    <!-- 消息展示，分为上下，上面是头像，下面是消息 -->
    <div v-if="props.message.type === 'USER'" class="row">
      <el-checkbox
        user-type="user"
        class="checkbox"
        :model-value="props.message.checked"
      ></el-checkbox>
      <!-- 发送的消息或者回复的消息 -->
      <div
        class="message message-user"
        :style="{
          fontFamily: props.serif ? 'serif' : 'sans-serif'
        }"
      >
        <div class="message-content">
          <!-- 附件 -->
          <div class="attachment">
            <div
              v-for="(item, index) in props.message.attach_file_ids"
              :key="index"
              class="attachment-item"
            >
              <template v-if="item.fileType == 'image'">
                <el-image
                  :key="'image' + index"
                  class="attachment-image"
                  fit="cover"
                  :preview-src-list="[item.fileUrl]"
                  :src="item.fileUrl"
                ></el-image>
              </template>
              <template v-else>
                <div class="file-item" @click.stop="lookOver(item)">
                  <img class="file-icon" src="@renderer/assets/attached-icon.png" alt="" />
                  <div class="file-name">
                    {{ item.fileName }}
                  </div>
                </div>
              </template>
            </div>
          </div>
          <!-- 如果消息是文本，用markdown展示 -->
          <MarkdownMessage
            :type="props.message.type"
            :message="props.message.textContent"
          ></MarkdownMessage>

          <!-- 如果消息的内容是图片，则显示图片  -->
          <el-image
            v-for="(image, index) in images"
            :key="'image' + index"
            class="image"
            fit="cover"
            :preview-src-list="images"
            :src="image"
          ></el-image>
          <div class="empty-message">
            {{ props.message.dateline }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="props.message.type !== 'USER'" class="row">
      <el-checkbox class="checkbox" :model-value="props.message.checked"></el-checkbox>
      <div>
        <div class="avatar-wrapper">
          <el-avatar :size="18" :src="logo" class="avatar" shape="square" />
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
                  !props.message.textContent)
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
              v-if="props.message.reasoningContentText && props.message.spread"
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
            ></MarkdownMessage>
            <el-image
              v-for="(image, index) in images"
              :key="'image' + index"
              class="image"
              fit="cover"
              :preview-src-list="images"
              :src="image"
            ></el-image>
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
  flex-direction: column;
  align-items: flex-end;
  .attachment-item {
    margin-bottom: 10px;
    background: #fff;
    border-radius: 6px;
    padding: 6px;
    overflow: hidden;
    width: fit-content;
    max-width: 312px;
    .attachment-image {
      width: 300px;
      height: 200px;
      border-radius: 6px;
      display: block;
    }
    .file-item {
      box-sizing: border-box;
      padding: 0 5px;
      display: flex;
      align-items: center;
      gap: 0 10px;
      height: 40px;
      width: 100%;
      overflow: hidden;
      background-color: #f9f9f9;
      border-radius: 6px;
      overflow: hidden;
      .file-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
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
        // background-color: rgb(231, 248, 255);
        :deep(.vuepress-markdown-body) {
          background-color: rgb(231, 248, 255);
        }
        .message-content {
          float: right;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
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
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 13px 20px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    :deep(.checkbox) {
      flex-shrink: 0;
      height: 18px;
      &[user-type='user'] {
        margin-top: 11px;
      }
      .el-checkbox__inner {
        width: 18px;
        height: 18px;
      }
    }
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
      :deep(.v-md-editor-preview[type='user']) {
        width: 100%;
        margin-bottom: 10px;
        .vuepress-markdown-body {
          font-size: 22px !important;
          color: var(--default-font-color);
          font-weight: 600;
          line-height: 30px;
        }
        // max-width: 100%;
      }
      :deep(.vuepress-markdown-body) {
        font-size: 14px;
        line-height: 20px;
        color: var(--default-font-color);
        font-family: inherit !important;
        background: transparent;
      }
      :deep(.vuepress-markdown-body:not(.custom)) {
        padding: 0;
        border-radius: 8px;
      }
      .image {
        width: 600px;
        height: 600px;
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
</style>
