<template>
  <div class="file-preview">
    <!-- 图片 -->
    <img v-if="isImage" :src="fileUrl" class="file-preview-img" alt="预览图片" />

    <!-- PDF -->
    <iframe v-else-if="isPdf" :src="fileUrl" class="file-preview-iframe"></iframe>

    <!-- TXT -->
    <pre v-else-if="isTxt" class="file-preview-txt">{{ txtDisplay }}</pre>

    <!-- Word -->
    <div v-else-if="isDocxLike" class="file-preview-docx-wrapper">
      <div v-if="docxError" class="file-preview-error">{{ docxError }}</div>
      <div v-else>
        <div ref="docxContainer" class="file-preview-docx"></div>
        <div v-if="loading" class="file-preview-loading">正在加载并解析 Word 文档...</div>
      </div>
    </div>

    <!-- Excel（Luckysheet 渲染） -->
    <div v-else-if="isXlsxLike" class="file-preview-xlsx-wrapper">
      <div v-if="xlsxError" class="file-preview-error">{{ xlsxError }}</div>
      <div v-else>
        <div v-if="loading" class="file-preview-loading">正在加载并解析 Excel 文档...</div>
        <div v-show="!loading" ref="xlsxContainer" class="file-preview-xlsx-lucky"></div>
      </div>
    </div>

    <!-- 其他类型 -->
    <div v-else class="file-preview-unsupported">
      <p>暂不支持该类型的在线预览（如 PPT/PPTX 等）。</p>
      <p>建议后端转成 PDF 或图片后再预览。</p>
      <a :href="fileUrl" target="_blank" rel="noopener noreferrer">打开/下载原文件</a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { renderAsync as renderDocx } from 'docx-preview'
import LuckyExcel from 'luckyexcel'

const props = defineProps({
  fileUrl: { type: String, required: true }, // 内/外网文件 URL
  fileName: { type: String, default: '' }, // url 无后缀时辅助识别类型
  requestOptions: { type: Object, default: () => ({}) } // 透传 fetch 配置
})

const loading = ref(false)

/* txt */
const textContent = ref('')
const txtDisplay = computed(() => {
  if (loading.value) return '正在加载文本...'
  if (!textContent.value) return '暂无内容或加载失败'
  return textContent.value
})

/* docx */
const docxContainer = ref(null)
const docxError = ref('')

/* xlsx */
const xlsxContainer = ref(null)
const xlsxError = ref('')
let luckysheetCreated = false
let Luckysheet = null

/* 扩展名 */
const ext = computed(() => {
  let name = ''
  if (props.fileName) name = props.fileName
  else if (props.fileUrl) name = props.fileUrl.split('?')[0].split('#')[0]
  const idx = name.lastIndexOf('.')
  if (idx === -1) return ''
  return name.slice(idx + 1).toLowerCase()
})

const isImage = computed(() => ['png', 'jpg', 'jpeg', 'gif'].includes(ext.value))
const isPdf = computed(() => ext.value === 'pdf')
const isTxt = computed(() => ext.value === 'txt')
const isDocxLike = computed(() => ['doc', 'docx'].includes(ext.value))
const isXlsxLike = computed(() => ['xls', 'xlsx'].includes(ext.value))

/* fetch 封装：默认带 credentials，可覆写 */
const doFetch = (url, extra = {}) => {
  const base = props.requestOptions || {}
  return fetch(url, { credentials: base.credentials ?? 'include', ...base, ...extra })
}

/* 动态加载 jQuery 和 luckysheet，保证顺序 */
const loadLuckysheet = async () => {
  if (Luckysheet) return // 已加载
  const jq = await import('jquery')
  window.$ = window.jQuery = jq.default || jq // 先挂全局
  await import('luckysheet/dist/plugins/js/plugin.js')
  await import('luckysheet/dist/plugins/css/pluginsCss.css')
  await import('luckysheet/dist/plugins/plugins.css')
  await import('luckysheet/dist/css/luckysheet.css')
  const mod = await import('luckysheet')
  Luckysheet = mod.default || mod
}

/* txt */
const fetchTxt = async () => {
  loading.value = true
  textContent.value = ''
  try {
    const res = await doFetch(props.fileUrl)
    if (!res.ok) throw new Error('http status ' + res.status)
    textContent.value = await res.text()
  } catch (e) {
    console.error('加载 txt 失败:', e)
    textContent.value = '加载 txt 失败，请检查地址/权限/CORS。'
  } finally {
    loading.value = false
  }
}

/* docx */
const fetchDocx = async () => {
  loading.value = true
  docxError.value = ''
  try {
    const res = await doFetch(props.fileUrl)
    if (!res.ok) throw new Error('http status ' + res.status)
    const blob = await res.blob()

    await nextTick()
    if (!docxContainer.value) return
    docxContainer.value.innerHTML = ''

    await renderDocx(blob, docxContainer.value, null, { inWrapper: true, ignoreFonts: true })
  } catch (e) {
    console.error('docx 解析失败:', e)
    docxError.value = '加载或解析 Word 失败，请检查地址/权限/CORS，或文件是否损坏。'
  } finally {
    loading.value = false
  }
}

/* Excel：用 LuckyExcel 拉取并转为 Luckysheet 数据，再渲染 */
const fetchXlsx = async () => {
  loading.value = true
  xlsxError.value = ''
  destroyLuckysheet()

  try {
    await loadLuckysheet() // 确保已加载并挂好 $
    await nextTick()
    if (!xlsxContainer.value) throw new Error('xlsx 容器不存在')

    await new Promise((resolve, reject) => {
      LuckyExcel.transformExcelToLuckyByUrl(props.fileUrl, 'sheet', (exportJson) => {
        if (!exportJson.sheets || exportJson.sheets.length === 0) {
          reject(new Error('解析结果为空'))
          return
        }
        try {
          Luckysheet.create({
            container: xlsxContainer.value.id || 'luckysheet-container',
            data: exportJson.sheets,
            title: exportJson.info?.name || 'Excel',
            showtoolbar: false,
            showinfobar: false,
            showstatisticBar: false,
            allowCopy: false,
            enableAddRow: false,
            enableAddCol: false,
            sheetFormulaBar: false,
            rowHeaderWidth: 46,
            columnHeaderHeight: 20
          })
          luckysheetCreated = true
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  } catch (e) {
    console.error('xlsx 解析失败:', e)
    xlsxError.value = '加载或解析 Excel 失败，请检查地址/权限/CORS，或文件是否有效。'
  } finally {
    loading.value = false
  }
}

const destroyLuckysheet = () => {
  try {
    if (luckysheetCreated && window.luckysheet && window.luckysheet.destroy) {
      window.luckysheet.destroy()
    }
  } catch (e) {
    console.warn('销毁 luckysheet 失败:', e)
  } finally {
    luckysheetCreated = false
  }
}

/* url/类型变化时，按类型加载 */
watch(
  () => [props.fileUrl, ext.value],
  () => {
    loading.value = false
    textContent.value = ''
    docxError.value = ''
    xlsxError.value = ''

    destroyLuckysheet()

    if (!props.fileUrl) return
    if (isTxt.value) fetchTxt()
    else if (isDocxLike.value) fetchDocx()
    else if (isXlsxLike.value) fetchXlsx()
    // 图片/PDF 直接用 src
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  destroyLuckysheet()
})
</script>

<style scoped lang="scss">
.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
}
.file-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin: auto;
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
.file-preview-docx-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding: 8px;
  background: #f5f5f5;
}
.file-preview-docx {
  background: #fff;
  padding: 16px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}
.file-preview-xlsx-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
  background: #f5f5f5;
}
.file-preview-xlsx-lucky {
  width: 100%;
  height: 100%;
  background: #fff;
}
.file-preview-unsupported {
  text-align: center;
  color: #666;
  padding: 16px;
  margin: auto;
}
.file-preview-unsupported a {
  color: #409eff;
}
.file-preview-loading {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}
.file-preview-error {
  color: #ff4d4f;
  margin-bottom: 8px;
}
</style>
