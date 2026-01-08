<template>
  <div class="onlyoffice-preview" :style="{ height, width }">
    <iframe
      ref="iframeRef"
      :srcdoc="iframeSrcdoc"
      style="width:100%;height:100%;border:0;background:white"
      sandbox="allow-scripts allow-same-origin allow-forms"
    ></iframe>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中…</div>
    </div>

    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <i class="el-icon-warning"></i>
        <p>OnlyOffice 预览错误</p>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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
  width: { type: String, default: '100%' }
})

const emit = defineEmits(['ready', 'error', 'loaded'])

const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const iframeRef = ref(null)

const fileExt = computed(() => {
  if (!props.src) return ''
  const m = props.src.split('?')[0].split('/').pop()
  return m && m.includes('.') ? m.split('.').pop().toLowerCase() : ''
})

function extToDocType(ext) {
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'text'
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet'
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'presentation'
  // 默认使用文本类型（OnlyOffice 会根据后缀解析）
  return 'text'
}

const iframeSrcdoc = computed(() => {
  const fileUrl = encodeURIComponent(props.src)
  const serverUrl = encodeURIComponent(props.serverUrl.replace(/\/$/, ''))
  const mode = props.mode === 'edit' ? 'edit' : 'view'
  const token = encodeURIComponent(props.jwt || '')
  const ext = fileExt.value || ''
  const docType = extToDocType(ext)

  // 通过 srcdoc 动态生成 iframe 内容，避免路径依赖
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>html,body,#placeholder{height:100%;margin:0;padding:0;background:white}</style>
</head>
<body>
<div id="placeholder" style="width:100%;height:100%"></div>
<script>
(function(){
  var fileUrl = decodeURIComponent("${fileUrl}");
  var serverUrl = decodeURIComponent("${serverUrl}");
  var mode = "${mode}";
  var token = decodeURIComponent("${token}");
  var ext = "${ext}";
  var docType = "${docType}";

  function postToParent(type, payload){
    try{ parent.postMessage({type:type, payload: payload}, '*'); }catch(e){}
  }

  // 动态加载 OnlyOffice API
  var script = document.createElement('script');
  script.src = serverUrl + '/web-apps/apps/api/documents/api.js';
  script.onload = function(){
    try{
      var config = {
        width: '100%',
        height: '100%',
        type: ext || 'docx',
        documentType: docType,
        document: {
          title: fileUrl.split('/').pop(),
          url: fileUrl,
          fileType: ext || 'docx',
          key: Date.now().toString()
        },
        editorConfig: {
          mode: mode === 'edit' ? 'edit' : 'view',
          lang: 'zh-cn',
          callbackUrl: serverUrl // 默认回调为 Document Server，自行在后端实现保存回调接口
        }
      }

      if (token) {
        config.token = token
      }

      // 创建实例
      new DocsAPI(config)
      postToParent('onlyoffice-ready', { file: fileUrl })

    }catch(err){
      postToParent('onlyoffice-error', { message: err && err.message ? err.message : String(err) })
    }
  };
  script.onerror = function(){
    postToParent('onlyoffice-error', { message: '加载 OnlyOffice API 失败，请确认 Document Server 地址正确并可从宿主访问' })
  };
  document.head.appendChild(script);
})();
<\/script>
</body>
</html>`

  return html
})

function handleMessage(e) {
  const msg = e && e.data
  if (!msg || !msg.type) return
  if (msg.type === 'onlyoffice-ready') {
    loading.value = false
    error.value = false
    emit('ready', msg.payload)
    emit('loaded', msg.payload)
  }
  if (msg.type === 'onlyoffice-error') {
    loading.value = false
    error.value = true
    errorMessage.value = msg.payload && msg.payload.message ? msg.payload.message : 'Unknown error'
    emit('error', { message: errorMessage.value })
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.onlyoffice-preview { position: relative; width: 100%; height: 100%; background: #fff }
.loading-overlay {
  position: absolute; left: 0; top: 0; right: 0; bottom: 0; display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(255,255,255,0.9);z-index:1000
}
.loading-spinner { width:36px;height:36px;border:4px solid #f3f3f3;border-top-color:#409eff;border-radius:50%;animation:spin 1s linear infinite }
.loading-text { margin-top:8px;color:#666 }
.error-overlay { position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.95);z-index:1001 }
.error-message { text-align:center;color:#f56c6c }
@keyframes spin{ to{ transform:rotate(360deg) } }
</style>
