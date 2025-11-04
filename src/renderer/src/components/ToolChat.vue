<template>
  <div class="Tool-chat">
    <div class="Tool-chat-header">
      <div class="head-left">
        <img class="head-logo" src="@renderer/assets/logo.png" alt="TONGEE AI" />
        <div class="head-text">TONGEE AI</div>
      </div>
      <div class="head-right">
        <el-tooltip content="清空会话" effect="light" placement="bottom">
          <img class="clear-chat-icon" src="@renderer/assets/clear-chat-icon.png" alt="清空对话" />
        </el-tooltip>
        <img class="close-chat-icon" src="@renderer/assets/close-chat-icon.png" alt="关闭对话" />
      </div>
    </div>
    <div class="chat-content">
      <template v-if="showChat">
        <MessageRow
          :message="userMessage"
          :is-chatting="isChatting"
          :is-fan-creation="isFanCreation"
        />
        <MessageRow
          :message="aiMessage"
          :is-chatting="isChatting"
          :is-fan-creation="isFanCreation"
        />
      </template>
      <div v-else class="empty-chat">
        <img class="empty-img" src="@renderer/assets/logo.png" alt="" />
        <div class="empty-text">Hi，任何关于这个知识库的问题，尽管提问</div>
      </div>
    </div>
    <div class="search-box">
      <MessageInput
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
      </MessageInput>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from 'vue'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
let isChatting = ref(false)
let showChat = ref(false)
const models = ref([])
const activeSession = reactive({
  name: '',
  messages: [],
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
const userMessage = reactive({
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
})

const aiMessage = reactive({
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
})
let isFanCreation = ref(false)
</script>
<style scoped lang="scss">
.Tool-chat {
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
  .Tool-chat-header {
    height: 50px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .head-left {
      display: flex;
      align-items: center;
      .head-logo {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
      .head-text {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
    }
    .head-right {
      display: flex;
      align-items: center;
      gap: 0 15px;
      .clear-chat-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      .close-chat-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
    }
  }
  .chat-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    .empty-chat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .empty-img {
        margin-bottom: 30px;
        width: 40px;
        height: 40px;
      }
      .empty-text {
        font-size: 14px;
        color: #737475;
      }
    }
  }
  .search-box {
    width: 100%;
    .message-input {
      width: 100%;
      max-width: 938px;
      margin: 0 auto;
    }
  }
}
</style>
