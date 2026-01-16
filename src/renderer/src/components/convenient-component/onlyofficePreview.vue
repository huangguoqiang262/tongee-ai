<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div class="onlyoffice-preview" :style="{ height, width }">
    <DocumentEditor
      :id="id"
      :document-server-url="props.serverUrl"
      :config="config"
      :events_onDocumentReady="handleDocumentReady"
      :events_onSave="handleSave"
      :events_onError="handleError"
      :events_onDestroy="handleDestroy"
      v-bind="$attrs"
    />
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中…</div>
    </div>

    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <i class="el-icon-warning"></i>
        <p>文档预览错误</p>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed } from 'vue'
import { DocumentEditor } from '@onlyoffice/document-editor-vue'
const props = defineProps({
  // 文档访问 URL（建议用局域网可访问的 http(s) 链接，例如: http://192.168.1.100:3000/files/example.docx）
  src: { type: String, required: true },
  // OnlyOffice Document Server 地址，不要包含路径尾部，例如: http://192.168.1.100:8080
  serverUrl: { type: String, required: true },
  // 视图模式: 'view' 或 'edit'（edit 需要文档服务器允许保存并配置回调接口）
  mode: { type: String, default: 'view' },
  // 可选 JWT（如果你的 Document Server 配置了 JWT 认证）
  jwt: { type: String, default: '' },
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  id: { type: String, default: 'onlyoffice-editor-' + Date.now() }
})

const emit = defineEmits(['ready', 'error', 'loaded'])

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const fileExt = computed(() => {
  if (!props.src) return ''
  const m = props.src.split('?')[0].split('/').pop()
  return m && m.includes('.') ? m.split('.').pop().toLowerCase() : ''
})

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
  // 默认使用文本类型（OnlyOffice 会根据后缀解析）
  return 'word'
}
const config = ref({
  width: '100%',
  height: '100%',
  type: fileExt.value || 'docx',
  documentType: docType,
  document: {
    title: fileUrl.split('/').pop(),
    url: fileUrl,
    fileType: fileExt.value || 'docx',
    key: Date.now().toString()
  },
  editorConfig: {
    mode: props.mode === 'edit' ? 'edit' : 'view',
    lang: 'zh-cn',
    callbackUrl: props.serverUrl // 默认回调为 Document Server，自行在后端实现保存回调接口
  },
  user: {
    id: 'guest',
    name: 'Guest User'
  }
})
const handleDocumentReady = (event) => {
  loading.value = false
  error.value = false
  emit('ready', event)
  emit('loaded', event)
}
const handleSave = (event) => {
  // 可选：处理保存事件
  console.log('Document saved:', event)
}
const handleError = (event) => {
  loading.value = false
  error.value = true
  errorMessage.value = event && event.message ? event.message : 'Unknown error'
  emit('error', { message: errorMessage.value })
}
const handleDestroy = (event) => {
  // 可选：处理销毁事件
  console.log('Document editor destroyed:', event)
}
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
