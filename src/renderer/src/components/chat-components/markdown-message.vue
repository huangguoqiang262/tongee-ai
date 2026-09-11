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
        <div class="knowledge-popover-title">
          {{ currentDocumentInfo?.fileName }}
          <!-- 所在段落（{{ currentDocumentInfo?.sort.split('.')[0] }}） -->
        </div>
        <div class="knowledge-popover-content">
          {{ htmlToText(currentDocumentInfo?.documentContent || '') }}
        </div>
        <div v-if="currentDocumentInfo?.note_id == 0 || !currentDocumentInfo?.note_id" class="knowledge-popover-footer">
          <img class="icon" :src="getFileIcon(currentDocumentInfo)" alt="" />
          <span>{{ currentDocumentInfo?.fileUrl?.split('.').pop()?.toUpperCase() }}</span>
          <!-- <span class="knowledge-popover-filename">{{ currentDocumentInfo?.fileName }}</span> -->
        </div>
        <div v-else class="knowledge-popover-footer">
          <img class="icon" :src="getFileIcon(currentDocumentInfo)" alt="" />
          <span>笔记</span>
          <!-- <span class="knowledge-popover-filename">{{ currentDocumentInfo?.fileName }}</span> -->
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
import noteIcon from '@renderer/assets/file-icons/note-large-icon.png'
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
  },
  // 添加附件属性
  useAnnexList: {
    type: Array,
    default: () => []
  },
  // 这个是需要显示原文两个字
  hideAttachFiles: {
    type: Array,
    default: () => []
  }
})
const addNewTab = inject('addNewTab')
// 获取文件图标
const getFileIcon = (item) => {
  if (!item || !item.fileName) {
    return ''
  }
 // 根据文件扩展名返回不同的图标
  let ext = ''
  if (item.full_path) {
    ext = item.full_path?.split('.').pop()?.toLowerCase()
  } else if (item.fileUrl) {
    ext = item.fileUrl?.split('.').pop()?.toLowerCase()
  } else {
    ext = item.url?.split('.').pop()?.toLowerCase()
  }
  if (item.note_id && item.note_id != 0) {
    ext = 'note'
  } 
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
    gif: imgIcon,
    note: noteIcon
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
// 合并相同fileId的文件，将引用的段落合并，每个文件保留children子数组
// 父级sort用于展示合并后的段落号（如"3、5"），children中每条保留原始sort不变
const mergeDocumentList = computed(() => {
  let files = [...props.retrievedDocumentList, ...props.useAnnexList]
  const urlMap = {}
  files.forEach((file) => {
    const sortVal = file.sort ? file.sort.split('.')[0] + '' : ''
    if (urlMap[file.fileId]) {
      urlMap[file.fileId].sort = urlMap[file.fileId].sort + '、' + sortVal
      // children保留原始file数据，sort保持原样
      urlMap[file.fileId].children.push({ ...file })
    } else {
      urlMap[file.fileId] = { ...file, sort: sortVal, children: [{ ...file }] }
    }
  })
  return Object.values(urlMap)
})

// 根据原始index和数据源类型查找该记录在合并文档列表中的文件索引和children中的段落索引
// sourceType: 'kno' 对应 retrievedDocumentList，'ann' 对应 useAnnexList
const findDocPosition = (knowledgeId, sourceType) => {
  if (!mergeDocumentList.value || mergeDocumentList.value.length === 0) {
    return { fileIndex: -1, childIndex: -1, doc: null }
  }
  const targetIndex = parseInt(knowledgeId)
  const targetList = sourceType === 'ann' ? props.useAnnexList : props.retrievedDocumentList
  // 先在该数据源中找到原始记录，获取它的唯一标识（用fileId+index组合区分）
  const originDoc = targetList.find((doc) => doc.index === targetIndex)
  if (!originDoc) {
    return { fileIndex: -1, childIndex: -1, doc: null }
  }
  // 在合并后的文档列表中，用 fileId 和 index 双重匹配
  for (let fileIdx = 0; fileIdx < mergeDocumentList.value.length; fileIdx++) {
    const file = mergeDocumentList.value[fileIdx]
    for (let childIdx = 0; childIdx < file.children.length; childIdx++) {
      const child = file.children[childIdx]
      if (child.fileId === originDoc.fileId && child.index === targetIndex) {
        return { fileIndex: fileIdx, childIndex: childIdx, doc: child }
      }
    }
  }
  return { fileIndex: -1, childIndex: -1, doc: null }
}

// 处理消息内容，将[kno_数字] 或[ kno_数字 ]或`[kno_数字]`或`[ kno_数字 ]`格式转换为HTML  我还想将[eqm_1]或[ eqm_1 ]替换为按钮
// 带空格的也要匹配
const processedMessage = computed(() => {
  // 处理 kno_ 标签：相邻且 fileIndex 相同的，只保留第一个，后面的替换为空
  let result = props.message.replace(/`?\[\s?kno_(\d+)\s?\]`?/g, (match, id, offset, str) => {
    const { fileIndex, doc } = findDocPosition(id, 'kno')
    const isHidden = doc && props.hideAttachFiles && props.hideAttachFiles.some((item) => item === doc.fileId)
    const displayText = isHidden ? '原文' : (fileIndex >= 0 ? fileIndex + 1 : id)
    const replacement = `<span class="knowledge-tag" data-knowledge-id="${id}" data-file-index="${fileIndex}">${displayText}</span>`

    // 检查前面是否紧邻一个 fileIndex 相同的 kno_ 标签（包括已替换的 <span> 和未替换的原始标签）
    const before = str.substring(0, offset)
    // 匹配前面末尾已替换的 knowledge-tag span 或原始 kno_ 标签
    const tailMatch = before.match(/(<span class="knowledge-tag"[^>]*data-file-index="(\d+)"[^>]*>[^<]*<\/span>|`?\[\s?kno_(\d+)\s?\]`?)\s*$/)
    if (tailMatch) {
      const prevFileIndex = tailMatch[2] !== undefined ? parseInt(tailMatch[2]) : (tailMatch[3] !== undefined ? findDocPosition(tailMatch[3], 'kno').fileIndex : -1)
      if (prevFileIndex === fileIndex) {
        return ''
      }
    }
    return replacement
  })

  // 处理 ann_ 标签：相邻且 fileIndex 相同的，只保留第一个，后面的替换为空
  result = result.replace(/`?\[\s?ann_(\d+)\s?\]`?/g, (match, id, offset, str) => {
    const { fileIndex, doc } = findDocPosition(id, 'ann')
    console.log('ann_标签替换:',props.hideAttachFiles, {  doc })

    const isHidden = doc && props.hideAttachFiles && props.hideAttachFiles.some((item) => item === doc.fileId)
    const displayText = isHidden ? '原文' : (fileIndex >= 0 ? fileIndex + 1 : id)
    const replacement = `<span class="ann-tag" data-ann-id="${id}" data-file-index="${fileIndex}">${displayText}</span>`

    const before = str.substring(0, offset)
    const tailMatch = before.match(/(<span class="ann-tag"[^>]*data-file-index="(\d+)"[^>]*>[^<]*<\/span>|`?\[\s?ann_(\d+)\s?\]`?)\s*$/)
    if (tailMatch) {
      const prevFileIndex = tailMatch[2] !== undefined ? parseInt(tailMatch[2]) : (tailMatch[3] !== undefined ? findDocPosition(tailMatch[3], 'ann').fileIndex : -1)
      if (prevFileIndex === fileIndex) {
        return ''
      }
    }
    return replacement
  })

  // 处理 eqm_ 标签：相邻且 id 相同的，只保留第一个，后面的替换为空
  result = result.replace(/`?\[\s?eqm_(\d+)\s?\]`?/g, (match, id, offset, str) => {
    const replacement = `<span class="equipment-tag" data-equipment-id="${id}">查看</span>`

    const before = str.substring(0, offset)
    const tailMatch = before.match(/(<span class="equipment-tag"[^>]*data-equipment-id="(\d+)"[^>]*>[^<]*<\/span>|`?\[\s?eqm_(\d+)\s?\]`?)\s*$/)
    if (tailMatch) {
      const prevId = tailMatch[2] !== undefined ? tailMatch[2] : tailMatch[3]
      if (prevId === id) {
        return ''
      }
    }
    return replacement
  })
  return result
})

// 根据知识库ID获取文档信息（kno_标签）
const getDocumentInfo = (knowledgeId) => {
  const { doc } = findDocPosition(knowledgeId, 'kno')
  return doc
}
// 根据引用文件库ID获取文档信息（ann_标签）
const getAnnexInfo = (annexId) => {
  const { doc } = findDocPosition(annexId, 'ann')
  return doc
}
// 显示弹窗
const showPopover = (targetTag) => {
  const knowledgeId = targetTag.getAttribute('data-knowledge-id')
  const annTagId = targetTag.getAttribute('data-ann-id')
  if (knowledgeId || annTagId) {
    if (annTagId) {
      currentKnowledgeId.value = annTagId
      currentDocumentInfo.value = getAnnexInfo(annTagId)
      if (!currentDocumentInfo.value) {
        return
      }
    } else {
      currentKnowledgeId.value = knowledgeId
      currentDocumentInfo.value = getDocumentInfo(knowledgeId)
    }
  }
  // 设置弹窗的触发元素
  triggerElement.value = targetTag
}
const toKnowledge = (item) => {
  if (!item.fileUrl) {
    return
  }
  addNewTab({
    title: item.fileName,
    url: 'DocumentDetail',
    isInternal: true,
    icon: getFileIcon(item),
    attrs: {
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileId: item.fileId || '',
      note_id: item.note_id || 0,
      notebook_id: item.notebook_id || 0,
    }
  })
  triggerElement.value = null
}
// 鼠标移入知识库标签事件处理
const handleKnowledgeHover = (event) => {
  const knowledgeTag = event.target.closest('.knowledge-tag')
  const annTag = event.target.closest('.ann-tag')
  if (!knowledgeTag && !annTag) return
  showPopover(knowledgeTag || annTag)
}
// 点击知识库/引用标签直接打开文档
const handleKnowledgeClick = (event) => {
  const knowledgeTag = event.target.closest('.knowledge-tag')
  const annTag = event.target.closest('.ann-tag')
  if (!knowledgeTag && !annTag) return

  const tag = knowledgeTag || annTag
  const knowledgeId = tag.getAttribute('data-knowledge-id')
  const annTagId = tag.getAttribute('data-ann-id')
  let docInfo = null
  if (annTagId) {
    docInfo = getAnnexInfo(annTagId)
  } else if (knowledgeId) {
    docInfo = getDocumentInfo(knowledgeId)
  }
  if (docInfo) {
    toKnowledge(docInfo)
  }
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
    // 监听设备标签点击事件
    markdownContainer.value.addEventListener('click', handleEquipmentClick, true)
    // 监听知识库/引用标签点击事件（直接打开文档）
    markdownContainer.value.addEventListener('click', handleKnowledgeClick, true)
  }
})

// 移除事件监听
onUnmounted(() => {
  if (markdownContainer.value && !props.isPreView) {
    markdownContainer.value.removeEventListener('mouseenter', handleKnowledgeHover, true)
    markdownContainer.value.removeEventListener('click', handleEquipmentClick, true)
    markdownContainer.value.removeEventListener('click', handleKnowledgeClick, true)
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
:deep(.ann-tag) {
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
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
