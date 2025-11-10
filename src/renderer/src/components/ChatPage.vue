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
        :is-fan-creation="isFanCreation"
      />
    </div>
    <div v-else class="empty-chat">
      <img class="empty-img" src="@renderer/assets/empty.png" alt="" />
      <div class="empty-text">Hi，有任何问题，尽管提问</div>
    </div>
    <div class="search-box">
      <chat-input
        v-if="activeSession"
        key="input"
        class="message-input"
        :models="models"
        :model_id="activeSession.model_id"
        :userknows="userknows"
        :source-knows="sourceKnows"
        :send-shortcut="activeSession.sendShortcut"
        :knowledge_ids="activeSession.knowledge_ids"
        :is-chatting="isChatting"
        :attach_file="attach_file"
        :sold-out="activeSession.agent_chat_status == 0 ? true : false"
        @select-model="selectModel"
        @select-library="selectKnows"
        @send="handleSendMessage"
        @uploaded-attachment="uploadedAttachment"
        @clear-attach="clearAttach"
        @stop-chat="stopChat"
      >
      </chat-input>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, inject } from 'vue'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
let replaceActiveTab = inject('replaceActiveTab')
let isChatting = ref(false)
let showChat = ref(false)
let back = () => {
  replaceActiveTab({
    title: '首页',
    url: 'SearchHome',
    isInternal: true
  })
}
const models = ref([])
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
      medias: [],
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
const userknows = ref([])
const sourceKnows = ref([])
const attach_file = ref([])
const selectModel = (model) => {
  console.log(model)
}
const selectKnows = (know) => {
  console.log(know)
}
const handleSendMessage = (message) => {
  console.log(message)
}
const uploadedAttachment = (file) => {
  console.log(file)
}
const clearAttach = () => {
  attach_file.value = []
}
const stopChat = () => {
  isChatting.value = false
}
let isFanCreation = ref(false)
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
    overflow: hidden;
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
    .message-input {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
    }
  }
}
</style>
