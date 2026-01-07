<template>
  <div class="tabs-container-box">
    <!-- 左侧下拉菜单按钮 -->
    <div v-if="showDropdownButton" class="dropdown-button" @click="toggleDropdown">
      <!-- 下拉菜单 -->
      <el-popover
        v-model:visible="dropdownVisible"
        placement="bottom"
        :width="260"
        trigger="click"
        popper-class="tabs-dropdown-popover"
      >
        <template #reference>
          <el-icon><ArrowDown /></el-icon>
        </template>
        <div class="tabs-dropdown-menu">
          <div class="dropdown-header">
            <span>所有标签页 ({{ tabs.length }})</span>
          </div>
          <div class="dropdown-tabs-list">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              class="dropdown-tab"
              :class="{ active: activeTabId === tab.id }"
              @click="selectTabFromDropdown(tab.id)"
            >
              <img :src="tab.favicon || defaultIcon" class="dropdown-tab-favicon" alt="favicon" />
              <span class="dropdown-tab-title">{{ tab.title }}</span>
              <div class="dropdown-tab-close" @click.stop="$emit('closeTab', tab.id)">
                <el-icon><Close /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-popover>
    </div>

    <!-- 标签滚动容器 -->
    <div
      ref="scrollContainer"
      class="tabs-scroll-container"
      @dragover="$emit('dragover', $event)"
      @dragend="$emit('dragend', $event)"
    >
      <div class="tabs-container">
        <div
          v-for="tab in visibleTabs"
          :key="tab.id"
          class="tab"
          :class="{ active: activeTabId === tab.id }"
          draggable="true"
          @dragstart="$emit('dragstart', $event, tab)"
          @click="$emit('tabClick', tab.id)"
          @contextmenu="$emit('contextmenu', $event, tab)"
        >
          <img :src="tab.favicon || defaultIcon" class="tab-favicon" alt="favicon" />
          <span class="tab-title">{{ tab.title }}</span>
          <div class="tab-close-box">
            <div class="tab-close" @click="$emit('closeTab', tab.id, $event)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
          <div
            class="tab-loading"
            :style="{ width: tab.loading ? tab.progress + '%' : '0%' }"
          ></div>
        </div>
        <div class="new-tab" @click="$emit('newTab')">
          <el-icon><Plus /></el-icon>
        </div>
        <div
          v-if="dropIndicator.show"
          class="tab-drop-indicator"
          :style="{ left: dropIndicator.left + 'px', width: dropIndicator.width + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import defaultIcon from '@renderer/assets/logo.png'
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { ArrowDown, Close, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  activeTabId: {
    type: Number,
    default: null
  },
  dropIndicator: {
    type: Object,
    default: () => ({ show: false, left: 0, width: 0 })
  }
})

const isMac = ref(false)
const scrollContainer = ref(null)
const dropdownVisible = ref(false)
const showDropdownButton = ref(false)
const maxVisibleTabs = ref(0)

// 计算可见的标签
const visibleTabs = computed(() => {
  if (!showDropdownButton.value) {
    return props.tabs
  }

  // 确保活动标签始终可见
  const activeTabIndex = props.tabs.findIndex((tab) => tab.id === props.activeTabId)
  if (activeTabIndex === -1) {
    return props.tabs.slice(0, maxVisibleTabs.value)
  }

  // 如果活动标签在可见范围内，直接返回前maxVisibleTabs个标签
  if (activeTabIndex < maxVisibleTabs.value) {
    return props.tabs.slice(0, maxVisibleTabs.value)
  }

  // 如果活动标签在可见范围外，确保它可见
  const startIndex = Math.max(0, activeTabIndex - maxVisibleTabs.value + 1)
  return props.tabs.slice(startIndex, startIndex + maxVisibleTabs.value)
})

// 计算最大可见标签数量
const calculateMaxVisibleTabs = () => {
  if (!scrollContainer.value) return

  const container = scrollContainer.value
  const containerWidth = container.clientWidth
  // 计算每个标签的预估宽度（包括边距）
  const estimatedTabWidth = 126 // 标签预估宽度
  const tabMargin = 4 // 标签间距
  const newTabWidth = 32 // 新建标签按钮宽度

  // 计算可以显示的标签数量
  const availableWidth = containerWidth - newTabWidth - 10 // 留出一些边距
  maxVisibleTabs.value = Math.max(1, Math.floor(availableWidth / (estimatedTabWidth + tabMargin)))
  // 检查是否需要显示下拉按钮
  showDropdownButton.value = props.tabs.length > maxVisibleTabs.value
}

// 切换下拉菜单
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

// 从下拉菜单选择标签
const selectTabFromDropdown = (tabId) => {
  dropdownVisible.value = false
  emit('tabClick', tabId)
}

// 监听标签变化
watch(
  () => props.tabs.length,
  () => {
    nextTick(() => {
      calculateMaxVisibleTabs()
    })
  }
)

// 监听窗口大小变化
const handleResize = () => {
  calculateMaxVisibleTabs()
}

onMounted(() => {
  // 使用 Electron 的 process.platform 进行更精确的检测
  if (window.process && window.process.platform) {
    isMac.value = window.process.platform === 'darwin'
  } else {
    // 备用方案：使用 navigator.platform
    isMac.value = navigator.platform.toLowerCase().includes('mac')
  }

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 初始计算
  nextTick(() => {
    calculateMaxVisibleTabs()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const emit = defineEmits([
  'dragover',
  'dragend',
  'dragstart',
  'tabClick',
  'contextmenu',
  'closeTab',
  'newTab'
])
</script>

<style scoped lang="scss">
.tabs-container-box {
  width: calc(100% - 10px);
  padding: 10px 0;
  padding-right: v-bind('isMac ? "0" : "200px"');
  display: flex;
  align-items: center;
  gap: 4px;
  app-region: drag;
  -webkit-app-region: drag;
  overflow: hidden;
  position: relative;
}

.dropdown-button {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  background: var(--primary-bg-color);
  transition: all 0.2s ease;
  app-region: no-drag;

  &:hover {
    background: #fff;
  }

  .el-icon {
    font-size: 14px;
    color: #1a2530;
  }
}

.tabs-scroll-container {
  flex: 1;
  overflow-x: hidden;
  overflow-y: hidden;
  app-region: drag;
}

.tabs-container {
  width: 100%;
  display: flex;
  background: transparent;
  user-select: none;
  min-width: min-content;
  app-region: drag;
  padding: 0 2px;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 120px;
  max-width: 120px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1a2530;
  overflow: hidden;
  flex-shrink: 0;
  app-region: no-drag;
}

.tab.active {
  background: #fff;
  padding-right: 5px;
  .tab-close-box {
    visibility: visible;
  }
}

.tab:hover:not(.active) {
  background: #fff;
  padding-right: 5px;
  .tab-close-box {
    visibility: visible;
  }
}

.tab-favicon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  flex-shrink: 0;
  object-fit: cover;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.tab-close-box {
  flex-shrink: 0;
  visibility: hidden;
}

.tab-close {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.tab-loading {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3498db;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 0%;
  transition: width 0.3s;
}

.new-tab {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 4px;
  line-height: 1;
  font-size: 14px;
  color: #1a2530;
  font-weight: 600;
  transition: background 0.3s;
  background: var(--primary-bg-color);
  app-region: no-drag;
  &:hover {
    background: #fff;
  }
}

.tab-drop-indicator {
  position: absolute;
  height: 3px;
  background: #3498db;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}
.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  font-weight: 600;
  color: #1a2530;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
}

.dropdown-tabs-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
}

.dropdown-tab {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e8f4fd;

    .dropdown-tab-title {
      font-weight: 600;
    }
  }
}

.dropdown-tab-favicon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  flex-shrink: 0;
  object-fit: cover;
}

.dropdown-tab-title {
  flex: 1;
  font-size: 13px;
  color: #1a2530;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-tab-close {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  opacity: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.dropdown-tab:hover .dropdown-tab-close {
  opacity: 1;
}
</style>
<style lang="scss">
.tabs-dropdown-popover {
  transform: translateX(10px);
  padding-top: 5px !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
