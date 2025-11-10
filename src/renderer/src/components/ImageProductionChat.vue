<template>
  <div class="chat-page-box">
    <div class="chat-back" @click="back">
      <el-icon><ArrowLeftBold /></el-icon>
    </div>
    <div v-if="showChat" class="chat-content">
      <MessageRow
        v-for="message in activeSession.messages"
        :key="message.dateline"
        :message="message"
        :is-chatting="isChatting"
        @handle-action="handleAction"
      />
    </div>
    <div v-else class="empty-chat">
      <img class="empty-img" src="@renderer/assets/empty.png" alt="" />
      <div class="empty-text">Hi，有任何问题，尽管提问</div>
    </div>
    <div class="search-box">
      <el-input
        v-model="message.text"
        autosize
        class="message-input"
        type="textarea"
        placeholder="继续输入调整图片内容"
        @keydown.enter.prevent="sendMessage"
      ></el-input>
    </div>
    <take-notes
      ref="takeNotes"
      v-model="onlineNoteVisible"
      :notes="notes"
      @submit-import="submitImport"
    />
    <PreviewMessage
      v-if="previewVisible"
      ref="previewMessage"
      :messages="activeSession.messages"
      @close-preview="closePreview"
    />
  </div>
</template>
<script setup>
import { reactive, ref, inject } from 'vue'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
let previewVisible = ref(false)
const closePreview = () => {
  previewVisible.value = false
}
let replaceActiveTab = inject('replaceActiveTab')
let isChatting = ref(false)
let showChat = ref(true)
let message = ref({
  text: ''
})
let back = () => {
  replaceActiveTab({
    title: '首页',
    url: 'SearchHome',
    isInternal: true
  })
}
const onlineNoteVisible = ref(false)
const notes = ref([])
const submitImport = (notes) => {
  console.log(notes)
  // notes.value = notes
}
const handleAction = (action) => {
  if (action === 'takeNote') {
    onlineNoteVisible.value = true
  } else if (action === 'share') {
    console.log(6666666)

    previewVisible.value = true
  }
}
const activeSession = reactive({
  name: '',
  messages: [
    {
      dateline: '2025-01-01 12:00:00',
      textContent: '你好！这是一个用户测试消息。',
      type: 'USER',
      completion_tokens: 10,
      medias: [],
      total_tokens: 20,
      prompt_tokens: 10,
      spread: false,
      issueContentText: '',
      attach_file_ids: [],
      retrievedDocumentList: [],
      reasoningContentText: ''
    },
    {
      dateline: '2025-01-01 12:01:00',
      textContent: '你好！我是AI助手，很高兴为您服务。这是一个AI回复的测试消息。',
      type: 'AI',
      completion_tokens: 15,
      medias: [
        {
          type: 'image',
          data: 'https://gips2.baidu.com/it/u=1651586290,17201034&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f600_800'
        },
        {
          type: 'image',
          data: 'https://gips3.baidu.com/it/u=3886271102,3123389489&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960'
        },
        {
          type: 'image',
          data: 'https://gips0.baidu.com/it/u=3602773692,1512483864&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280'
        },
        {
          type: 'image',
          data: 'https://gips0.baidu.com/it/u=3560029307,576412274&fm=3028&app=3028&f=JPEG&fmt=auto?w=960&h=1280'
        }
      ],
      total_tokens: 25,
      prompt_tokens: 10,
      spread: false,
      issueContentText: '',
      attach_file_ids: [],
      retrievedDocumentList: [],
      reasoningContentText: '这是一个思考过程示例'
    }
  ],
  chat_key: '',
  model_id: '',
  knowledge_ids: '',
  cue_word: '',
  shop_id: '',
  agent_id: '',
  agent_chat_status: 1,
  is_ai_creation: 2, //1是口播稿智能体2不是
  temperature: 0.7,
  top_p: 3,
  max_tokens: 1024,
  stream: true,
  enableLengthLimit: false,
  splitLine: false,
  serif: false,
  lineNumber: true,
  fontSize: 16,
  estimatedToken: false,
  pasteAsFile: false,
  markdownRender: true,
  generateQuestions: true,
  agentInfo: {}
})
const sendMessage = (event) => {
  if (event.key === 'Enter' && (event.shiftKey || event.ctrlKey || event.altKey)) {
    message.value.text += '\n'
  } else {
    if (!message.value.text.trim().length) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '请输入消息',
        type: 'warning'
      })
      return
    }
  }
}

// const stopChat = () => {
//   isChatting.value = false
// }
</script>
<style scoped lang="scss">
.chat-page-box {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 20px 20px;
  height: 100%;
  min-width: 375px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  .chat-back {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 1;
    width: 30px;
    height: 30px;
    background: #efefef;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--default-font-color);
  }
  .chat-content {
    flex: 1;
    padding: 20px 0;
    width: 770px;
    margin: 0 auto;
    overflow-y: auto;
  }
  .empty-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty-img {
      margin-bottom: 30px;
      width: 78px;
      height: 55px;
    }
    .empty-text {
      font-size: 14px;
      color: #737475;
    }
  }
  .search-box {
    width: 100%;
    :deep(.message-input) {
      display: block;
      width: 100%;
      max-width: 770px;
      margin: 0 auto 30px;
      .el-textarea__inner {
        padding: 20px 18px;
        min-height: 58px;
        font-size: 16px;
        max-height: 150px;
        background: #f6f6f6;
        border-radius: 12px;
      }
    }
  }
}
</style>
