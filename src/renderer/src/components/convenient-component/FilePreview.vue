<template>
  <div class="file-preview">
    <!-- 图片预览 -->
    <div
      v-if="isImage"
      class="file-preview-img-container"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <img
        :src="fileUrl"
        class="file-preview-img"
        :style="imageStyle"
        alt="预览图片"
        draggable="false"
        @load="handleImageLoad"
      />

      <!-- 图片控制工具栏 -->
      <div class="image-controls">
        <button class="control-btn" title="放大" @click="zoomIn">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </button>
        <button class="control-btn" title="缩小" @click="zoomOut">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M19 13H5v-2h14v2z" fill="currentColor" />
          </svg>
        </button>
        <button class="control-btn" title="重置" @click="resetView">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button class="control-btn" title="全屏" @click="toggleFullscreen">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div class="zoom-info">{{ Math.round(scale * 100) }}%</div>
      </div>
    </div>

    <!-- PDF 预览 -->
    <webview v-else-if="isPdf" :src="fileUrl" class="file-preview-iframe"></webview>

    <!-- 文本预览（txt） -->
    <pre v-else-if="isTxt" class="file-preview-txt">
正在加载文本内容...
    </pre>

    <!-- Office 文档在线预览（需要公网可访问的URL） -->
    <webview v-else-if="isOffice" :src="officePreviewUrl" class="file-preview-iframe"></webview>
    <!-- 网页 -->
    <webview v-else-if="isWebUrl" :src="fileUrl" class="file-preview-iframe"></webview>
    <!-- 其他类型：仅提供打开/下载 -->
    <div v-else class="file-preview-unsupported">
      <p>暂不支持该类型的在线预览。</p>
      <a :href="fileUrl" target="_blank" rel="noopener noreferrer"> 点击打开/下载文件 </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    default: ''
  }
})

/** 获取后缀名（不带点，小写） */
const ext = computed(() => {
  const url = props.fileUrl || ''
  const name = props.fileName || ''

  const fromName = name.split('?')[0].split('#')[0]
  const fromUrl = url.split('?')[0].split('#')[0]

  const full = fromName || fromUrl
  const idx = full.lastIndexOf('.')
  if (idx === -1) return ''
  return full.slice(idx + 1).toLowerCase()
})

const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext.value))

const isPdf = computed(() => ext.value === 'pdf')

const isTxt = computed(() => ext.value === 'txt')

const isOffice = computed(() => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext.value))
const isWebUrl = computed(() => props.fileUrl.startsWith('http'))
/**
 * 使用 Microsoft Office 在线预览
 * 文档要求是公网可访问的 URL
 */
const officePreviewUrl = computed(() => {
  if (!isOffice.value) return ''
  const encoded = encodeURIComponent(props.fileUrl)
  return `https://view.officeapps.live.com/op/view.aspx?src=${encoded}`
})

// 图片预览相关状态
const scale = ref(1) // 缩放比例
const position = reactive({ x: 0, y: 0 }) // 图片位置
const isDragging = ref(false) // 是否正在拖拽
const dragStart = reactive({ x: 0, y: 0 }) // 拖拽起始位置
const imageSize = reactive({ width: 0, height: 0 }) // 图片原始尺寸
const containerSize = reactive({ width: 0, height: 0 }) // 容器尺寸

// 图片样式
const imageStyle = computed(() => ({
  transform: `translate(${position.x}px, ${position.y}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  transition: isDragging.value ? 'none' : 'transform 0.2s ease'
}))

// 缩放限制
const MIN_SCALE = 0.1
const MAX_SCALE = 5

// 处理图片加载
const handleImageLoad = (event) => {
  const img = event.target
  imageSize.width = img.naturalWidth
  imageSize.height = img.naturalHeight
  updateContainerSize()
  resetView()
}

// 更新容器尺寸
const updateContainerSize = () => {
  const container = document.querySelector('.file-preview-img-container')
  if (container) {
    containerSize.width = container.clientWidth
    containerSize.height = container.clientHeight
  }
}

// 重置视图
const resetView = () => {
  scale.value = 1
  position.x = 0
  position.y = 0
}

// 放大
const zoomIn = () => {
  const newScale = Math.min(scale.value * 1.2, MAX_SCALE)
  scale.value = newScale
  constrainPosition()
}

// 缩小
const zoomOut = () => {
  const newScale = Math.max(scale.value / 1.2, MIN_SCALE)
  scale.value = newScale
  constrainPosition()
}

// 鼠标滚轮缩放
const handleWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(MIN_SCALE, Math.min(scale.value + delta, MAX_SCALE))

  // 以鼠标位置为中心缩放
  const rect = event.currentTarget.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const scaleChange = newScale / scale.value
  position.x = mouseX - (mouseX - position.x) * scaleChange
  position.y = mouseY - (mouseY - position.y) * scaleChange

  scale.value = newScale
  constrainPosition()
}

// 限制图片位置，防止拖拽超出边界
const constrainPosition = () => {
  const scaledWidth = imageSize.width * scale.value
  const scaledHeight = imageSize.height * scale.value

  const maxX = Math.max(0, (scaledWidth - containerSize.width) / 2)
  const maxY = Math.max(0, (scaledHeight - containerSize.height) / 2)

  position.x = Math.max(-maxX, Math.min(maxX, position.x))
  position.y = Math.max(-maxY, Math.min(maxY, position.y))
}

// 鼠标按下
const handleMouseDown = (event) => {
  if (event.button !== 0) return // 只处理左键
  isDragging.value = true
  dragStart.x = event.clientX - position.x
  dragStart.y = event.clientY - position.y
  event.preventDefault()
}

// 鼠标移动
const handleMouseMove = (event) => {
  if (!isDragging.value) return
  position.x = event.clientX - dragStart.x
  position.y = event.clientY - dragStart.y
  constrainPosition()
}

// 鼠标释放
const handleMouseUp = () => {
  isDragging.value = false
}

// 全屏切换
const toggleFullscreen = () => {
  const container = document.querySelector('.file-preview-img-container')
  if (!container) return

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.error('无法进入全屏模式:', err)
    })
  } else {
    document.exitFullscreen()
  }
}

// 监听窗口大小变化
const handleResize = () => {
  updateContainerSize()
  constrainPosition()
}

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 图片预览容器 */
.file-preview-img-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: grab;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-preview-img-container:active {
  cursor: grabbing;
}

.file-preview-img {
  max-width: none;
  max-height: none;
  user-select: none;
  pointer-events: none;
}

/* 图片控制工具栏 */
.image-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 8px 12px;
  border-radius: 8px;
  z-index: 10;
}

.control-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

.zoom-info {
  color: #fff;
  font-size: 12px;
  padding: 0 8px;
  min-width: 50px;
  text-align: center;
}

.file-preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.file-preview-txt {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
  white-space: pre-wrap;
  overflow: auto;
  font-family: Consolas, Menlo, monospace;
  background: #fafafa;
}

.file-preview-unsupported {
  text-align: center;
  color: #666;
}

.file-preview-unsupported a {
  color: #409eff;
}

/* 全屏模式样式 */
:deep(.file-preview-img-container:fullscreen) {
  background: #000;
}

:deep(.file-preview-img-container:fullscreen .image-controls) {
  bottom: 30px;
}
</style>
