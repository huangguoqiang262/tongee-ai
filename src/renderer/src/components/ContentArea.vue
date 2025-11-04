<template>
  <div
    class="content-area"
    :style="{ backgroundColor: props.activeTab?.backgroundColor || '#fff' }"
  >
    <div v-if="!tabs.length" class="empty-state">
      <i class="fas fa-window-maximize"></i>
      <p>没有打开的标签页</p>
    </div>

    <template v-else>
      <div v-if="!activeTabUrlValid" class="internal-page">
        <component :is="internalComponents['NotFound']" />
      </div>

      <div v-else-if="activeTab.isInternal" class="internal-page">
        <template v-for="tab in tabs" :key="tab.id">
          <component
            :is="internalComponents[tab.url]"
            v-bind="tab.attrs || {}"
            v-show="tab.isInternal && isActiveTab(tab.id)"
          />
        </template>
      </div>
      <div v-else class="webview-container">
        <!-- 加载状态覆盖层 -->
        <div v-if="activeTab.loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>加载中... {{ activeTab.progress }}%</p>
        </div>
        <!-- 为每个标签页创建独立的webview -->
        <template v-for="tab in tabs" :key="tab.id">
          <webview
            v-if="!tab.isInternal && tab.url"
            id="webview"
            :key="tab.id"
            :ref="(el) => setWebviewRef(tab.id, el)"
            :src="tab.url"
            allowpopups
            class="webview"
            :style="{
              display: isActiveTab(tab.id) ? 'flex' : 'none',
              width: '100%',
              height: '100%'
            }"
          >
          </webview>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchHome from './SearchHome.vue'
import NotFound from './NotFound.vue'
import AccountSettings from './AccountSettings.vue'
import Square from './Square.vue'
import MessageCenter from './MessageCenter.vue'
import RepositoryStore from './RepositoryStore.vue'
import History from './History.vue'
import Recycled from './Recycled.vue'
import FeedbackCenter from './FeedbackCenter.vue'
import Note from './Note.vue'
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
  Note
}
const isValidInternalUrl = (url) => {
  return Object.keys(internalComponents).includes(url)
}
const webviewRefs = ref(new Map())
const emit = defineEmits([
  'update-tab-info',
  'update-loading-state',
  'update-webview-instance',
  'new-webview'
])

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
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: false,
        progress: 0
      })
    }
  })
  // 页面标题更新
  webview.addEventListener('page-title-updated', (event) => {
    // 只有当该标签页是活动标签时才更新标题
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-tab-info', {
        tabId: tabId,
        title: event.title,
        url: webview.getURL()
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
      const url = webview.getURL()

      emit('update-tab-info', {
        tabId: tabId,
        title: title,
        url: url
      })
    }
  })

  // 加载失败
  webview.addEventListener('did-fail-load', () => {
    // 只有当该标签页是活动标签时才更新加载状态
    if (props.activeTab && props.activeTab.id === tabId) {
      emit('update-loading-state', {
        tabId: tabId,
        loading: false,
        progress: 0
      })
    }
  })

  // 导航事件
  webview.addEventListener('will-navigate', (event) => {
    // 只有当该标签页是活动标签时才更新URL
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
  // 处理新窗口打开事件 - 改为在当前标签页导航
  webview.addEventListener('new-window', (event) => {
    // 在当前标签页导航到目标URL
    emit('new-webview', {
      url: event.detail.url
    })
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
