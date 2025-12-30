<template>
  <div class="upload-files-box">
    <el-dialog
      v-model="uploadVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      modal-class="upload-files-box-dialog"
      width="430"
      @close="closeUploadDialog"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/upload-files/upload-file-icon.png"
          alt=""
        />
        <div class="">上传文件</div>
      </template>
      <div class="file-list">
        <div
          v-for="(item, index) in uploadList"
          :key="item.uid"
          class="file-item"
          :class="{ err: item.status === 'error' }"
        >
          <img class="icon" :src="getFileIcon(item)" alt="" />
          <div class="file-item-right">
            <div class="right-top">
              <div class="title">{{ item.name }}</div>
              <div class="status-tip" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
                <span>({{ item.uploadedCount }}/{{ item.totalCount }})</span>
              </div>
            </div>
            <div class="right-center">
              <div class="right-center-label">
                <span v-if="item.size" class="file-size">{{ formatFileSize(item.size) }}</span>
                <span v-if="item.size" class="file-size">·</span>
                <span class="file-path">上传至：{{ props.knowledgePath }}</span>
              </div>
              <img
                class="delete-icon"
                src="@renderer/assets/del-icon1.png"
                alt=""
                @click="delErrItem(index)"
              />
            </div>
            <div class="right-bottom">
              <div class="progress">
                <div class="bar" :style="{ width: item.progress + '%' }"></div>
              </div>
            </div>
            <!-- <div v-if="item.status === 'success'" class="right-bottom">
              <div class="success-text">上传成功</div>
            </div>
            <div v-else-if="item.status === 'error'" class="right-bottom">
              <div class="error-text">上传失败: {{ item.errorMessage }}</div>
            </div> -->
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-popover
            ref="repositoryuploadPopover"
            popper-class="custom-repository-popover"
            trigger="click"
            placement="bottom"
            :show-arrow="false"
          >
            <template #reference>
              <el-button class="continue-uploading">
                <img
                  class="icon"
                  src="@renderer/assets/upload-files/continue-uploading-icon.png"
                  alt=""
                />
                继续上传
              </el-button>
            </template>
            <div class="common-handle-box" @click="hidePopover(repositoryuploadPopover)">
              <div class="item" @click="beforeUploadFiles('local-file')">
                <img class="icon" src="@renderer/assets/popover/local-file-icon.png" alt="" />
                <div class="title">本地文件</div>
              </div>
              <div class="item" @click="beforeUploadFiles('local-folder')">
                <img class="icon" src="@renderer/assets/popover/local-folder-icon.png" alt="" />
                <div class="title">本地文件夹</div>
              </div>
              <!-- <div class="item">
                  <img class="icon" src="@renderer/assets/popover/catalogue-file-icon.png" alt="" />
                  <div class="title">目录文件</div>
                </div>
                <div class="item">
                  <img
                    class="icon"
                    src="@renderer/assets/popover/directory-folder-icon.png"
                    alt=""
                  />
                  <div class="title">目录文件夹</div>
                </div> -->
              <!-- <el-popover
                ref="repositoryuploadPopover"
                popper-class="custom-repository-popover"
                trigger="hover"
                placement="right-start"
                :show-arrow="false"
              >
                <template #reference>
                  <div class="item">
                    <img class="icon" src="@renderer/assets/popover/note-icon.png" alt="" />
                    <div class="title">笔记</div>
                    <el-icon>
                      <ArrowRight />
                    </el-icon>
                  </div>
                </template>
                <div class="common-handle-box" @click="hidePopover(repositoryuploadPopover)">
                  <div class="item">
                    <img class="icon" src="@renderer/assets/repository/new-note-icon.png" alt="" />
                    <div class="title">新建笔记</div>
                  </div>
                  <div class="item">
                    <img
                      class="icon"
                      src="@renderer/assets/repository/import-notes-icon.png"
                      alt=""
                    />
                    <div class="title">导入笔记</div>
                  </div>
                </div>
              </el-popover>

              <div class="item" @click="beforeUploadFiles('createFolder')">
                <img class="icon" src="@renderer/assets/popover/createFolder-icon.png" alt="" />
                <div class="title">创建文件夹</div>
              </div>
              <div class="item" @click="beforeUploadFiles('import-web')">
                <img class="icon" src="@renderer/assets/popover/web-page-icon.png" alt="" />
                <div class="title">导入网页</div>
              </div> -->
            </div>
          </el-popover>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Buffer } from 'buffer'
import { create_folder_task, task_list } from '@renderer/api/uploadRepository'
import { user_info } from '@renderer/api/user'
import { useUserStore } from '@renderer/stores/user'
import cloneDeep from 'lodash.clonedeep'
import { ref, watch, onUnmounted } from 'vue'
import catalogueIcon from '@renderer/assets/upload-files/catalogue-icon.png'
import excelIcon from '@renderer/assets/file-icons/excel-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-icon.png'
let repositoryuploadPopover = ref(null)
let uploadVisible = defineModel({ type: Boolean })
// let waitUploadList = ref([])
// 文件上传状态定义
const uploadStatus = {
  PENDING: 'pending', // 等待上传
  UPLOADING: 'uploading', // 上传中
  SUCCESS: 'success', // 上传成功
  ERROR: 'error' // 上传失败
}
const getUserInfo = () => {
  const userStore = useUserStore()
  return user_info({}).then((res) => {
    if (res.code == 200) {
      userStore.updateUser(res.data?.user_info)
    }
  })
}
let mapStatus = {
  0: uploadStatus.PENDING,
  1: uploadStatus.UPLOADING,
  2: uploadStatus.SUCCESS,
  3: uploadStatus.ERROR
}
// 上传列表数据
const uploadList = ref([])

const props = defineProps({
  readyUploadList: {
    type: Array,
    default: () => []
  },
  knowledgePath: {
    type: String,
    default: '糖源ai知识库'
  },
  knowledgeId: {
    type: [String, Number],
    default: ''
  },
  parentItemId: {
    type: [String, Number],
    default: ''
  }
})

const emits = defineEmits(['beforeUploadFiles', 'refreshList'])

// 监听readyUploadList变化，初始化上传列表
watch(
  () => props.readyUploadList,
  (newList) => {
    if (newList.length > 0) {
      initializeUploadList(cloneDeep(newList))
    }
  },
  { deep: true }
)
watch(
  () => props.knowledgeId,
  () => {
    uploadList.value = []
  }
)
watch(
  () => props.parentItemId,
  () => {
    uploadList.value = []
  }
)
// 初始化上传列表
const initializeUploadList = (fileList) => {
  var tempList = []
  tempList = fileList.map((file, index) => ({
    uid: file.uid || `file-${Date.now()}-${index}`,
    name: file.name,
    path: file.path || '',
    size: file.size || 0,
    type: file.type || 'file',
    status: uploadStatus.PENDING,
    progress: 0,
    uploadedCount: 0,
    totalCount: file.children ? file.children.length : 1,
    errorMessage: '',
    file: file.file || null,
    children: file.children || [],
    same_name_type: file.same_name_type || 0,

  }))
  uploadList.value.push(...tempList)
  // 开始上传
  startUpload()
}

// 开始上传（添加错误边界）
const startUpload = async () => {
  for (const item of uploadList.value) {
    // 检查是否已经有上传任务在进行
    if (item.status === uploadStatus.UPLOADING) {
      console.log('已有上传任务在进行中，跳过重复上传')
      continue
    }

    if (item.status === uploadStatus.PENDING) {
      try {
        await uploadItem(item)
      } catch (error) {
        console.error('上传任务失败:', error)
        // 不再继续处理下一个文件
        continue
      }
    }
  }
}

// 上传单个项目（文件或文件夹）
const uploadItem = async (item) => {
  try {
    // 更新状态为上传中
    item.status = uploadStatus.UPLOADING
    item.progress = 0

    if (item.type === 'file') {
      // 上传单个文件
      await uploadSingleFile(item)
    } else if (item.type === 'directory' && item.children) {
      // 上传文件夹中的所有文件
      await uploadDirectory(item)
    }
  } catch (error) {
    item.status = uploadStatus.ERROR
    item.errorMessage = error.message || '上传失败'
    console.error('上传失败:', error)
    // 抛出错误，让上层函数知道上传失败
    throw error
  }
}

// 上传单个文件（简化版本，去掉重试机制）
const uploadSingleFile = async (fileItem) => {
  const userStore = useUserStore()
  try {
    // 如果还没有file对象，先读取文件
    if (!fileItem.file && fileItem.path) {
      const fileObj = await window.customApi.readFileAsFileObject(fileItem.path)
      if (fileObj) {
        fileItem.file = new File([fileObj.arrayBuffer], fileObj.meta.name, {
          type: fileObj.meta.type,
          lastModified: fileObj.meta.lastModified
        })
      }
    }
    // 继续上传逻辑...
    // ... 原有的上传代码
  } catch (error) {
    // 错误处理
    fileItem.status = uploadStatus.ERROR
    fileItem.errorMessage = error.message || '上传失败'
    console.error('上传失败:', error)
    // 抛出错误，让上层函数知道上传失败
    // throw error
  }
  return new Promise((resolve, reject) => {
    // 模拟文件上传过程
    const formData = new FormData()
    formData.append('uniacid', userStore.uniacid)
    formData.append('knowledge_id', props.knowledgeId)
    formData.append('parent_item_id', props.parentItemId)
    formData.append('same_name_type', fileItem.same_name_type)
    formData.append('file[]', fileItem.file) // 实际使用时需要真实文件数据
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        fileItem.progress = Math.round(progress)
      }
    }

    xhr.onload = () => {
      console.log('上传完成:', xhr)
      let response = JSON.parse(xhr.response)
      if (xhr.status == 200 && response.code == 200) {
        fileItem.status = uploadStatus.SUCCESS
        fileItem.progress = 100
        fileItem.uploadedCount = 1
        // 刷新知识库详情列表
        clearSuccessUploadItems()
        emits('refreshList')
        resolve()
      } else {
        reject(new Error(response.code || xhr.status))
        clearSuccessUploadItems()
      }
    }

    xhr.onerror = () => {
      reject(new Error('网络错误'))
      clearSuccessUploadItems()
    }

    // 实际使用时需要配置正确的上传地址
    xhr.open('POST', import.meta.env.VITE_API_BASE_URL + '/api/intelligence/upload_know_file')
    xhr.setRequestHeader('Authorization', userStore.token)
    xhr.send(formData)
  })
}
const delErrItem = (index) => {
  uploadList.value.splice(index, 1)
  clearSuccessUploadItems()
}
// 修复：改为每个任务独立的轮询管理
const taskPollingMap = new Map() // 存储每个任务的轮询信息

// 开始任务状态轮询（修复版本）
const startTaskPolling = (taskId) => {
  // 如果该任务已有轮询，先清除
  if (taskPollingMap.has(taskId)) {
    const { interval } = taskPollingMap.get(taskId)
    clearInterval(interval)
  }

  // 创建新的轮询间隔
  const interval = setInterval(() => {
    getUploadProgress(taskId)
  }, 2000)

  // 存储任务轮询信息
  taskPollingMap.set(taskId, {
    interval,
    isActive: true
  })
}
const closeUploadDialog = () => {
  // 清除所有任务的轮询
  taskPollingMap.forEach(({ interval }, taskId) => {
    clearInterval(interval)
    taskPollingMap.delete(taskId)
  })
}
const clearSuccessUploadItems = () => {
  uploadList.value = uploadList.value.filter((item) => item.status !== uploadStatus.SUCCESS)
  if (uploadList.value.length == 0) {
    uploadVisible.value = false
  }
  getUserInfo()
}
onUnmounted(() => {
  // 清除所有任务的轮询
  taskPollingMap.forEach(({ interval }, taskId) => {
    clearInterval(interval)
    taskPollingMap.delete(taskId)
  })
})
// 获取文件上传进度（修复版本）
const getUploadProgress = async (taskId) => {
  try {
    const res = await task_list({
      page: 1,
      page_size: 100,
      task_id: taskId
    })

    if (res.data.data && res.data.data.length > 0) {
      res.data.data.forEach((item) => {
        // 找到对应的上传项
        const uploadItem = uploadList.value.find((file) => file.task_id === item.task_id)
        if (uploadItem) {
          // 更新上传项状态
          uploadItem.progress = item.progress
          uploadItem.uploadedCount = item.success_files
          uploadItem.status = mapStatus[item.status]
          uploadItem.totalCount = item.total_files

          // 检查任务是否完成
          if (item.processed_files >= item.total_files) {
            // 任务完成，停止该任务的轮询
            const taskInfo = taskPollingMap.get(taskId)
            if (taskInfo) {
              clearInterval(taskInfo.interval)
              taskPollingMap.delete(taskId)
              console.log(`任务 ${taskId} 完成，停止轮询`)
            }
          }
        }
      })
    } else {
      // 没有找到任务数据，停止该任务的轮询
      const taskInfo = taskPollingMap.get(taskId)
      if (taskInfo) {
        clearInterval(taskInfo.interval)
        taskPollingMap.delete(taskId)
        console.log(`任务 ${taskId} 不存在，停止轮询`)
      }
    }
    clearSuccessUploadItems()
  } catch (error) {
    console.error('获取任务进度失败:', error)
    // 发生错误时，继续轮询，不要停止
  }
}
// 上传文件夹（保持错误边界）
const uploadDirectory = async (directoryItem) => {
  // eslint-disable-next-line no-undef
  let loadcontext = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.3)',
    customClass: 'upload-loading'
  })
  // const files = flattenDirectory(directoryItem)
  // directoryItem.totalCount = files.length
  const userStore = useUserStore()
  const formData = new FormData()
  // 添加所有文件，保持目录结构
  directoryItem.children.forEach((file) => {
    // 对于普通文件，使用文件名作为key；对于文件夹中的文件，使用相对路径
    const key = file.webkitRelativePath || file.name
    formData.append(Buffer.from(key).toString('base64'), file)
  })
  formData.append('uniacid', userStore.uniacid)
  formData.append('know_id', props.knowledgeId)
  formData.append('file_type', 2)
  formData.append('parent_item_id', props.parentItemId)
  create_folder_task(formData)
    .then((res) => {
      directoryItem.task_id = res.data.task_id
      emits('refreshList')
      startTaskPolling(res.data.task_id)
    })
    .finally(() => {
      loadcontext.close()
    })
  return
  // 错误边界
  // let hasError = false

  // for (let i = 0; i < files.length; i++) {
  //   console.log('上传文件:', files[i].name);

  //   // 如果已经有错误，停止上传
  //   if (hasError) {
  //     continue
  //   }

  //   try {
  //     await uploadSingleFile(files[i])
  //     directoryItem.uploadedCount = i + 1
  //     directoryItem.progress = Math.round(((i + 1) / files.length) * 100)
  //   } catch (error) {
  //     // 设置错误状态，但只设置一次
  //     if (!hasError) {
  //       // hasError = true
  //       directoryItem.status = uploadStatus.ERROR
  //       directoryItem.errorMessage = `文件 ${files[i].name}  ${error.message}`
  //       // 抛出错误，让上层函数知道上传失败
  //       // throw error
  //     }
  //   }
  // }

  // // 只有当所有文件都成功上传时才标记为成功
  // if (!hasError && directoryItem.uploadedCount === files.length) {
  //   directoryItem.status = uploadStatus.SUCCESS
  // }
}
// // 扁平化目录结构，获取所有文件
// const flattenDirectory = (directory) => {
//   const files = []

//   const traverse = async (node) => {
//     if (node.type === 'file') {
//       files.push(node)
//     } else if (node.children && node.children.length) {
//       node.children.forEach((child) => traverse(child))
//     }
//   }

//   traverse(directory)
//   console.log('files',files);

//   return files
// }

// 获取文件图标
const getFileIcon = (item) => {
  if (item.type === 'directory') {
    return catalogueIcon
  }
  // 根据文件扩展名返回不同的图标
  const ext = item.name?.split('.').pop()?.toLowerCase()
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

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    [uploadStatus.PENDING]: 'status-pending',
    [uploadStatus.UPLOADING]: 'status-uploading',
    [uploadStatus.SUCCESS]: 'status-success',
    [uploadStatus.ERROR]: 'status-error'
  }
  return classMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    [uploadStatus.PENDING]: '等待上传',
    [uploadStatus.UPLOADING]: '上传中',
    [uploadStatus.SUCCESS]: '上传成功',
    [uploadStatus.ERROR]: '上传失败'
  }
  return textMap[status] || ''
}

const hidePopover = (popoverName) => {
  if (popoverName) {
    popoverName.hide()
  }
}

const beforeUploadFiles = (type) => {
  emits('beforeUploadFiles', type)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
</script>
<style lang="scss">
.upload-loading {
  z-index: 9999 !important;
}
</style>
<style scoped lang="scss">
:deep(.upload-files-box-dialog) {
  .el-dialog {
    padding: 17px 10px;
    height: 510px;
    display: flex;
    flex-direction: column;

    .el-dialog__header {
      flex-shrink: 0;
      padding-left: 10px;
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
      flex: 1;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      overflow: hidden;
      .file-list {
        height: 100%;
        overflow-y: auto;
        .file-item {
          padding: 8px 10px;
          margin-bottom: 2px;
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 22px;
          &.err {
            &:hover {
              background: #f9f9f9;
              border-radius: 4px;
              .delete-icon {
                display: block !important;
              }
            }
          }
          &:hover {
            background: #f9f9f9;
            border-radius: 4px;
          }
          .icon {
            flex-shrink: 0;
            display: block;
            margin-top: 3px;
            width: 14px;
            height: 14px;
          }

          .file-item-right {
            flex: 1;
            overflow: hidden;

            .right-top {
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;

              .title {
                font-weight: 500;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
              }

              .status-tip {
                flex-shrink: 0;
                font-size: 12px;
                line-height: 16px;

                &.status-pending {
                  color: #909090;
                }

                &.status-uploading {
                  color: var(--el-color-primary);
                }

                &.status-success {
                  color: #67c23a;
                }

                &.status-error {
                  color: #f56c6c;
                }
              }
            }

            .right-center {
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 5px;
              overflow: hidden;
              .right-center-label {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 2px;
                overflow: hidden;
                span {
                  font-size: 12px;
                  color: #909090;
                  line-height: 16px;
                }
                .file-size {
                  flex-shrink: 0;
                }
                .file-path {
                  flex: 1;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                }
              }
              .delete-icon {
                display: none;
                flex-shrink: 0;
                width: 14px;
                height: 14px;
                cursor: pointer;
              }
            }

            .right-bottom {
              width: 100%;

              .progress {
                width: 100%;
                height: 2px;
                background: #eaeaea;
                border-radius: 1px;

                .bar {
                  height: 100%;
                  background: var(--el-color-primary);
                  border-radius: 1px;
                  transition: width 0.3s ease;
                }
              }

              .success-text {
                font-size: 12px;
                color: #67c23a;
                line-height: 16px;
              }

              .error-text {
                font-size: 12px;
                color: #f56c6c;
                line-height: 16px;
              }
            }
          }
        }
      }
    }

    .dialog-footer {
      flex-shrink: 0;

      .continue-uploading {
        height: 36px;
        width: 100%;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        background: #f9f9f9;
        color: var(--default-font-color);

        .icon {
          margin-right: 6px;
          vertical-align: middle;
          width: 14px;
          height: 14px;
        }
      }
    }
  }
}
</style>
