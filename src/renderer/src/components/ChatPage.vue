<template>
  <div
    class="chat-page-box disabled-tools-chat"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div v-show="showDragOverlay" class="drag-overlay">
      <div class="drag-overlay-content">
        <div class="drag-text">拖拽文件到这里</div>
        <div class="drag-type">
          支持.doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式
        </div>
      </div>
    </div>
    <div class="chat-back" @click="back">
      <el-icon><ArrowLeftBold /></el-icon>
    </div>
    <div
      v-if="activeSession.messages.length"
      ref="messageListRef"
      class="chat-content"
      @scroll.passive="handleScroll"
    >
      <div class="message-row-box">
        <MessageRow
          v-for="(message, index) in activeSession.messages"
          :key="message.dateline + index"
          :message="message"
          :is-chatting="isChatting"
          @handle-action="handleAction"
          @again-text="handleAgainText"
        />
      </div>
    </div>
    <div v-else class="empty-chat">
      <EmptySvgIcon class="empty-img" />
      <div class="empty-text">Hi，有任何问题，尽管提问</div>
    </div>
    <div v-if="feedbackVisible" class="feedback-box">
      <div class="feedback-hd">
        <div class="feedback-title">糖源ai在哪些方面需要进一步优化？</div>
        <el-icon class="close-icon" @click="closeFeedback"><Close /></el-icon>
      </div>
      <div class="feedback-item-box">
        <div
          v-for="item in feedbackList"
          :key="item.id"
          class="feedback-item"
          @click="handleFeedback(item.title)"
        >
          {{ item.title }}
        </div>
      </div>
    </div>
    <div v-if="resultVisible" class="feedback-result">感谢您对糖源ai的反馈</div>
    <div class="search-box">
      <chat-input
        v-if="activeSession.model_name"
        key="input"
        ref="chatInputRef"
        :is-active-tab="isActiveTab"
        class="message-input"
        :models="models"
        :model_id="
          activeSession.model_name +
          '/' +
          activeSession.provider_key +
          '/' +
          activeSession.model_id +
          '/' +
          activeSession.enableSearch
        "
        :enable-search="activeSession.enableSearch"
        :is-network="activeSession.isNetwork"
        :is-chatting="isChatting"
        :default-model-config="defaultModelConfig"
        :model-config="modelConfig"
        @select-model="selectModel"
        @network-change="networkChange"
        @mention-change="handleMentionSelect"
        @send="handleSendMessage"
        @uploaded-attachment="uploadedAttachment"
        @stop-chat="stopChat(true)"
        @configuration-change="handleConfigurationChange"
      >
      </chat-input>
    </div>
    <take-notes
      v-model="onlineNoteVisible"
      :mark-down-text="markDownText"
      @submit-import="submitImport"
    />
    <PreviewMessage
      v-if="previewVisible"
      ref="previewMessage"
      direction="left"
      :messages="activeSession.messages"
      @close-preview="closePreview"
    />
  </div>
</template>
<script setup>
import { reactive, ref, inject, onMounted, nextTick } from 'vue'
import {
  getChatInfo,
  update_chat,
  get_chat_word,
  chat_feedback,
  feedbackType
} from '@renderer/api/chat.js'
import { SSE } from 'sse.js'
import { get_type_models } from '@renderer/api/repository.js'
import { useUserStore } from '@renderer/stores/user'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
import EmptySvgIcon from '@renderer/assets/empty-chatPage.svg'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
const props = defineProps({
  attrs: {
    type: Object,
    default: () => ({})
  },
  isActiveTab: {
    type: Boolean,
    default: false
  }
})
// 处理再次发送文本
const handleAgainText = (text) => {
  if (isChatting.value) return
  chatInputRef.value.againTextChange(text)
}
// 模型默认配置
const defaultModelConfig = ref({})
// 模型当前配置
const modelConfig = ref({})
const handleConfigurationChange = (config) => {
  modelConfig.value = config
}
let chat_key = ref(props.attrs.chat_key || '')
let feedbackVisible = ref(false)
let resultVisible = ref(false)
let resultTimeout = ref(null)
let markDownText = ref('')
let previewVisible = ref(false)
let messageListRef = ref(null)
let attach_files = ref(props.attrs.attach_files || [])
let mentionedList = ref([])
const userInfo = useUserInfo()
const userStore = useUserStore()
const closeFeedback = () => {
  feedbackVisible.value = false
}
let chatInputRef = ref(null)
// 拖拽相关数据
const showDragOverlay = ref(false)

// 拖拽事件处理
const handleDragEnter = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = true
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  // 只有当拖拽离开整个容器时才隐藏遮罩
  if (!event.currentTarget.contains(event.relatedTarget)) {
    showDragOverlay.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showDragOverlay.value = false

  const files = event.dataTransfer.files
  if (!files || !files.length) return
  if (chatInputRef.value) {
    for (const file of files) {
      var tempFile = {
        file: file
      }
      // 调用上传文件的方法
      chatInputRef.value.customUpload(tempFile)
    }
  }
}
const showResultMessage = () => {
  resultTimeout.value && clearTimeout(resultTimeout.value)
  resultVisible.value = true
  resultTimeout.value = setTimeout(() => {
    clearTimeout(resultTimeout.value)
    resultVisible.value = false
  }, 2000)
}
const closePreview = () => {
  previewVisible.value = false
}
let replaceActiveTab = inject('replaceActiveTab')
let handleTabAction = inject('handleTabAction')
let isChatting = ref(false)
let back = () => {
  if (props.attrs.backClose) {
    handleTabAction('close-active')
    return
  }
  replaceActiveTab({
    title: '首页',
    url: 'SearchHome',
    isInternal: true
  })
}
const onlineNoteVisible = ref(false)
const submitImport = () => {
  markDownText.value = ''
  onlineNoteVisible.value = false
}
const handleAction = (action, textContent) => {
  if (action === 'takeNote') {
    markDownText.value = textContent
    onlineNoteVisible.value = true
  } else if (action === 'share') {
    previewVisible.value = true
  } else if (action === 'feedback') {
    feedbackVisible.value = true
  }
}
let feedbackList = ref([])
const getFeedbackType = () => {
  feedbackType({}).then((res) => {
    feedbackList.value = res.data || []
  })
}
const handleFeedback = (str) => {
  chat_feedback({ chat_key: activeSession.value.chat_key, feedback: str }).then(() => {
    feedbackVisible.value = false
    showResultMessage()
  })
}
const models = ref([])
const activeSession = ref({
  title: '',
  messages: [],
  chat_key: '',
  model_id: '',
  model_name: '',
  provider_key: '',
  know_key: '',
  stream: true,
  lineNumber: true,
  prompt: '',
  generateQuestions: true,
  isNetwork: false,
  enableSearch: 2,
  vector_folder_path: '',
  know_modelName: '',
  know_provider_key: ''
})
const networkChange = (isNetwork) => {
  activeSession.value.isNetwork = !isNetwork
}
const evtSource = ref(null)
const selectModel = (model) => {
  if (model) {
    activeSession.value.model_name = model.split('/')[0]
    activeSession.value.provider_key = model.split('/')[1] || ''
    activeSession.value.model_id = model.split('/')[2] || ''
    activeSession.value.enableSearch = model.split('/')[3] || 2
    if (activeSession.value.enableSearch == 2) {
      activeSession.value.isNetwork = false
    }
  }
}
const handleSendMessage = async (message) => {
  if (!useCheckLogin().value) {
    return
  }
  if (!message.text || isChatting.value) {
    return
  }
  // 图片/语音
  const medias = []
  if (message.image && message.image.length) {
    medias.push({ type: 'image', data: message.image })
  }
  // 用户的提问
  const chatMessage = reactive({
    sessionId: activeSession.value.chat_key,
    medias,
    textContent: message.text,
    type: 'USER',
    dateline: new Date().toLocaleString().replace(/\//g, '-'),
    char_id: '',
    completion_tokens: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    retrievedDocumentList: [],
    spread: false,
    issueContentText: '',
    attach_file_ids: [...attach_files.value],
    file_info: [],
    use_annex: []
  })
  var tempAttachs = []
  attach_files.value.map((item) => {
    tempAttachs.push({
      fileName: item.title,
      fileUrl: item.full_path,
      fileSize: item.total_space || 0,
      fileId: item.fileId || ''
    })
  })
  var data = {
    messageParams: {
      type: 'USER',
      content: message.text,
      sessionId: activeSession.value.chat_key
    },
    chatParams: {
      modelName: activeSession.value.model_name || '',
      modelPlatform: activeSession.value.provider_key || '',
      prompt: activeSession.value.prompt || '',
      enableSearch: activeSession.value.isNetwork,
      generateQuestions: activeSession.value.generateQuestions,
      temperature: modelConfig.value.temperature,
      contextNumber: modelConfig.value.context_number,
      frequencyPenalty: modelConfig.value.frequency_penalty,
      presencePenalty: modelConfig.value.presence_penalty,
      seed: modelConfig.value.seed,
      topP: modelConfig.value.top_p,
      vectorShardNumber: modelConfig.value.vector_shard_number,
      similarityThreshold: modelConfig.value.similarity_threshold,
      enableThinking: modelConfig.value.enable_thinking,
      maxCompletionTokens:1000,
      sceneId: modelConfig.value.scene_id || ''
    },
    knowledgeBaseParamsList: mentionedList.value.map((item) => {
      return {
        modelName: item.model_name || '',
        modelPlatform: item.provider_key || '',
        knowledgeBaseId: item.know_key || '/',
        folderPath: '/' + item.know_key || '/'
      }
    }),
    otherParams: {
      dingUid: userInfo.value.ding_uid,
      uniacid: userStore.uniacid,
      chat_key: activeSession.value.chat_key
    },
    annexParamList: [...tempAttachs]
  }
  evtSource.value = new SSE(import.meta.env.VITE_API_BASE_AI_URL + '/ai/chat-dialogue/chat', {
    withCredentials: false, // 跨域请求时是否携带cookie凭证 zhaoxin TODO
    // 禁用自动启动，需要调用stream()方法才能发起请求
    start: false,
    payload: JSON.stringify(data),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  isChatting.value = true
  attach_files.value = []
  const responseMessage = reactive({
    medias: [],
    type: 'ASSISTANT',
    textContent: '',
    sessionId: activeSession.value.chat_key,
    dateline: new Date().toLocaleString().replace(/\//g, '-'),
    char_id: '',
    completion_tokens: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    reasoningContentText: '',
    spread: true,
    issueContentText: '',
    retrievedDocumentList: [],
    attach_file_ids: [],
    file_info: [],
    use_annex: []
  })
  evtSource.value.addEventListener('document', async (event) => {
    const response = JSON.parse(event.data)
    responseMessage.retrievedDocumentList = response || []
  })
  evtSource.value.addEventListener('file', async (event) => {
    const response = JSON.parse(event.data)

    responseMessage.file_info = response || []
  })
  evtSource.value.addEventListener('annex', async (event) => {
    const response = JSON.parse(event.data)
    responseMessage.use_annex = response || []
  })
  evtSource.value.addEventListener('message', async (event) => {
    const response = JSON.parse(event.data)
    if (response.contentText || response.reasoningContentText) {
      if (response.reasoningContentText) {
        //匹配过滤掉\n、<think>、</think> 用正则|| 替换  排除[^\n\n]
        function filterText(str) {
          // 1. 替换标签
          str = str.replace(/<\/?think>/g, '')

          // 2. 替换单独的 \n（保留 \n\n）
          str = str.replace(/\n/g, (match, offset, s) => {
            const prev = s[offset - 1]
            const next = s[offset + 1]
            return prev === '\n' || next === '\n' ? '\n' : ''
          })

          return str
        }
        responseMessage.reasoningContentText += filterText(response.reasoningContentText)
      }
      responseMessage.textContent += response.contentText
    }

    // if (response.finished) {
    // isChatting.value = false
    // chatMessage.prompt_tokens = response.promptToken
    // chatMessage.total_tokens = response.promptToken
    // responseMessage.completion_tokens = response.completionTokens
    // responseMessage.total_tokens = response.completionTokens
    // responseMessage.issueContentText = response.issueContentText || ''
    // }
    // 滚动到底部
    await nextTick(() => {
      const container = messageListRef.value
      if (container) {
        const isAtBottom =
          container.scrollTop + container.clientHeight >= container.scrollHeight - 80
        if (isAtBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    })
  })
  // 添加明确的关闭监听
  evtSource.value.addEventListener('stop', (event) => {
    let stopResponse = JSON.parse(event.data)
    isChatting.value = false
    chatMessage.char_id = stopResponse.startId
    responseMessage.char_id = stopResponse.endId
    // evtSource.value.close()
  })
  evtSource.value.addEventListener('error', (error) => {
    var errData
    try {
      errData = error.data
        ? JSON.parse(error.data)
        : {
            message: '系统错误，请稍后再试'
          }
    } catch (err) {
      console.log(err)

      errData = {
        message: '系统错误，请稍后再试'
      }
    }
    // eslint-disable-next-line no-undef
    ElMessage({
      type: 'error',
      message: errData.message
    })
    if (!responseMessage.textContent) {
      responseMessage.textContent = errData.message
    }
    isChatting.value = false
  })
  // 添加明确的关闭监听
  evtSource.value.addEventListener('abort', () => {
    // if (!responseMessage.textContent) {
    //   responseMessage.textContent = '已取消回答'
    // }
    isChatting.value = false
  })
  // 调用stream，发起请求。
  evtSource.value.stream()
  // 将两条消息显示在页面中
  activeSession.value.messages.push(...[chatMessage, responseMessage])
  await nextTick(() => {
    messageListRef.value ? messageListRef.value.scrollTo(0, messageListRef.value.scrollHeight) : ''
  })
}
const uploadedAttachment = (files) => {
  attach_files.value = files
}
const stopChat = (isUserStop = false) => {
  // 主动暂停（用户点击停止按钮）：调用后端暂停接口
  if (isUserStop && isChatting.value) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', import.meta.env.VITE_API_BASE_AI_URL + '/ai/chat-dialogue/stop')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({ sessionId: activeSession.value.chat_key, otherParams: {
      dingUid: userInfo.value.ding_uid,
      uniacid: userStore.uniacid
    }}))
    isChatting.value = false
    return false
  }

  isChatting.value = false
  evtSource.value?.close()
}

// 恢复未完成的回答（每次加载历史后调用，由后端判断是否有后续内容）
const tryResumeChat = () => {
  resumeUnfinishedResponse()
}
// 续传未完成的回答（调用后端流式接口，后端会通过事件告知是否有后续内容）
const resumeUnfinishedResponse = () => {
  if (isChatting.value) return
  const messages = activeSession.value.messages
  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null
  if (!lastMsg || lastMsg.type != 'ASSISTANT') return false
  isChatting.value = true
  // 使用续传接口（后端流式返回后续内容）
  evtSource.value = new SSE(import.meta.env.VITE_API_BASE_AI_URL + '/ai/chat-dialogue/reconnect', {
    withCredentials: false,
    start: false,
    payload: JSON.stringify({
      sessionId: activeSession.value.chat_key,
    }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  evtSource.value.addEventListener('document', async (event) => {
    const response = JSON.parse(event.data)
    lastMsg.retrievedDocumentList = response || []
  })
  evtSource.value.addEventListener('file', async (event) => {
    const response = JSON.parse(event.data)
    lastMsg.file_info = response || []
  })
  evtSource.value.addEventListener('annex', async (event) => {
    const response = JSON.parse(event.data)
    lastMsg.use_annex = response || []
  })
  evtSource.value.addEventListener('message', async (event) => {

    try {
      const response = JSON.parse(event.data)

      if (response.contentText || response.reasoningContentText) {
        if (response.reasoningContentText) {
          //匹配过滤掉\n、<think>、</think> 用正则|| 替换  排除[^\n\n]
          function filterText(str) {
            // 1. 替换标签
            str = str.replace(/<\/?think>/g, '')

            // 2. 替换单独的 \n（保留 \n\n）
            str = str.replace(/\n/g, (match, offset, s) => {
              const prev = s[offset - 1]
              const next = s[offset + 1]
              return prev === '\n' || next === '\n' ? '\n' : ''
            })

            return str
          }
          lastMsg.reasoningContentText += filterText(response.reasoningContentText)
        }
        lastMsg.textContent += response.contentText || ''
      }

      // if (response.finished) {
      //   isChatting.value = false
        // lastMsg.issueContentText = response.issueContentText || lastMsg.issueContentText || ''
      //   lastMsg.char_id = response.endId || ''
      //   evtSource.value?.close()
      // }

      // 滚动到底部
      await nextTick(() => {
        const container = messageListRef.value
        if (container) {
          const isAtBottom =
            container.scrollTop + container.clientHeight >= container.scrollHeight - 80
          if (isAtBottom) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            })
          }
        }
      })
    } catch (err) {
      console.error('解析续传响应失败:', err)
    }
  })
  // 添加明确的关闭监听
  evtSource.value.addEventListener('stop', (event) => {
    let stopResponse = JSON.parse(event.data)
    isChatting.value = false
    lastMsg.char_id = stopResponse.endId || ''
  })
  evtSource.value.addEventListener('reconnect_null', (data) => {
    isChatting.value = false
    evtSource.value?.close()
  })
  evtSource.value.addEventListener('error', (error) => {
    var errData
    try {
      errData = error.data
        ? JSON.parse(error.data)
        : {
            message: '系统错误，请稍后再试'
          }
    } catch (err) {
      console.log(err)

      errData = {
        message: '系统错误，请稍后再试'
      }
    }
    // eslint-disable-next-line no-undef
    ElMessage({
      type: 'error',
      message: errData.message
    })
    if (!lastMsg.textContent) {
      lastMsg.textContent = errData.message
    }
    isChatting.value = false
  })

  // 添加明确的关闭监听
  evtSource.value.addEventListener('abort', () => {
    // if (!lastMsg.textContent) {
    //   lastMsg.textContent = '已取消回答'
    // }
    isChatting.value = false
  })

  evtSource.value.stream()
}
const lastScrollTop = ref(0)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)
const debounceTimer = ref(null)
const isSwitching = ref(false)
const updataChat = () => {
  var data = {
    uniacid: userStore.uniacid,
    chat_key: activeSession.value.chat_key,
    title: activeSession.value.title,
    model_id: activeSession.value.model_id || ''
  }
  update_chat(data)
}
// 根据cheat_key获取会话记录
const getWordList = () => {
  lastScrollTop.value = 0
  function filterText(str) {
    // 1. 替换标签
    str = str.replace(/<\/?think>/g, '')

    // 2. 替换单独的 \n（保留 \n\n）
    str = str.replace(/\n/g, (match, offset, s) => {
      const prev = s[offset - 1]
      const next = s[offset + 1]
      return prev === '\n' || next === '\n' ? '\n' : ''
    })

    return str
  }
  var data = {
    chat_key: activeSession.value.chat_key,
    page: page.value,
    page_size: pageSize.value
  }
  return get_chat_word(data).then(async (res) => {
    if (res.code == 200) {
      var list = []
      page.value = res.data.words_list.current_page
      total.value = res.data.words_list.total
      pageSize.value = res.data.words_list.per_page
      if (res.data.words_list.data.length) {
        res.data.words_list.data.map((item) => {
          if (item.msg_type == 'ASSISTANT') {
            list.push({
              type: 'ASSISTANT',
              textContent: item.content || '已取消回答',
              sessionId: item.chat_key,
              medias: [],
              dateline: item.createtime,
              prompt_tokens: item.prompt_tokens,
              completion_tokens: item.completion_tokens,
              total_tokens: item.total_tokens,
              char_id: item.id,
              reasoningContentText: filterText(item.thinking_content || ''),
              spread: false,
              issueContentText: item.issue_content_text || '',
              retrievedDocumentList: item.use_file_ids || [],
              attach_file_ids: [],
              file_info: item.file_info || [],
              use_annex: item.use_annex || []
            })
          } else {
            list.push({
              type: 'USER',
              textContent: item.content,
              sessionId: item.chat_key,
              medias: [],
              dateline: item.createtime,
              prompt_tokens: item.prompt_tokens,
              completion_tokens: item.completion_tokens,
              total_tokens: item.total_tokens,
              char_id: item.id,
              spread: false,
              issueContentText: item.issue_content_text || '',
              retrievedDocumentList: item.use_file_ids || [],
              attach_file_ids:
                item.attach_file_ids.map((fileItem) => ({
                  title: fileItem.fileName,
                  full_path: fileItem.fileUrl,
                  total_space: fileItem.fileSize || 0,
                  fileId: fileItem.fileId || ''
                })) || [],
              file_info: item.file_info || [],
              use_annex: []
            })
          }
        })
      }
      activeSession.value.messages = list.reverse()
      // 滚动到底部
      await nextTick(() => {
        const container = messageListRef.value
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }
  })
}
// 获取数据方法（示例）
const loadData = async () => {
  function filterText(str) {
    // 1. 替换标签
    str = str.replace(/<\/?think>/g, '')

    // 2. 替换单独的 \n（保留 \n\n）
    str = str.replace(/\n/g, (match, offset, s) => {
      const prev = s[offset - 1]
      const next = s[offset + 1]
      return prev === '\n' || next === '\n' ? '\n' : ''
    })

    return str
  }
  try {
    var data = {
      chat_key: activeSession.value.chat_key,
      page: page.value,
      page_size: pageSize.value
    }
    return get_chat_word(data).then((res) => {
      if (res.code == 200) {
        var list = []
        page.value = res.data.words_list.current_page
        total.value = res.data.words_list.total
        pageSize.value = res.data.words_list.per_page
        if (res.data.words_list.data.length) {
          res.data.words_list.data.map((item) => {
            if (item.msg_type == 'ASSISTANT') {
              list.push({
                type: 'ASSISTANT',
                textContent: item.content || '已取消回答',
                sessionId: item.chat_key,
                medias: [],
                dateline: item.createtime,
                prompt_tokens: item.prompt_tokens,
                completion_tokens: item.completion_tokens,
                total_tokens: item.total_tokens,
                char_id: item.id,
                reasoningContentText: filterText(item.thinking_content || ''),
                issueContentText: item.issue_content_text || '',
                spread: false,
                retrievedDocumentList: item.use_file_ids || [],
                attach_file_ids: [],
                file_info: item.file_info || [],
                use_annex: item.use_annex || []
              })
            } else {
              list.push({
                type: 'USER',
                textContent: item.content,
                sessionId: item.chat_key,
                medias: [],
                dateline: item.createtime,
                prompt_tokens: item.prompt_tokens,
                completion_tokens: item.completion_tokens,
                total_tokens: item.total_tokens,
                char_id: item.id,
                spread: false,
                issueContentText: item.issue_content_text || '',
                retrievedDocumentList: item.use_file_ids || [],
                attach_file_ids:
                  item.attach_file_ids.map((fileItem) => ({
                    title: fileItem.fileName,
                    full_path: fileItem.fileUrl,
                    total_space: fileItem.fileSize || 0,
                    fileId: fileItem.fileId || ''
                  })) || [],
                file_info: item.file_info || [],
                use_annex: []
              })
            }
          })
        }
        activeSession.value.messages.unshift(...list.reverse())
      }
    })
  } finally {
    isLoading.value = false
  }
}
// 滚动事件处理
const handleScroll = (event) => {
  if (isSwitching.value) return
  const container = event.target
  const { scrollTop } = container
  const topThreshold = 5 // 距离顶部5px触发加载
  const currentScroll = scrollTop

  // 增加滚动方向判断
  const isScrollingUp = currentScroll < (lastScrollTop.value || 0)
  lastScrollTop.value = currentScroll

  // 修改触顶条件：接近顶部且正在向上滚动
  if (scrollTop < topThreshold && !isLoading.value && isScrollingUp) {
    debounceLoadMore()
  }
}
const handleMentionSelect = (Mentions) => {
  mentionedList.value = Mentions
}
// 防抖函数
const debounceLoadMore = () => {
  isLoading.value = true
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
  debounceTimer.value = setTimeout(() => {
    clearTimeout(debounceTimer.value)
    loadMore()
  }, 300) // 300毫秒的防抖时间
}
const loadMore = async () => {
  if (page.value * pageSize.value >= total.value) {
    isLoading.value = false
    return false
  }
  // 记录加载前的高度
  const container = messageListRef.value
  const oldScrollHeight = container.scrollHeight
  page.value++
  await loadData()
  // 滚动位置补偿
  nextTick(() => {
    container.scrollTop = container.scrollHeight - oldScrollHeight
  })
}
const createChat = () => {
  var data = {
    chat_type: 6,
    chat_key: chat_key.value || ''
  }
  feedbackVisible.value = false
  getChatInfo(data).then(async (res) => {
    activeSession.value.title = res.data.title || ''
    activeSession.value.chat_key = res.data.chat_key
    activeSession.value.know_key = res.data.know_key
    activeSession.value.model_id = res.data.model_info?.model_id || ''
    activeSession.value.model_name = res.data.model_info?.model_name
    activeSession.value.provider_key = res.data.model_info?.provider_key
    activeSession.value.enableSearch = res.data.model_info?.net_status || 2
    activeSession.value.isNetwork = res.data.is_use_net ? true : false
    if (activeSession.value.enableSearch == 2) {
      activeSession.value.isNetwork = false
    }
    // 模型默认配置
    defaultModelConfig.value = res.data.model_default_set || {
      frequency_penalty: 0,
      presence_penalty: 0,
      seed: 100,
      temperature: 0.7,
      top_p: 0.5,
      vector_shard_number: 10,
      similarity_threshold: 0.5,
      context_number: 5,
      enable_thinking: true,
      scene_id: 0
    }
    // 模型当前配置
    modelConfig.value = {
      frequency_penalty: res.data.frequency_penalty,
      presence_penalty: res.data.presence_penalty,
      seed: res.data.seed,
      temperature: res.data.temperature,
      top_p: res.data.top_p,
      vector_shard_number: res.data.vector_shard_number,
      similarity_threshold: res.data.similarity_threshold,
      context_number: res.data.context_number,
      enable_thinking: res.data.enable_thinking,
      scene_id: res.data.scene_id
    }
    // activeSession.value.vector_folder_path = res.data.vector_folder_path || ''
    // activeSession.value.know_model_name = res.data.know_vector_model?.model_name || ''
    // activeSession.value.know_provider_key = res.data.know_vector_model?.provider_key || ''
    activeSession.value.messages = []
    page.value = 1
    pageSize.value = 10
    total.value = 0
    isLoading.value = false
    debounceTimer.value = null
    isLoading.value = true
    isSwitching.value = true
    // await getWordList()
    isSwitching.value = false
    isLoading.value = false
    if (activeSession.value.title == '默认会话') {
      activeSession.value.title = props.attrs?.message_text || '文档解读'
      updataChat()
    }
    if (!chat_key.value) {
      handleSendMessage({ text: props.attrs?.message_text })
    } else {
      getWordList().then(() => {
        // 每次加载历史后尝试恢复会话
        tryResumeChat()
      })
    }
  })
}
onMounted(() => {
  get_type_models({
    model_type: 'reasoning',
    ding_uid: userInfo.value?.ding_uid,
    t: new Date().getTime()
  }).then((res) => {
    models.value = res.data
  })
  getFeedbackType()
  createChat()
})
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
  user-select: text;
  .drag-overlay {
    position: absolute;
    inset: 6px;
    background: rgba(249, 249, 249, 0.96);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #efefef;
    border-radius: 12px;
    .drag-overlay-content {
      padding: 40px;
      text-align: center;
      .drag-text {
        margin-bottom: 20px;
        font-weight: 600;
        font-size: 24px;
        color: var(--default-font-color);
        line-height: 32px;
      }
      .drag-type {
        font-size: 16px;
        color: #909090;
        line-height: 22px;
      }
    }
  }
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
    box-sizing: border-box;
    flex: 1;
    width: 100%;
    padding: 20px 0;
    margin: 0 auto;
    overflow-y: auto;
    .message-row-box {
      overflow: hidden;
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
    }
  }
  .empty-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty-img {
      margin-bottom: 30px;
      width: 56px;
      height: 52px;
      color: var(--el-color-primary);
    }
    .empty-text {
      font-size: 14px;
      color: #737475;
    }
  }
  .feedback-result {
    padding: 9px 14px;
    width: 100%;
    max-width: 770px;
    margin: 0 auto 10px;
    font-size: 14px;
    text-align: center;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-radius: 8px;
  }
  .feedback-box {
    flex-shrink: 0;
    padding: 14px 11px;
    width: 100%;
    max-width: 770px;
    margin: 0 auto 9px;
    background: #f9f9f9;
    border-radius: 8px;
    .feedback-hd {
      margin-bottom: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .feedback-title {
        font-size: 14px;
        color: #737475;
        line-height: 20px;
      }
      .close-icon {
        cursor: pointer;
        font-size: 20px;
        color: #737475;
        transition: all 0.2s;
        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
    .feedback-item-box {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      max-height: 200px;
      overflow-y: auto;
      .feedback-item {
        flex-shrink: 0;
        padding: 5px 10px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        font-size: 14px;
        color: #737475;
        line-height: 20px;
        &:hover {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
      }
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
