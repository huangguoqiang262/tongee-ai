<template>
  <div class="feedback-center-box">
    <div class="feedback-center">
      <div class="square">
        <div class="page-title-box">
          <div class="page-title">反馈中心</div>
        </div>
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ 'active-tab': tab.id == feedbackData.sug_or_pb }"
            :style="{
              cursor: activeHistoryItem?.id ? 'not-allowed' : 'pointer'
            }"
            @click="tabHandle(tab.id)"
          >
            <!-- <img class="icon" :src="tab.icon" alt="" /> -->
            <component :is="coustomIcons[tab.icon]" class="icon"></component>
            <div class="tab-right">
              <div class="title">{{ tab.name }}</div>
              <div class="desc">{{ tab.des }}</div>
            </div>
          </div>
        </div>
        <div class="content-box">
          <el-form
            ref="feedbackForm"
            label-position="top"
            hide-required-asterisk
            :model="feedbackData"
            :rules="feedbackRules"
            class="feedback-form"
            @submit.prevent
          >
            <el-form-item label="文档类别" prop="doc_type">
              <el-select
                v-model="feedbackData.doc_type"
                :disabled="activeHistoryItem?.id ? true : false"
                size="large"
                placeholder="请选择文档类别"
              >
                <el-option
                  v-for="value in docTypeList"
                  :key="value.id"
                  :label="value.title"
                  :value="value.id"
                />
              </el-select>
            </el-form-item>
            <!-- 反馈分类 -->
            <el-form-item label="反馈分类" prop="type">
              <el-select
                v-model="feedbackData.type"
                size="large"
                :disabled="activeHistoryItem?.id ? true : false"
                placeholder="请选择反馈分类"
              >
                <el-option-group v-for="group in typeTreeList" :key="group.id" :label="group.name">
                  <el-option
                    v-for="item in group.children"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>
            <el-form-item class="editor-container-box" label="反馈内容" prop="content">
              <div class="editor-container">
                <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" />
                <Editor
                  v-model="feedbackData.content"
                  class="editor-content"
                  :default-config="editorConfig"
                  mode="default"
                  @on-created="handleCreated"
                />
                <div class="footer-btns">
                  <el-button
                    v-if="!activeHistoryItem?.id"
                    class="confirm-btn"
                    type="primary"
                    @click="submitFeedback"
                    >提交反馈</el-button
                  >
                  <el-button v-else class="cancel-btn" @click="resetFeedback">重置</el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="history-box">
      <div class="history-hd">反馈历史</div>
      <div v-infinite-scroll="loadData" class="list-box">
        <template v-if="historyList.length">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="hisrory-item"
            :class="{ 'active-history-item': item.id == activeHistoryItem?.id }"
            @click="handleHistoryItemClick(item)"
          >
            <div class="status" :class="{ 'status-err': item.sug_or_pb == 1 }">
              {{ item.sug_or_pb == 1 ? '问题' : '建议' }}
            </div>
            <div class="title">{{ getText(item.content) }}</div>
            <div class="time">{{ item.createtime }}</div>
          </div>
        </template>
        <div v-else class="empty">
          <div class="empty-text">暂无反馈历史</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watchEffect, nextTick } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import {
  feedback_type_tree,
  feedback_doc_type,
  feedback_add,
  feedback_get_list
} from '@renderer/api/feedback'
import cloneDeep from 'lodash.clonedeep'
import { convertToPlainText } from '@renderer/utils/convertToPlainText'
import problemIcon from '@renderer/assets/feedback/problem-icon.svg'
import suggestionIcon from '@renderer/assets/feedback/suggestion-icon.svg'
let props = defineProps({
  attrs: {
    type: Object,
    default: () => ({})
  }
})
let coustomIcons = {
  problemIcon,
  suggestionIcon
}
let tabs = ref([
  {
    id: '2',
    name: '建议',
    icon: 'problemIcon',
    des: '提供文档缺少、改进或新想法'
  },
  {
    id: '1',
    name: '问题',
    icon: 'suggestionIcon',
    des: '报告文档中错误的内容等问题'
  }
])
let feedbackForm = ref(null)
let defaultConfig = {
  excludeKeys: [
    'insertImage',
    'group-video',
    'insertVideo',
    'unFullScreen',
    'fullScreen',
    'insertLink',
    'todo',
    'codeBlock',
    'emotion',
    'group-indent'
  ]
}
let activeHistoryItem = ref({})
let feedbackData = ref({
  content: '',
  type: '',
  doc_type: '',
  sug_or_pb: '2',
  know_id: ''
})
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
watchEffect(() => {
  feedbackData.value.know_id = props.attrs.knowId
})
const tabHandle = (id) => {
  if (activeHistoryItem.value?.id) {
    return
  }
  feedbackData.value.sug_or_pb = id
}
let editorRef = shallowRef(null)
const userStore = useUserStore()
let editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_API_BASE_URL + '/api/common/upload',
      headers: {
        Authorization: userStore.token,
        uniacid: userStore.uniacid
      },
      fieldName: 'file[]',
      meta: {
        uniacid: userStore.uniacid
      },
      allowedFileTypes: ['.png', '.jpg', '.jpeg', '.gif'],
      customInsert(res, insertFn) {
        insertFn(res.data[0].url, res.data[0].file_type || '', res.data[0].url || '')
      }
    }
  }
}
let isEmpty = (rule, value, callback) => {
  // 匹配<p><br></p>
  let reg = /^<p><br><\/p>$/
  if (value.trim() === '') {
    callback('请输入反馈内容')
  } else if (reg.test(value)) {
    callback('请输入反馈内容')
  } else {
    callback()
  }
}
let feedbackRules = ref({
  content: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { validator: isEmpty, trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择反馈分类', trigger: 'blur' }],
  doc_type: [{ required: true, message: '请选择文档类别', trigger: 'blur' }]
})
// 提交
const submitFeedback = () => {
  feedbackForm.value.validate((valid) => {
    if (valid) {
      feedback_add(feedbackData.value).then(() => {
        // eslint-disable-next-line no-undef
        ElMessage.primary('提交成功')
        feedbackForm.value.resetFields()
        pagination.value = {
          page: 1,
          page_size: 10,
          total: 0
        }
        historyList.value = []
        getHistoryList()
      })
    }
  })
}
const handleCreated = (editor) => {
  editorRef.value = editor
  editorRef.value.clear()
  // editorRef.value.setContent(feedbackData.value.content)
}
// 文档类型列表
let docTypeList = ref([])
const getDocTypeList = () => {
  feedback_doc_type().then((res) => {
    docTypeList.value = res.data
  })
}
// 反馈类型树
let typeTreeList = ref([])
const getTypeTreeList = () => {
  feedback_type_tree().then((res) => {
    typeTreeList.value = res.data
  })
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getHistoryList()
}
// 反馈历史列表
let historyList = ref([])
const getHistoryList = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size,
    search_type: 0
  }
  feedback_get_list(data).then((res) => {
    historyList.value = historyList.value.concat(res.data.data || [])
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    pagination.value.page_size = res.data.per_page
  })
}
const handleHistoryItemClick = async (item) => {
  await nextTick(() => {
    let canUndo = true
    while (canUndo && editorRef.value) {
      canUndo = editorRef.value.undo()
    }
  })
  var data = cloneDeep(item)
  activeHistoryItem.value = data
  feedbackData.value = {
    content: data.content || '',
    type: data.type,
    doc_type: data.doc_type,
    sug_or_pb: data.sug_or_pb,
    know_id: data.know_id
  }
  nextTick(() => {
    editorRef.value?.disable()
  })
}
const resetFeedback = () => {
  feedbackForm.value.resetFields()
  activeHistoryItem.value = {}
  feedbackData.value = {
    content: '',
    type: '',
    doc_type: '',
    sug_or_pb: '2',
    know_id: props.attrs.knowId || ''
  }
  nextTick(() => {
    editorRef.value.enable()
  })
}
const getText = (content) => {
  return convertToPlainText(content, { maxLength: 100 })
}
onMounted(() => {
  getDocTypeList()
  getTypeTreeList()
  getHistoryList()
})
</script>

<style scoped lang="scss">
.feedback-center-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  .feedback-center {
    box-sizing: border-box;
    padding: 50px 20px 10px;
    flex: 1;
    height: 100%;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;

    .square {
      width: 78%;
      max-width: 910px;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .page-title-box {
        flex-shrink: 0;
        margin-bottom: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .page-title {
          font-size: 22px;
          font-weight: 500;
          color: var(--default-font-color);
          line-height: 30px;
        }
      }

      .tabs {
        margin-bottom: 20px;
        flex-shrink: 0;
        width: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;

        .tab-item {
          flex-shrink: 0;
          width: calc(50% - 10px);
          height: 90px;
          cursor: pointer;
          transition: all 0.2s linear;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          border-radius: 12px;
          border: 1px solid #d8d8d8;
          .icon {
            color: var(--el-color-primary);
            flex-shrink: 0;
            width: 26px;
            height: 26px;
          }
          .tab-right {
            .title {
              margin-bottom: 4px;
              font-size: 14px;
              font-weight: 500;
              color: var(--default-font-color);
              line-height: 22px;
            }
            .desc {
              font-size: 12px;
              color: #909090;
              line-height: 22px;
            }
          }

          &.active-tab {
            border-color: var(--el-color-primary);
            background: color-mix(in srgb, var(--el-color-primary) 5%, #ffffff);
          }
        }
      }

      .content-box {
        flex: 1;
        overflow: hidden;
        .feedback-form {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          :deep(.el-select) {
            .el-select__wrapper {
              background-color: #f9f9f9;
              border-radius: 6px !important;
              // .el-select__placeholder {
              //   color: var(--el-text-color-placeholder);
              // }
              // .el-select__selected-item {
              //   color: var(--default-font-color);
              // }
            }
          }
        }
        .editor-container-box {
          margin-bottom: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          :deep(.el-form-item__content) {
            padding-bottom: 20px;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
            .el-form-item__error {
              top: calc(100% - 18px);
            }
          }
        }
        :deep(.editor-container) {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 10px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #d8d8d8;
          overflow: hidden;
          .w-e-toolbar {
            flex-shrink: 0;
            background: transparent !important;
          }
          .editor-content {
            flex: 1;
            background: #fff !important;
            border-radius: 6px;
            overflow: hidden;
            .w-e-text-placeholder {
              top: 10px;
            }
          }
          .footer-btns {
            width: 100%;
            height: 75px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            .cancel-btn,
            .confirm-btn {
              height: 36px;
              width: 110px;
              border-radius: 8px;
              border: none;
              font-size: 14px;
            }
            .cancel-btn {
              background: #efefef;
              color: var(--default-font-color);
              &:hover {
                background: #d8d8d8;
              }
            }
          }
        }
      }
    }
  }
  .history-box {
    flex-shrink: 0;
    box-sizing: border-box;
    padding: 20px 10px;
    width: 26%;
    max-width: 426px;
    height: 100%;
    background-color: #fff;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .history-hd {
      flex-shrink: 0;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;
      margin-bottom: 22px;
    }
    .list-box {
      flex: 1;
      overflow-y: auto;
      .empty {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909090;
        .empty-text {
          margin-bottom: 16vh;
        }
      }
      .hisrory-item {
        margin-bottom: 10px;
        padding: 14px 10px;
        background: #f9f9f9;
        border: 1px solid #f9f9f9;
        border-radius: 4px;
        transition: all 0.2s linear;
        cursor: pointer;
        &.active-history-item {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }
        &:hover {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }
        * {
          margin: 0;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        .status {
          margin-bottom: 10px;
          width: 48px;
          height: 22px;
          background: var(--el-color-primary-light-9);
          border-radius: 2px;
          line-height: 22px;
          font-size: 14px;
          text-align: center;
          color: var(--el-color-primary);
        }
        .status-err {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
        .title {
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
        }
        .time {
          font-size: 12px;
          color: #909090;
          line-height: 16px;
        }
      }
    }
  }
}
</style>
