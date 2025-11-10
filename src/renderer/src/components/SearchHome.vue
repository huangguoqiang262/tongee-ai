<template>
  <div class="search-home" @click="handleClick">
    <div class="logo-box">
      <img class="logo" src="@renderer/assets/home/large-logo.png" alt="" />
    </div>
    <div class="search-box">
      <MessageInput
        ref="messageInput"
        key="input"
        class="message-input"
        :models="models"
        :model_id="activeSession.model_id"
        :userknows="userknows"
        :source-knows="sourceKnows"
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
import { ref, reactive } from 'vue'
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
let isChatting = ref(false)
const selectModel = (model) => {
  console.log(model)
}
const messageInput = ref(null)
const handleClick = (e) => {
  messageInput.value?.focusChange(e)
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
</script>

<style scoped lang="scss">
.search-home {
  height: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .logo-box {
    margin-bottom: 58px;
    text-align: center;
    flex-shrink: 0;
    .logo {
      width: 274px;
      height: 77px;
      object-fit: contain;
    }
    .logo-text {
      font-weight: 700;
      font-size: 32px;
      color: var(--default-font-color);
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
