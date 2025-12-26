<template>
  <div class="tabs-container-box">
    <div
      class="tabs-container"
      @dragover="$emit('dragover', $event)"
      @dragend="$emit('dragend', $event)"
    >
      <div
        v-for="tab in tabs"
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
        <div class="tab-loading" :style="{ width: tab.loading ? tab.progress + '%' : '0%' }"></div>
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
</template>

<script setup>
import defaultIcon from '@renderer/assets/logo.png'
import { ref, onMounted } from 'vue'
defineProps({
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
onMounted(() => {
  // 使用 Electron 的 process.platform 进行更精确的检测
  if (window.process && window.process.platform) {
    isMac.value = window.process.platform === 'darwin'
  } else {
    // 备用方案：使用 navigator.platform
    isMac.value = navigator.platform.toLowerCase().includes('mac')
  }
})
defineEmits(['dragover', 'dragend', 'dragstart', 'tabClick', 'contextmenu', 'closeTab', 'newTab'])
</script>

<style scoped lang="scss">
.tabs-container-box {
  width: calc(100% - 10px);
  padding: 10px 0;
  padding-right: v-bind('isMac ? "0" : "200px"');
  display: flex;
  app-region: drag;
  -webkit-app-region: drag;
  overflow: hidden;
}
.tabs-container {
  display: flex;
  background: transparent;
  user-select: none;
  overflow-x: hidden;
  min-width: 0;
  /* flex: 1; */
  app-region: no-drag;
}

.tabs-container::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 120px;
  max-width: 180px;
  height: 32px;
  padding: 0 12px;
  // background: var(--primary-bg-color);
  border-radius: 8px;
  margin-right: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1a2530;
  overflow: hidden;
}

.tab.active {
  background: #fff;
  .tab-close-box {
    visibility: visible;
  }
}

.tab:hover:not(.active) {
  background: #fff;
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
  margin-left: 4px;
  flex-shrink: 0;
  font-size: 12px;
  transition: background 0.2s;
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
}

.new-tab:hover {
  background: #fff;
}
.tab-drop-indicator {
  position: absolute;
  height: 3px;
  background: #3498db;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}
</style>
