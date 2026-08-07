<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="onlyoffice-preview" :style="{ height, width }">
    <DocumentEditor v-if="fileKey && !isImage && config.token" :id="onlyofficePreviewId"
      :document-server-url="serverUrl" :config="config" :events_onAppReady="onAppReady"
      :events_onDocumentReady="onDocumentReady" :events_onDocumentSave="onDocumentSave"
      :events_onError="onError" :events_onWarning="onWarning"
      v-bind="$attrs"/>
    <!-- 图片预览 -->
    <div v-if="isImage" ref="imgContainer" class="file-preview-img-container" @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp">
      <img v-if="!loading" :src="props.src" class="file-preview-img" :style="imageStyle" alt="预览图片" draggable="false"
        @load="handleImageLoad" />

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
              fill="currentColor" />
          </svg>
        </button>
        <button class="control-btn" title="全屏" @click="toggleFullscreen">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
              fill="currentColor" />
          </svg>
        </button>
        <div class="zoom-info">{{ Math.round(scale * 100) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Buffer } from 'buffer'
import cloneDeep from 'lodash.clonedeep'
import { ref, reactive, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { DocumentEditor } from '@onlyoffice/document-editor-vue'
import { useUserInfo } from '@renderer/hooks/checkLogin'
import { getEditKey } from '@renderer/api/repository'
// 历史版本接口
import { getOfficeVersionList, getOfficeVersionData } from '@renderer/api/repository'
const userInfo = useUserInfo()
const serverUrl = ref(import.meta.env.VITE_API_BASE_ONLYOFFICE_URL)
const props = defineProps({
  // 文档访问 URL（建议用局域网可访问的 http(s) 链接，例如: http://192.168.1.187:3000/files/example.docx）
  src: { type: String, required: true },
  // 视图模式: 'view' 或 'edit'（edit 需要文档服务器允许保存并配置回调接口）
  mode: { type: String, default: 'view' },
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  fileKey: { type: String, default: '' },
  fileName: { type: String, default: '' },
  download: { type: Boolean, default: false },
})
let onlyofficePreviewId = ref('onlyoffice-preview-' + Math.random().toString(36).substr(2, 9))
let imgContainer = ref(null)
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const fileExt = computed(() => {
  if (!props.src) return ''
  const m = props.src.split('?')[0].split('/').pop()
  return m && m.includes('.') ? m.split('.').pop().toLowerCase() : ''
})
const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileExt.value))
function docType(ext) {
  if (
    [
      'doc',
      'docm',
      'docx',
      'dot',
      'dotm',
      'dotx',
      'epub',
      'fb2',
      'fodt',
      'htm',
      'html',
      'mht',
      'mhtml',
      'odt',
      'ott',
      'pages',
      'rtf',
      'stw',
      'sxw',
      'txt',
      'wps',
      'wpt',
      'xml'
    ].includes(ext)
  )
    return 'word'
  if (
    [
      'csv',
      'et',
      'ett',
      'fods',
      'numbers',
      'ods',
      'ots',
      'sxc',
      'xls',
      'xlsb',
      'xlsm',
      'xlsx',
      'xlt',
      'xltm',
      'xltx',
      'xml'
    ].includes(ext)
  )
    return 'cell'
  if (
    [
      'dps',
      'dpt',
      'fodp',
      'key',
      'odp',
      'otp',
      'pot',
      'potm',
      'potx',
      'pps',
      'ppsm',
      'ppsx',
      'ppt',
      'pptm',
      'pptx',
      'sxi'
    ].includes(ext)
  )
    return 'slide'
  if (['djvu', 'docxf', 'oform', 'oxps', 'pdf', 'xps'].includes(ext)) return 'pdf'
  if (['vsdm', 'vsdx', 'vssm', 'vssx', 'vstm', 'vstx'].includes(ext)) return 'diagram'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'diagram'
  // 默认使用文本类型（OnlyOffice 会根据后缀解析）
  return 'word'
}
let onlyofficeSecret = 'my_jwt_secret'
// 生成jwt
const createJWT = async (json, secret) => {
  if (!secret) return null
  let header = {
    typ: 'JWT',
    alg: 'HS256'
  }

  let base64EncodeURL = function (str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  let encodedHeader = base64EncodeURL(JSON.stringify(header))
  let encodedPayload = base64EncodeURL(JSON.stringify(json))
  let encoder = new TextEncoder()
  let algorithm = { name: 'HMAC', hash: 'SHA-256' }
  let key = await crypto.subtle.importKey('raw', encoder.encode(secret), algorithm, false, [
    'sign',
    'verify'
  ])
  let buf = encoder.encode(encodedHeader + '.' + encodedPayload)
  let sign = await crypto.subtle.sign(algorithm.name, key, buf)
  let hash = base64EncodeURL(Buffer.from(sign))
  return encodedHeader + '.' + encodedPayload + '.' + hash
}
let users = {
  id: cloneDeep(userInfo.value?.ding_uid || ''),
  name: cloneDeep(userInfo.value?.name || ''),
  image: cloneDeep(userInfo.value?.avatar || '')
}
let t = Date.now()
let docEditor = null
// 在 onAppReady 中通过 window.DocEditor.instances[id] 获取编辑器实例
const onAppReady = () => {
  docEditor = window.DocEditor?.instances?.[onlyofficePreviewId.value]
}
const onDocumentReady = () => {
  // 文档加载完成
}
const onDocumentSave = () => {
  // 用户点击保存（Ctrl+S / 保存按钮）——实际落盘由后端 callback 处理
}
const onError = (event) => {
  console.error('[ONLYOFFICE]', event?.data)
}
const onWarning = (event) => {
  console.warn('[ONLYOFFICE]', event?.data)
}
// // 用户点击"版本历史"图标 -> 拉取版本列表并喂给编辑器
//  :events_onRequestHistory="onRequestHistory"
      // :events_onRequestHistoryData="onRequestHistoryData"
      // :events_onRequestHistoryClose="onRequestHistoryClose"
      // :events_onRequestRestore="onRequestRestore"
// const onRequestHistory = async () => {
//   console.log(111,docEditor)
//   if (!docEditor || !props.fileKey) return
//   console.log('[ONLYOFFICE] onRequestHistory 触发, fileKey=', props.fileKey)
//   try {
//     const res = await getOfficeVersionList({ file_key: props.fileKey })
//     const raw = res?.data || res
//     const list = raw?.history || raw?.data?.history || []
//     const currentVersion = raw?.currentVersion ?? raw?.data?.currentVersion ?? list.length
//     // 组装 ONLYOFFICE 要求的 history 数据结构
//     // 每个历史版本的 key 必须由后端提供（即该版本保存时用的真实 key），不能前端拼接
//     const history = await Promise.all(
//       list.map(async (item) => {
//         const version = item.version ?? item.id ?? 0
//         const key = item.key
//         if (!key) {
//           console.warn('[ONLYOFFICE] 版本缺少 key, 跳过', item)
//           return null
//         }
//         const token = await createJWT(
//           { document: { key }, documentType: docType(fileExt.value) },
//           onlyofficeSecret
//         ).catch(() => config.value.token)
//         return {
//           version,
//           key,
//           created: item.created || item.create_time || '',
//           user: {
//             id: item.user?.id ?? item.user_id ?? '',
//             name: item.user?.name ?? item.user_name ?? ''
//           },
//           serverVersion: item.serverVersion ?? 4,
//           token: token || undefined
//         }
//       })
//     )
//     const filtered = history.filter(Boolean)
//     console.log('[ONLYOFFICE] 历史版本列表', { currentVersion, count: filtered.length })
//     docEditor.refreshHistory({ currentVersion, history: filtered })
//   } catch (err) {
//     console.error('[ONLYOFFICE] 获取历史版本失败', err)
//   }
// }
// // 用户点击某个历史版本 -> 拉取该版本详情并喂给编辑器（用于对比/恢复）
// const onRequestHistoryData = async (event) =>{
//   const version = event?.data?.version
//   if (!version || !props.fileKey) return
//   console.log('[ONLYOFFICE] onRequestHistoryData 触发, version=', version)
//   try {
//     const res = await getOfficeVersionData({ file_key: props.fileKey, version })
//     const raw = res?.data || res
//     const key = raw.key
//     if (!key) {
//       console.warn('[ONLYOFFICE] 版本详情缺少 key', raw)
//       return
//     }
//     const token = await createJWT(
//       { document: { key }, documentType: docType(fileExt.value) },
//       onlyofficeSecret
//     ).catch(() => config.value.token)
//     const data = {
//       fileType: raw.fileType || fileExt.value || 'docx',
//       version,
//       key,
//       url: raw.url,
//       token: token || undefined
//     }
//     if (raw.previous?.key) {
//       data.previous = {
//         key: raw.previous.key,
//         url: raw.previous.url,
//         token:
//           (await createJWT(
//             { document: { key: raw.previous.key }, documentType: docType(fileExt.value) },
//             onlyofficeSecret
//           ).catch(() => config.value.token)) || undefined
//       }
//     }
//     if (raw.changesUrl) data.changesUrl = raw.changesUrl
//     docEditor.setHistoryData(data)
//   } catch (err) {
//     console.error('[ONLYOFFICE] 获取历史版本详情失败', err)
//   }
// }
// // // 用户关闭历史版本面板
// const onRequestHistoryClose = async ()=> {
//   console.log('[ONLYOFFICE] onRequestHistoryClose')
// }
// // // 用户点击"恢复此版本" -> 通知后端恢复（可选，后端按需实现）
// const onRequestRestore = async (event) => {
//   const version = event?.data?.version
//   if (!version || !props.fileKey) return
//   try {
//     await getOfficeVersionData({ file_key: props.fileKey, version, restore: true })
//     await getKey()
//   } catch (err) {
//     console.error('[ONLYOFFICE] 恢复历史版本失败', err)
//   }
// }
const handleError = (event) => {
  loading.value = false
  error.value = true
  errorMessage.value = event && event.message ? event.message : 'Unknown error'
}

const config = ref({
  width: '100%',
  height: '100%',
  type: fileExt.value || 'docx',
  documentType: docType(fileExt.value),
  document: {
    title: props.fileName || props.src.split('/').pop(),
    url: props.src + '?t=' + t,
    fileType: fileExt.value || 'docx',
    key: props.fileKey || '',
    permissions: {
      download: props.download || false
    }
  },
  editorConfig: {
    mode: props.mode === 'edit' ? 'edit' : 'view',
    lang: 'zh-cn',
    customization: {
      autosave: true,
      forcesave: true
    },
    coEditing: {
      mode: 'fast',
      change: true
    },
    callbackUrl:
      import.meta.env.VITE_API_BASE_ONLYOFFICE_CALLBACK_URL + '&file_key=' + props.fileKey || '', // 默认回调为 Document Server，自行在后端实现保存回调接口
    user: users
  }

})
const getKey = async () => {
  try {
    var res = await getEditKey({ file_key: props.fileKey })
    config.value.document.key = res.data.office_key
    createJWT(config.value,
      onlyofficeSecret
    ).then((token) => {
      config.value.token = token
    })
  } catch (err) {
    console.log(err)
  }
}
getKey()


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
  //  判断如果初始大小大于容器大小，则进行适应性缩放
  const containerWidth = imgContainer.value.clientWidth
  const containerHeight = imgContainer.value.clientHeight
  let initialScale = 1
  if (img.naturalWidth > containerWidth || img.naturalHeight > containerHeight) {
    const scaleX = containerWidth / img.naturalWidth
    const scaleY = containerHeight / img.naturalHeight
    initialScale = Math.min(scaleX, scaleY)
  }
  scale.value = initialScale
  imageSize.width = img.naturalWidth
  imageSize.height = img.naturalHeight
  updateContainerSize()
  resetView(scale.value)
}

// 更新容器尺寸
const updateContainerSize = () => {
  if (imgContainer.value) {
    containerSize.width = imgContainer.value.clientWidth
    containerSize.height = imgContainer.value.clientHeight
  }
}

// 重置视图
const resetView = (defaultScale = 1) => {
  scale.value = defaultScale
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
  if (!imgContainer.value) return

  if (!document.fullscreenElement) {
    imgContainer.value.requestFullscreen().catch((err) => {
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
  loading.value = false
  updateContainerSize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.onlyoffice-preview {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
}

.loading-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #f3f3f3;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 8px;
  color: #666;
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

.error-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1001;
}

.error-message {
  text-align: center;
  color: #f56c6c;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
