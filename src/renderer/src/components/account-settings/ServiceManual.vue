<template>
  <div class="notebook-box">
    <div class="catalogue" v-if="!catalogueShow" @click="catalogueClick(true)">目录</div>
    <div class="left-box" v-if="catalogueShow">
      <div class="common-box">
        <div class="common-box-left">目录</div>
        <div class="square-icon-box" @click="catalogueClick(false)">
          <img class="square-icon" src="@renderer/assets/close-chat-icon.png" alt="" />
        </div>
      </div>
      <div class="notebook-list">
        <div class="item active-note">
          <!-- <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div> -->
          <div class="title">更新日志</div>
        </div>
        <div v-for="value in 28" :key="value" class="item">
          <!-- <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div> -->
          <div class="title">更新日志</div>
        </div>
        <div class="item">
          <!-- <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div> -->
          <div class="title">更新日志</div>
        </div>
      </div>
    </div>
    <div class="center-box">
      <div class="center-content">
        <div v-for="item in noteList" :key="item.id" class="note-item">
          <div class="title">
            <template>{{ item.title }}</template>
          </div>
          <div class="des">{{ item.des }}</div>
          <div class="item-bottom">
            <div class="time">{{ item.time }}</div>
            <div class="size">{{ item.size }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="answer-box">
      <div class="chat-box">
        <div class="chat-list">
          <div class="chat-item user-char">
            <div class="item-nr user-item">你好呀</div>
          </div>
          <div class="chat-item">
            <div class="item-nr">你好呀</div>
          </div>
        </div>
        <!-- <div class="no-data">
          <img src="@renderer/assets/no-icon.png" class="no-img" />

          <div class="no-tips">
Hi，任何关于这个知识库的问题，尽管提问
          </div>
        </div> -->
      </div>

      <div ref="inputWrapper" class="input-wrapper" @click.stop="focusChange">
        <div class="input-box">
          <!-- 按回车键发送，输入框高度三行 -->
          <el-input
            ref="messageInputRef"
            v-model="message.text"
            :disabled="isChatting"
            autosize
            class="input"
            resize="none"
            placeholder="@知识库或直接提问"
            @focus="focus.value = true"
            :rows="3"
          >
          </el-input>
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
            <div
              class="networking"
              :class="{ 'is-network': isNetwork }"
              @click.stop="networkChange"
            >
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, nextTick } from 'vue'
import html2Canvas from 'html2canvas'

const noteList = ref([
  {
    id: 1,
    title: '医疗器械注册流程笔记',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '123KB'
  },
  {
    id: 2,
    title: '质量管理体系要点',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '123KB'
  },
  {
    id: 3,
    title: '临床评价需求总结',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '13KB'
  }
])

const catalogueShow = ref(false)
const catalogueClick = (val) => {
  catalogueShow.value = val
}
let message = ref({
  text: ''
})
// ... existing code ...
const sendMessage = (event) => {
  if (event.type == 'keydown') {
    if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
      message.value.text += '\n'
    }
  } else {
    if (!message.value.text) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '请输入消息',
        type: 'warning'
      })
      return
    }
    this.$emit('send', message.value)
    message.value = { text: '' }
  }
}
let cities = ref([
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
])

const isChatting = ref(false)
// 处理粘贴事件
const handlePaste = (event) => {
  if (isChatting.value) {
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
        handleImageFile(file)
      }
      break
    }
  }
}
let focus = ref(false)
const focusChange = (e) => {
  if (this.$refs.inputWrapper.contains(e.target) || e.target == this.$refs.inputWrapper) {
    focus.value = true
  } else if (!message.text) {
    focus.value = false
  }
}
let isNetwork = ref(false)
const networkChange = () => {
  isNetwork.value = !isNetwork.value
}
</script>

<style scoped lang="scss">
.notebook-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  position: relative;
  .catalogue {
    width: 32px;
    height: 64px;
    background: #efefef;
    border-radius: 0px 12px 12px 0px;
    display: flex;
    justify-content: center;
    writing-mode: tb;
    align-items: center;
    position: absolute;
    top: 60px;
    left: 0;
    cursor: pointer;
  }

  .left-box {
    box-sizing: border-box;
    padding: 20px;
    width: 292px;
    height: 100%;
    border-right: 1px solid #efefef;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .common-box {
      flex-shrink: 0;
      margin-bottom: 20px;
      box-sizing: border-box;
      // padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .common-box-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .icon {
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }

      .square-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        // border-radius: 4px;
        .square-icon {
          display: block;
          width: 18px;
          height: 18px;
        }
      }
    }

    .notebook-list {
      flex: 1;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background-color: #dddcdc;

        &:hover {
          background-color: #909090;
        }
      }
      .item {
        position: relative;
        margin-bottom: 4px;
        box-sizing: border-box;
        // padding: 0 36px 0 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        // &:hover {
        //   background: #f6f6f6;
        // }

        .icon-box {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          // border-radius: 2px;
          transition: all 0.2s;

          .icon {
            display: block;
            width: 16px;
            height: 16px;
          }
        }

        .title {
          flex: 1;
          font-size: 16px;
          color: var(--default-font-color);
          line-height: 22px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        &.active-note {
          // background: var(--el-color-primary-light-9);
          .title {
            color: var(--el-color-primary) !important;
          }
        }
      }
    }
  }

  .center-box {
    flex: 1;
    height: 100%;
    padding: 13px 10px 20px 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .center-content {
      flex: 1;
      padding-right: 10px;
      overflow-y: auto;
      width: 100%;
      max-width: 910px;
      margin: 0 auto;
      &::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background-color: #dddcdc;

        &:hover {
          background-color: #909090;
        }
      }

      .note-item {
        padding-top: 8px;
        padding-bottom: 19px;
        margin-bottom: 11px;
        border-bottom: 1px solid #efefef;

        &:last-of-type {
          border-bottom: none;
        }

        .title {
          margin-bottom: 7px;
          font-size: 16px;
          color: var(--default-font-color);
          line-height: 22px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .des {
          margin-bottom: 11px;
          font-size: 14px;
          color: #909090;
          line-height: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          .time,
          .size {
            font-size: 12px;
            color: #909090;
            line-height: 16px;
          }
        }
      }
    }
  }

  .answer-box {
    width: 412px;
    height: 100%;
    border-left: 1px solid #efefef;
    // background: red;
    position: relative;
    padding: 20px;

    .chat-box {
      width: 100%;
      height: calc(100% - 100px);
      // background: #f9f9f9;
      .chat-list {
        .chat-item {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          width: 100%;
          margin-bottom: 30px;
          .item-nr {
            max-width: 80%;
          }
        }
        .user-char {
          display: flex;
          justify-content: end;
        }
        .ai {
        }
        .user-item {
          background: var(--el-color-primary);
          padding: 10px 14px;
          border-radius: 8px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }
      }

      .no-data {
        width: 100%;
        position: absolute;
        top: 50%;
        text-align: center;
        left: 50%;
        transform: translate(-50%, -50%);
        .no-img {
          width: 76px;
          height: 55px;
          margin-bottom: 13px;
        }
        .no-tips {
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: #737475;
          line-height: 20px;
        }
      }
    }

    .input-wrapper {
      box-sizing: border-box;
      padding: 10px 20px;
      min-height: 76px;
      max-height: 76px;
      display: flex;
      // align-items: center;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      background: #f9f9f9;
      border-radius: 16px;
      border: 1px solid #dfdfdf;
      transition: min-height 0.3s linear, max-height 0.6s linear;
      position: absolute;
      bottom: 30px;
      width: calc(100% - 40px);
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
        .input {
          .el-input__wrapper {
            border: none;
          }
          :deep(.el-input__wrapper) {
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
  }
}
</style>
