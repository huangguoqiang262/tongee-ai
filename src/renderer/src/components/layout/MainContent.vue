<template>
  <div class="browser-container">
    <TabBar
      :tabs="tabs"
      :active-tab-id="activeTabId"
      :drop-indicator="dropIndicator"
      @dragover="handleDragOver"
      @dragend="handleDragEnd"
      @dragstart="handleDragStart"
      @tab-click="activateTab"
      @contextmenu="showContextMenu"
      @close-tab="closeTab"
      @new-tab="addNewTab"
    />

    <ToolBar
      v-if="!activeTab?.isInternal"
      :can-go-back="activeTab?.canGoBack"
      :can-go-forward="activeTab?.canGoForward"
      :loading="activeTab?.loading"
      :address-bar-url="addressBarUrl"
      @go-back="goBack"
      @go-forward="goForward"
      @reload="reload"
      @stop="stop"
      @navigate="navigateToUrl"
    />

    <ContentArea
      :tabs="tabs"
      :active-tab="activeTab"
      @update-tab-info="handleUpdateTabInfo"
      @update-loading-state="handleUpdateLoadingState"
      @update-webview-instance="handleUpdateWebviewInstance"
      @new-webview="handleNewWebview"
      @add-syc-tab="addSycTab"
    />

    <ContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @action="handleTabAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { add_web_log } from '@renderer/api/history'
import defaultIcon from '@renderer/assets/logo.png'
const tabs = ref([])
const activeTabId = ref(null)
const draggingTab = ref(null)
const dropIndicator = ref({ show: false, left: 0, width: 0 })
const contextMenu = ref({ show: false, x: 0, y: 0, tabId: null })
const addressBarUrl = ref('')
const webviewInstances = ref(new Map())
// 阻止默认  自定义打开新窗口
const handleNewWebview = (info) => {
  addNewTab({
    url: decodeURIComponent(info.url),
    title: decodeURIComponent(info.url),
    isInternal: false
  })
}
const addSycTab = (data) => {
  add_web_log({ ...data, t: Date.now() })
}
// 计算当前活动标签
const activeTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTabId.value) || null
})

// 获取当前活动标签的webview实例
const activeWebview = computed(() => {
  if (!activeTab.value) return null
  return webviewInstances.value.get(activeTab.value.id)
})

// 添加事件处理函数
const handleUpdateWebviewInstance = (info) => {
  if (info.webview) {
    webviewInstances.value.set(info.tabId, info.webview)
  }
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 更新标签布局
const updateTabLayout = debounce(() => {
  const tabsContainer = document.querySelector('.tabs-container')
  if (!tabsContainer) return

  const containerWidth = tabsContainer.clientWidth
  const tabCount = tabs.value.length
  const minTabWidth = 120
  const maxTabWidth = 240

  // 获取新建标签按钮的实际宽度
  const newTabEl = document.querySelector('.new-tab')
  const newTabWidth = newTabEl ? newTabEl.offsetWidth : 34

  // 计算可用宽度（减去新建标签按钮宽度和边距）
  const availableWidth = containerWidth - newTabWidth - 8

  // 计算每个标签的理想宽度（避免除以0）
  let idealTabWidth =
    tabCount > 0
      ? Math.max(minTabWidth, Math.min(maxTabWidth, availableWidth / tabCount))
      : maxTabWidth

  // 应用宽度到所有标签
  const tabElements = document.querySelectorAll('.tab')
  tabElements.forEach((tab) => {
    tab.style.flexGrow = '1'
    tab.style.flexShrink = '1'
    tab.style.flexBasis = `${idealTabWidth}px`
    tab.style.minWidth = `${minTabWidth}px`
    tab.style.maxWidth = `${maxTabWidth}px`
  })
}, 100)

// 初始化标签
const initTabs = () => {
  const initialTabs = [
    {
      id: 1,
      url: 'SearchHome',
      title: '首页',
      favicon: defaultIcon,
      loading: false,
      progress: 100,
      canGoBack: false,
      canGoForward: false,
      backgroundColor: '#fff',
      isInternal: true,
      attrs: {},
      history: [],
      currentHistoryIndex: -1
    }
  ]
  tabs.value = initialTabs
  activeTabId.value = initialTabs[0].id
  updateAddressBar()
}

// 新建标签
const addNewTab = (config = {}) => {
  var options = Object.assign(
    {
      url: 'SearchHome',
      title: '首页',
      icon: defaultIcon,
      isInternal: true
    },
    // {
    //   url: 'Maintain',
    //   title: '设备保养',
    //   icon: defaultIcon,
    //   isInternal: true
    // },
    config
  )
  const newTab = {
    id: Date.now(),
    url: options.url,
    title: options.title,
    favicon: options.icon,
    loading: options.isInternal ? false : true,
    backgroundColor: options.backgroundColor || '#fff',
    progress: 0,
    canGoBack: false,
    canGoForward: false,
    isInternal: options.isInternal,
    attrs: options.attrs || {},
    history: [],
    currentHistoryIndex: -1
  }

  newTab.isInternal = !/^(https?|ftp|file|mailto|tel):/.test(options.url)
  const index = tabs.value.findIndex((tab) => tab.url === options.url)
  let whiteList = [
    'SearchHome',
    'HomePage',
    'ImageProductionChat',
    'IntelligentWritingChat',
    'ChatPage',
    'DocumentDetail'
  ]
  if (index !== -1 && newTab.isInternal && !whiteList.includes(newTab.url)) {
    tabs.value[index].attrs = newTab.attrs
    activeTabId.value = tabs.value[index].id
    return
  }
  tabs.value.push(newTab)
  activeTabId.value = newTab.id
  updateAddressBar()

  // 更新标签布局
  nextTick(() => {
    updateTabLayout()
    // 滚动到最右侧显示新标签
    const tabsContainer = document.querySelector('.tabs-container')
    if (tabsContainer) {
      tabsContainer.scrollLeft = tabsContainer.scrollWidth
    }
  })

  // 初始化历史记录 - 修复：确保新建标签页时正确初始化历史记录
  if (!newTab.isInternal && newTab.url) {
    newTab.history = [] // 直接初始化为包含当前URL的数组
    newTab.currentHistoryIndex = -1
    // 确保导航按钮状态正确
    newTab.canGoBack = false
    newTab.canGoForward = false
  }
}
//  替换当前活动标签
const replaceActiveTab = (config = {}) => {
  var options = Object.assign(
    {
      url: 'SearchHome',
      title: '首页',
      icon: defaultIcon,
      isInternal: true
    },
    config
  )
  const newTab = {
    id: Date.now(),
    url: options.url,
    title: options.title,
    favicon: options.icon,
    loading: options.isInternal ? false : true,
    backgroundColor: options.backgroundColor || '#fff',
    progress: 0,
    canGoBack: false,
    canGoForward: false,
    isInternal: options.isInternal,
    attrs: options.attrs || {},
    history: [],
    currentHistoryIndex: -1
  }

  newTab.isInternal = !/^(https?|ftp|file|mailto|tel):/.test(options.url)
  const index = tabs.value.findIndex((tab) => tab.id === activeTabId.value)
  if (index !== -1) {
    tabs.value[index] = newTab
    activeTabId.value = newTab.id
  }
  updateAddressBar()

  // 更新标签布局
  nextTick(() => {
    updateTabLayout()
    // 滚动到最右侧显示新标签
    const tabsContainer = document.querySelector('.tabs-container')
    if (tabsContainer) {
      tabsContainer.scrollLeft = tabsContainer.scrollWidth
    }
  })

  // 初始化历史记录 - 修复：确保新建标签页时正确初始化历史记录
  if (!newTab.isInternal && newTab.url) {
    newTab.history = [] // 直接初始化为包含当前URL的数组
    newTab.currentHistoryIndex = -1
    // 确保导航按钮状态正确
    newTab.canGoBack = false
    newTab.canGoForward = false
  }
}
// 监听标签数量变化，自动更新布局
watch(
  () => tabs.value.length,
  () => {
    nextTick(updateTabLayout)
  }
)

// 模拟加载过程
const simulateLoading = (tab) => {
  tab.loading = true
  tab.progress = 10

  const interval = setInterval(() => {
    if (tab.progress < 90) {
      tab.progress += 10
    } else {
      clearInterval(interval)
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId)
        tab.loading = false
        tab.progress = 100
        // 只有当该标签页是活动标签时才设置示例标题
        if (activeTabId.value === tab.id) {
          tab.title = 'Example Website'
          tab.favicon =
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iIzYxNjE2MSIgZD0iTTggMGM0LjQxIDAgOCAzLjU5IDggOHMtMy41OSA4LTggOC04LTMuNTktOC04IDMuNTktOCA4LTh6bTAgMTQuNWMzLjU5IDAgNi41LTIuOTEgNi41LTYuNVMxMS41OSAxLjUgOCAxLjVTMS41IDQuNDEgMS41IDhzMi45MSA2LjUgNi41IDYuNXoiLz48L3N2Zz4='
        }
        // 修复：加载完成后更新导航按钮状态
        updateNavigationButtons()
      }, 500)
    }
  }, 100)
}

// 关闭标签
const closeTab = (tabId, e) => {
  if (e) e.stopPropagation()

  const index = tabs.value.findIndex((tab) => tab.id === tabId)
  if (index === -1) return

  // 如果关闭的是当前活动标签，需要激活另一个标签
  if (activeTabId.value === tabId) {
    if (tabs.value.length > 1) {
      // 优先激活右侧标签，如果没有则激活左侧
      activeTabId.value = tabs.value[index + 1]?.id || tabs.value[index - 1]?.id
    }
  }

  tabs.value.splice(index, 1)

  // 如果关闭了所有标签，创建一个新标签
  if (tabs.value.length === 0) {
    addNewTab()
  }

  updateAddressBar()
}

// 激活标签
const activateTab = (tabId) => {
  activeTabId.value = tabId
  updateAddressBar()
}

// 更新地址栏
const updateAddressBar = () => {
  if (activeTab.value) {
    addressBarUrl.value = activeTab.value.url
  } else {
    addressBarUrl.value = ''
  }
}

// 导航到地址
const navigateToUrl = (uri) => {
  if (!activeTab.value) return

  const url = uri.trim()
  if (!url) return

  // 立即设置加载状态
  activeTab.value.loading = true
  activeTab.value.progress = 10

  // 判断是否是内部链接
  if (!/^(https?|ftp|file|mailto|tel):/.test(url)) {
    activeTab.value.url = url
    activeTab.value.isInternal = true
    activeTab.value.title = 'Internal Page'
    activeTab.value.favicon =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iIzQyODVGOCIgZD0iTTggMGM0LjQxIDAgOCAzLjU5IDggOHMt3.59IDgtOCA4LTgtMy41OS04LTggMy.59LTggOC04em0wIDE0LjVjMy41OSAwIDYuNS0yLjkxIDYuNS02LjVTMTEuNTkgMS41IDggMS41UzEuNSA0LjQxIDEuNSA4czIuOTEgNi41IDYuNSA2LjV6Ii8+PC9zdmc+'
    // 内部页面立即完成加载
    setTimeout(() => {
      activeTab.value.loading = false
      activeTab.value.progress = 100
    }, 100)

    // 清空外部链接的历史记录
    activeTab.value.history = []
    activeTab.value.currentHistoryIndex = -1
  } else {
    // 外部链接处理 - 让webview自己处理导航
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url
    }

    // 确保从内部页面切换到外部链接时正确设置isInternal为false
    activeTab.value.isInternal = false

    // 立即更新URL显示在地址栏
    activeTab.value.url = finalUrl
    addressBarUrl.value = finalUrl // 确保地址栏也立即更新

    // 添加到历史记录 - 像浏览器一样管理历史记录
    if (activeTab.value.history.length === 0) {
      // 第一次导航
      activeTab.value.history.push(finalUrl)
      activeTab.value.currentHistoryIndex = 0
    } else {
      // 如果当前不是历史记录的最后一项，截断后面的历史（像浏览器一样）
      if (activeTab.value.currentHistoryIndex < activeTab.value.history.length - 1) {
        activeTab.value.history = activeTab.value.history.slice(
          0,
          activeTab.value.currentHistoryIndex + 1
        )
      }
      // 添加新URL到历史记录
      activeTab.value.history.push(finalUrl)
      activeTab.value.currentHistoryIndex = activeTab.value.history.length - 1
    }

    // 更新导航按钮状态
    updateNavigationButtons()

    // 让webview处理实际的导航
    const webview = activeWebview.value
    if (webview && webview.loadURL) {
      webview.loadURL(finalUrl)
    } else {
      // 如果没有webview实例，模拟加载过程
      simulateLoading(activeTab.value)
    }
    // 如果没有webview实例，URL已经在上方设置过了
  }
}

const handleUpdateTabInfo = (info) => {
  const tab = tabs.value.find((t) => t.id === info.tabId)
  if (tab) {
    if (info.title) tab.title = info.title
    if (info.url) {
      tab.url = info.url

      // 如果是外部链接且不是内部页面，更新历史记录
      if (!tab.isInternal && info.url.startsWith('http')) {
        // 只有当URL不在历史记录中，或者不在当前位置时才认为是新导航
        // 这样可以避免前进后退操作被误认为是新导航
        const isNewNavigation = !tab.history.includes(info.url)

        if (isNewNavigation) {
          // 如果当前不是历史记录的最后一项，截断后面的历史
          if (tab.currentHistoryIndex < tab.history.length - 1) {
            tab.history = tab.history.slice(0, tab.currentHistoryIndex + 1)
          }
          tab.history.push(info.url)
          tab.currentHistoryIndex = tab.history.length - 1
        } else {
          // 如果是前进后退操作，更新当前位置
          const historyIndex = tab.history.indexOf(info.url)
          if (historyIndex !== -1) {
            tab.currentHistoryIndex = historyIndex
          }
        }
        // 更新导航按钮状态
        updateNavigationButtons()
      }

      // 修复：确保地址栏同步更新
      if (tab.id === activeTabId.value) {
        addressBarUrl.value = info.url
      }
    }
    if (info.favicon) tab.favicon = info.favicon
  }
}

const handleUpdateLoadingState = (state) => {
  const tab = tabs.value.find((t) => t.id === state.tabId)
  if (tab) {
    tab.loading = state.loading
    tab.progress = state.progress
    // 加载完成时更新导航按钮状态
    if (!state.loading) {
      updateNavigationButtons()
    }
  }
}

// 更新导航按钮状态
const updateNavigationButtons = () => {
  if (!activeTab.value) return

  if (activeTab.value.isInternal) {
    activeTab.value.canGoBack = false
    activeTab.value.canGoForward = false
    return
  }

  activeTab.value.canGoBack = activeTab.value.currentHistoryIndex > 0
  activeTab.value.canGoForward =
    activeTab.value.currentHistoryIndex < activeTab.value.history.length - 1
}

// 导航按钮功能
const goBack = () => {
  if (!activeTab.value || !activeTab.value.canGoBack) return

  // 实际调用webview的导航方法
  const webview = activeWebview.value
  if (webview && webview.goBack) {
    webview.goBack()
  } else {
    // 如果没有webview实例，使用历史记录
    if (activeTab.value.currentHistoryIndex > 0) {
      activeTab.value.currentHistoryIndex--
      const prevUrl = activeTab.value.history[activeTab.value.currentHistoryIndex]
      activeTab.value.url = prevUrl
      activeTab.value.loading = true
      activeTab.value.progress = 10
      // 更新地址栏 - 修复：确保地址栏同步更新
      addressBarUrl.value = prevUrl
    }
  }

  // 更新导航按钮状态
  updateNavigationButtons()
}

const goForward = () => {
  if (!activeTab.value || !activeTab.value.canGoForward) return

  // 实际调用webview的导航方法
  const webview = activeWebview.value
  if (webview && webview.goForward) {
    webview.goForward()
  } else {
    // 如果没有webview实例，使用历史记录
    if (activeTab.value.currentHistoryIndex < activeTab.value.history.length - 1) {
      activeTab.value.currentHistoryIndex++
      const nextUrl = activeTab.value.history[activeTab.value.currentHistoryIndex]
      activeTab.value.url = nextUrl
      activeTab.value.loading = true
      activeTab.value.progress = 10
      // 更新地址栏 - 修复：确保地址栏同步更新
      addressBarUrl.value = nextUrl
    }
  }

  // 更新导航按钮状态
  updateNavigationButtons()
}
const reload = () => {
  if (!activeTab.value || activeTab.value.isInternal) return

  if (activeWebview.value) {
    // 使用webview的原生reload方法
    activeWebview.value.reload()
  } else {
    // 备用方案：通过URL重置的方式
    activeTab.value.loading = true
    activeTab.value.progress = 10
    const currentUrl = activeTab.value.url
    activeTab.value.url = ''
    nextTick(() => {
      activeTab.value.url = currentUrl
    })
  }
}

const stop = () => {
  if (!activeTab.value) return

  if (activeWebview.value && activeWebview.value.stop) {
    // 使用webview的原生stop方法
    activeWebview.value.stop()
  } else {
    // 备用方案：直接设置加载状态为false
    activeTab.value.loading = false
    activeTab.value.progress = 0
  }

  // 更新导航按钮状态
  updateNavigationButtons()
}

// 拖拽相关函数
const handleDragStart = (e, tab) => {
  draggingTab.value = tab
  e.dataTransfer.effectAllowed = 'move'
  setTimeout(() => {
    e.target.classList.add('dragging')
  }, 0)
}

const handleDragOver = (e) => {
  e.preventDefault()
  if (!draggingTab.value) return

  const tabsEl = e.currentTarget
  const tabsRect = tabsEl.getBoundingClientRect()
  const mouseX = e.clientX - tabsRect.left

  // 找到放置位置
  const tabEls = Array.from(tabsEl.querySelectorAll('.tab:not(.dragging)'))
  let nextTab = null

  for (const tabEl of tabEls) {
    const rect = tabEl.getBoundingClientRect()
    const offsetLeft = rect.left - tabsRect.left

    if (mouseX < offsetLeft + rect.width / 2) {
      nextTab = tabEl
      break
    }
  }

  // 显示放置指示器
  if (nextTab) {
    const rect = nextTab.getBoundingClientRect()
    dropIndicator.value = {
      show: true,
      left: rect.left - tabsRect.left,
      width: 2
    }
  } else {
    // 放在最后
    dropIndicator.value = {
      show: true,
      left: tabsRect.width - 2,
      width: 2
    }
  }
}

const handleDragEnd = (e) => {
  e.preventDefault()
  if (!draggingTab.value) return

  const tabsEl = e.currentTarget
  const tabsRect = tabsEl.getBoundingClientRect()
  const mouseX = e.clientX - tabsRect.left

  // 移除拖拽样式
  e.target.classList.remove('dragging')

  // 找到放置位置
  const tabEls = Array.from(tabsEl.querySelectorAll('.tab:not(.dragging)'))
  let newIndex = -1

  for (let i = 0; i < tabEls.length; i++) {
    const tabEl = tabEls[i]
    const rect = tabEl.getBoundingClientRect()
    const offsetLeft = rect.left - tabsRect.left

    if (mouseX < offsetLeft + rect.width / 2) {
      newIndex = i
      break
    }
  }

  if (newIndex === -1) {
    newIndex = tabs.value.length
  }

  // 重新排序标签
  const currentIndex = tabs.value.findIndex((tab) => tab.id === draggingTab.value.id)
  if (currentIndex !== newIndex) {
    const tab = tabs.value[currentIndex]
    tabs.value.splice(currentIndex, 1)
    tabs.value.splice(newIndex, 0, tab)
  }

  // 隐藏指示器
  dropIndicator.value = { show: false, left: 0, width: 0 }
  draggingTab.value = null
}

// 右键菜单相关函数
const showContextMenu = (e, tab) => {
  e.preventDefault()
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    tabId: tab.id
  }
}

const handleTabAction = (action) => {
  const tabId = contextMenu.value.tabId

  switch (action) {
    case 'new':
      addNewTab()
      break
    case 'reload':
      reload()
      break
    case 'duplicate': {
      const tabToDuplicate = tabs.value.find((tab) => tab.id === tabId)
      if (tabToDuplicate) {
        addNewTab(tabToDuplicate)
      }
      break
    }
    case 'close':
      closeTab(tabId)
      break
    case 'close-others':
      tabs.value = tabs.value.filter((tab) => tab.id === tabId)
      break
    case 'close-right': {
      const index = tabs.value.findIndex((tab) => tab.id === tabId)
      tabs.value = tabs.value.slice(0, index + 1)
      break
    }
    case 'close-all':
      tabs.value = []
      addNewTab()
      break
  }

  contextMenu.value.show = false
}

// 点击其他地方隐藏右键菜单
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}

// 初始化
onMounted(() => {
  initTabs()

  // 监听窗口大小变化，更新标签布局
  window.addEventListener('resize', updateTabLayout)

  // 初始更新标签布局
  nextTick(() => {
    updateTabLayout()
  })

  document.addEventListener('click', hideContextMenu)
})
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})
defineExpose({
  addNewTab,
  replaceActiveTab,
  handleTabAction
})
</script>

<style scoped>
/* 只保留浏览器容器的样式 */
.browser-container {
  width: 100%;
  height: 100%;
  background: transparent;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
