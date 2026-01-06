<template>
  <div class="chat-page-box">
    <div class="chat-back" @click="back">
      <el-icon><ArrowLeftBold /></el-icon>
    </div>
    <div v-if="showChat" ref="messageListRef" class="chat-content" @scroll.passive="handleScroll">
      <MessageRow
        v-for="(messageItem, index) in activeSession.messages"
        :key="messageItem.dateline + index"
        :message="messageItem"
        chat-type="image"
        :is-chatting="isChatting"
        @handle-action="handleAction"
      />
    </div>
    <div v-else class="empty-chat">
      <img class="empty-img" src="@renderer/assets/empty.png" alt="" />
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
      <el-input
        v-model="message.text"
        autosize
        resize="none"
        :disabled="isChatting"
        class="message-input"
        type="textarea"
        placeholder="继续输入调整图片内容"
        @keydown.enter.prevent="sendMessage"
      ></el-input>
      <div v-if="isChatting" class="stop-chat-box" @click="stopChat">
        <img class="stop-icon" src="@renderer/assets/chat-icon/stop-icon.png" alt="" />
        停止回答
      </div>
    </div>
    <div class="tips">内容由AI生成仅供参考</div>
    <take-notes
      v-model="onlineNoteVisible"
      :mark-down-text="markDownText"
      @submit-import="submitImport"
    />
    <PreviewMessage
      v-if="previewVisible"
      ref="previewMessage"
      chat-type="image"
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
  feedbackType,
  text_to_image_call
} from '@renderer/api/chat.js'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
import { useUserStore } from '@renderer/stores/user'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
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
let previewVisible = ref(false)
const closePreview = () => {
  previewVisible.value = false
}
let chat_key = ref(props.attrs.chat_key || '')
let feedbackVisible = ref(false)
let resultVisible = ref(false)
let resultTimeout = ref(null)
let markDownText = ref('')
let messageListRef = ref(null)
const userInfo = useUserInfo()
const userStore = useUserStore()
let replaceActiveTab = inject('replaceActiveTab')
let handleTabAction = inject('handleTabAction')
let isChatting = ref(false)
let showChat = ref(true)
let message = ref({
  text: '',
  image: []
})
const closeFeedback = () => {
  feedbackVisible.value = false
}
const showResultMessage = () => {
  resultTimeout.value && clearTimeout(resultTimeout.value)
  resultVisible.value = true
  resultTimeout.value = setTimeout(() => {
    clearTimeout(resultTimeout.value)
    resultVisible.value = false
  }, 2000)
}
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
const referenceImgs = ref([])
const controller = ref(new AbortController())
const activeSession = ref({
  title: '',
  messages: [],
  chat_key: '',
  model_id: '',
  model_name: '',
  provider_key: '',
  know_key: '',
  temperature: 0.7,
  contextNumber: 5,
  stream: true,
  lineNumber: true,
  prompt: '',
  generateQuestions: true,
  isNetwork: false,
  vector_folder_path: '',
  know_modelName: '',
  know_provider_key: '',
  image_size: props.attrs.image_size || '512x512',
  image_style: props.attrs.image_style || '风格不限'
})
const sendMessage = (event = {}) => {
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
  if (!useCheckLogin().value) {
    return
  }
  if (isChatting.value) {
    // eslint-disable-next-line no-undef
    ElMessage({
      message: '正在回答，请稍后重试',
      type: 'error'
    })
    return
  }
  isChatting.value = true
  // 图片/语音
  const medias = []
  if (message.value.image && message.value.image.length) {
    medias.push({ type: 'image', data: message.value.image })
  }
  // 用户的提问
  const chatMessage = reactive({
    sessionId: activeSession.value.chat_key,
    medias,
    textContent: message.value.text,
    type: 'USER',
    dateline: new Date().toLocaleString().replace(/\//g, '-'),
    char_id: '',
    completion_tokens: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    retrievedDocumentList: [],
    spread: false,
    issueContentText: '',
    attach_file_ids: [],
    file_info: []
  })
  const responseMessage = reactive({
    medias: [
      {
        type: 'image',
        data: referenceImgs.value.length ? [{}, {}, {}, {}] : [{}]
      }
    ],
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
    file_info: []
  })
  // diagramModelParams: {
  //     modelName: 'Kwai-Kolors/Kolors',
  //     modelPlatform: 'siliconflow'
  //   },
  //   diagramParams: {
  //     batch_size: 4,
  //     prompt: message.value.text,
  //     num_inference_steps: 20,
  //     seed: 4999999999,
  //     guidance_scale: 7.5,
  //     negative_prompt: activeSession.value.image_style,
  //     image_size: activeSession.value.image_size,
  //     model: 'Kwai-Kolors/Kolors'
  //   },
  //   callbackUrl:
  //     import.meta.env.VITE_API_BASE_URL +
  //     '/api/intelligence/text_to_image_call?uniacid=' +
  //     userStore.uniacid,
  //   params: {
  //     ding_uid: userInfo.value.ding_uid,
  //     chat_key: activeSession.value.chat_key
  //   }
  var data = {
    diagramModelParams: {
      // modelName: 'qwen-image-edit-plus',
      // modelPlatform: 'aliyun'
    },
    diagramParams: {
      n: 4,
      prompt_extend: true,
      prompt: message.value.text + '，风格：' + activeSession.value.image_style,
      // num_inference_steps: 20,
      seed: 247483647,
      // guidance_scale: 7.5,
      negative_prompt: '',
      image_size: activeSession.value.image_size,
      // model: 'qwen-image-edit-plus',
      images: referenceImgs.value[0] ? [referenceImgs.value[0].full_path] : []
    },
    params: {
      ding_uid: userInfo.value.ding_uid,
      chat_key: activeSession.value.chat_key
      // attach_file_ids: referenceImgs.value[0] ? [referenceImgs.value[0]] : []
    }
  }
  activeSession.value.messages.push(chatMessage)
  activeSession.value.messages.push(responseMessage)
  nextTick(() => {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  })
  message.value = {
    text: '',
    image: []
  }
  let apiUrl = import.meta.env.VITE_API_BASE_AI_URL + '/ai/image/test-to-image'
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    signal: controller.value.signal
  })
    .then((res) => {
      return res.json()
    })
    .then(async (res) => {
      if (res.code == '0000' && res.data) {
        isChatting.value = false
        var response = res.data
        let images = response.map((item) => {
          return {
            full_path: item.image
          }
        })
        responseMessage.medias = [{ type: 'image', data: images }]
        try {
          var saveRes = await text_to_image_call({
            ding_uid: userInfo.value.ding_uid,
            chat_key: activeSession.value.chat_key,
            USER: chatMessage.textContent,
            USERImage: referenceImgs.value[0] ? [referenceImgs.value[0].full_path] : [],
            AI: response
          })
          referenceImgs.value = []
          chatMessage.char_id = saveRes.data.user_msg_id
          responseMessage.char_id = saveRes.data.ai_msg_id
        } catch (error) {
          console.log(error)
          referenceImgs.value = []
        }
      } else {
        isChatting.value = false
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'error',
          message: '请求出错，请稍后重试'
        })
      }
    })
    .catch((err) => {
      isChatting.value = false
      if (err.name == 'AbortError') {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'info',
          message: '请求已取消'
        })
        return
      }
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'error',
        message: '请求出错，请稍后重试'
      })
    })
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
          var images = []
          item.attach_file_ids.map((image_item) => {
            images.push({
              full_path: image_item.image || image_item
            })
          })
          if (item.msg_type == 'ASSISTANT') {
            list.push({
              type: 'ASSISTANT',
              textContent: '',
              sessionId: item.chat_key,
              medias: [{ type: 'image', data: images }],
              dateline: item.createtime,
              prompt_tokens: item.prompt_tokens,
              completion_tokens: item.completion_tokens,
              total_tokens: item.total_tokens,
              char_id: item.id,
              reasoningContentText: filterText(item.thinking_content || ''),
              spread: false,
              issueContentText: item.issue_content_text || '',
              retrievedDocumentList: [],
              attach_file_ids: [],
              file_info: []
            })
          } else {
            list.push({
              type: 'USER',
              textContent: item.content,
              sessionId: item.chat_key,
              medias: [{ type: 'image', data: images }],
              dateline: item.createtime,
              prompt_tokens: item.prompt_tokens,
              completion_tokens: item.completion_tokens,
              total_tokens: item.total_tokens,
              char_id: item.id,
              spread: false,
              issueContentText: item.issue_content_text || '',
              retrievedDocumentList: [],
              attach_file_ids: [],
              file_info: []
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
            var images = []
            item.attach_file_ids.map((image_item) => {
              images.push({
                full_path: image_item.image
              })
            })
            if (item.msg_type == 'ASSISTANT') {
              list.push({
                type: 'ASSISTANT',
                textContent: '',
                sessionId: item.chat_key,
                medias: [{ type: 'image', data: images }],
                dateline: item.createtime,
                prompt_tokens: item.prompt_tokens,
                completion_tokens: item.completion_tokens,
                total_tokens: item.total_tokens,
                char_id: item.id,
                reasoningContentText: filterText(item.thinking_content || ''),
                issueContentText: item.issue_content_text || '',
                spread: false,
                retrievedDocumentList: [],
                attach_file_ids: [],
                file_info: []
              })
            } else {
              list.push({
                type: 'USER',
                textContent: item.content,
                sessionId: item.chat_key,
                medias: [{ type: 'image', data: images }],
                dateline: item.createtime,
                prompt_tokens: item.prompt_tokens,
                completion_tokens: item.completion_tokens,
                total_tokens: item.total_tokens,
                char_id: item.id,
                spread: false,
                issueContentText: item.issue_content_text || '',
                retrievedDocumentList: [],
                attach_file_ids: [],
                file_info: []
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
    chat_type: 4,
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
    activeSession.value.isNetwork = res.data.is_network ? true : false
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
      activeSession.value.title = props.attrs?.message_text || '图像生成'
      updataChat()
    }
    message.value.image = props.attrs.attach_files || []
    referenceImgs.value = props.attrs.attach_files || []
    if (!chat_key.value) {
      message.value.text = props.attrs?.message_text
      sendMessage()
    } else {
      getWordList()
    }
  })
}
onMounted(() => {
  getFeedbackType()
  createChat()
})
const stopChat = () => {
  isChatting.value = false
  controller.value?.close()
}
</script>
<style scoped lang="scss">
.tips {
  font-size: 12px;
  color: #909090;
  text-align: center;
}
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
    position: relative;
    width: 100%;
    .stop-chat-box {
      position: absolute;
      left: 50%;
      top: -58px;
      transform: translateX(-50%);
      z-index: 1;
      width: 116px;
      height: 38px;
      background: #fff;
      box-shadow: 0px 2px 18px 2px rgba(0, 0, 0, 0.07);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
      cursor: pointer;
      .stop-icon {
        flex-shrink: 0;
        width: 14px;
        height: 14px;
      }
      &:active {
        opacity: 0.6;
      }
    }
    :deep(.message-input) {
      display: block;
      width: 100%;
      max-width: 770px;
      margin: 0 auto 10px;
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
