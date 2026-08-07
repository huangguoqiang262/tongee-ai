<template>
  <div class="chat-page-box disabled-tools-chat">
    <!-- <img
      v-if="activeSession.messages.length"
      class="chat-clear"
      src="@renderer/assets/chat-icon/clear-icon.png"
      alt=""
      @click="clearChat"
    />
    <img
      v-else
      class="chat-clear"
      src="@renderer/assets/chat-icon/disabled-clear-icon.png"
      alt=""
    /> -->
    <div class="fiexd-box">
      <div class="icons">
        <div class="icon-item" @click="addChat">
          <img class="add-chat-icon" src="@renderer/assets/chat-icon/add-chat-icon.png" alt="" />
        </div>
        <div
          class="icon-item"
          :class="{ openHistory: historySidebarVisible }"
          @click="openHistorySidebar"
        >
          <img class="history-icon" src="@renderer/assets/chat-icon/history-icon.png" alt="" />
        </div>
      </div>
      <div class="history-sidebar-box" :class="{ visible: historySidebarVisible }">
        <div class="history-title">问答历史</div>
        <div :infinite-scroll-distance="1" v-infinite-scroll="loadHistoryData" class="history-list">
          <template v-if="historyList.length">
            <div
              v-for="(item, i) in historyList"
              :key="i"
              class="history-item"
              @click="switchChat(item)"
            >
              <answersIcon class="left-icon" />
              <div class="history-center-box">
                <div class="title">{{ item.latest_question?.content || item.title }}</div>
                <div class="desc">
                  {{ htmlToText(item.latest_answer?.content || '') }}
                </div>
                <!-- <div v-if="!Array.isArray(item.from_origin)" class="souce-box">
                  <img class="icon" src="@renderer/assets/souce-icon.png" alt="" />
                  来源：《{{ item.from_origin.fileName }}》
                </div> -->
              </div>
              <div class="time-box">
                <div class="time">{{ formatTimeFun(item.updatetime) }}</div>
                <div class="size">
                  <img
                    class="icon"
                    src="@renderer/assets/edit-icon.png"
                    alt=""
                    @click.stop="beforeRenameChange(item)"
                  />
                  <img
                    class="icon"
                    src="@renderer/assets/del-icon1.png"
                    alt=""
                    @click.stop="beforeDelChange(item)"
                  />
                </div>
              </div>
            </div>
          </template>
          <div v-else class="empty">
            <el-empty :image-size="100" description="暂无数据" />
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="activeSession.messages.length"
      ref="messageListRef"
      class="chat-content"
      @scroll.passive="handleScroll"
    >
      <div class="message-rows-box">
        <MessageRow
          v-for="(message, index) in activeSession.messages"
          :key="index"
          :message="message"
          direction="right"
          :is-chatting="isChatting"
          @handle-action="handleAction"
          @again-text="handleAgainText"
        />
      </div>
    </div>
    <div v-else class="empty-chat">
      <EmptySvgIcon class="empty-img" />
      <div class="shadow-chunk"></div>
      <div class="empty-text">Hi，任何关于这个知识库的问题，尽管提问</div>
      <div v-if="questions.length" class="question-box">
        <div
          v-for="(item, index) in questions"
          :key="index"
          class="question-item"
          @click="handleSendMessage({ text: item })"
        >
          <div class="question-text">{{ item }}</div>
          <img class="icon" src="@renderer/assets/chat-icon/right-icon.png" alt="" />
        </div>
      </div>
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
      <repository-chat-input
        v-if="activeSession"
        ref="chatInputRef"
        key="input"
        class="message-input"
        :models="models"
        :model_id="
          activeSession.model_key +
          '%' +
          activeSession.provider_key +
          '%' +
          activeSession.model_id +
          '%' +
          activeSession.enableSearch
        "
        :enable-search="activeSession.enableSearch"
        :is-network="activeSession.isNetwork"
        :is-chatting="isChatting"
        :attach_file="attach_file"
        :default-model-config="defaultModelConfig"
        :model-config="modelConfig"
        @select-model="selectModel"
        @network-change="networkChange"
        @send="handleSendMessage"
        @uploaded-attachment="uploadedAttachment"
        @clear-attach="clearAttach"
        @stop-chat="stopChat(true)"
        @configuration-change="handleConfigurationChange"
        @mention-change="handleMentionSelect"
      >
      </repository-chat-input>
    </div>
    <take-notes
      v-model="onlineNoteVisible"
      :mark-down-text="markDownText"
      import-type="note"
      @submit-import="submitImport"
    />
    <PreviewMessage
      v-if="previewVisible"
      :repository-name="repositoryName"
      direction="right"
      :messages="activeSession.messages"
      @close-preview="closePreview"
    />
    <!-- 重命名 -->
    <el-dialog
      v-model="renameHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/rename-icon.png" alt="" />
        <div class="">重命名记录</div>
      </template>
      <el-form
        ref="renameFormRef"
        :model="renameForm"
        :rules="renameRules"
        class="rename-form"
        @submit.prevent
      >
        <el-form-item prop="renameInput" style="margin-bottom: 0">
          <el-input
            v-model="renameForm.renameInput"
            class="rename-input"
            size="large"
            placeholder="请输入新名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="renameHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitRenameForm(renameFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 删除单条 -->
    <el-dialog
      v-model="delHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="">确认删除</div>
      </template>
      <span>您确定要删除这条历史记录吗？此操作不可撤销！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="delHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="delHistoryChange"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, watchEffect, watch } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
import MessageRow from '@renderer/components/chat-components/message-row.vue'
import answersIcon from '@renderer/assets/answers-icon.svg'
import EmptySvgIcon from '@renderer/assets/empty.svg'
import { SSE } from 'sse.js'
import { get_type_models } from '@renderer/api/repository.js'
import { convertToPlainText } from '@renderer/utils/convertToPlainText'
import { formatTime } from '@renderer/utils/index.js'
import {
  getChatInfo,
  update_chat,
  get_chat_word,
  chat_feedback,
  feedbackType,
  know_chat_lists,
  modifyChatHistory,
  del_chat,
} from '@renderer/api/chat.js'
let previewVisible = ref(false)
let props = defineProps({
  knowId: {
    type: [Number, String],
    default: ''
  },
  selecteFileIdList: {
    type: Array,
    default: () => []
  },
  repositoryName: {
    type: String,
    default: '糖源医疗'
  },
  itemId: {
    type: [Number, String],
    default: ''
  },
  questions: {
    type: Array,
    default: () => []
  }
})
const formatTimeFun = (time) => {
  return formatTime(time)
}
const htmlToText = (html) => {
  return convertToPlainText(html, { maxLength: 100 })
}
// 新增对话或者切换会话
const addChat = (isNewChat = true, chat_key = '') => {
  var data = {
    know_id: props.knowId,
    item_id: props.itemId,
    chat_type: 2,
    create_new_chat: isNewChat ? 1 : 0,
    chat_key: chat_key
  }
  stopChat(false)
  feedbackVisible.value = false
  if (!data.know_id) return
  resetHitory()
  getChatInfo(data).then(async (res) => {
    activeSession.value.title = res.data.title || ''
    activeSession.value.chat_key = res.data.chat_key
    activeSession.value.know_key = res.data.know_key
    activeSession.value.model_id = res.data.model_info?.model_id || ''
    activeSession.value.model_key = res.data.model_info?.model_key
    activeSession.value.provider_key = res.data.model_info?.provider_key
    activeSession.value.isNetwork = res.data.is_network ? true : false
    activeSession.value.vector_folder_path = res.data.vector_folder_path || ''
    activeSession.value.know_model_key = res.data.know_vector_model?.model_key || ''
    activeSession.value.know_provider_key = res.data.know_vector_model?.provider_key || ''
    activeSession.value.enableSearch = res.data.model_info?.net_status || 2
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
    activeSession.value.isNetwork = res.data.is_use_net ? true : false
    if (activeSession.value.enableSearch == 2) {
      activeSession.value.isNetwork = false
    }
    activeSession.value.messages = []
    page.value = 1
    pageSize.value = 10
    total.value = 0
    isLoading.value = false
    debounceTimer.value = null
    isLoading.value = true
    isSwitching.value = true
    await getWordList()
    isSwitching.value = false
    isLoading.value = false
    // 每次加载历史后尝试恢复会话
    tryResumeChat()
  })
}
// 历史记录改名
let renameHistory = ref(false)
let renameItem = ref({})
let beforeRenameChange = (item) => {
  renameForm.value.renameInput = item.latest_question?.content || ''
  renameForm.value.chat_words_id = item.latest_question?.id || ''
  renameHistory.value = true
  renameItem.value = item
}
let renameForm = ref({
  renameInput: '',
  chat_words_id: ''
})
let renameRules = ref({
  renameInput: [
    { required: true, message: '请输入新名称', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value.trim().length) {
          callback(new Error('名称不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})
let renameFormRef = ref(null)
const submitRenameForm = (FormRef) => {
  FormRef.validate((valid) => {
    if (valid) {
      modifyChatHistory({
        chat_words_id: renameForm.value.chat_words_id,
        content: renameForm.value.renameInput
      }).then((res) => {
        if (res.code == 200) {
          renameItem.value.latest_question.content = renameForm.value.renameInput
          renameHistory.value = false
          // tabHandle('1')
          // eslint-disable-next-line no-undef
          ElMessage.primary('修改成功')
        }
      })
    } else {
      console.log('表单验证失败')
    }
  })
}
// 删除历史单条
let delHistory = ref(false)
let delItem = ref({})
let beforeDelChange = (item) => {
  delHistory.value = true
  delItem.value = {
    chat_key: item.chat_key || '',
    log_id: item.id
  }
}
// 删除单条对话或历史浏览记录
let delHistoryChange = () => {
  del_chat({ chat_key: delItem.value.chat_key }).then((res) => {
    if (res.code == 200) {
      delHistory.value = false
      if (activeSession.value.chat_key == delItem.value.chat_key) {
        addChat()
      }
      resetHitory(true)
      // eslint-disable-next-line no-undef
      ElMessage.primary('删除成功')
    }
  })
}
// 切换会话
const switchChat = (item) => {
  addChat(false, item.chat_key)
}
const chatInputRef = ref(null)
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
let feedbackVisible = ref(false)
let resultVisible = ref(false)
let resultTimeout = ref(null)
let markDownText = ref('')
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
const userInfo = useUserInfo()
const userStore = useUserStore()
const closePreview = () => {
  previewVisible.value = false
}
let messageListRef = ref(null)
let isChatting = ref(false)
const evtSource = ref(null)
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
const models = ref([])
const selecteFileList = ref([])
const activeSession = ref({
  title: '',
  messages: [],
  chat_key: '',
  model_id: '',
  model_key: '',
  provider_key: '',
  know_key: '',
  stream: true,
  lineNumber: true,
  prompt: '',
  generateQuestions: true,
  isNetwork: false,
  enableSearch: 2,
  vector_folder_path: '',
  know_model_key: '',
  know_provider_key: ''
})
const historyList = ref([])
const historyPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const historySidebarVisible = ref(false)
const openHistorySidebar = () => {
  renameHistory.value = false
  renameItem.value = {}
  delHistory.value = false
  delItem.value = {}
  historyPagination.value = {
    page: 1,
    pageSize: 20,
    total: 0
  }
  historyList.value = []
  historySidebarVisible.value = !historySidebarVisible.value
  getChatLists()
}
const loadHistoryData = () => {
  if (
    historyPagination.value.page * historyPagination.value.pageSize >=
    historyPagination.value.total
  ) {
    return
  }
  historyPagination.value.page++
  getChatLists()
}
// 获取对话历史列表
const getChatLists = () => {
  var data = {
    page: historyPagination.value.page,
    page_size: historyPagination.value.pageSize,
    know_id: props.knowId,
    item_id: props.itemId
  }
  know_chat_lists(data).then((res) => {
    if (res.code == 200) {
      historyList.value = historyList.value.concat(res.data.data || [])
      historyPagination.value.total = res.data.total || 0
      historyPagination.value.page = res.data.current_page
      historyPagination.value.pageSize = res.data.per_page
    }
  })
}
// const clearChat = () => {
//   // eslint-disable-next-line no-undef
//   ElMessageBox.confirm('确认清空当前会话吗？', '提示', {
//     confirmButtonText: '确认',
//     cancelButtonText: '取消',
//     type: 'warning'
//   })
//     .then(() => {
//       delChatOne({ chat_key: activeSession.value.chat_key }).then(async (res) => {
//         if (res.code == 200) {
//           // eslint-disable-next-line no-undef
//           ElMessage({
//             type: 'primary',
//             message: '已清空'
//           })
//           page.value = 1
//           pageSize.value = 10
//           total.value = 0
//           isLoading.value = false
//           debounceTimer.value = null
//           isLoading.value = true
//           isSwitching.value = true
//           await getWordList()
//           isSwitching.value = false
//           isLoading.value = false
//         }
//       })
//     })
//     .catch(() => {})
// }
const handleFeedback = (str) => {
  chat_feedback({ chat_key: activeSession.value.chat_key, feedback: str }).then(() => {
    feedbackVisible.value = false
    showResultMessage()
  })
}
const updataChat = () => {
  var data = {
    uniacid: userStore.uniacid,
    chat_key: activeSession.value.chat_key,
    title: activeSession.value.title,
    model_id: activeSession.value.model_id || ''
  }
  update_chat(data)
}
const lastScrollTop = ref(0)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isLoading = ref(false)
const debounceTimer = ref(null)
const isSwitching = ref(false)
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
              textContent: item.content || '',
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
              use_annex: item.use_annex || [],
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
                textContent: item.content || '',
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
                use_annex: item.use_annex || [],
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
onUnmounted(() => {
  stopChat()
})
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
    //   lastMsg.textContent = ''
    // }
    isChatting.value = false
  })

  evtSource.value.stream()
}
const resetHitory = (isClose = false) => {
  renameHistory.value = false
  renameItem.value = {}
  delHistory.value = false
  historySidebarVisible.value = isClose
  delItem.value = {}
  historyPagination.value = {
    page: 1,
    pageSize: 20,
    total: 0
  }
  historyList.value = []
  stopChat(false)
  getChatLists()
}
const throttle = ref(null)
watchEffect(() => {
  selecteFileList.value = props.selecteFileIdList
})
watchEffect(() => {
  var data = {
    know_id: props.knowId,
    item_id: props.itemId,
    chat_type: 2
  }
  feedbackVisible.value = false
  if (!data.know_id) return
  // 添加节流，避免频繁请求
  if (throttle.value) {
    clearTimeout(throttle.value)
  }
  throttle.value = setTimeout(() => {
    resetHitory()
    getChatInfo(data).then(async (res) => {
      activeSession.value.title = res.data.title || ''
      activeSession.value.chat_key = res.data.chat_key
      activeSession.value.know_key = res.data.know_key
      activeSession.value.model_id = res.data.model_info?.model_id || ''
      activeSession.value.model_key = res.data.model_info?.model_key
      activeSession.value.provider_key = res.data.model_info?.provider_key
      activeSession.value.isNetwork = res.data.is_network ? true : false
      // activeSession.value.isNetwork = false
      activeSession.value.vector_folder_path = res.data.vector_folder_path || ''
      activeSession.value.know_model_key = res.data.know_vector_model?.model_key || ''
      activeSession.value.know_provider_key = res.data.know_vector_model?.provider_key || ''
      activeSession.value.enableSearch = res.data.model_info?.net_status || 2
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
      // activeSession.value.isNetwork = res.data.is_use_net ? true : false
      activeSession.value.isNetwork =  false
      if (activeSession.value.enableSearch == 2) {
        activeSession.value.isNetwork = false
      }
      activeSession.value.messages = []
      page.value = 1
      pageSize.value = 10
      total.value = 0
      isLoading.value = false
      debounceTimer.value = null
      isLoading.value = true
      isSwitching.value = true
      await getWordList()
      isSwitching.value = false
      isLoading.value = false
      // 每次加载历史后尝试恢复会话
      tryResumeChat()
    })
  }, 300)
})
// 监听 knowId/itemId 变化，暂停当前会话
watch(
  [() => props.knowId, () => props.itemId],
  ([newKnowId, newItemId], [oldKnowId, oldItemId]) => {
    if (newKnowId !== oldKnowId || newItemId !== oldItemId) {
      // 被动暂停（只关闭 SSE，不调用后端暂停接口）
      isChatting.value = false
      evtSource.value?.close()
    }
  }
)
onMounted(() => {
  get_type_models({
    model_type: 'reasoning',
    ding_uid: userInfo.value?.ding_uid,
    t: new Date().getTime()
  }).then((res) => {
    models.value = res.data
  })
  getFeedbackType()
})
const attach_file = ref([])
let mentionedList = ref([])
const selectModel = (model) => {
  if (model) {
    activeSession.value.model_key = model.split('%')[0]
    activeSession.value.provider_key = model.split('%')[1] || ''
    activeSession.value.model_id = model.split('%')[2] || ''
    activeSession.value.enableSearch = model.split('%')[3] || 2
    if (activeSession.value.enableSearch == 2) {
      activeSession.value.isNetwork = false
    }
  }
}
const networkChange = (isNetwork) => {
  activeSession.value.isNetwork = !isNetwork
}
const handleMentionSelect = (Mentions) => {
  mentionedList.value = Mentions
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
    attach_file_ids: [...attach_file.value],
    file_info: [],
    use_annex: []
  })
  var data = {
    messageParams: {
      type: 'USER',
      content: message.text,
      sessionId: activeSession.value.chat_key
    },
    chatParams: {
      modelName: activeSession.value.model_key || '',
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
    knowledgeBaseParamsList: [].concat(
      mentionedList.value.map((item) => ({
        modelName: item.model_key || '',
        modelPlatform: item.provider_key || '',
        knowledgeBaseId: item.know_key || '/',
        folderPath: '/' + item.know_key || '/'
      })),
      [
        {
          modelName: activeSession.value.know_model_key || '',
          modelPlatform: activeSession.value.know_provider_key || '',
          knowledgeBaseId: activeSession.value.know_key || '',
          folderPath: activeSession.value.vector_folder_path || '',
          selecteFileIdList: selecteFileList.value
        }
      ]
    ),
    otherParams: {
      dingUid: userInfo.value.ding_uid,
      uniacid: userStore.uniacid,
      chat_key: activeSession.value.chat_key,
      attach_file_ids: []
    },
    annexParamList: []
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
    use_annex: [],
    last_message_id: '',
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
  // 添加明确的关闭监听
  evtSource.value.addEventListener('stop', (event) => {
    let stopResponse = JSON.parse(event.data)
    isChatting.value = false
    chatMessage.char_id = stopResponse.startId
    responseMessage.char_id = stopResponse.endId
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
    //   isChatting.value = false
    //   // evtSource.value.close()
    //   // chatMessage.prompt_tokens = response.promptToken
    //   // chatMessage.total_tokens = response.promptToken
    //   // responseMessage.completion_tokens = response.completionTokens
    //   // responseMessage.total_tokens = response.completionTokens
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
    //   responseMessage.textContent = ''
    // }
    isChatting.value = false
  })
  // 调用stream，发起请求。
  evtSource.value.stream()
  // 将两条消息显示在页面中
  activeSession.value.messages.push(...[chatMessage, responseMessage])
  if (activeSession.value.title == '默认会话') {
    activeSession.value.title = chatMessage.textContent
    updataChat()
  }
  await nextTick(() => {
    messageListRef.value ? messageListRef.value.scrollTo(0, messageListRef.value.scrollHeight) : ''
  })
}
const uploadedAttachment = (file) => {
  console.log(file)
}
const clearAttach = () => {
  attach_file.value = []
}
</script>
<style scoped lang="scss">
:deep(.clear-recycled-dialog) {
  .el-dialog {
    .el-dialog__header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;

      .dialog-header-del-icon {
        width: 16px;
        height: 16px;
      }
    }

    .el-dialog__body {
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      .rename-input {
        .el-input__wrapper {
          background: #f9f9f9;
          box-shadow: none;
          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
          .el-input__inner {
            font-size: 14px;
            color: var(--default-font-color);
          }
        }
      }
    }

    .dialog-footer {
      .cancel-btn,
      .confirm-btn {
        height: 36px;
        width: 80px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
      }

      .cancel-btn {
        background: #efefef;
        color: var(--default-font-color);
      }
    }
  }
}
.chat-page-box {
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 40px 0px 20px;
  height: 100%;
  width: 100%;
  // min-width: 375px;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  user-select: text;
  .chat-clear {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  $sidebar-height: calc(100vh - 62px);
  .fiexd-box {
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 1;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    .icons {
      flex-shrink: 0;
      margin: 0 10px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0 5px;
      .icon-item {
        border-radius: 6px;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.openHistory {
          background: #efefef;
        }
        &:hover {
          background: #efefef;
        }
        .add-chat-icon {
          width: 22px;
          height: 22px;
          cursor: pointer;
        }
        .history-icon {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
    }
    .history-sidebar-box {
      border-left: 1px solid #efefef;
      height: $sidebar-height;
      width: 0;
      background: #f7f8f8;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      transition: all 0.2s ease-in-out;
      opacity: 0;
      &.visible {
        padding: 10px;
        width: 100%;
        opacity: 1;
      }
      .history-title {
        margin-bottom: 10px;
        width: 100%;
        font-size: 14px;
        color: var(--default-font-color);
      }
      .history-list {
        flex: 1;
        width: 100%;
        overflow-y: auto;
        .empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: calc($sidebar-height - 80px);
          width: 100%;
          font-size: 13px;
          text-align: center;
          line-height: 20px;
          color: #909090;
        }
        .history-item {
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          gap: 20px;

          &:last-child {
            border-bottom: none;
          }
          &:hover {
            .time-box {
              .size {
                visibility: visible;
              }
            }
          }
          .left-icon {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            color: var(--el-color-primary);
          }

          .history-center-box {
            flex: 1;
            overflow: hidden;
            .title {
              margin-bottom: 4px;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 22px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .desc {
              margin-top: 4px;
              font-size: 12px;
              color: #909090;
              line-height: 16px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              &.desc1 {
                margin-top: 10px;
              }
            }
            .souce-box {
              margin-top: 8px;
              font-size: 12px;
              color: #909090;
              line-height: 16px;
              .icon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
                margin-right: 8px;
              }
            }
            .btns {
              display: flex;
              gap: 10px;

              .btn {
                box-sizing: border-box;
                min-width: 76px;
                padding: 5px 8px;
                font-size: 12px;
                text-align: center;
                color: var(--el-color-primary);
                line-height: 16px;
                border-radius: 6px;
                border: 1px solid var(--el-color-primary-light-8);
                cursor: pointer;

                &:active {
                  opacity: 0.6;
                }

                &.btn1 {
                  color: var(--default-font-color);
                  border-color: #efefef;
                }

                &.btn2 {
                  color: #909090;
                  border-color: #efefef;
                }
              }
            }
          }

          .time-box {
            flex-shrink: 0;
            font-size: 12px;
            color: #909090;
            line-height: 22px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: flex-end;
            .time {
              margin-bottom: 4px;
            }
            .size {
              margin-bottom: 1px;
              display: flex;
              align-items: center;
              gap: 16px;
              visibility: hidden;
              .icon {
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }
  .chat-content {
    flex: 1;
    padding: 20px;
    width: 100%;
    margin: 0 auto;
    overflow-y: auto;
    .message-rows-box {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
      overflow: hidden;
    }
  }
  .empty-chat {
    box-sizing: border-box;
    padding: 0px 40px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .empty-img {
      flex-shrink: 0;
      display: block;
      width: 56px;
      height: 52px;
      // color: var(--el-color-primary);
    }
    .shadow-chunk {
      flex-shrink: 0;
      margin-bottom: 13px;
      display: block;
      width: 32px;
      height: 6px;
      background: #cccccc;
      opacity: 0.62;
      filter: blur(2px);
    }
    .empty-text {
      flex-shrink: 0;
      font-size: 14px;
      color: #737475;
    }
    .question-box {
      overflow-y: auto;
      margin-top: 30px;
      width: 80%;
      max-width: 480px;
      max-height: 240px;
      .question-item {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0 10px;
        padding: 9px 10px 9px 16px;
        background: #f6f6f6;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        .question-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
        }
        .icon {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }
      }
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
    box-sizing: border-box;
    padding: 0px 20px;
    width: 100%;
    .message-input {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
    }
  }
}
</style>
