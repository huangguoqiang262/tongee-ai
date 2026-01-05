<template>
  <!-- markdown显示消息 -->
  <div ref="markdownContainer" class="markdown-container">
    <v-md-preview :text="processedMessage"></v-md-preview>
    <!-- 知识库弹窗 -->
    <el-popover
      ref="popoverRef"
      trigger="hover"
      :virtual-ref="triggerElement"
      virtual-triggering
      :width="376"
      :show-arrow="false"
      placement="bottom"
      popper-class="knowledge-popover"
    >
      <div class="knowledge-popover-content" @click="toKnowledge(currentDocumentInfo)">
        <div class="knowledge-popover-title">所在段落（{{ currentDocumentInfo?.sort }}）</div>
        <div class="knowledge-popover-content">
          {{ htmlToText(currentDocumentInfo?.documentContent || '') }}
        </div>
        <div class="knowledge-popover-footer">
          <img class="icon" :src="getFileIcon(currentDocumentInfo)" alt="" />
          <span>{{ currentDocumentInfo?.fileUrl?.split('.').pop()?.toUpperCase() }}</span>
          <span class="knowledge-popover-filename">{{ currentDocumentInfo?.fileName }}</span>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { convertToPlainText } from '@renderer/utils/convertToPlainText'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  // 添加知识库文档列表属性
  retrievedDocumentList: {
    type: Array,
    default: () => []
  },
  // 添加预览属性
  isPreView: {
    type: Boolean,
    default: false
  }
})
const addNewTab = inject('addNewTab')
// 获取文件图标
const getFileIcon = (item) => {
  if (!item || !item.fileName) {
    return ''
  }
  // 根据文件扩展名返回不同的图标
  const ext = item.fileUrl?.split('.').pop()?.toUpperCase()
  const iconMap = {
    doc: wordIcon,
    docx: wordIcon,
    pdf: pdfIcon,
    xls: excelIcon,
    xlsx: excelIcon,
    csv: csvIcon,
    ppt: pptIcon,
    pptx: pptIcon,
    txt: txtIcon,
    png: imgIcon,
    jpg: imgIcon,
    jpeg: imgIcon,
    gif: imgIcon
  }

  return iconMap[ext] || wordIcon
}
const htmlToText = (html) => {
  return convertToPlainText(html)
}
const markdownContainer = ref(null)
const popoverRef = ref(null)
let triggerElement = ref(null)
const currentKnowledgeId = ref(null)
const currentDocumentInfo = ref(null)

// 处理消息内容，将[kno_数字]格式转换为HTML  我还想将[eqm_1]替换为按钮
const processedMessage = computed(() => {
  return props.message
    .replace(/\[kno_(\d+)\]/g, (match, id) => {
      return `<span class="knowledge-tag" data-knowledge-id="${id}">${id}</span>`
    })
    .replace(/\[eqm_(\d+)\]/g, (match, id) => {
      return `<span class="equipment-tag" data-equipment-id="${id}">查看</span>`
    })
})

// 根据知识库ID获取文档信息
const getDocumentInfo = (knowledgeId) => {
  if (!props.retrievedDocumentList || props.retrievedDocumentList.length === 0) {
    return null
  }

  // 在文档列表中查找匹配的知识库文档
  return props.retrievedDocumentList.find((doc) => doc.index === parseInt(knowledgeId))
}

// 显示弹窗
const showPopover = (knowledgeTag) => {
  const knowledgeId = knowledgeTag.getAttribute('data-knowledge-id')
  // 设置弹窗的触发元素
  triggerElement.value = knowledgeTag

  if (knowledgeId) {
    currentKnowledgeId.value = knowledgeId
    currentDocumentInfo.value = getDocumentInfo(knowledgeId)
  }
}
const toKnowledge = (item) => {
  if (!item.fileUrl) {
    return
  }
  addNewTab({
    title: item.fileName,
    url: 'DocumentDetail',
    isInternal: true,
    attrs: {
      fileUrl: item.fileUrl,
      fileName: item.fileName
    }
  })
}
// 鼠标移入知识库标签事件处理
const handleKnowledgeHover = (event) => {
  const knowledgeTag = event.target.closest('.knowledge-tag')
  if (!knowledgeTag) return
  showPopover(knowledgeTag)
}
// 跳转保养计划页面
const handleEquipmentClick = (event) => {
  const equipmentTag = event.target.closest('.equipment-tag')
  if (!equipmentTag) return
  addNewTab({
    title: '设备保养',
    url: 'Maintain',
    isInternal: true
  })
}
// 添加事件监听
onMounted(() => {
  if (markdownContainer.value && !props.isPreView) {
    // 监听鼠标移入事件
    markdownContainer.value.addEventListener('mouseenter', handleKnowledgeHover, true)
    // 监听鼠标移入事件
    markdownContainer.value.addEventListener('click', handleEquipmentClick, true)
  }
})

// 移除事件监听
onUnmounted(() => {
  if (markdownContainer.value && !props.isPreView) {
    markdownContainer.value.removeEventListener('mouseenter', handleKnowledgeHover, true)
    // 监听鼠标移入事件
    markdownContainer.value.addEventListener('click', handleEquipmentClick, true)
  }
})
</script>

<style scoped lang="scss">
// 调整markdown组件的一些样式
:deep(.md-editor-preview-wrapper) {
  .smart-blue-theme p {
    line-height: unset;
  }
}
:deep(.equipment-tag) {
  color: var(--el-color-primary);
  padding: 0px 2px;
  margin: 0 4px;
  display: inline-block;
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: var(--el-color-primary-light-8);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
// 知识库标签样式
:deep(.knowledge-tag) {
  color: var(--el-color-primary);
  padding: 0px 2px;
  margin: 0 4px;
  display: inline-block;
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: var(--el-color-primary-light-8);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// 知识库弹窗内容样式
.knowledge-popover-content {
  .knowledge-popover-title {
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--default-font-color);
    line-height: 18px;
  }
  .knowledge-popover-content {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
    font-size: 14px;
    color: #646464;
    line-height: 24px;
    text-align: justify;
    font-style: normal;
    text-transform: uppercase;
    // white-space: pre-wrap;
  }
  .knowledge-popover-footer {
    font-size: 14px;
    color: #646464;
    line-height: 20px;
    display: flex;
    align-items: center;
    overflow: hidden;
    gap: 0 9px;
    .icon {
      width: 16px;
      height: 16px;
    }
    .knowledge-popover-filename {
      flex: 1;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>

<style>
/* 全局弹窗样式 */
.knowledge-popover {
  z-index: 9999 !important;
  padding: 20px 20px 10px !important;
  /* 确保弹窗可以接收鼠标事件 */
  pointer-events: auto !important;
  border-radius: 16px !important;
}
</style>
