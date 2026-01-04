<template>
  <div class="Recycled-box">
    <!-- 账号设置 -->
    <div v-if="activeTab == 'account'" class="square">
      <div class="page-title-box">
        <div class="page-title">账号设置</div>
      </div>
      <div class="content-box">
        <div class="account-box" @click="sonClick('person')">
          <div class="account-left">
            <img class="buddha" :src="userInfo.avatar || defaultAvatar" alt="" />
            <div class="name">{{ userInfo.name }}</div>
          </div>
          <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
        </div>
        <div class="general-title">通用设置</div>
        <div class="handle-box">
          <div class="handle-item">
            <div class="label">主题色配置</div>
            <!-- <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in appearanceList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select> -->
            <theme-picker></theme-picker>
          </div>
          <!-- <div class="handle-item" @click="sonClick('paddle')">
            <div class="label">ai划词工具栏</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div> -->
          <div class="handle-item">
            <div class="label">首选大模型</div>
            <el-select
              v-model="defaultModel"
              popper-class="setting-model-select"
              placeholder="请选择"
              style="width: 160px"
              @change="modelChange"
            >
              <el-option
                v-for="item in models"
                :key="item.id"
                :label="item.model_name"
                :value="item.id"
              >
                <div class="value-text">{{ item.model_name }}</div>
                <div class="value-label">{{ item.desc }}</div>
              </el-option>
            </el-select>
          </div>
          <div class="handle-item" @click="manualClick('manual')">
            <div class="label">知识库使用手册</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item">
            <div class="label">
              版本号
              <span class="versions">{{ appVersion }}</span>
              <span v-if="isUpdateAvailable" class="new-version">New</span>
            </div>
            <el-button
              class="btn-check-update"
              size="small"
              type="info"
              :loading="getLoading"
              @click="handleCheckUpdate"
              >检查并更新</el-button
            >
          </div>
          <div class="handle-item" @click="toUploadLog">
            <div class="label">功能介绍</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item" @click="sonClick('assist')">
            <div class="label">帮助与反馈</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 个人设置 -->
    <div v-if="activeTab == 'person'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">个人设置</div>
      </div>
      <div class="content-box">
        <div class="handle-box">
          <div class="handle-item">
            <div class="label">头像</div>
            <img class="buddha" :src="userInfo.avatar || defaultAvatar" alt="" />
          </div>
          <!-- <div class="handle-item">
            <div class="label">昵称</div>
            <div class="item-right">
              <div>昵称</div>
              <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
            </div>
          </div> -->
          <div class="handle-item">
            <div class="label">姓名</div>
            <div class="item-right">
              <div>{{ userInfo.name }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">部门</div>
            <div class="item-right">
              <template v-if="userInfo?.organs">
                <el-popover title="" popper-class="more-position-popover" placement="bottom-end">
                  <template #reference>
                    <div>
                      {{ userInfo?.organs?.[0]?.hierarchy_names || '--' }}
                    </div>
                  </template>
                  <div class="more-position-box">
                    <span v-for="item in userInfo?.organs" :key="item" class="more-position">{{
                      item.hierarchy_names
                    }}</span>
                  </div>
                </el-popover>
              </template>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">职位</div>
            <div class="item-right">
              <div>{{ userInfo?.position || '--' }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
          <div class="handle-item">
            <div class="label">手机号</div>
            <div class="item-right">
              <div>{{ userInfo?.mobile || '--' }}</div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
        </div>
        <div class="handle-box" style="margin-top: 20px">
          <div class="handle-item">
            <div class="label">登录密码</div>
            <div class="item-right">
              <div
                style="color: var(--el-color-primary); cursor: pointer"
                @click="beforeClearChange()"
              >
                修改密码
              </div>
            </div>
            <!-- <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" /> -->
          </div>
        </div>
        <div class="quit-box" @click="quitLogin">退出登录</div>
      </div>
    </div>
    <!-- 帮助与反馈 -->
    <div v-if="activeTab == 'assist'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">帮助与反馈</div>
        <div class="export-box" @click="toFeedback">我要反馈</div>
      </div>
      <div
        ref="messageListRef"
        class="content-box assist-content-box"
        style="border-top: 1px solid #efefef"
      >
        <div class="assist-list">
          <div
            v-for="item in questionList"
            :key="item.id"
            class="assist-item"
            @click="handleQuestion(item)"
          >
            <div class="disc"></div>
            {{ item.title }}
          </div>
        </div>
        <div class="chat-content">
          <MessageRow
            v-for="messageItem in activeSession.messages"
            :key="messageItem.dateline"
            :message="messageItem"
            :is-pre-view="true"
            :is-chatting="isChatting"
          />
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
      </div>
      <div class="quiz-box">
        <div v-if="isChatting" class="stop-chat-box" @click="stopChat">
          <img class="stop-icon" src="@renderer/assets/chat-icon/stop-icon.png" alt="" />
          停止回答
        </div>
        <el-input
          v-model="message.text"
          class="quiz-input"
          size="large"
          placeholder="请描述一下你遇到的问题"
          @keyup.enter="sendMessage"
        />
      </div>
    </div>
    <!-- ai划词工具栏 -->
    <div v-if="activeTab == 'paddle'" class="square">
      <div class="retreat-box" @click="tabHandle()">
        <img class="icon" src="@renderer/assets/down-icon.png" alt="" />
      </div>
      <div class="page-title-box">
        <div class="page-title">AI划词工具栏</div>
      </div>
      <div class="content-box">
        <div class="paddle-box">
          <div class="operate">
            <div v-for="(item, index) in operateList" :key="index" class="operate-item">
              <img class="item-icon" :src="item.icon" alt="" />
              <div class="item-title">{{ item.name }}</div>
            </div>
          </div>
          <div class="examples">
            作为独立部署数据库并以知识库为核心的AI工作台，<span>糖源AI Tongee Origin AI</span>
            集读、搜、写一体，提升办公、学习效率
          </div>
          <div class="bottom-operate">
            <div class="label">当选中文本时显示工具栏</div>
            <el-select
              v-model="toolbarShow"
              placeholder="请选择"
              style="width: 160px"
              @change="updateToolbarShow"
            >
              <el-option
                v-for="item in toolbarList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordVisible"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/contextMenu/edit-icon.png"
          alt=""
        />
        <div class="title">修改密码</div>
      </template>
      <el-form
        ref="passwordFormRef"
        label-position="top"
        :model="passwordForm"
        :rules="passwordRules"
      >
        <el-form-item prop="password" label="新密码">
          <el-input
            v-model="passwordForm.password"
            class="book-input"
            type="password"
            size="large"
            show-password
            placeholder="设置您的新密码"
          />
        </el-form-item>
        <el-form-item prop="repeatPassword" label="确认密码">
          <el-input
            v-model="passwordForm.repeatPassword"
            class="book-input"
            type="password"
            size="large"
            show-password
            placeholder="再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="passwordVisible = false">取消</el-button>
          <el-button
            class="confirm-btn"
            type="primary"
            @click="submitpasswordForm(passwordFormRef)"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject, reactive, nextTick, onMounted } from 'vue'
import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
import { edit_user, logout } from '@renderer/api/user'
import { useUserStore, useToolBarStore } from '@renderer/stores/user'
import { get_usually_questions } from '@renderer/api/feedback'
import { SSE } from 'sse.js'
import { get_type_models } from '@renderer/api/repository'
import { getChatInfo, chat_feedback, feedbackType, set_default_model } from '@renderer/api/chat.js'
import unscrambleIcon from '@renderer/assets/settings/unscramble-icon.png'
import translateIcon from '@renderer/assets/settings/translate-icon.png'
import notebookIcon from '@renderer/assets/settings/notebook-icon.png'
import copyIcon from '@renderer/assets/settings/copy-icon.png'
import defaultAvatar from '@renderer/assets/default-avatar.png'
import feedbackIcon from '@renderer/assets/repository/fk-icon.png'
const userStore = useUserStore()
const userInfo = useUserInfo()
let getLoading = ref(false)
const updateApi = inject('updateApi')
let isUpdateAvailable = ref(false)
let appVersion = ref('1.0.0')
// 获取应用版本
const getAppVersion = async () => {
  getLoading.value = true
  try {
    const version = await window.customApi?.getAppVersion()
    appVersion.value = version
  } catch (error) {
    console.log(error)
    appVersion.value = '1.0.0'
  }
  getLoading.value = false
  nextTick(() => {
    isUpdateAvailable.value = compareVersions(appVersion.value, userStore.version || '1.0.0')
  })
}

const compareVersions = (version1, version2) => {
  console.log(version1, version2,'版本');

  // 将版本号拆分成数字数组
  var arr1 = version1.split('.')
  var arr2 = version2.split('.')

  // 遍历数字数组进行逐段比较
  for (var i = 0; i < Math.max(arr1.length, arr2.length); i++) {
    var num1 = parseInt(arr1[i] || 0) // 如果数组长度不够，则将缺失部分补0
    var num2 = parseInt(arr2[i] || 0)
    if (num1 < num2) {
      return true // 版本1小于版本2
    } else if (num1 > num2) {
      return true // 版本1大于版本2
    }
  }
  return false // 版本1等于版本2
}
const handleCheckUpdate = async () => {
  getLoading.value = true
  if (updateApi && updateApi.checkForUpdates) {
    try {
      await updateApi.checkForUpdates()
    } catch (err) {
      console.log(err)
    }
  }
  isUpdateAvailable.value = compareVersions(appVersion.value, userStore.version || '1.0.0')
  getLoading.value = false
}
// let memberPrivileges = ref('')
let toolbarShow = ref(useToolBarStore().toolbarShow)
// 工具栏选择
let toolbarList = ref([
  {
    name: '开启',
    value: true
  },
  {
    name: '关闭',
    value: false
  }
])
const updateToolbarShow = (val) => {
  useToolBarStore().toolbarShow = val
}
// 外观选择
// let appearanceList = ref([
//   {
//     name: '跟随系统',
//     action: 'public'
//   }
// ])
let models = ref([])
let defaultModel = ref({})
onMounted(() => {
  getAppVersion()
  getModels()
})
// 获取模型列表
const getModels = () => {
  get_type_models({
    model_type: 'reasoning',
    ding_uid: userInfo.value?.ding_uid,
    t: new Date().getTime()
  }).then((res) => {
    models.value = res.data
    models.value.filter((item) => {
      if (item.is_default == 1) {
        defaultModel.value = item.id
      }
    })
  })
}
const modelChange = (id) => {
  if (!id) {
    return false
  }
  if (useCheckLogin().value) {
    set_default_model({ model_id: id }).then(() => {
      getModels()
    })
  }
}
const addNewTab = inject('addNewTab')
const handleTabAction = inject('handleTabAction')
let activeTab = ref('account')

const tabHandle = () => {
  activeTab.value = 'account'
  isChatting.value = false
  evtSource.value?.close()
}
const toUploadLog = () => {
  addNewTab({
    title: '功能介绍',
    url: 'UpdateLog',
    isInternal: true,
    attrs: {}
  })
}
// 修改密码
let passwordVisible = ref(false)
let beforeClearChange = () => {
  passwordVisible.value = true
  passwordFormRef.value?.resetFields()
}
let passwordFormRef = ref(null)
let passwordForm = ref({
  password: '',
  repeatPassword: ''
})
let toFeedback = () => {
  addNewTab({
    icon: feedbackIcon,
    title: '反馈中心',
    url: 'FeedbackCenter',
    backgroundColor: 'var(--primary-bg-color)',
    isInternal: true,
    attrs: {}
  })
}
let passwordRules = ref({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  repeatPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})
let feedbackVisible = ref(false)
let resultVisible = ref(false)
let resultTimeout = ref(null)
const activeSession = ref({
  title: '',
  messages: [],
  chat_key: '',
  model_id: '',
  model_name: '',
  provider_key: '',
  know_key: '',
  know_id: '',
  item_id: 0,
  temperature: 0.7,
  contextNumber: 5,
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
let feedbackList = ref([])
const getFeedbackType = () => {
  feedbackType({}).then((res) => {
    feedbackList.value = res.data || []
  })
}
let questionList = ref([])
const getQuestions = () => {
  get_usually_questions({}).then((res) => {
    if (res.code == 200) {
      questionList.value = res.data.question_list
      activeSession.value.know_key = res.data.know_info?.know_key
      activeSession.value.know_id = res.data.know_info?.know_id
      createChat()
    }
  })
}
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
const handleFeedback = (str) => {
  chat_feedback({ chat_key: activeSession.value.chat_key, feedback: str }).then(() => {
    feedbackVisible.value = false
    showResultMessage()
  })
}
const createChat = () => {
  var data = {
    know_id: activeSession.value.know_id,
    item_id: activeSession.value.item_id,
    chat_type: 2
  }
  getChatInfo(data).then(async (res) => {
    activeSession.value.title = res.data.title || ''
    activeSession.value.chat_key = res.data.chat_key
    activeSession.value.know_key = res.data.know_key
    activeSession.value.model_id = res.data.model_info?.model_id || ''
    activeSession.value.model_name = res.data.model_info?.model_name
    activeSession.value.provider_key = res.data.model_info?.provider_key
    activeSession.value.isNetwork = res.data.is_network ? true : false
    activeSession.value.vector_folder_path = res.data.vector_folder_path || ''
    activeSession.value.know_model_name = res.data.know_vector_model?.model_name || ''
    activeSession.value.know_provider_key = res.data.know_vector_model?.provider_key || ''
    activeSession.value.enableSearch = res.data.model_info?.net_status || 2
    activeSession.value.isNetwork = res.data.is_use_net ? true : false
    if (activeSession.value.enableSearch == 2) {
      activeSession.value.isNetwork = false
    }
    activeSession.value.messages = []
  })
}
let isChatting = ref(false)
let evtSource = ref(null)
let message = ref({
  text: '',
  image: []
})
const handleQuestion = (item) => {
  if (isChatting.value) {
    // eslint-disable-next-line no-undef
    ElMessage({
      message: '请先结束当前会话',
      type: 'warning'
    })
    return
  }
  message.value.text = item.title
  sendMessage({ type: 'keydown', key: 'Enter' })
}
let messageListRef = ref(null)
const sendMessage = (e) => {
  if (e.type == 'keydown') {
    if (e.key === 'Enter' && (e.shiftKey || e.ctrlKey || e.altKey)) {
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
      handleSendMessage(message.value)
      message.value = { text: '', image: '' }
    }
  } else {
    if (!message.value.text.trim().length) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '请输入消息',
        type: 'warning'
      })
      return
    }
    handleSendMessage(message.value)
    message.value = { text: '', image: '' }
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
    dateline: new Date().toLocaleString(),
    completion_tokens: 0,
    char_id: '',
    total_tokens: 0,
    prompt_tokens: 0,
    retrievedDocumentList: [],
    spread: false,
    issueContentText: '',
    attach_file_ids: []
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
      contextNumber: activeSession.value.contextNumber,
      prompt: activeSession.value.prompt || '',
      enableSearch: activeSession.value.isNetwork,
      temperature: activeSession.value.temperature,
      generateQuestions: activeSession.value.generateQuestions
    },
    knowledgeBaseParamsList: [
      {
        modelName: activeSession.value.know_model_name || '',
        modelPlatform: activeSession.value.know_provider_key || '',
        knowledgeBaseId: activeSession.value.know_key || '',
        folderPath: activeSession.value.vector_folder_path || ''
      }
    ],
    otherParams: {
      dingUid: userInfo.value.ding_uid,
      uniacid: userStore.uniacid,
      chat_key: activeSession.value.chat_key,
      attach_file_ids: []
    },
    annexParamList: []
  }
  evtSource.value = new SSE(import.meta.env.VITE_API_BASE_AI_URL + '/ai/chat-dialogue/basic-chat', {
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
    dateline: new Date().toLocaleString(),
    char_id: '',
    completion_tokens: 0,
    total_tokens: 0,
    prompt_tokens: 0,
    reasoningContentText: '',
    spread: true,
    issueContentText: '',
    retrievedDocumentList: [],
    attach_file_ids: []
  })
  evtSource.value.addEventListener('document', async (event) => {
    const response = JSON.parse(event.data)
    responseMessage.retrievedDocumentList = response || []
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

    if (response.finished) {
      isChatting.value = false
      // evtSource.value.close()
      // chatMessage.prompt_tokens = response.promptToken
      // chatMessage.total_tokens = response.promptToken
      // responseMessage.completion_tokens = response.completionTokens
      // responseMessage.total_tokens = response.completionTokens
      responseMessage.issueContentText = response.issueContentText || ''
    }
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
    if (!responseMessage.textContent) {
      responseMessage.textContent = '已取消回答'
    }
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
const stopChat = () => {
  isChatting.value = false
  evtSource.value?.close()
}
const submitpasswordForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      edit_user({
        password: passwordForm.value.password
      }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('修改成功')
          passwordVisible.value = false
        }
      })
    }
  })
}
const quitLogin = () => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认退出吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      logout().then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('退出登录成功')
          userStore.reset()
          activeTab.value = 'account'
          handleTabAction('close-all')
        }
      })
    })
    .catch(() => {})
}
// 修改密码end
// 进入个人设置
const sonClick = (val) => {
  if (!useCheckLogin().value) {
    return
  }
  activeTab.value = val
  if (val == 'assist') {
    getQuestions()
    getFeedbackType()
  }
}
// 划词操作
let operateList = ref([
  {
    name: 'AI解读',
    icon: unscrambleIcon
  },
  {
    name: '翻译',
    icon: translateIcon
  },
  {
    name: '笔记本',
    icon: notebookIcon
  },
  {
    name: '复制',
    icon: copyIcon
  }
])

const manualClick = () => {
  addNewTab({
    url: 'ServiceManual',
    title: '使用手册',
    icon: notebookIcon,
    isInternal: true
  })
}
</script>

<style scoped lang="scss">
.Recycled-box {
  box-sizing: border-box;
  padding: 50px 20px 10px;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;

  .square {
    width: 100%;
    max-width: 808px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .retreat-box {
      width: 30px;
      height: 30px;
      background: #efefef;
      border-radius: 6px;
      position: absolute;
      left: 20px;
      top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      .icon {
        width: 16px;
        height: 16px;
        transform: rotate(90deg);
      }
    }
    .page-title-box {
      flex-shrink: 0;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 22px;
        font-weight: 500;
        color: var(--default-font-color);
        line-height: 30px;
      }
      .export-box {
        width: 94px;
        height: 34px;
        background: var(--el-color-primary);
        border-radius: 8px;
        text-align: center;
        line-height: 34px;
        font-size: 16px;
        color: #fff;
        cursor: pointer;

        &:active {
          opacity: 0.6;
        }
      }
    }

    :deep(.content-box) {
      flex: 1;
      overflow: hidden;
      &.assist-content-box {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        .chat-content {
          padding: 20px 0;
          width: 100%;
          margin: 0 auto;
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
      }

      .account-box {
        // width: 808px;
        height: 100px;
        background: #f9f9f9;
        border-radius: 8px;
        padding: 0 23px 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .account-left {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          .buddha {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
          }
          .name {
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 500;
            font-size: 18px;
            color: #221815;
            line-height: 24px;
          }
        }

        .icon {
          width: 15px;
          height: 16px;
          transform: rotate(-90deg);
        }
      }
      .general-title {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #909090;
        line-height: 22px;
        margin-top: 40px;
        margin-bottom: 24px;
      }
      .handle-box {
        padding: 0 19px;
        background: #f9f9f9;
        border-radius: 8px;
        overflow: hidden;
        .el-select__wrapper {
          background-color: #eaeaea !important;
          border-radius: 4px !important;
          box-shadow: 0 0 0 1px #f9f9f9 inset;
          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }
        .handle-item {
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #efefef;
          &:last-of-type {
            border-bottom: none;
          }
          .label {
            flex-shrink: 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--default-font-color);
            line-height: 22px;
          }
          .buddha {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
          }
          .versions {
            margin-left: 5px;
            color: var(--default-font-color);
          }
          .new-version {
            margin-left: 10px;
            font-size: 12px;
            line-height: 1;
            background-color: #ff4444;
            color: #fff;
            padding: 2px 10px;
            border-radius: 30px;
          }

          .btn-check-update {
            background-color: #e0dede;
            color: var(--default-font-color);
            border: none;
            border-radius: 6px;
          }
          .item-right {
            display: flex;
            align-items: center;
            font-family:
              PingFangSC,
              PingFang SC;
            font-weight: 400;
            font-size: 16px;
            color: #221815;
            line-height: 22px;
            gap: 14px;
          }
          .icon {
            width: 16px;
            height: 16px;
            transform: rotate(-90deg);
          }
        }
      }
      .quit-box {
        width: 100%;
        height: 62px;
        background: #f9f9f9;
        border-radius: 8px;
        margin-top: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #ff5151;
        cursor: pointer;
      }
    }
  }

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
        .book-input,
        .repository-select,
        .notebook-select {
          .el-input__wrapper,
          .el-select__wrapper {
            height: 40px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: none;

            &.is-focus,
            &.is-focused {
              box-shadow: 0 0 0 1px var(--el-color-primary) inset;
            }
          }
          .el-textarea__inner {
            background: #f9f9f9;
            box-shadow: none;
            font-size: 14px;
            height: 122px;
            color: var(--default-font-color);
            border-radius: 8px;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
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

  .assist-list {
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .assist-item {
      cursor: pointer;
      color: var(--el-color-primary);
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 16px;
      line-height: 22px;
      margin-bottom: 12px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 6px;
      border-radius: 4px;
      .disc {
        width: 8px;
        height: 8px;
        background: var(--el-color-primary);
        border-radius: 50%;
      }
    }
    .assist-item:hover {
      background: var(--el-color-primary-light-9);
      // opacity: 0.1;
    }
  }
  :deep(.quiz-box) {
    margin-bottom: 30px;
    position: relative;
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
    .quiz-input,
    .el-input__wrapper {
      height: 58px;
      background-color: #f6f6f6;
      border-radius: 12px;
      box-shadow: none;
      font-size: 16px;
      &.is-focus,
      &.is-focused {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
    }
  }
  :deep(.paddle-box) {
    padding: 0 20px;
    height: 322px;
    background: #f9f9f9;
    border-radius: 8px;
    position: relative;
    .operate {
      width: 366px;
      height: 50px;
      background: #ffffff;
      box-shadow: 0px 2px 20px 8px rgba(0, 0, 0, 0.07);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 70px;
      .operate-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        .item-icon {
          width: 16px;
          height: 16px;
          img {
            width: 16px;
            height: 16px;
          }
        }
        .item-title {
          font-family:
            PingFangSC,
            PingFang SC;
          font-weight: 400;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
        }
      }
    }
    .examples {
      width: 498px;
      height: 52px;
      font-family:
        PingFangSC,
        PingFang SC;
      font-weight: 400;
      font-size: 14px;
      color: #221815;
      line-height: 26px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 140px;
      > span {
        background: #eaf5f5;
        padding: 0 4px;
      }
    }
    .bottom-operate {
      width: calc(100% - 40px);
      border-top: 1px solid #efefef;
      padding: 20px 0;
      position: absolute;
      bottom: 0px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .label {
        font-family:
          PingFangSC,
          PingFang SC;
        font-weight: 500;
        font-size: 16px;
        color: #221815;
        line-height: 22px;
      }
      .el-select__wrapper {
        background-color: #eaeaea !important;
        border-radius: 4px !important;
        box-shadow: 0 0 0 1px #f9f9f9 inset;
        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.setting-model-select {
  .el-select-dropdown__list {
    padding: 10px;
    .el-select-dropdown__item {
      border-radius: 4px;
      height: 64px;
      padding: 5px 10px;
      line-height: 27px;
      color: var(--default-font-color);
      &.is-hovering {
        .value-text {
          color: var(--el-color-primary);
        }
      }
      &.is-selected {
        .value-text {
          color: var(--el-color-primary);
        }
      }
      .value-text {
        font-style: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .value-label {
        font-style: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #909090;
      }
    }
  }
}
.more-position-popover {
  .more-position-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.Recycled-handle-popover {
  border-radius: 8px !important;
  padding: 19px 18px !important;
  .handle-box {
    display: flex;
    flex-direction: column;
    gap: 22px;

    .handle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      cursor: pointer;
      transition: all 0.2s linear;

      // &:hover {
      //   color: var(--el-color-primary);
      // }
      &:active {
        opacity: 0.6;
      }

      .icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
