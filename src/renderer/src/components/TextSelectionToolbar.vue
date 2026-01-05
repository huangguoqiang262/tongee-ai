<template>
  <div v-if="showToolbar" ref="toolbarRef" :style="toolbarStyle" class="text-selection-toolbar">
    <button class="toolbar-btn" title="AI解读" @click="handleAI">
      <img class="btn-icon" src="@renderer/assets/settings/unscramble-icon.png" alt="" />
      <span class="btn-text">AI解读</span>
    </button>
    <button class="toolbar-btn" title="搜索" @click="handleTranslate">
      <img class="btn-icon" src="@renderer/assets/settings/translate-icon.png" alt="" />
      <span class="btn-text">翻译</span>
    </button>
    <button class="toolbar-btn" title="笔记本" @click="handleNotebook">
      <img class="btn-icon" src="@renderer/assets/settings/notebook-icon.png" alt="" />
      <span class="btn-text">笔记本</span>
    </button>
    <button class="toolbar-btn" title="复制" @click="handleCopy">
      <img class="btn-icon" src="@renderer/assets/settings/copy-icon.png" alt="" />
      <span class="btn-text">复制</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useToolBarStore } from '@renderer/stores/user'
// 工具栏状态和位置
const showToolbar = ref(false)
const position = ref({ x: 0, y: 0 })
const selectedText = ref('')
const toolbarRef = ref(null)
const isSpaceLimited = ref(false)

// 工具栏样式计算
const toolbarStyle = computed(() => ({
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  display: showToolbar.value ? 'flex' : 'none',
  transform: 'translateX(-50%)',
  transition: 'opacity 0.2s ease, transform 0.2s ease'
}))

// 实时获取工具栏尺寸
const getToolbarDimensions = () => {
  if (!toolbarRef.value) return { width: 234, height: 40 }

  const rect = toolbarRef.value.getBoundingClientRect()
  return {
    width: rect.width || 234,
    height: rect.height || 40
  }
}

// 防抖函数
const debounce = (func, delay = 100) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// 边界检查和调整 - 返回调整后的位置和是否进行了水平调整
const adjustBoundary = (targetX, targetY, toolbarWidth, toolbarHeight) => {
  const margin = 10
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 检查空间是否足够显示所有按钮
  const availableSpace = windowWidth - margin * 2
  isSpaceLimited.value = toolbarWidth > availableSpace

  let isHorizontalAdjusted = false
  let isVerticalAdjusted = false

  // 水平边界检查
  if (targetX - toolbarWidth / 2 < margin) {
    targetX = margin + toolbarWidth / 2
    isHorizontalAdjusted = true
  } else if (targetX + toolbarWidth / 2 > windowWidth - margin) {
    targetX = windowWidth - margin - toolbarWidth / 2
    isHorizontalAdjusted = true
  }

  // 垂直边界检查
  if (targetY < margin) {
    targetY = margin
    isVerticalAdjusted = true
  } else if (targetY + toolbarHeight > windowHeight - margin) {
    targetY = windowHeight - margin - toolbarHeight
    isVerticalAdjusted = true
  }
  return {
    position: { x: targetX, y: targetY },
    isHorizontalAdjusted: isHorizontalAdjusted,
    isVerticalAdjusted: isVerticalAdjusted
  }
}

// 计算工具栏位置 - 智能定位版
const calculatePosition = async (selectionRect) => {
  await nextTick()

  // 获取实时尺寸
  const { width: toolbarWidth, height: toolbarHeight } = getToolbarDimensions()
  const selectionWidth = selectionRect.width
  // 基础位置 - 默认居中
  let baseX = selectionRect.left + selectionWidth / 2
  let baseY = selectionRect.top - toolbarHeight - 10

  // 先进行边界调整，获取调整结果
  const boundaryResult = adjustBoundary(baseX, baseY, toolbarWidth, toolbarHeight)
  const { position: adjustedPosition, isHorizontalAdjusted } = boundaryResult

  // 应用新的定位策略（仅在未触发水平边界调整时）
  if (!isHorizontalAdjusted) {
    if (selectionWidth > toolbarWidth) {
      // 1. 选中文本宽度大于工具栏宽度 - 水平居中
      adjustedPosition.x = selectionRect.left + selectionWidth / 2
    } else {
      // 2. 选中文本宽度小于等于工具栏宽度 - 以选择开始位置为基准
      adjustedPosition.x = selectionRect.left + toolbarWidth / 2 // 以开始位置为基准并居中工具栏
    }
  } else {
    // console.log('已触发水平边界调整，使用边界调整后位置')
  }

  return adjustedPosition
}

// 处理文本选择
const handleSelection = debounce(async () => {
  if (!useToolBarStore().toolbarShow) {
    showToolbar.value = false
    return
  }
  try {
    const selection = window.getSelection()
    if (!selection || !selection.toString().trim()) {
      showToolbar.value = false
      return
    }

    // 检查选择是否涉及input/textarea
    const range = selection.getRangeAt(0)
    const startContainer = range.startContainer
    const endContainer = range.endContainer

    // 检查选择是否在input/textarea内
    const isSelectionInInput = () => {
      // 检查开始容器是否在input/textarea内
      let startNode = startContainer
      while (startNode && startNode.nodeType !== Node.ELEMENT_NODE) {
        startNode = startNode.parentElement
      }

      if (startNode) {
        const startInputElement = startNode.closest('input, textarea')
        if (startInputElement) {
          return true
        }
      }

      // 检查结束容器是否在input/textarea内
      let endNode = endContainer
      while (endNode && endNode.nodeType !== Node.ELEMENT_NODE) {
        endNode = endNode.parentElement
      }

      if (endNode) {
        const endInputElement = endNode.closest('input, textarea')
        if (endInputElement) {
          return true
        }
      }

      return false
    }

    // 如果选择涉及input/textarea，不显示工具栏
    if (isSelectionInInput()) {
      showToolbar.value = false
      return
    }

    // 检查工具栏是否包含当前活动元素
    const activeElement = document.activeElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      showToolbar.value = false
      return
    }

    // 新增：检查选中文本的祖先级或父级是否有disabled-tools-chat类
    const hasDisabledToolsChat = () => {
      // 检查开始容器的祖先级
      let currentNode = startContainer
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          if (currentNode.classList && currentNode.classList.contains('disabled-tools-chat')) {
            return true
          }
        }
        currentNode = currentNode.parentElement
      }

      // 检查结束容器的祖先级
      currentNode = endContainer
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          if (currentNode.classList && currentNode.classList.contains('disabled-tools-chat')) {
            return true
          }
        }
        currentNode = currentNode.parentElement
      }

      // 检查选中范围的共同祖先容器
      const commonAncestor = range.commonAncestorContainer
      currentNode = commonAncestor
      while (currentNode) {
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          if (currentNode.classList && currentNode.classList.contains('disabled-tools-chat')) {
            return true
          }
        }
        currentNode = currentNode.parentElement
      }

      return false
    }

    // 如果选中文本的祖先级有disabled-tools-chat类，不显示工具栏
    if (hasDisabledToolsChat()) {
      showToolbar.value = false
      return
    }

    selectedText.value = selection.toString().trim()

    // 获取选中文本的位置信息
    const rect = range.getBoundingClientRect()
    // 计算并设置工具栏位置
    position.value = await calculatePosition(rect)
    showToolbar.value = true
  } catch (error) {
    console.error('处理文本选择时出错:', error)
    showToolbar.value = false
  }
})

// 工具栏按钮事件
const handleTranslate = () => {
  console.log('翻译文本:', selectedText.value)
}

const handleNotebook = () => {
  console.log('笔记本文本:', selectedText.value)
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(selectedText.value)
    // eslint-disable-next-line no-undef
    ElMessage.primary('文本已复制到剪贴板')
    console.log('文本已复制到剪贴板')
  } catch (error) {
    console.error('复制文本失败:', error)
  }
}

const handleAI = () => {
  console.log('AI分析文本:', selectedText.value)
}

// 事件监听
onMounted(() => {
  document.addEventListener('selectionchange', handleSelection, true)
  document.addEventListener('mousedown', (e) => {
    if (toolbarRef.value && !toolbarRef.value.contains(e.target)) {
      showToolbar.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleSelection)
  document.removeEventListener('mousedown', () => (showToolbar.value = false))
})
</script>

<style scoped lang="scss">
.text-selection-toolbar {
  --toolbar-bg: #fff;
  --toolbar-btn-bg: #fff;
  --toolbar-btn-hover: #f8f8f8;
  --spacing: 6px;

  position: fixed;
  background: var(--toolbar-bg);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 20px 8px rgba(0, 0, 0, 0.07);
  border-radius: 8px;
  z-index: 9999;

  display: flex;
  gap: var(--spacing);
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;
}

/* 滚动条样式优化 */
.text-selection-toolbar::-webkit-scrollbar {
  height: 4px;
}

.text-selection-toolbar::-webkit-scrollbar-track {
  background: transparent;
}

.text-selection-toolbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* 工具栏箭头 */
.text-selection-toolbar::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
}

/* 上方显示时箭头朝下 */
.text-selection-toolbar:not(.bottom-boundary)::after {
  top: 100%;
  border-color: var(--toolbar-bg) transparent transparent transparent;
}

/* 下方显示时箭头朝上 */
.text-selection-toolbar.bottom-boundary::after {
  bottom: 100%;
  border-color: transparent transparent var(--toolbar-bg) transparent;
}

/* 按钮样式 */
.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--toolbar-btn-bg);
  border: none;
  border-radius: 6px;
  color: var(--default-font-color);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
  .btn-icon {
    margin-right: 4px;
    width: 16px;
    height: 16px;
  }
}

/* 空间不足时减小按钮尺寸 */
.text-selection-toolbar.space-limited .toolbar-btn {
  padding: 4px 8px;
  font-size: 11px;
  gap: 2px;
}

.toolbar-btn:hover {
  background: var(--toolbar-btn-hover);
}

.toolbar-btn .el-icon {
  font-size: 14px;
}

/* 小屏幕适配 */
@media (max-width: 320px) {
  .text-selection-toolbar {
    --spacing: 4px;
    padding: 4px;
  }

  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 4px;
    border-radius: 4px;
  }
}
</style>
