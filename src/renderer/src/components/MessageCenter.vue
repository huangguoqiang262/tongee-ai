<template>
  <div class="message-center-box">
    <div class="square">
      <div class="page-title">消息中心</div>
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ 'active-tab': tab.id == activeTab }"
          @click="tabHandle(tab.id)"
        >
          {{ tab.name }}
        </div>
      </div>
      <div class="content-box">
        <div v-if="activeTab == '1'" class="repository-box">
          <div class="head">
            <div class="search-box">
              <el-input
                v-model="searchVal"
                clearable
                class="search-input"
                placeholder="搜索反馈内容"
                :suffix-icon="searchVal ? '' : Search"
                @change="tabHandle(1)"
              />
            </div>
            <div class="right-head-box">
              <el-tooltip
                ref="datePickerTooltip"
                placement="bottom-end"
                effect="light"
                trigger="click"
              >
                <template #content>
                  <el-date-picker
                    v-model="dateValue"
                    :teleported="false"
                    format="YYYY/MM/DD"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    @change="changeDate"
                  />
                </template>
                <div class="filter-box" :class="{ active: dateValue && dateValue.length > 0 }">
                  <svg
                    width="14px"
                    height="14px"
                    viewBox="0 0 14 14"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g id="消息中心—知识库反馈" transform="translate(-1282, -244)">
                        <rect fill="#FAFAFA" x="0" y="0" width="1920" height="1080"></rect>
                        <g id="编组-2">
                          <rect id="矩形" x="0" y="0" width="1920" height="1080"></rect>
                          <g id="背景" transform="translate(0, 0)" fill="#EEEFF0">
                            <rect id="矩形" x="0" y="0" width="1920" height="1080"></rect>
                          </g>
                        </g>
                        <rect
                          id="矩形备份-18"
                          fill="#FFFFFF"
                          x="68"
                          y="52"
                          width="1842"
                          height="1018"
                          rx="16"
                        ></rect>
                        <rect
                          id="矩形"
                          fill="#F9F9F9"
                          x="534"
                          y="214"
                          width="910"
                          height="490"
                          rx="12"
                        ></rect>
                        <rect
                          id="矩形备份-3"
                          stroke="#EFEFEF"
                          x="1268.5"
                          y="238.5"
                          width="69"
                          height="25"
                          rx="6"
                        ></rect>
                        <g id="245筛选过滤" transform="translate(1282, 244)" fill-rule="nonzero">
                          <rect
                            id="矩形"
                            fill="#000000"
                            opacity="0"
                            x="0"
                            y="0"
                            width="14"
                            height="14"
                          ></rect>
                          <path
                            id="路径"
                            d="M11.9546875,2.996875 L7.875,7.8859375 L7.875,10.7296875 C7.875,10.7953125 7.8421875,10.8609375 7.7984375,10.9046875 L6.4859375,11.9765625 C6.34375,12.096875 6.125,11.9875 6.125,11.8015625 L6.125,7.8859375 L2.0453125,2.996875 C1.925,2.8546875 2.0234375,2.6359375 2.209375,2.6359375 L11.7796875,2.6359375 C11.965625,2.6359375 12.075,2.8546875 11.9546875,2.996875 Z"
                            :fill="fillColor"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                  筛选
                </div>
              </el-tooltip>

              <div class="export-box" @click="exportFeedback">导出反馈</div>
            </div>
          </div>
          <div v-if="feedList.length" v-infinite-scroll="loadData" class="list-box">
            <div v-for="item in feedList" :key="item.id" class="list-item">
              <FileSvgIcon class="left-icon" />
              <div class="center-box">
                <div class="title">
                  关于{{ item.type_name }}的{{ item.sug_or_pb == 1 ? '问题' : '建议' }}
                </div>
                <div class="desc desc-hide">{{ htmlToText(item.content) }}</div>
                <div class="author">
                  提交者：{{ item.username || ''
                  }}{{ item.user_dept ? '(' + item.dept_name + ')' : '' }}
                </div>
                <div class="btns">
                  <div v-if="item.status == 0" class="btn" @click="markHandle(item)">
                    标记已处理
                  </div>
                  <div v-if="item.status == 1" class="btn btn2">已处理</div>
                  <div class="btn btn1" @click="showDetail(item)">查看详情</div>
                </div>
              </div>
              <div class="time">{{ formatTimeFun(item.createtime) }}</div>
            </div>
          </div>
          <div v-else class="empty">
            <el-empty :image-size="120" description="暂无数据" />
          </div>
        </div>
        <div v-if="activeTab == '2'" class="repository-box">
          <div v-if="fileList.length" v-infinite-scroll="loadData" class="list-box">
            <div v-for="item in fileList" :key="item.id" class="list-item">
              <FileSvgShadowIcon class="left-icon" />
              <div class="center-box">
                <div class="title">新增《临床实验报告模板》</div>
                <div class="desc">新增了符合最新法规要求的临床试验报告模板，供所有项目参考使用</div>
                <div class="author author1">张医生·临床部·5天前更新</div>
              </div>
              <div class="time">18:00</div>
            </div>
          </div>
          <div v-else class="empty">
            <el-empty :image-size="120" description="暂无数据" />
          </div>
        </div>
        <div v-if="activeTab == '3'" class="repository-box">
          <div v-if="systemMsgList.length" v-infinite-scroll="loadData" class="list-box">
            <div v-for="item in systemMsgList" :key="item.id" class="list-item">
              <InformSvgIcon class="left-icon" />
              <div class="center-box">
                <div class="title">{{ item.title }}</div>
                <div class="desc desc1">
                  {{ item.content }}
                </div>
              </div>
              <div class="time">{{ formatTimeFun(item.createtime) }}</div>
            </div>
          </div>
          <div v-else class="empty">
            <el-empty :image-size="120" description="暂无数据" />
          </div>
        </div>
        <div v-if="activeTab == '4'" class="synergia-box">
          <div class="synergia-list">
            <div
              v-for="(item, index) in synergiaMsgList"
              :key="index"
              class="list-item"
              @click="lookSystem(item)"
            >
              <FileSvgShadowIcon class="left-icon" />
              <div class="center-box">
                <div class="title-box">
                  <div class="title">{{ item.title }}</div>
                  <div class="time">{{ formatTimeFun(item.createtime) }}</div>
                </div>
                <div class="author">
                  <span class="author-name">提交者：{{ item.sender_name }}</span>
                  <span>地址：{{ item.file_edit_url }}</span>
                </div>
                <div class="message-box">
                  <div class="message-text" :class="{ 'message-text-err': item.is_refuse == 1 }">
                    {{ item.content }}
                  </div>
                  <!-- <div v-if="item.user_status == 0" class="handle-box">
                    <el-button class="btn-refuse" size="small" @click="handleRefuse(item)"
                      >确认反馈</el-button
                    >
                    <el-button
                      class="btn-agree"
                      type="primary"
                      size="small"
                      @click="handleAgree(item)"
                      >确认通过</el-button
                    >
                  </div>
                  <div v-else-if="item.user_status == 2" class="handle-box">
                    <el-button
                      class="btn-agree"
                      type="primary"
                      size="small"
                      @click="handleAgree(item)"
                      >批准入库</el-button
                    >
                  </div> -->
                  <div v-if="item.user_status == 4 && item.msg_type == 6" class="handle-box">
                    <el-button class="btn-refuse" size="small" @click="handleRefuse(item)"
                      >拒绝</el-button
                    >
                    <el-button
                      class="btn-agree"
                      type="primary"
                      size="small"
                      @click="handleAgree(item)"
                      >同意</el-button
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="feedbackDetailVisible"
      :close-on-click-modal="false"
      align-center
      :show-close="true"
      destroy-on-close
      modal-class="feedback-detail-box-dialog"
      width="850"
    >
      <template #header>
        <div class="head-left">
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/repository/fk-icon.png"
            alt=""
          />
          <div class="">反馈详情</div>
        </div>
      </template>
      <div class="detail-box">
        <Toolbar
          v-show="false"
          :default-config="defaultConfig"
          :editor="editorRef"
          mode="default"
        />
        <div class="title-input">
          {{ '关于' + deepData.type_name + '的' + (deepData.sug_or_pb == 1 ? '问题' : '建议') }}
        </div>
        <div class="type-box">
          <div class="status" :class="{ 'status-err': deepData.sug_or_pb == 1 }">
            {{ deepData.sug_or_pb == 1 ? '问题' : '建议' }}
          </div>
          <div class="doc-type">文档类别：{{ deepData.doc_type_name || '' }}</div>
          <div class="feekback-type">反馈分类：{{ deepData.type_name || '' }}</div>
        </div>
        <Editor
          v-model="deepData.content"
          class="editor-content"
          mode="default"
          @on-created="handleCreated"
        />
      </div>
    </el-dialog>
    <el-dialog
      v-model="refuseVisible"
      draggable
      align-center
      modal-class="refuse-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/refuse-icon.png" alt="" />
        <div class="">拒绝原因</div>
      </template>
      <el-form
        ref="refuseFormRef"
        :model="refuseForm"
        :rules="refuseRules"
        class="rename-form"
        @submit.prevent
      >
        <el-form-item prop="refuseInput" style="margin-bottom: 0">
          <el-input
            v-model="refuseForm.refuseInput"
            type="textarea"
            resize="none"
            class="refuse-input"
            size="large"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="refuseVisible = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitRefuseForm(refuseFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, watchEffect, shallowRef, nextTick, inject } from 'vue'
import FileSvgIcon from '@renderer/assets/file-icon.svg'
import FileSvgShadowIcon from '@renderer/assets/file-icon1.svg'
import InformSvgIcon from '@renderer/assets/inform-icon.svg'
import catalogueIcon from '@renderer/assets/upload-files/catalogue-icon.png'
import excelIcon from '@renderer/assets/file-icons/excel-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-icon.png'
import webPageIcon from '@renderer/assets/file-icons/web-page-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-icon.png'
import { formatTime } from '@renderer/utils/index.js'
import {
  get_system_msg,
  get_file_logs,
  get_list,
  export_feedback,
  synergia_message_list
} from '@renderer/api/messageCenter'
import { synergia_audit_in_know } from '@renderer/api/repository'
import { feedback_mark } from '@renderer/api/feedback'
import { convertToPlainText } from '@renderer/utils/convertToPlainText.js'
let fillColor = 'var(--default-font-color)'
const props = defineProps({
  attrs: {
    type: Object,
    default: () => {}
  }
})
const refuseVisible = ref(false)
const refuseFormRef = ref(null)
const refuseForm = ref({
  refuseInput: '',
  item_id: ''
})
const refuseRules = ref({
  refuseInput: [{ required: true, message: '请输入拒绝原因', trigger: ['blur'] }]
})
const addNewTab = inject('addNewTab')
const lookSystem = (item) => {
  addNewTab({
    icon: getFileIcon(item),
    title: item.process_title,
    url: 'SynergiaDetail',
    isInternal: true,
    attrs: {
      fileUrl: item.file_edit_url,
      fileName: item.process_title,
      fileId: item.file_key,
      itemId: item.item_id || ''
    }
  })
}
// 获取文件图标
const getFileIcon = (item) => {
  if (item.item_type == 2) {
    return catalogueIcon
  } else if (item.item_type == 3) {
    return webPageIcon
  }
  // 根据文件扩展名返回不同的图标
  const ext = item.file_edit_url?.split('.').pop()?.toLowerCase()
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
    web: webPageIcon
  }

  return iconMap[ext] || wordIcon
}
const submitRefuseForm = (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      var data = {
        audit_type: 2,
        item_id: refuseForm.value.item_id,
        reason: refuseForm.value.refuseInput
      }
      synergia_audit_in_know(data).then((res) => {
        if (res.code == 200) {
          tabHandle(4)
          // synergiaMsgList.value.find(
          //   (item) => item.item_id == refuseForm.value.item_id
          // ).user_status = 5
          refuseVisible.value = false
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '拒绝入库成功'
          })
        }
      })
    }
  })
}
// 同意入库
const handleAgree = (item) => {
  refuseForm.value.item_id = item.item_id
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认同意入库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      var data = {
        audit_type: 1,
        item_id: refuseForm.value.item_id
      }
      synergia_audit_in_know(data).then((res) => {
        if (res.code == 200) {
          tabHandle(4)
          // synergiaMsgList.value.find(
          //   (item) => item.item_id == refuseForm.value.item_id
          // ).user_status = 5
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '同意入库成功'
          })
        }
      })
    })
    .catch(() => {})
}
// 拒绝入库
const handleRefuse = (item) => {
  refuseForm.value.item_id = item.item_id
  refuseVisible.value = true
  nextTick(() => {
    refuseFormRef.value.resetFields()
  })
}
let searchVal = ref('')
let tabs = ref([
  {
    id: '1',
    name: '知识库反馈'
  },
  {
    id: '2',
    name: '文件更新'
  },
  {
    id: '3',
    name: '系统通知'
  },
  {
    id: '4',
    name: '协作通知'
  }
])
let feedbackDetailVisible = ref(false)
let deepData = ref({})
let defaultConfig = {}
let editorRef = shallowRef(null)
const handleCreated = (editor) => {
  editorRef.value = editor
  nextTick(() => {
    editorRef.value.disable()
  })
}
const formatTimeFun = (time) => {
  return formatTime(time)
}
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
const htmlToText = (html) => {
  return convertToPlainText(html, { maxLength: 100 })
}
let activeTab = ref('1')
const tabHandle = (id) => {
  activeTab.value = id
  pagination.value = {
    page: 1,
    page_size: 10,
    total: 0
  }
  feedList.value = []
  fileList.value = []
  systemMsgList.value = []
  synergiaMsgList.value = []
  if (id == '1') {
    getList()
  } else if (id == '2') {
    getFileList()
  } else if (id == '3') {
    getSystemMsgList()
  } else if (id == '4') {
    getSynergiaList()
  }
}
const exportFeedback = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size,
    search_type: 1,
    keyword: searchVal.value,
    start_time: dateValue.value?.[0] || '',
    end_time: dateValue.value?.[1] || ''
  }
  export_feedback(data).then((res) => {
    if (res.code == 200) {
      //通过返回export_file_url 链接创建a标签下载
      let a = document.createElement('a')
      a.href = res.data.export_file_url
      a.download = `反馈数据${new Date().getTime()}.xlsx`
      a.click()
    }
  })
}
const markHandle = (item) => {
  feedback_mark({
    id: item.id
  }).then((res) => {
    if (res.code == 200) {
      item.status = 1
      // eslint-disable-next-line no-undef
      ElMessage.primary('标记已处理')
    }
  })
}
const showDetail = (item) => {
  deepData.value = item
  feedbackDetailVisible.value = true
}
let dateValue = ref([])
let datePickerTooltip = ref(null)
const changeDate = (val) => {
  datePickerTooltip.value.hide()
  if (val && val.length > 0) {
    fillColor = 'var(--el-color-primary)'
  } else {
    fillColor = 'var(--default-font-color)'
  }
  tabHandle(activeTab.value)
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  if (activeTab.value == '1') {
    getList()
  } else if (activeTab.value == '2') {
    getFileList()
  } else if (activeTab.value == '3') {
    getSystemMsgList()
  } else if (activeTab.value == '4') {
    getSynergiaList()
  }
}
const synergiaMsgList = ref([])
const getSynergiaList = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  synergia_message_list(data).then((res) => {
    synergiaMsgList.value = synergiaMsgList.value.concat(res.data.data || [])
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    pagination.value.page_size = res.data.per_page
  })
}
const feedList = ref([])
const getList = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size,
    search_type: 1,
    keyword: searchVal.value,
    start_time: dateValue.value?.[0] || '',
    end_time: dateValue.value?.[1] || ''
  }
  get_list(data).then((res) => {
    feedList.value = feedList.value.concat(res.data.data || [])
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    pagination.value.page_size = res.data.per_page
  })
}
const fileList = ref([])
const getFileList = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  get_file_logs(data).then((res) => {
    fileList.value = fileList.value.concat(res.data.data || [])
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    pagination.value.page_size = res.data.per_page
  })
}
const systemMsgList = ref([])
const getSystemMsgList = () => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  get_system_msg(data).then((res) => {
    systemMsgList.value = systemMsgList.value.concat(res.data.data || [])
    pagination.value.total = res.data.total
    pagination.value.page = res.data.current_page
    pagination.value.page_size = res.data.per_page
  })
}
onMounted(() => {
  getList()
})
watchEffect(() => {
  activeTab.value = props.attrs.activeTab || '1'
  nextTick(() => {
    tabHandle(activeTab.value)
  })
})
</script>

<style scoped lang="scss">
:deep(.refuse-dialog) {
  .el-dialog {
    .el-dialog__header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;

      .dialog-header-del-icon {
        width: 18px;
        height: 18px;
      }
    }

    .el-dialog__body {
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      .refuse-input {
        height: 140px;
        .el-textarea__inner {
          height: 100%;
          background: #f9f9f9;
          box-shadow: none;
          font-size: 14px;
          color: var(--default-font-color);
          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }
      }
    }

    .dialog-footer {
      .cancel-btn,
      .confirm-btn {
        height: 36px;
        width: 80px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
      }

      .cancel-btn {
        background: #efefef;
        color: var(--default-font-color);
      }
    }
  }
}
:deep(.feedback-detail-box-dialog) {
  .el-dialog {
    padding: 13px 20px 14px;
    .el-dialog__header {
      padding-bottom: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-weight: 500;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      .head-left {
        display: flex;
        align-items: center;
        gap: 10px;
        .dialog-header-del-icon {
          width: 16px;
          height: 16px;
        }
      }
      .head-right {
        display: flex;
        align-items: center;
        gap: 20px;
        .close-icon {
          color: #737475;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s linear;
          &:hover {
            color: var(--el-color-primary);
          }
        }
        .open-chat {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 99px;
          height: 36px;
          font-size: 14px;
          color: var(--default-font-color);
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9e9e9;
          }

          .logo {
            flex-shrink: 0;
            display: block;
            width: 16px;
            height: 16px;
          }
        }
        .save {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }
    }

    .el-dialog__body {
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      overflow: hidden;
      height: 660px;
      background: #f9f9f9;
      border-radius: 10px;
      .detail-box {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .w-e-toolbar {
          flex-shrink: 0;
          background: transparent !important;
        }
        .title-input {
          flex-shrink: 0;
          width: calc(100% - 10px);
          padding: 1px 10px;
          margin: 10px auto 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--default-font-color);
        }
        .type-box {
          padding: 10px;
          display: flex;
          gap: 10px 30px;
          flex-wrap: wrap;
          .doc-type,
          .feekback-type {
            font-size: 14px;
            color: var(--default-font-color);
          }
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
        .editor-content {
          flex: 1;
          padding: 0 5px;
          background: transparent !important;
          overflow: hidden;
          .w-e-text-container {
            background: transparent !important;
            .w-e-text-placeholder {
              color: #909090;
            }
          }
        }
      }
    }
    .el-dialog__footer {
      .dialog-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #909090;
        line-height: 20px;
      }
    }
  }
}
.message-center-box {
  box-sizing: border-box;
  padding: 50px 20px 10px;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  .square {
    width: 100%;
    max-width: 910px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .page-title {
      flex-shrink: 0;
      margin-bottom: 40px;
      font-size: 22px;
      font-weight: 500;
      color: var(--default-font-color);
      line-height: 30px;
    }
    .tabs {
      margin-bottom: 20px;
      flex-shrink: 0;
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px 40px;
      .tab-item {
        flex-shrink: 0;
        font-size: 14px;
        color: #555555;
        line-height: 22px;
        cursor: pointer;
        transition: all 0.2s linear;
        will-change: color, font-size, font-weight;
        backface-visibility: hidden;
        perspective: 100px;
        &.active-tab {
          color: var(--el-color-primary);
          font-size: 16px;
          font-weight: 500;
        }
      }
    }
    .content-box {
      flex: 1;
      overflow: hidden;
      .empty {
        margin: 30px auto 100px;
        font-size: 13px;
        color: #909090;
        text-align: center;
        line-height: 20px;
      }
      .repository-box {
        max-height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 0 0 0 20px;
        background: #f9f9f9;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .head {
          flex-shrink: 0;
          padding-top: 20px;
          padding-right: 20px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .search-box {
            .search-input {
              :deep(.el-input__wrapper) {
                background: #fff;
                border-radius: 20px;
                width: 280px;
                padding-left: 20px;
                font-size: 14px;
                .el-input__inner {
                  color: var(--default-font-color);
                  height: 32px;
                }
              }
            }
          }
          .right-head-box {
            display: flex;
            align-items: center;
            gap: 10px;
            .filter-box {
              width: 70px;
              height: 26px;
              border-radius: 6px;
              border: 1px solid #efefef;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              font-size: 12px;
              color: var(--default-font-color);
              cursor: pointer;
              &:active {
                opacity: 0.8;
              }
              &.active {
                color: var(--el-color-primary);
                border-color: var(--el-color-primary-light-8);
              }
              .filter-icon {
                width: 14px;
                height: 14px;
              }
            }
            .export-box {
              width: 76px;
              height: 26px;
              background: var(--el-color-primary);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: #fff;
              cursor: pointer;
              &:active {
                opacity: 0.8;
              }
            }
          }
        }
        .list-box {
          padding-right: 20px;
          overflow-y: auto;
          .list-item {
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            &:last-child {
              border-bottom: none;
            }
            .left-icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
              color: var(--el-color-primary);
            }
            .center-box {
              flex: 1;
              overflow: hidden;
              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
              }
              .desc {
                margin-bottom: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                &.desc-hide {
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                &.desc1 {
                  margin-bottom: 0;
                }
              }
              .author {
                margin-bottom: 10px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                &.author1 {
                  margin-bottom: 0;
                }
              }
              .btns {
                display: flex;
                gap: 10px;
                .btn {
                  box-sizing: border-box;
                  min-width: 76px;
                  padding: 5px 8px;
                  font-size: 12px;
                  text-align: center;
                  color: var(--el-color-primary);
                  line-height: 16px;
                  border-radius: 6px;
                  border: 1px solid var(--el-color-primary-light-8);
                  cursor: pointer;
                  &:active {
                    opacity: 0.8;
                  }
                  &.btn1 {
                    color: var(--default-font-color);
                    border-color: #efefef;
                  }
                  &.btn2 {
                    color: #909090;
                    border-color: #efefef;
                    cursor: default;
                  }
                }
              }
            }
            .time {
              flex-shrink: 0;
              font-size: 12px;
              color: #909090;
              line-height: 22px;
            }
          }
        }
      }
      .synergia-box {
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .synergia-list {
          box-sizing: border-box;
          width: 100%;
          padding: 0 20px;
          overflow-y: auto;
          background: #f9f9f9;
          border-radius: 12px;
          .list-item {
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            &:last-child {
              border-bottom: none;
            }
            .left-icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
              color: var(--el-color-primary);
            }
            .center-box {
              flex: 1;
              overflow: hidden;
              .title-box {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0 10px;
                margin-bottom: 8px;
                overflow: hidden;
                .title {
                  flex: 1;
                  font-size: 14px;
                  color: var(--default-font-color);
                  line-height: 22px;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  overflow: hidden;
                }
                .time {
                  flex-shrink: 0;
                  font-size: 12px;
                  color: #909090;
                  line-height: 22px;
                }
              }
              .author {
                margin-bottom: 16px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                display: flex;
                // align-items: center;
                gap: 0 20px;
                word-break: break-all;
                .author-name {
                  flex-shrink: 0;
                }
              }
              .message-box {
                box-sizing: border-box;
                padding: 11px 10px;
                display: flex;
                align-items: center;
                gap: 0 20px;
                justify-content: space-between;
                border-radius: 6px;
                border: 1px solid #efefef;
                background: #fff;
                .message-text {
                  flex: 1;
                  font-size: 12px;
                  color: var(--default-font-color);
                  line-height: 16px;
                  &.message-text-err {
                    color: #ff5151;
                  }
                }
                .handle-box {
                  display: flex;
                  .btn-agree,
                  .btn-refuse {
                    box-sizing: border-box;
                    width: 60px;
                    border-radius: 6px;
                    cursor: pointer;
                    &:active {
                      opacity: 0.8;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
