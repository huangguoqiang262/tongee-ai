<template>
  <div class="document-detail">
    <el-splitter>
      <el-splitter-panel min="50%" class="center-box" :class="{ 'mr-chat': chatVisible }">
        <div class="center-head">
          <div class="title">{{ fileName }}</div>
          <div v-if="!IS_VIDEO" class="right-handle-box">
            <div v-if="!chatVisible" class="open-chat" @click="openChat">
              <img class="logo" src="@renderer/assets/logo.png" alt="" />
              问问糖源
            </div>
          </div>
        </div>
        <!-- <FilePreview
          v-if="fileUrl"
          class="center-content"
          :file-url="fileUrl"
          :file-name="fileName"
        /> -->
        <div v-if="IS_VIDEO" id="video-player"></div>
        <template v-else>
          <onlyofficePreview v-if="fileUrl && !IS_NOTE && !IS_WEB" class="center-content" :src="fileUrl"
            :file-name="fileName" :file-key="fileKey" :download="download" :mode="'view'" />
          <div v-if="IS_NOTE" class="note-box">
            <div class="note-content">
              <v-md-preview :text="noteInfo.content"></v-md-preview>
            </div>
          </div>
          <div v-else-if="IS_WEB" class="note-box">
            <webview ref="webview" id="webview" class="note-content" allowpopups autoplay partition="persist:external-webview" :src="normalizeWebviewUrl(webUrl)"
              disablewebsecurity="true"
              allow="camera; microphone; display-capture; geolocation; fullscreen; autoplay"></webview>
            <!-- webview 加载中遮罩 -->
            <div v-if="webLoading && IS_WEB && !isAntiBot" class="web-loading-overlay">
              <div class="web-loading-spinner"></div>
              <p class="web-loading-text">加载中...</p>
            </div>
            <!-- 反爬网站提示卡片（绝对定位覆盖在 webview 上方） -->
            <div v-if="isAntiBot" class="anti-bot-tips">
              <div class="anti-bot-card">
                <div class="anti-bot-icon">🔗</div>
                <div class="anti-bot-title">已在外部浏览器中打开</div>
                <div class="anti-bot-desc">该网站使用了特殊的安全机制，已为您在系统默认浏览器中打开。如果未自动打开，请点击下方按钮手动打开。</div>
                <div class="anti-bot-link-box">
                  <div class="anti-bot-link-label">网页地址</div>
                  <div class="anti-bot-link-url">{{ detectedAntiBotUrl }}</div>
                </div>
                <button class="anti-bot-btn" @click="reopenExternal(detectedAntiBotUrl)">再次打开</button>
              </div>
            </div>
          </div>
        </template>
      </el-splitter-panel>
      <el-splitter-panel v-if="chatVisible" :min="375" :size="375" class="right-box">
        <CommonChat :is-active-tab="props.isActiveTab" :attach-files="attach_files" :chat-key="props.attrs.chat_key"
          @close-chat="chatVisible = false" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { I18N } from 'xgplayer'
import ZH from 'xgplayer/es/lang/zh-cn'
import { nextTick, ref, watchEffect, watch, inject, onMounted, onUnmounted, computed } from 'vue'
import { get_note_info } from '@renderer/api/note'
import { add_web_log } from '@renderer/api/history'
import { safeGetURL, normalizeWebviewUrl } from '@renderer/utils/webview'
// ===== 反爬检测相关：纯工具函数（不依赖响应式状态，可提前定义） =====
// URL 归一化：去掉 query 和 hash、末尾 ? # /，并 decode，用于反爬卡片的宽松匹配
// 注意：hash 是客户端片段（如 SPA 的 #category=yp），不会发送到服务器，
// 主进程 onHeadersReceived 收到的 details.url 不含 hash，因此这里必须去掉 hash 才能匹配
const normalizeUrl = (u) => {
  if (!u) return ''
  try {
    let s = decodeURIComponent(normalizeWebviewUrl(u))
    // 去掉 hash（主进程请求 URL 不包含客户端片段）
    s = s.replace(/#.*$/, '')
    // 去掉末尾的 ? # 与 /
    s = s.replace(/[?#/]+$/, '')
    return s
  } catch (e) {
    return u
  }
}
// 用系统默认浏览器打开 URL
const reopenExternal = (url) => {
  if (window.customApi && window.customApi.openExternal) {
    window.customApi.openExternal(url)
  }
}
// 记录最近一次外部打开的 URL+时间，避免主进程 202 检测与 did-fail-load 重复打开同一地址
let lastExternalOpenUrl = ''
let lastExternalOpenTime = 0
const openExternalOnce = (url) => {
  if (!url) return
  const now = Date.now()
  if (url === lastExternalOpenUrl && now - lastExternalOpenTime < 5000) return
  lastExternalOpenUrl = url
  lastExternalOpenTime = now
  reopenExternal(url)
}
// 启用中文
I18N.use(ZH)
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
const addNewTab = inject('addNewTab')
let webview = ref(null)
let webLoading = ref(false)
let webLoadingTimer = null
// 文件类型 / 内容状态（提前声明，供反爬检测的 computed 引用，避免 TDZ）
let fileUrl = ref('')
let fileName = ref('')
let fileKey = ref('')
let download = ref(false)
let chatVisible = ref(false)
let IS_VIDEO = ref(false) //如果是视频，则使用xgplayer播放器 只做播放  不能进行问一问
let IS_NOTE = ref(false)
let note_id = ref('')
let noteInfo = ref({})
let IS_WEB = ref(false)
let webUrl = ref('')
const callBack = (event) => {
  // 在当前标签页导航到目标URL
  const details = event.detail
  addNewTab({
    url: details.url,
    title: details.title || '',
    icon: details.icon || '',
    isInternal: false
  })
}
// webview 加载状态：控制遮罩显隐
const showWebLoading = () => { webLoading.value = true }
const hideWebLoading = () => { webLoading.value = false }
// 网页历史更新
const lastTitle = ref('')
const updateLog = (event) => {
  // 去重：title 没变就不处理
  if (event.title === lastTitle.value) return
  lastTitle.value = event.title
  add_web_log({
    title: event.title,
    web_url: safeGetURL(webview.value),
    t: Date.now()
  })
}
// ===== 反爬检测相关：依赖 IS_WEB / webUrl 的响应式状态（必须在它们定义之后） =====
// 当前 WebView 实际降级到外部浏览器的地址
const detectedAntiBotUrl = ref('')
const showExternalFallback = (url) => {
  if (!url || !props.isActiveTab) return
  detectedAntiBotUrl.value = url
}
// 当前 webview 是否命中反爬（仅当 IS_WEB 时判断）
const isAntiBot = computed(() => {
  if (!props.isActiveTab || !IS_WEB.value || !webUrl.value) return false
  return Boolean(detectedAntiBotUrl.value)
})
// 主进程 antibot-detected 回调：主框架返回 202/412 时标记为"疑似反爬"
// 不立即外部打开，等 did-stop-loading 后检查页面内容再决定
const handleAntibotDetected = (url) => {
  if (!props.isActiveTab) return
  const norm = normalizeUrl(url)
  if (!norm) return
  const currentWebviewUrl = safeGetURL(webview.value)
  let sameOrigin = false
  try {
    const expectedUrl = normalizeWebviewUrl(props.attrs.webUrl || webUrl.value)
    sameOrigin = new URL(expectedUrl).origin === new URL(url).origin
  } catch (e) {}
  const belongsToThisWebview =
    normalizeUrl(props.attrs.webUrl) === norm ||
    normalizeUrl(webUrl.value) === norm ||
    normalizeUrl(currentWebviewUrl) === norm ||
    (sameOrigin && normalizeUrl(currentWebviewUrl) === normalizeUrl(webUrl.value))
  if (belongsToThisWebview) {
    if (webview.value) {
      webview.value.__suspectAntiBot = true
      webview.value.__suspectAntiBotUrl = url
    }
  }
}
// 监听文档 URL 变化时清理当前实例的降级状态
watch(
  () => props.attrs.webUrl,
  (newUrl, oldUrl) => {
    if (newUrl !== oldUrl) {
      detectedAntiBotUrl.value = ''
      if (webview.value) {
        webview.value.__suspectAntiBot = false
        webview.value.__suspectAntiBotUrl = ''
      }
    }
  }
)
// webview 加载失败处理：主框架失败时用系统浏览器打开并显示反爬卡片
const handleDidFailLoad = (event) => {
  hideWebLoading()
  if (!event.isMainFrame) return
  // ERR_ABORTED(-3)、ERR_TOO_MANY_REDIRECTS(-27) 忽略
  const ignoreCodes = [-3, -27]
  if (ignoreCodes.includes(event.errorCode)) return
  const realUrl = webUrl.value || event.validatedURL || safeGetURL(webview.value)
  if (realUrl) {
    openExternalOnce(realUrl)
    showExternalFallback(realUrl)
  }
}
// 保存 antibot 监听器的移除函数，卸载时调用避免内存泄漏与重复回调
let removeAntibotListener = null
onMounted(() => {
  if (!webview.value) return
  webview.value.addEventListener('new-window', callBack)
  webview.value.addEventListener('page-title-updated', updateLog)
  webview.value.addEventListener('did-start-loading', showWebLoading)
  webview.value.addEventListener('did-stop-loading', hideWebLoading)
  webview.value.addEventListener('did-finish-load', hideWebLoading)
  webview.value.addEventListener('did-fail-load', handleDidFailLoad)
  webview.value.addEventListener('did-stop-loading', () => {
    try {
      const wv = webview.value
      // 只在主进程标记为"疑似反爬"（202/412）时才检查页面内容
      // 延迟 500ms 给 WAF 的 JS 挑战时间执行
      if (wv.__suspectAntiBot && !detectedAntiBotUrl.value) {
        if (wv.__antiBotCheckTimer) clearTimeout(wv.__antiBotCheckTimer)
        wv.__antiBotCheckTimer = setTimeout(() => {
          wv.executeJavaScript(`(function(){
            var body=document.body;
            var text=body ? (body.innerText || '').replace(/\\s/g, '') : '';
            var visible=body && body.getBoundingClientRect().height > 0;
            return { htmlLength: body ? body.innerHTML.length : 0, textLength: text.length, visible: !!visible };
          })()`).then(result => {
            const pageUsable = result && result.visible && (result.textLength >= 20 || result.htmlLength >= 200)
            if (!pageUsable && wv.__suspectAntiBot) {
              const realUrl = wv.__suspectAntiBotUrl || webUrl.value || safeGetURL(wv)
              openExternalOnce(realUrl)
              showExternalFallback(realUrl)
            } else {
              // WAF 挑战通过，清除疑似标记
              wv.__suspectAntiBot = false
            }
          }).catch(() => {})
        }, 500)
      }
    } catch (e) {}
  })
  // 监听主进程反爬检测事件（202 状态码等）
  if (window.customApi && window.customApi.onAntibotDetected) {
    removeAntibotListener = window.customApi.onAntibotDetected(handleAntibotDetected)
  }
  // :src 可能在我们绑定监听前就已加载完成，若已加载则直接隐藏遮罩；
  // 否则显示遮罩并启动兜底超时（防止卡死导致遮罩常驻）
  nextTick(() => {
    const wv = webview.value
    if (!wv) return
    const cur = safeGetURL(wv)
    if (cur && cur !== 'about:blank' && normalizeWebviewUrl(cur) === normalizeWebviewUrl(webUrl.value)) {
      webLoading.value = false
    } else {
      webLoading.value = true
      webLoadingTimer = setTimeout(() => { webLoading.value = false }, 15000)
    }
  })
})
onUnmounted(() => {
  if (webview.value) {
    webview.value.removeEventListener('new-window', callBack)
    webview.value.removeEventListener('page-title-updated', updateLog)
    webview.value.removeEventListener('did-start-loading', showWebLoading)
    webview.value.removeEventListener('did-stop-loading', hideWebLoading)
    webview.value.removeEventListener('did-finish-load', hideWebLoading)
    webview.value.removeEventListener('did-fail-load', handleDidFailLoad)
  }
  // 移除主进程 antibot 监听器，避免组件卸载后仍累积监听器
  if (removeAntibotListener) {
    removeAntibotListener()
    removeAntibotListener = null
  }
  if (webLoadingTimer) clearTimeout(webLoadingTimer)
  webLoading.value = false
  lastTitle.value = ''
  detectedAntiBotUrl.value = ''
  lastExternalOpenUrl = ''
})
let attach_files = ref([
  {
    title: props.attrs.fileName,
    full_path: props.attrs.fileUrl,
    fileId: props.attrs.fileId || ''
  }
])
const openChat = () => {
  chatVisible.value = true
}
const getNote = () => {
  get_note_info({ note_id: note_id.value }).then(res => {
    if (res.code == 200) {
      noteInfo.value = res.data
    }
  })
}
watchEffect(() => {
  fileUrl.value = props.attrs.fileUrl || ''
  fileName.value = props.attrs.fileName || ''
  fileKey.value = props.attrs.fileId || ''
  download.value = props.attrs.download || false
  var allowedTypes = ['.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.mkv',
    '.rmvb',
    '.webm',
    '.3gp',
    '.mpeg',
    '.mpg']
  const fileExt = '.' + fileUrl.value.split('.').pop().toLowerCase()
  if (allowedTypes.includes(fileExt)) {
    IS_VIDEO.value = true
    nextTick(() => {
      let player = new Player({
        id: 'video-player',
        url: fileUrl.value,
        height: '100%',
        width: '100%',
      });
    })
  } else if (props.attrs.note_id && props.attrs.note_id != 0) {
    note_id.value = props.attrs.note_id
    IS_NOTE.value = true
    getNote()
  } else if (props.attrs.webUrl) {
    IS_WEB.value = true
    webUrl.value = props.attrs.webUrl
  }

})
</script>
<style scoped lang="scss">
.document-detail {
  width: 100%;
  height: 100%;
  display: flex;
  align-content: start;
  overflow: hidden;
  background: var(--primary-bg-color);

  :deep(.center-box) {
    flex: 1;
    min-width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    background: #fff;
    border-radius: 0 12px 12px 0;

    &.mr-chat {
      margin-right: 5px;
    }

    .center-head {
      flex-shrink: 0;
      width: 100%;
      padding-right: 10px;
      margin: 0 auto 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #fff;
      overflow: hidden;

      .title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--default-font-color);
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .right-handle-box {
        display: flex;
        align-items: center;
        gap: 10px;

        .add-icon {
          flex-shrink: 0;
          margin-right: 10px;
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .search-input {
          width: 240px;
          height: 36px;

          .el-input__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 1px #efefef inset;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }

        .open-chat {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 99px;
          height: 36px;
          font-size: 14px;
          color: var(--default-font-color);
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9e9e9;
          }

          .logo {
            flex-shrink: 0;
            display: block;
            width: 16px;
            height: 16px;
          }
        }
      }
    }

    .center-content {
      flex: 1;
      user-select: text;
      width: 100%;
      overflow-y: auto;
      margin: 0 auto;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1);
    }

    .note-box {
      flex: 1;
      user-select: text;
      width: 100%;
      overflow: hidden;
      margin: 0 auto;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      position: relative;

      .note-content {
        overflow-y: auto;
        height: 100%;
        width: 100%;
      }
    }

    .web-loading-overlay {
      position: absolute;
      inset: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: #fff;
      border-radius: 12px;

      .web-loading-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e6e6e6;
        border-top-color: #409eff;
        border-radius: 50%;
        animation: web-loading-spin 0.8s linear infinite;
      }

      .web-loading-text {
        font-size: 14px;
        color: #999;
        margin: 0;
      }
    }

    // 反爬网站提示卡片
    .anti-bot-tips {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      border-radius: 12px;

      .anti-bot-card {
        text-align: center;
        padding: 40px 48px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        max-width: 440px;
        width: 100%;

        .anti-bot-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, #4f8cf0 0%, #3a6fd8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .anti-bot-title {
          color: #1a1a1a;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .anti-bot-desc {
          color: #666;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .anti-bot-link-box {
          background: #f7f8fa;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 20px;
          word-break: break-all;
          max-height: 90px;
          overflow-y: auto;
        }

        .anti-bot-link-label {
          color: #999;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .anti-bot-link-url {
          color: #4f8cf0;
          font-size: 13px;
        }

        .anti-bot-btn {
          display: inline-block;
          padding: 10px 32px;
          background: linear-gradient(135deg, #4f8cf0 0%, #3a6fd8 100%);
          color: #fff;
          font-size: 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.9;
          }

          &:active {
            opacity: 0.8;
          }
        }
      }
    }

    @keyframes web-loading-spin {
      to { transform: rotate(360deg); }
    }

    #video-player {
      flex: 1;
      width: 100%;
    }
  }

  :deep(.right-box) {
    flex: 1;
    height: 100%;
    overflow: hidden;
    margin-left: 5px;
    // display: flex;
    // flex-direction: column;
    // border-left: 1px solid #efefef;
  }
}
</style>
