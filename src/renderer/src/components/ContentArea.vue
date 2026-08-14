<template>
  <div class="content-area" :style="{
    backgroundColor: props.activeTab?.backgroundColor || '#fff',
    borderRadius: activeTab?.isInternal ? '12px' : '0px 0px 12px 12px'
  }">
    <div v-if="!tabs.length" class="empty-state">
      <i class="fas fa-window-maximize"></i>
      <p>没有打开的标签页</p>
    </div>

    <template v-else>
      <div v-if="!activeTabUrlValid" class="internal-page">
        <component :is="internalComponents['NotFound']" />
      </div>

      <div v-show="activeTab.isInternal" class="internal-page">
        <template v-for="tab in tabs" :key="tab.id">
          <component :is="internalComponents[tab.url]" v-show="tab.isInternal && isActiveTab(tab.id)"
            :attrs="tab.attrs || {}" :is-active-tab="isActiveTab(tab.id)" />
        </template>
      </div>
      <div v-show="!activeTab.isInternal" class="webview-container">
        <!-- 加载状态覆盖层 -->
        <div v-show="activeTab.loading && !isAntiBotTab" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>加载中... {{ activeTab.progress }}%</p>
        </div>
        <!-- 反爬网站提示卡片（绝对定位覆盖在 webview 上方） -->
        <div v-if="isAntiBotTab && activeTab.url" class="anti-bot-tips">
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
        <!-- 为每个标签页创建独立的webview -->
        <template v-for="tab in tabs" :key="tab.id">
          <webview v-if="!tab.isInternal && tab.url" id="webview" :key="tab.id" :ref="(el) => setWebviewRef(tab.id, el)"
            :src="normalizeWebviewUrl(tab.url)" partition="persist:external-webview" allowpopups autoplay class="webview" :style="{
              display: isActiveTab(tab.id) ? 'flex' : 'none',
              width: '100%',
              height: '100%'
            }"
            disablewebsecurity="true"
            allow="camera; microphone; display-capture; geolocation; fullscreen; autoplay">
          </webview>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onErrorCaptured, onMounted, nextTick } from 'vue'
import { safeLoadURL, safeGetURL, normalizeWebviewUrl } from '@renderer/utils/webview'
import SearchHome from './SearchHome.vue'
import NotFound from './NotFound.vue'
import AccountSettings from './account-settings/AccountSettings.vue'
import ServiceManual from './account-settings/ServiceManual.vue'
import Square from './Square.vue'
import MessageCenter from './MessageCenter.vue'
import RepositoryStore from './RepositoryStore.vue'
import History from './History.vue'
import Recycled from './Recycled.vue'
import FeedbackCenter from './FeedbackCenter.vue'
import Note from './Note.vue'
import ChatPage from './ChatPage.vue'
import ImageProductionChat from './ImageProductionChat.vue'
import IntelligentWritingChat from './IntelligentWritingChat.vue'
import HomePage from './HomePage.vue'
import Maintain from './Maintain.vue'
import DocumentDetail from './DocumentDetail.vue'
import UpdateLog from './UpdateLog.vue'
import SynergiaDetail from './SynergiaDetail.vue'
import SystemFeedback from './SystemFeedback.vue'
const internalComponents = {
  SearchHome,
  NotFound,
  AccountSettings,
  Square,
  MessageCenter,
  RepositoryStore,
  History,
  Recycled,
  FeedbackCenter,
  Note,
  ChatPage,
  ServiceManual,
  ImageProductionChat,
  IntelligentWritingChat,
  HomePage,
  Maintain,
  DocumentDetail,
  UpdateLog,
  SynergiaDetail,
  SystemFeedback
}
const isValidInternalUrl = (url) => {
  return Object.keys(internalComponents).includes(url)
}
const reopenExternal = (url) => {
  if (window.customApi && window.customApi.openExternal) {
    window.customApi.openExternal(url)
  }
}
const webviewRefs = ref(new Map())
const emit = defineEmits([
  'update-tab-info',
  'update-loading-state',
  'update-webview-instance',
  'new-webview',
  'add-syc-tab'
])
onErrorCaptured((err, instance, info) => {
  console.error('ContentArea 组件捕获到错误:', err, info)
  return false // 阻止继续向上传播错误
})
const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: Object,
    default: () => ({})
  }
})
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
// 记录每个标签页实际降级到外部浏览器的 URL，保证子链接失败后提示归属于正确 WebView
const externalFallbackUrls = ref(new Map())
const detectedAntiBotUrl = computed(() => {
  if (!props.activeTab) return ''
  return externalFallbackUrls.value.get(props.activeTab.id) || ''
})
const showExternalFallback = (tabId, url) => {
  if (!tabId || !url) return
  externalFallbackUrls.value.set(tabId, url)
  externalFallbackUrls.value = new Map(externalFallbackUrls.value)
  emit('update-tab-info', { tabId, url })
}
const isAntiBotTab = computed(() => {
  if (!props.activeTab || props.activeTab.isInternal) return false
  return Boolean(detectedAntiBotUrl.value)
})
// 监听主进程的反爬检测事件：主框架返回 202/412 时标记为"疑似反爬"
// 不立即外部打开，等 did-stop-loading 后检查页面内容再决定
const handleAntibotDetected = (url) => {
  const norm = normalizeUrl(url)
  if (!norm) return
  const matched = props.tabs.find((t) => {
    if (normalizeUrl(t.url) === norm) return true
    const wv = webviewRefs.value.get(t.id)
    return normalizeUrl(safeGetURL(wv)) === norm
  }) || props.tabs.find((t) => {
    try {
      return t.id === props.activeTab?.id && new URL(t.url).origin === new URL(url).origin
    } catch (e) {
      return false
    }
  })
  if (matched) {
    const wv = webviewRefs.value.get(matched.id)
    if (wv) {
      wv.__suspectAntiBot = true
      wv.__suspectAntiBotUrl = url
    }
  }
}
// 外部降级仅在检测或加载失败发生时打开一次；切换标签页只恢复提示，不重复打开系统浏览器
const handleWebviewNewWindow = (event) => {
  const url = event.detail && event.detail.url
  if (!url) return
  // 忽略 SPA 内部探测用的空白页
  if (url === 'about:blank' || url === '') return
  // 新开标签页承载跳转目标
  emit('new-webview', { url })
}
onMounted(() => {
  if (window.customApi && window.customApi.onAntibotDetected) {
    window.customApi.onAntibotDetected(handleAntibotDetected)
  }
  // window 级别监听 webview 内新窗口事件（preload 派发），在当前标签导航
  window.addEventListener('webview-new-window', handleWebviewNewWindow)
})
// 当活动标签页的 URL 变化（含仅 hash 变化时，Electron <webview> 的 :src 绑定不会重新导航）
// 强制调用 loadURL 重新加载，确保 SPA 的 hash 路由（如 #category=yp）能正确初始化
// 使用 safeLoadURL：webview 未 dom-ready 时暂存待加载，避免抛错
// 注意：shouldLoad 回调去掉 hash 再比较，避免 WAF 挑战中间态（hash 丢失）误判为需要重新加载
watch(
  () => props.activeTab && props.activeTab.url,
  (newUrl, oldUrl) => {
    if (!newUrl || newUrl === oldUrl) return
    const tabId = props.activeTab && props.activeTab.id
    if (!tabId) return
    const webview = webviewRefs.value.get(tabId)
    if (webview && webview.__domReadyLoaded) {
      safeLoadURL(webview, newUrl, (wv) => {
        // 避免重复加载相同地址；getURL 在 webview 未 attached 时会抛错，需保护
        const currentUrl = safeGetURL(wv)
        return normalizeWebviewUrl(currentUrl) !== normalizeWebviewUrl(newUrl)
      })
    }
  },
  { flush: 'post' }
)
// 添加一个Map来跟踪已经绑定事件的webview
const hasSetupListeners = ref(new Map())
// 设置webview引用
const setWebviewRef = (tabId, el) => {
  if (el) {
    webviewRefs.value.set(tabId, el)
    // 只有当该webview还没有设置监听器时才设置
    if (!hasSetupListeners.value.has(tabId)) {
      // 立即设置监听器，不等待dom-ready
      setupWebviewListeners(tabId, el)
      hasSetupListeners.value.set(tabId, true)
    }
    // 将webview实例传递给父组件
    emit('update-webview-instance', {
      tabId: tabId,
      webview: el
    })
  } else {
    webviewRefs.value.delete(tabId)
    hasSetupListeners.value.delete(tabId)
  }
}

// 检查是否是当前活动标签
const isActiveTab = (tabId) => {
  return props.activeTab && props.activeTab.id === tabId
}
// 根据 tabId 查找 tab 对象
const findTab = (tabId) => {
  return props.tabs.find((t) => t.id === tabId)
}
// 计算属性，检查当前活动标签页的URL是否有效
const activeTabUrlValid = computed(() => {
  if (!props.activeTab) return false

  if (props.activeTab.isInternal) {
    if (isValidInternalUrl(props.activeTab.url)) {
      return true
    } else {
      emit('update-tab-info', {
        tabId: props.activeTab.id,
        title: '404 Not Found',
        url: 'NotFound'
      })
      return false
    }
  } else {
    // 外部URL总是视为有效，由webview处理
    return true
  }
})
// 监听webview事件
const setupWebviewListeners = (tabId, webview) => {
  if (!webview) return
  // 标记 webview 就绪：dom-ready 前调用 loadURL 会抛错，
  // 同时消费可能暂存的待加载 URL（来自 safeLoadURL）
  webview.addEventListener('dom-ready', () => {
    webview.__domReadyLoaded = true
    const pending = webview.__pendingUrl
    if (pending) {
      webview.__pendingUrl = null
      try {
        webview.loadURL(pending)
      } catch (e) {
        console.warn('[ContentArea] loadURL pending failed', e)
      }
    }
  })
  // 开始加载
  webview.addEventListener('did-start-loading', () => {
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: true,
        progress: 10
      })
    }
  })
  // 开始加载
  webview.addEventListener('did-stop-loading', () => {
    // 检测 WAF 挑战失败：只在主进程标记为"疑似反爬"（202/412）时才检查
    // 延迟 500ms 给 WAF 的 JS 挑战时间执行，如果页面仍空则判定反爬
    try {
      if (webview.__suspectAntiBot && !detectedAntiBotUrl.value) {
        if (webview.__antiBotCheckTimer) clearTimeout(webview.__antiBotCheckTimer)
        webview.__antiBotCheckTimer = setTimeout(() => {
          webview.executeJavaScript(`(function(){
            var body=document.body;
            var text=body ? (body.innerText || '').replace(/\\s/g, '') : '';
            var visible=body && body.getBoundingClientRect().height > 0;
            return { htmlLength: body ? body.innerHTML.length : 0, textLength: text.length, visible: !!visible };
          })()`).then(result => {
            const pageUsable = result && result.visible && (result.textLength >= 20 || result.htmlLength >= 200)
            if (!pageUsable && webview.__suspectAntiBot) {
              const tabObj = findTab(tabId)
              const realUrl = webview.__suspectAntiBotUrl || (tabObj ? tabObj.url : safeGetURL(webview))
              if (realUrl && window.customApi && window.customApi.openExternal) {
                window.customApi.openExternal(realUrl)
              }
              showExternalFallback(tabId, realUrl)
            } else {
              // WAF 挑战通过，清除疑似标记
              webview.__suspectAntiBot = false
            }
          }).catch(() => {})
        }, 500)
      }
    } catch (e) {}
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: false,
        progress: 0
      })
    }
    // hash 同步兜底：若实际加载后丢失了期望的 hash，带 hash 重新加载
    // 用 __hashReloading 标记防止重复 reload 死循环
    // 注意：延迟 1.5 秒再检查，给 WAF 的 JS 挑战（412/202 响应体）时间执行
    // 否则在 WAF 挑战的中间态（hash 丢失）就强制 reload 会打断挑战流程导致死循环白屏
    const tabObj = findTab(tabId)
    const expectedUrl = tabObj ? tabObj.url : ''
    const expectedHash = expectedUrl && expectedUrl.includes('#') ? expectedUrl.split('#')[1] : ''
    if (expectedHash && !webview.__hashReloading) {
      webview.__hashReloading = true
      setTimeout(() => {
        webview.__hashReloading = false
        // 延迟后再次检查：如果页面已正常加载（WAF 挑战完成），hash 可能已恢复，无需 reload
        let actualHash = ''
        try {
          const cur = safeGetURL(webview)
          actualHash = cur.includes('#') ? cur.split('#')[1] : ''
        } catch (e) {
          actualHash = ''
        }
        if (expectedHash && expectedHash !== actualHash) {
          webview.executeJavaScript(`location.hash = ${JSON.stringify(`#${expectedHash}`)}`).catch(() => {})
        }
      }, 1500)
    }
  })
  // 页面标题更新
  const lastTitle = ref('')
  webview.addEventListener('page-title-updated', (event) => {
    // 去重：title 没变就不处理
    if (event.title === lastTitle.value) return
    lastTitle.value = event.title

    if (props.activeTab && props.activeTab.id === tabId) {
      emit('add-syc-tab', {
        title: event.title,
        web_url: safeGetURL(webview)
      })
      emit('update-tab-info', {
        tabId: tabId,
        title: event.title,
        url: safeGetURL(webview)
      })
    }
  })

  // 页面favicon更新
  webview.addEventListener('page-favicon-updated', (event) => {
    // 只有当该标签页是活动标签时才更新favicon
    if (
      props.activeTab &&
      props.activeTab.id === tabId &&
      event.favicons &&
      event.favicons.length > 0
    ) {
      emit('update-tab-info', {
        tabId: tabId,
        favicon: event.favicons[0]
      })
    }
  })

  // 完成加载
  webview.addEventListener('did-finish-load', () => {
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: false,
        progress: 100
      })
    }

    // 获取最终标题和URL，只有当该标签页是活动标签时才更新
    if (props.activeTab && props.activeTab.id === tabId) {
      const title = webview.getTitle()
      const url = safeGetURL(webview)

      emit('update-tab-info', {
        tabId: tabId,
        title: title,
        url: url
      })

      // hash 同步兜底：Electron <webview> 在加载带 hash 的 URL 时，
      // 偶尔会丢失 hash 导致 SPA 的 hash 路由（如 #category=yp）未初始化。
      // 若标签页期望的 URL 含 hash 而实际加载后丢失，则带 hash 重新加载。
      // 注意：延迟 1.5 秒再 reload，避免打断 WAF 的 JS 挑战流程
      const tabObj = findTab(tabId)
      const expectedUrl = tabObj ? tabObj.url : ''
      const extractHash = (u) => (u && u.includes('#') ? u.split('#')[1] : '')
      const expectedHash = extractHash(expectedUrl)
      const actualHash = extractHash(url)
      const isHomeIndex = /nmpa\.gov\.cn\/datasearch\/home-index/.test(expectedUrl || url)

      if (expectedHash && expectedHash !== actualHash && !webview.__hashReloading) {
        webview.__hashReloading = true
        setTimeout(() => {
          webview.__hashReloading = false
          // 延迟后再次检查 hash 是否恢复（WAF 挑战完成后 hash 可能已恢复）
          let curHash = ''
          try {
            curHash = extractHash(safeGetURL(webview))
          } catch (e) {
            curHash = ''
          }
          if (expectedHash && expectedHash !== curHash) {
            const targetBase = normalizeWebviewUrl(expectedUrl).replace(/#.*$/, '')
            const current = safeGetURL(webview)
            const currentBase = normalizeWebviewUrl(current).replace(/#.*$/, '')
            if (targetBase === currentBase) {
              const targetHash = new URL(normalizeWebviewUrl(expectedUrl)).hash
              webview.executeJavaScript(`location.hash = ${JSON.stringify(targetHash)}`).catch(() => {})
            } else {
              safeLoadURL(webview, expectedUrl)
            }
          }
        }, 1500)
      } else if (isHomeIndex) {
        // nmpa 数据查询页是 SPA（home-index.html?#category=yp）：
        // 偶尔主文档加载完成但 SPA 未初始化导致白屏/没反应。
        // 注入脚本检测页面是否已渲染出正文内容，未渲染则手动派发 hashchange 触发初始化。
        try {
          webview
            .executeJavaScript(
              `(function(){
                var body=document.body;
                var text=(body?body.innerText||'':'');
                var hasContent=text.replace(/\\s/g,'').length>50;
                if(!hasContent && location.hash){
                  var ev;
                  try{ev=new HashChangeEvent('hashchange',{newURL:location.href,oldURL:location.href});}catch(e){ev=new Event('hashchange');}
                  window.dispatchEvent(ev);
                  // 部分 SPA 监听的是 popstate，一并兜底
                  window.dispatchEvent(new PopStateEvent('popstate',{state:null}));
                }
                return hasContent;
              })()`
            )
            .catch(() => {})
        } catch (e) {
          /* ignore */
        }
      }
    }
  })

  // 加载失败
  webview.addEventListener('did-fail-load', (event) => {
    console.error('[webview did-fail-load]', {
      tabId,
      errorCode: event.errorCode,
      errorDescription: event.errorDescription,
      validatedURL: event.validatedURL,
      isMainFrame: event.isMainFrame
    })
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: false,
        progress: 0
      })
    }
    // 主框架加载失败，用系统浏览器打开
    if (event.isMainFrame) {
      const ignoreCodes = [-3, -27] // ERR_ABORTED, ERR_TOO_MANY_REDIRECTS
      if (!ignoreCodes.includes(event.errorCode)) {
        // 用真实 tab.url 记录，确保归一化匹配后反爬卡片一定显示
        const tabObj = findTab(tabId)
        const realUrl = (tabObj && tabObj.url) || event.validatedURL || safeGetURL(webview)
        if (realUrl && window.customApi && window.customApi.openExternal) {
          window.customApi.openExternal(realUrl)
        }
        showExternalFallback(tabId, realUrl)
      }
    }
  })

  // 导航事件
  webview.addEventListener('will-navigate', (event) => {
    // 只有活动标签页才同步 URL，避免站内跳转后重新把旧 URL 写回并触发空白导航
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-tab-info', {
        tabId: tabId,
        url: event.url
      })
    }
  })

  webview.addEventListener('did-navigate', (event) => {
    // 只有当该标签页是活动标签时才更新URL
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-tab-info', {
        tabId: tabId,
        url: event.url
      })
    }
  })

  webview.addEventListener('did-navigate-in-page', (event) => {
    // 只有当该标签页是活动标签时才更新URL
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-tab-info', {
        tabId: tabId,
        url: event.url
      })
    }
  })
}
</script>

<style scoped lang="scss">
.content-area {
  flex: 1;
  margin: 0 10px 10px 0;
  display: flex;
  position: relative;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
}

.webview-container {
  flex: 1;
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
}

// 反爬网站提示卡片
.anti-bot-tips {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);

  .anti-bot-card {
    text-align: center;
    padding: 48px 56px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    max-width: 480px;
    width: 100%;

    .anti-bot-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #4f8cf0 0%, #3a6fd8 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
    }

    .anti-bot-title {
      color: #1a1a1a;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .anti-bot-desc {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .anti-bot-link-box {
      background: #f7f8fa;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      word-break: break-all;
      max-height: 100px;
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

.webview {
  flex: 1;
  border: none;
  background: white;
  border: none;
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
}

.internal-page {
  flex: 1;
  // padding: 5px;
  color: #2c3e50;
  background: transparent;
  overflow-y: auto;
}

.internal-page h1 {
  margin-bottom: 20px;
  color: #3498db;
}

.internal-page p {
  margin-bottom: 15px;
  line-height: 1.6;
}

// 加载状态样式
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
