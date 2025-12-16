<template>
  <div class="online-file-selection-box">
    <el-dialog
      v-model="onlineNoteVisible"
      :close-on-click-modal="false"
      align-center
      :show-close="false"
      destroy-on-close
      modal-class="online-file-selection-box-dialog"
      width="850"
    >
      <template #header>
        <div class="head-left">
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/upload-files/continue-uploading-icon.png"
            alt=""
          />
          <div class="">导入笔记</div>
        </div>
        <div class="head-right">
          <el-input
            v-model="searchText"
            class="search-input"
            clearable
            placeholder="搜索"
            @change="refreshList"
          ></el-input>
          <el-icon class="close-icon" @click="close"><Close /></el-icon>
        </div>
      </template>
      <div class="online-file-box">
        <div class="path-box">
          <div class="history-btns">
            <el-icon
              class="icon"
              :style="{
                cursor: pathList.length > 1 ? 'pointer' : 'not-allowed',
                color: pathList.length > 1 ? 'var(--default-font-color)' : '#ccc'
              }"
              @click="backPath"
              ><Back
            /></el-icon>
            <el-icon class="icon"><Right /></el-icon>
            <el-divider direction="vertical" />
          </div>
          <div class="path">
            <div
              v-for="(item, index) in pathList"
              :key="item.id"
              class="path-item"
              :class="{ active: index === pathList.length - 1 }"
              @click="pathChange(index)"
            >
              <el-icon v-if="index != 0" class="icon"><ArrowRight /></el-icon>
              {{ item.title }}
            </div>
          </div>
        </div>
        <div class="file-list">
          <template v-if="activeBook.level == 0">
            <el-skeleton :loading="loading" animated :throttle="{ leading: 500, initVal: true }">
              <template #template>
                <el-skeleton-item v-for="i in 6" :key="i" variant="text" style="margin: 10px 0" />
              </template>
              <template #default>
                <template v-if="bookList.length">
                  <div
                    v-for="(item, index) in bookList"
                    :key="index + '-' + item.id"
                    class="file-item"
                    @click="notebookChange(item)"
                  >
                    <div class="item-content">
                      <div class="content-left">
                        <img src="@renderer/assets/notebook/note-icon.png" alt="" />
                        <div v-if="!item.isCreated" class="title">{{ item.title }}</div>
                        <div v-else class="title" @click.stop="() => {}">
                          <el-input
                            v-model="item.title"
                            autofocus
                            class="create-input"
                            placeholder="请输入笔记本名称"
                            @keyup.enter="createOrRename(item)"
                            @blur="createOrRename(item)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">暂无笔记本，点击新建笔记本创建一个</div>
              </template>
            </el-skeleton>
          </template>
          <template v-if="activeBook.level == 1">
            <el-skeleton :loading="loading" animated :throttle="{ leading: 500, initVal: true }">
              <template #template>
                <el-skeleton-item v-for="i in 6" :key="i" variant="text" style="margin: 10px 0" />
              </template>
              <template #default>
                <template v-if="noteList.length">
                  <div
                    v-for="(item, index) in noteList"
                    :key="index + '-' + item.id"
                    class="file-item"
                    :class="{ active: activeFiles.length && item.id == activeFiles[0].id }"
                    @click="handleCheckChange(item, !item.checked)"
                  >
                    <el-checkbox v-model="item.checked" class="check" @click.stop="() => {}" />
                    <div class="item-content">
                      <div class="content-left">
                        <!-- <img src="@renderer/assets/notebook/notebook-icon.png" alt="" /> -->
                        <div v-if="!item.isCreated" class="title">
                          {{ item.title }}
                        </div>
                        <div v-else class="title" @click.stop="() => {}">
                          <el-input
                            v-model="item.title"
                            autofocus
                            class="create-input"
                            placeholder="请输入笔记名称"
                            @keyup.enter="createOrRenameNote(item)"
                            @blur="createOrRenameNote(item)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">暂无笔记，点击新建笔记创建一个</div>
              </template>
            </el-skeleton>
          </template>
        </div>
      </div>
      <template #footer>
        <div
          v-if="activeBook.level == 0 && props.importType == 'note'"
          class="take-note-btn take-book-btn"
          @click="beforeCreate"
        >
          新建笔记本
        </div>
        <template v-if="activeBook.level == 1">
          <div v-if="props.importType == 'note'" class="take-note-btn" @click="beforeCreate">
            新建笔记
          </div>
          <div v-else class="tips">已选中{{ activeFiles.length }}条笔记</div>
          <div class="dialog-footer">
            <el-button class="cancel-btn" @click="close">取消</el-button>
            <el-button
              class="confirm-btn"
              :disabled="!activeFiles.length"
              type="primary"
              @click="submitImport"
            >
              导入
            </el-button>
          </div>
        </template>
      </template>
    </el-dialog>
    <!-- <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :permission-type="contextMenu.permission_type"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    /> -->
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import {
  note_list,
  note_add,
  note_edit,
  notebook_add,
  notebook_edit,
  notebook_list
} from '@renderer/api/note'
import markdownToRichText from '@renderer/utils/markdownToRichText'
import { emit } from '@renderer/utils/eventBus'
// import renameIcon from '@renderer/assets/contextMenu/rename-icon.png'
const onlineNoteVisible = defineModel({ type: Boolean })
const props = defineProps({
  markDownText: {
    type: String,
    default: ''
  },
  importType: {
    type: String,
    default: 'note'
  }
})
const transFormOptions = ref({
  allowHtml: false,
  lineBreaks: true,
  autoLink: true,
  sanitize: true,
  headingStyle: 'hierarchy'
})
const emits = defineEmits(['submitImport'])
let searchText = ref('')
let pathList = ref([
  {
    title: '笔记本',
    id: 0,
    level: 0
  }
])
let loading = ref(true)
let activeBook = computed(() => {
  return pathList.value[pathList.value.length - 1]
})
let bookList = ref([])
let noteList = ref([])
const close = () => {
  onlineNoteVisible.value = false
}
const pathChange = (i) => {
  pathList.value = removeItemsAfterIndex(pathList.value, i)
  nextTick(() => {
    refreshList()
  })
}
const removeItemsAfterIndex = (array, index) => {
  if (index > -1 && index < array.length) {
    array.splice(index + 1, array.length - index - 1)
  }
  return array
}
// 点击笔记本
const notebookChange = (item) => {
  pathList.value.push({
    title: item.title,
    id: item.id,
    level: 1
  })
  refreshList()
}
const refreshList = () => {
  loading.value = true
  var level = activeBook.value.level
  if (level == 0) {
    noteList.value = []
    bookList.value = []
    notebook_list({ title: searchText.value })
      .then((res) => {
        if (res.code == 200) {
          bookList.value = res.data || []
        }
      })
      .finally(() => {
        loading.value = false
      })
  } else if (level == 1) {
    noteList.value = []
    note_list({ notebook_id: activeBook.value.id, title: searchText.value })
      .then((res) => {
        if (res.code == 200) {
          noteList.value = res.data || []
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}
watch(
  () => onlineNoteVisible.value,
  (newVal) => {
    if (newVal) {
      refreshList()
    } else {
      pathList.value = [
        {
          title: '笔记本',
          id: 0,
          level: 0
        }
      ]
      noteList.value = []
      bookList.value = []
      searchText.value = ''
    }
  },
  {
    immediate: true
  }
)
// 点击返回
const backPath = () => {
  if (activeBook.value.level == 0) {
    return
  }
  pathList.value.pop()
  refreshList()
}
const beforeCreate = () => {
  var level = activeBook.value.level
  if (level == 0) {
    bookList.value.unshift({
      title: '未命名笔记本' + Date.now(),
      desc: '',
      id: '',
      isCreated: true
    })
  } else if (level == 1) {
    noteList.value.unshift({
      title: '未命名笔记' + Date.now(),
      content: '',
      id: '',
      checked: false,
      isCreated: true
    })
  }
  nextTick(() => {
    // 让新生成的input聚焦 且让其内容selected选中
    const newInput = document.querySelector('.create-input input')
    var timer = setTimeout(() => {
      clearTimeout(timer)
      newInput.focus()
      newInput.select()
    }, 100)
  })
}
// 创建笔记本或重命名
const createOrRename = (item) => {
  if (!item.title.trim()) {
    refreshList()
    return
  }
  var data
  if (!item.id) {
    data = {
      desc: '',
      title: item.title
    }
    notebook_add(data).then((res) => {
      if (res.code == 200) {
        item.isCreated = false
        refreshList()
      }
    })
  } else {
    data = {
      notebook_id: item.id,
      title: item.title,
      desc: item.desc
    }
    notebook_edit(data).then((res) => {
      if (res.code == 200) {
        item.isCreated = false
        refreshList()
      }
    })
  }
}
// 创建笔记或重命名
const createOrRenameNote = (item) => {
  if (!item.title.trim()) {
    refreshList()
    return
  }
  var data
  if (!item.id) {
    data = {
      content: '',
      title: item.title,
      notebook_id: activeBook.value.id
    }
    note_add(data).then((res) => {
      if (res.code == 200) {
        item.isCreated = false
        refreshList()
      }
    })
  } else {
    data = {
      notebook_id: activeBook.value.id,
      title: item.title,
      content: item.content
    }
    note_edit(data).then((res) => {
      if (res.code == 200) {
        item.isCreated = false
        refreshList()
      }
    })
  }
  emit('refresh-note-list')
}
const resetChecks = () => {
  noteList.value.map((item) => {
    item.checked = false
  })
}
const handleCheckChange = (item, e) => {
  if (props.importType == 'note') {
    resetChecks()
  }
  item.checked = e
}
// const contextMenu = ref({ show: true, x: 0, y: 0, actionSheet: [] })
// 右键菜单相关函数
// const showContextMenu = (e, item) => {
//   if (!item.checked) {
//     resetChecks()
//   }
//   item.checked = true
//   contextMenu.value = {
//     show: true,
//     permission_type: 'cannotView',
//     x: e.clientX,
//     y: e.clientY,
//     actionSheet: [
//       {
//         name: '重命名',
//         icon: renameIcon,
//         action: 'rename'
//       }
//     ]
//   }
// }
let activeFiles = computed(() => {
  return noteList.value.filter((item) => item.checked)
})
// const handleContextMenuAction = ({ action }) => {
//   if (action === 'rename') {
//     // 重命名
//     if (activeFiles.value.length == 1) {
//       activeFiles.value[0].isCreated = true
//       nextTick(() => {
//         // 让新生成的input聚焦 且让其内容selected选中
//         const newInput = document.querySelector('.create-input input')
//         var timer = setTimeout(() => {
//           clearTimeout(timer)
//           newInput.focus()
//           newInput.select()
//         }, 100)
//       })
//     }
//   }
//   contextMenu.value.show = false
// }
// 提交
const submitImport = async () => {
  // 使用防抖优化性能
  await nextTick()
  try {
    if (props.importType == 'note') {
      const { html } = markdownToRichText(props.markDownText, transFormOptions)
      note_edit({
        note_id: activeFiles.value[0].id,
        notebook_id: activeBook.value.id,
        title: activeFiles.value[0].title,
        content: activeFiles.value[0].content + html
      }).then((res) => {
        if (res.code == 200) {
          activeFiles.value[0].isCreated = false
          // eslint-disable-next-line no-undef
          ElMessage.primary('导入成功')
          refreshList()
          emits('submitImport')
        }
      })
    } else {
      emits(
        'submitImport',
        activeFiles.value.map((item) => item.id)
      )
    }
  } catch (error) {
    console.log(error)
  }
  // onlineNoteVisible.value = false
}
// const hideContextMenu = (e) => {
//   if (contextMenu.value.show && !e.target.closest('.context-menu')) {
//     contextMenu.value.show = false
//   }
//   resetChecks()
// }
// onMounted(() => {
//   document.addEventListener('click', hideContextMenu)
// })
</script>

<style scoped lang="scss">
.online-file-selection-box {
  :deep(.online-file-selection-box-dialog) {
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
          .search-input {
            width: 230px;
            .el-input__wrapper {
              background-color: #f9f9f9 !important;
              border-radius: 6px !important;
              box-shadow: 0 0 0 1px #efefef inset;

              &.is-focus {
                box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
              }
            }
          }
        }
      }

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;
        height: 368px;
        background: #f9f9f9;
        border-radius: 10px;
        .online-file-box {
          box-sizing: border-box;
          .path-box {
            padding: 0 20px;
            height: 50px;
            display: flex;
            border-bottom: 1px solid #efefef;
            .history-btns {
              flex-shrink: 0;
              height: 50px;
              display: flex;
              align-items: center;
              gap: 18px;
              font-size: 18px;
              color: #ccc;
              line-height: 22px;
              .icon {
                cursor: not-allowed;
              }
            }
            .path {
              margin-left: 18px;
              flex: 1;
              display: flex;
              align-items: center;
              overflow: hidden;
              .path-item {
                display: inline-flex;
                align-items: center;
                // font-size: 14px;
                // line-height: 50px;
                color: #737475;
                cursor: pointer;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                .icon {
                  flex-shrink: 0;
                  color: #909090;

                  margin: 0 2px;
                }
                &:first-of-type {
                  flex-shrink: 0;
                }
                &:last-of-type {
                  flex-shrink: 0;
                }
                &.active {
                  color: var(--default-font-color);
                }
              }
            }
          }
          .file-list {
            padding: 10px 10px;
            height: 316px;
            overflow-y: auto;
            .empty {
              height: 100%;
              line-height: 200px;
              text-align: center;
              color: #95a5a6;
              font-size: 13px;
            }
            .file-item {
              overflow: hidden;
              padding: 0 10px;
              width: 100%;
              height: 32px;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 14px;
              line-height: 22px;
              color: var(--default-font-color);
              cursor: pointer;
              border-radius: 6px;
              &.active {
                background: var(--el-color-primary-light-9);
              }
              .item-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                align-items: center;
                .content-left {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  overflow: hidden;
                  img {
                    flex-shrink: 0;
                    // padding: 2px;
                    width: 18px;
                    height: 18px;
                    // background: #fff;
                    border-radius: 2px;
                  }
                  .title {
                    flex: 1;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    overflow: hidden;

                    :deep(.create-input) {
                      width: 100%;
                      height: 100%;

                      .el-input__inner {
                        font-size: 14px;
                        color: var(--default-font-color);
                      }
                    }
                  }
                }
                .type {
                  flex-shrink: 0;
                  font-size: 14px;
                  line-height: 24px;
                  color: #737475;
                }
              }
              .check {
                flex-shrink: 0;
                .el-checkbox__inner {
                  width: 18px;
                  height: 18px;
                }
              }
            }
          }
        }
      }
      .el-dialog__footer {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .take-note-btn {
          font-size: 14px;
          color: var(--default-font-color);
          width: 76px;
          height: 32px;
          line-height: 30px;
          text-align: center;
          border-radius: 8px;
          border: 1px solid #909090;
          cursor: pointer;
          &.take-book-btn {
            width: 90px;
          }
        }
        .tips {
          font-size: 14px;
          color: #737475;
        }
        .dialog-footer {
          flex-shrink: 0;
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
}
</style>
