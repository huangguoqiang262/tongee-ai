<template>
  <div class="Recycled-box">
    <div class="square">
      <div class="page-title-box">
        <div class="page-title">历史记录</div>
        <div class="right-head-box">
          <div class="filter-box" @click="refresh">
            <img class="filter-icon" src="@renderer/assets/refresh-icon.png" alt="" />
            刷新
          </div>
          <div class="export-box" @click="beforeClearChange">清空记录</div>
        </div>
      </div>
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
        <div class="repository-box">
          <el-skeleton :loading="loading" animated>
            <template #template>
              <div class="list-box">
                <div v-for="item in 6" :key="item" class="list-item">
                  <el-skeleton-item variant="text" class="left-icon" />
                  <div class="center-box">
                    <el-skeleton-item
                      variant="text"
                      style="width: 40%; display: block"
                      class="title"
                    ></el-skeleton-item>
                    <el-skeleton-item
                      variant="text"
                      style="width: 100%; display: block"
                      class="desc"
                    ></el-skeleton-item>
                  </div>
                  <div class="time-box" style="width: 30%">
                    <el-skeleton-item
                      variant="text"
                      style="width: 70%; display: block"
                      class="time"
                    ></el-skeleton-item>
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <div v-if="activeTab == '1'" v-infinite-scroll="loadData" class="list-box">
                <template v-if="list.length">
                  <div v-for="(item, i) in list" :key="i" class="list-item" @click="openChat(item)">
                    <answersIcon class="left-icon" />
                    <div class="center-box">
                      <div class="title">{{ item.latest_question?.content || item.title }}</div>
                      <div class="desc">
                        {{ htmlToText(item.latest_answer?.content || '') }}
                      </div>
                      <div v-if="!Array.isArray(item.from_origin)" class="souce-box">
                        <img class="icon" src="@renderer/assets/souce-icon.png" alt="" />
                        来源：《{{ item.from_origin.fileName }}》
                      </div>
                    </div>
                    <div class="time-box">
                      <div class="time">{{ formatTimeFun(item.updatetime) }}</div>
                      <div class="size">
                        <img
                          class="icon"
                          src="@renderer/assets/edit-icon.png"
                          alt=""
                          @click.stop="beforeRenameChange(item)"
                        />
                        <img
                          class="icon"
                          src="@renderer/assets/del-icon1.png"
                          alt=""
                          @click.stop="beforeDelChange(item)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">
                  <el-empty :image-size="120" description="暂无数据" />
                </div>
              </div>
              <div v-if="activeTab == '2'" v-infinite-scroll="loadData" class="list-box">
                <template v-if="list.length">
                  <div v-for="item in list" :key="item" class="list-item" @click="openWeb(item)">
                    <webpageIcon class="left-icon" />
                    <div class="center-box">
                      <div class="title">{{ item.title }}</div>
                      <div class="desc desc1">{{ item.web_url }}</div>
                    </div>
                    <div class="time-box">
                      <div class="time">{{ formatTimeFun(item.createtime) }}</div>
                      <div class="size">
                        <img
                          class="icon"
                          src="@renderer/assets/del-icon1.png"
                          alt=""
                          @click.stop="beforeDelChange(item)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">
                  <el-empty :image-size="120" description="暂无数据" />
                </div>
              </div>
              <div v-if="activeTab == '3'" class="synergia-box">
                <div class="statistics-list">
                  <div
                    class="statistics-item"
                    :class="{ actives: search_type == 0 }"
                    @click="searchTypeChange(0)"
                  >
                    <div class="value">{{ statisticsData.total || 0 }}</div>
                    <div class="title">全部文件</div>
                    <div class="desc">全部协同文件</div>
                  </div>
                  <div
                    class="statistics-item"
                    :class="{ actives: search_type == 1 }"
                    @click="searchTypeChange(1)"
                  >
                    <div class="value">{{ statisticsData.my_files_count || 0 }}</div>
                    <div class="title">我的文件</div>
                    <div class="desc">我发起的协同文件</div>
                  </div>
                  <div
                    class="statistics-item"
                    :class="{ actives: search_type == 2 }"
                    @click="searchTypeChange(2)"
                  >
                    <div class="value">{{ statisticsData.pending_task_count || 0 }}</div>
                    <div class="title">等待处理</div>
                    <div class="desc">未反馈、未确认、未批准</div>
                  </div>
                  <div
                    class="statistics-item"
                    :class="{ actives: search_type == 3 }"
                    @click="searchTypeChange(3)"
                  >
                    <div class="value">{{ statisticsData.pending_feedback_count || 0 }}</div>
                    <div class="title">完成协同</div>
                    <div class="desc">已确认或已批准的文件</div>
                  </div>
                  <div class="statistics-item">
                    <div class="value">{{ statisticsData.avg_progress_percent || 0 }}%</div>
                    <div class="title">平均进度</div>
                    <div class="desc">我的文件平均进度</div>
                  </div>
                </div>

                <div class="synergia-list">
                  <el-select
                    v-model="process_type"
                    class="typeList-box"
                    :options="fileTypes"
                    :props="{ label: 'title', value: 'id' }"
                    placeholder="请选择类型"
                    clearable
                    @change="tabHandle('3')"
                  />
                  <template v-if="list.length">
                    <div v-for="(item, index) in list" :key="index" class="list-item">
                      <FileSvgShadowIcon class="left-icon" />
                      <div class="center-box">
                        <div class="title-box">
                          <div class="title">{{ item.title }}</div>
                          <div v-if="item.status == 0" class="status">等待反馈</div>
                          <div v-else-if="item.status == 1" class="status">协同进行中</div>
                          <div v-else-if="item.status == 2" class="status">协同审批中</div>
                          <div v-else-if="item.status == 3" class="status">入库审批中</div>
                          <div v-else-if="item.status == 4" class="status err-status">
                            已拒绝入库
                          </div>
                          <div v-else-if="item.status == 5" class="status">已入库</div>
                        </div>
                        <div class="desc">
                          {{ item.path }}
                        </div>
                        <div class="author author1">协同人数：5人</div>
                      </div>
                      <div class="time">{{ formatTimeFun(item.createtime) }}</div>
                    </div>
                  </template>
                  <div v-else class="empty">
                    <el-empty :image-size="120" description="暂无数据" />
                  </div>
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>
    <!-- 清空所有 -->
    <el-dialog
      v-model="clearHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="">确认清空</div>
      </template>
      <span
        >您确定要清空所有{{
          activeTab == '1' ? '问答' : '网页浏览'
        }}历史记录吗？此操作将永久删除所有项目且不可撤销！</span
      >
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="clearHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="clearChange"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 删除单条 -->
    <el-dialog
      v-model="delHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="">确认删除</div>
      </template>
      <span>您确定要删除这条历史记录吗？此操作不可撤销！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="delHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="delHistoryChange"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 重命名 -->
    <el-dialog
      v-model="renameHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/rename-icon.png" alt="" />
        <div class="">重命名记录</div>
      </template>
      <el-form
        ref="renameFormRef"
        :model="renameForm"
        :rules="renameRules"
        class="rename-form"
        @submit.prevent
      >
        <el-form-item prop="renameInput" style="margin-bottom: 0">
          <el-input
            v-model="renameForm.renameInput"
            class="rename-input"
            size="large"
            placeholder="请输入新名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="renameHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitRenameForm(renameFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  get_web_log,
  del_web_log,
  del_web_log_one,
  synergia_history_list
} from '@renderer/api/history'
import { formatTime } from '@renderer/utils/index.js'
import webpageIcon from '@renderer/assets/webpage-icon.svg'
import answersIcon from '@renderer/assets/answers-icon.svg'
import catalogueIcon from '@renderer/assets/upload-files/catalogue-icon.png'
import excelIcon from '@renderer/assets/file-icons/excel-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-icon.png'
import webPageIcon from '@renderer/assets/file-icons/web-page-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-icon.png'
import FileSvgShadowIcon from '@renderer/assets/file-icon1.svg'
import { convertToPlainText } from '@renderer/utils/convertToPlainText'
import { chat_lists, del_chat, del_all_chat, modifyChatHistory } from '@renderer/api/chat'
import { synergia_type_list } from '@renderer/api/repository'
import { ref, onMounted, inject, onErrorCaptured } from 'vue'
onErrorCaptured((err, instance, info) => {
  console.error('组件捕获到错误:', err, info)
  return false // 阻止继续向上传播错误
})
let tabs = ref([
  {
    id: '1',
    name: '问答历史'
  },
  {
    id: '2',
    name: '网页浏览历史'
  },
  {
    id: '3',
    name: '协作历史'
  }
])
// 获取文件图标
const getFileIcon = (item) => {
  if (item.item_type == 2) {
    return catalogueIcon
  } else if (item.item_type == 3) {
    return webPageIcon
  }
  // 根据文件扩展名返回不同的图标
  const ext = item.file_add_info?.url?.split('.').pop()?.toLowerCase()
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
let addNewTab = inject('addNewTab')
const openWeb = (item) => {
  addNewTab({
    title: item.title,
    url: item.web_url,
    isInternal: false
  })
}
const openChat = (item) => {
  if (item.chat_type == 1) {
    addNewTab({
      title: item.title,
      url: 'HomePage',
      isInternal: true,
      attrs: {
        chat_key: item.chat_key,
        backClose: true
      }
    })
  } else if (item.chat_type == 4) {
    addNewTab({
      title: item.title,
      url: 'ImageProductionChat',
      isInternal: true,
      attrs: {
        chat_key: item.chat_key,
        backClose: true
      }
    })
  } else if (item.chat_type == 5) {
    addNewTab({
      title: item.title,
      url: 'IntelligentWritingChat',
      isInternal: true,
      attrs: {
        chat_key: item.chat_key,
        backClose: true
      }
    })
  } else if (item.chat_type == 6) {
    addNewTab({
      title: item.title,
      url: 'ChatPage',
      isInternal: true,
      attrs: {
        chat_key: item.chat_key,
        backClose: true
      }
    })
  } else if (item.chat_type == 7) {
    addNewTab({
      icon: getFileIcon(item),
      title: item.file_add_info?.title || item.title,
      url: 'DocumentDetail',
      isInternal: true,
      attrs: {
        chat_key: item.chat_key,
        fileUrl: item.file_add_info?.url,
        fileName: item.file_add_info?.title || item.title,
        fileId: item.file_key || ''
      }
    })
  }
}
let loading = ref(true)
let activeTab = ref('1')
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
const formatTimeFun = (time) => {
  return formatTime(time)
}
const htmlToText = (html) => {
  return convertToPlainText(html, { maxLength: 100 })
}
const refresh = () => {
  pagination.value = {
    page: 1,
    page_size: 10,
    total: 0
  }
  list.value = []
  getList()
}
const tabHandle = (id) => {
  activeTab.value = id
  pagination.value = {
    page: 1,
    page_size: 10,
    total: 0
  }
  list.value = []
  getList()
}
const list = ref([])
const statisticsData = ref({})
let clearHistory = ref(false)
let beforeClearChange = () => {
  clearHistory.value = true
}
const fileTypes = ref([])
const process_type = ref('')
const search_type = ref(0)
const searchTypeChange = (i) => {
  search_type.value = i
  tabHandle('3')
}
// 获取类型列表
const getTypeList = () => {
  synergia_type_list({}).then((res) => {
    if (res.code == 200) {
      fileTypes.value = [{ id: '', title: '全部' }, ...res.data]
    }
  })
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
}
const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  loading.value = load
  if (activeTab.value == '1') {
    chat_lists(data)
      .then((res) => {
        if (res.code == 200) {
          list.value = list.value.concat(res.data.data)
          pagination.value.total = res.data.total
          pagination.value.page = res.data.current_page
          pagination.value.page_size = res.data.per_page
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else if (activeTab.value == '2') {
    get_web_log(data)
      .then((res) => {
        if (res.code == 200) {
          list.value = list.value.concat(res.data.data)
          pagination.value.total = res.data.total
          pagination.value.page = res.data.current_page
          pagination.value.page_size = res.data.per_page
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else if (activeTab.value == '3') {
    loading.value = false
    var synergiaData = {
      ...data,
      process_type: process_type.value,
      search_type: search_type.value
    }
    synergia_history_list(synergiaData)
      .then((res) => {
        if (res.code == 200) {
          list.value = list.value.concat(res.data.list.data || [])
          statisticsData.value = res.data.summary || {}
          pagination.value.total = res.data.list.total
          pagination.value.page = res.data.list.current_page
          pagination.value.page_size = res.data.list.per_page
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}
let delHistory = ref(false)
let delItem = ref({})
let beforeDelChange = (item) => {
  delHistory.value = true
  delItem.value = {
    chat_key: item.chat_key || '',
    log_id: item.id
  }
}
// 删除单条对话或历史浏览记录
let delHistoryChange = () => {
  if (activeTab.value == '1') {
    del_chat({ chat_key: delItem.value.chat_key }).then((res) => {
      if (res.code == 200) {
        delHistory.value = false
        tabHandle('1')
        // eslint-disable-next-line no-undef
        ElMessage.primary('删除成功')
      }
    })
  } else if (activeTab.value == '2') {
    del_web_log_one({ log_id: delItem.value.log_id }).then((res) => {
      if (res.code == 200) {
        delHistory.value = false
        tabHandle('2')
        // eslint-disable-next-line no-undef
        ElMessage.primary('删除成功')
      }
    })
  }
}
// 清空所有对话或历史浏览记录
let clearChange = () => {
  if (activeTab.value == '1') {
    del_all_chat().then((res) => {
      if (res.code == 200) {
        clearHistory.value = false
        tabHandle('1')
        // eslint-disable-next-line no-undef
        ElMessage.primary('清空成功')
      }
    })
  } else if (activeTab.value == '2') {
    del_web_log().then((res) => {
      if (res.code == 200) {
        clearHistory.value = false
        tabHandle('2')
        // eslint-disable-next-line no-undef
        ElMessage.primary('清空成功')
      }
    })
  }
}
let renameHistory = ref(false)
let renameItem = ref({})
let beforeRenameChange = (item) => {
  renameForm.value.renameInput = item.latest_question?.content || ''
  renameForm.value.chat_words_id = item.latest_question?.id || ''
  renameHistory.value = true
  renameItem.value = item
}
let renameForm = ref({
  renameInput: '',
  chat_words_id: ''
})
let renameRules = ref({
  renameInput: [
    { required: true, message: '请输入新名称', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value.trim().length) {
          callback(new Error('名称不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})
let renameFormRef = ref(null)
const submitRenameForm = (FormRef) => {
  FormRef.validate((valid) => {
    if (valid) {
      modifyChatHistory({
        chat_words_id: renameForm.value.chat_words_id,
        content: renameForm.value.renameInput
      }).then((res) => {
        if (res.code == 200) {
          renameItem.value.latest_question.content = renameForm.value.renameInput
          renameHistory.value = false
          // tabHandle('1')
          // eslint-disable-next-line no-undef
          ElMessage.primary('修改成功')
        }
      })
    } else {
      console.log('表单验证失败')
    }
  })
}
onMounted(() => {
  getTypeList()
  getList()
})
</script>

<style scoped lang="scss">
.Recycled-box {
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

    .page-title-box {
      flex-shrink: 0;
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 22px;
        font-weight: 500;
        color: var(--default-font-color);
        line-height: 30px;
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
            opacity: 0.6;
          }

          &.active {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary-light-8);
          }

          .filter-icon {
            width: 12px;
            height: 12px;
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
            opacity: 0.6;
          }
        }
      }
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
        perspective: 100px; // 创建3D渲染上下文
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
      .repository-box {
        max-height: 100%;
        width: 100%;
        background: #f9f9f9;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .list-box {
          box-sizing: border-box;
          padding: 0 20px;
          overflow-y: auto;
          contain: layout style;
          .empty {
            padding-top: 80px;
            height: 425px;
            font-size: 13px;
            text-align: center;
            line-height: 20px;
            color: #909090;
          }
          .list-item {
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;

            &:last-child {
              border-bottom: none;
            }
            &:hover {
              .time-box {
                .size {
                  visibility: visible;
                }
              }
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
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .desc {
                margin-top: 4px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &.desc1 {
                  margin-top: 10px;
                }
              }
              .souce-box {
                margin-top: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                .icon {
                  width: 12px;
                  height: 12px;
                  vertical-align: middle;
                  margin-right: 8px;
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
                    opacity: 0.6;
                  }

                  &.btn1 {
                    color: var(--default-font-color);
                    border-color: #efefef;
                  }

                  &.btn2 {
                    color: #909090;
                    border-color: #efefef;
                  }
                }
              }
            }

            .time-box {
              flex-shrink: 0;
              font-size: 12px;
              color: #909090;
              line-height: 22px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: flex-end;

              .size {
                margin-bottom: 1px;
                display: flex;
                align-items: center;
                gap: 16px;
                visibility: hidden;
                .icon {
                  flex-shrink: 0;
                  width: 14px;
                  height: 14px;
                  cursor: pointer;
                }
              }
            }
          }
        }
        .synergia-box {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #fff;
          .statistics-list {
            box-sizing: border-box;
            margin-bottom: 10px;
            padding: 20px 0px;
            width: 100%;
            height: 120px;
            background: #f9f9f9;
            border-radius: 12px;
            display: flex;
            align-items: center;
            .statistics-item {
              flex-shrink: 0;
              width: 20%;
              text-align: center;
              // 添加高亮聚光灯效果 锥形
              &.actives {
                color: var(--el-color-primary);
                .title {
                  color: var(--el-color-primary);
                }
                .desc {
                  color: var(--el-color-primary-light-3);
                }
              }
              .value {
                margin-bottom: 6px;
                font-size: 26px;
                line-height: 32px;
                font-family: DOUYINSANSBOLD;
                .unit {
                  font-size: 20px;
                  font-weight: normal;
                  font-family:
                    PingFangSC,
                    PingFang SC;
                }
              }
              .title {
                margin-bottom: 8px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 18px;
              }
              .desc {
                font-size: 12px;
                line-height: 16px;
                color: #909090;
              }
            }
          }
          .typeList-box {
            position: sticky;
            top: 10px;
            right: 0px;
            margin: 10px 0 5px auto;
            display: block;
            width: 210px;
          }
          .synergia-list {
            box-sizing: border-box;
            width: 100%;
            padding: 0 20px;
            overflow-y: auto;
            background: #f9f9f9;
            border-radius: 12px;
            contain: layout style;
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
                  gap: 0 10px;
                  margin-bottom: 8px;
                  overflow: hidden;
                  .title {
                    max-width: calc(100% - 80px);
                    font-size: 14px;
                    color: var(--default-font-color);
                    line-height: 22px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                  }
                  .status {
                    flex-shrink: 0;
                    box-sizing: border-box;
                    padding: 0 6px;
                    font-size: 10px;
                    color: var(--el-color-primary);
                    line-height: 14px;
                    height: 16px;
                    background: var(--el-color-primary-light-9);
                    border-radius: 2px;
                    border: 1px solid var(--el-color-primary);
                    &.err-status {
                      color: var(--el-danger-color);
                      border-color: var(--el-danger-color);
                      background: var(--el-danger-color-light-9);
                    }
                  }
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
      }
    }
  }

  :deep(.clear-recycled-dialog) {
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
          width: 16px;
          height: 16px;
        }
      }

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        .rename-input {
          .el-input__wrapper {
            background: #f9f9f9;
            box-shadow: none;
            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
            .el-input__inner {
              font-size: 14px;
              color: var(--default-font-color);
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
}
</style>
<style lang="scss">
.Recycled-handle-popover {
  border-radius: 8px !important;
  padding: 19px 18px !important;

  .handle-box {
    display: flex;
    flex-direction: column;
    gap: 22px;

    .handle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      cursor: pointer;
      transition: all 0.2s linear;

      // &:hover {
      //   color: var(--el-color-primary);
      // }
      &:active {
        opacity: 0.6;
      }

      .icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
