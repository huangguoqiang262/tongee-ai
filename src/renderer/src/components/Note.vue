<template>
  <div class="notebook-box">
    <div class="left-box">
      <div class="common-box">
        <div class="common-box-left">笔记本</div>
        <div class="square-icon-box" @click="addNotebook">
          <img class="square-icon" src="@renderer/assets/repository/add-icon.png" alt="" />
        </div>
      </div>
      <div class="notebook-list">
        <el-skeleton animated :loading="bookLoading">
          <template #template>
            <el-skeleton-item v-for="i in 10" :key="i" variant="text" style="margin: 10px 0" />
          </template>
          <template #default>
            <template v-if="notebookLists.length">
              <div
                v-for="item in notebookLists"
                :key="item.id"
                class="item"
                :class="{ 'active-note': item.id === activeNotebook }"
                @click="bookChange(item)"
                @contextmenu="(e) => showContextMenu(e, item, 'notebook')"
              >
                <div class="icon-box">
                  <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
                </div>
                <div class="title">
                  <el-input
                    v-if="item.isEdit"
                    v-model="item.title"
                    autofocus
                    class="create-input"
                    placeholder="请输入笔记本名称"
                    @keyup.enter="editNoteBookName(item)"
                    @click.stop=""
                    @blur="editNoteBookName(item)"
                  />
                  <template v-else>{{ item.title }}</template>
                </div>
              </div>
            </template>
            <div v-else class="empty">
              <div class="empty-text">暂无笔记本，快去添加吧</div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
    <div class="center-box" :class="{ 'mr-chat': chatVisible }">
      <div class="center-head">
        <div class="title">工作笔记</div>
        <div class="right-handle-box">
          <img
            class="add-icon"
            src="@renderer/assets/repository/add-icon.png"
            alt=""
            @click="beforeAddNote"
          />
          <el-input
            v-model="searchValue"
            class="search-input"
            :prefix-icon="Search"
            clearable
            placeholder="搜索笔记"
            @change="searchChange"
          ></el-input>
          <div v-if="!chatVisible" class="open-chat" @click="openChat">
            <img class="logo" src="@renderer/assets/logo.png" alt="" />
            问问糖源
          </div>
        </div>
      </div>
      <div class="center-content">
        <el-skeleton animated :loading="noteLoading">
          <template #template>
            <el-skeleton-item v-for="i in 16" :key="i" variant="text" style="margin: 10px 0" />
          </template>
          <template #default>
            <template v-if="noteLists.length">
              <div
                v-for="item in noteLists"
                :key="item.id"
                class="note-item"
                :class="{ 'active-note': item.checked }"
                @contextmenu="(e) => showContextMenu(e, item, 'note')"
                @click="beforeEditNote(item)"
              >
                <el-checkbox v-model="item.checked" class="checkbox" size="large" @click.stop="" />
                <div class="title">
                  <el-input
                    v-if="item.isEdit"
                    v-model="item.title"
                    autofocus
                    class="create-input"
                    placeholder="请输入笔记名称"
                    @keyup.enter="editNoteName(item)"
                    @click.stop=""
                    @blur="editNoteName(item)"
                  />
                  <template v-else>{{ item.title }}</template>
                </div>
                <div class="des">{{ htmlToText(item.content) || '无任何内容' }}</div>
                <div class="item-bottom">
                  <div class="time">{{ formatTimeFun(item.updatetime) }}</div>
                  <div class="size">{{ formatFileSize(item?.file_space || 0) || '< 0 KB' }}</div>
                </div>
              </div>
            </template>
            <div v-else class="empty">
              <div class="empty-text">暂无笔记内容，快去添加吧</div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
    <div v-if="chatVisible" class="right-box">
      <ToolChat
        v-if="chatVisible"
        :selecte-file-id-list="selecteFileIdList"
        :notebook-id="activeNotebook"
        @close-chat="chatVisible = false"
      />
    </div>
    <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    />
    <el-dialog
      v-model="beforeShareVisible"
      align-center
      modal-class="before-share-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/notebook/share-icon.png" alt="" />
        <div class="title">分享笔记</div>
      </template>
      <div class="type-list">
        <div class="type-item" @click="handleShare('link')">
          <img class="icon" src="@renderer/assets/notebook/link-icon.png" alt="" />
          <div class="right-type">
            <div class="title">链接分享</div>
            <div class="des">生成分享链接，其他人可以通过链接查看笔记</div>
          </div>
        </div>
        <div class="type-item" @click="handleShare('img')">
          <img class="icon" src="@renderer/assets/notebook/img-icon.png" alt="" />
          <div class="right-type">
            <div class="title">生成长图</div>
            <div class="des">将笔记内容生成场图片，方便分享到社交平台</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      v-model="longImageVisible"
      align-center
      destroy-on-close
      modal-class="before-share-dialog longImg-share-dialog"
      width="800"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/notebook/share-icon.png" alt="" />
        <div class="title">生成长图预览</div>
      </template>
      <div class="long-img-box">
        <div class="head-box">
          <img class="logo" src="@renderer/assets/home/large-logo.png" alt="" />
          <div class="author-box">
            <div class="author">创建人：{{ userInfo.name }}</div>
            <el-divider direction="vertical" />
            <div class="time-box">更新时间：{{ formatTimeFun(activeNote.updatetime) }}</div>
          </div>
        </div>
        <div class="long-view-box">
          <div class="note-title">{{ activeNote.title }}</div>
          <!-- <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" /> -->
          <Editor
            v-model="activeNote.content"
            class="editor-content"
            :default-config="editorConfig"
            mode="default"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="handleDownloadLongImage">下载图片</el-button>
          <el-button class="confirm-btn" type="primary" @click="copyLongImage">
            复制图片
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="notebookVisible"
      draggable
      align-center
      destroy-on-close
      modal-class="notebook-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/notebook/notebook-icon.png"
          alt=""
        />
        <div class="title">新建笔记本</div>
      </template>
      <el-form ref="notebookFormRef" :model="notebookForm" :rules="notebookRules" @submit.prevent>
        <el-form-item prop="title">
          <el-input
            v-model="notebookForm.title"
            class="book-input"
            size="large"
            placeholder="请输入笔记本名称"
          />
        </el-form-item>
        <!-- <el-form-item prop="desc">
          <el-input
            v-model="notebookForm.desc"
            class="book-input"
            size="large"
            resize="none"
            type="textarea"
            placeholder="请输入笔记本描述"
          />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="notebookVisible = false">取消</el-button>
          <el-button
            class="confirm-btn"
            type="primary"
            @click="submitNotebookForm(notebookFormRef)"
          >
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="addRepositoryVisible"
      draggable
      align-center
      destroy-on-close
      modal-class="notebook-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/contextMenu/repository-icon.png"
          alt=""
        />
        <div class="title">添加到知识库</div>
      </template>
      <el-form
        ref="repositoryFormRef"
        :model="repositoryForm"
        :rules="repositoryRules"
        @submit.prevent
      >
        <el-form-item prop="id">
          <el-select
            v-model="repositoryForm.id"
            size="large"
            class="repository-select"
            placeholder="请先选择知识库"
          >
            <el-option-group
              v-for="group in repositoryOptions"
              :key="group.id"
              :label="group.title"
            >
              <el-option
                v-for="item in group.knows"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item prop="title">
          <el-input
            v-model="repositoryForm.title"
            class="book-input"
            size="large"
            disabled
            placeholder="请输入知识库标题"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="addRepositoryVisible = false">取消</el-button>
          <el-button
            class="confirm-btn"
            type="primary"
            @click="submitRepositoryForm(repositoryFormRef)"
          >
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="moveNoteVisible"
      draggable
      align-center
      destroy-on-close
      modal-class="notebook-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/notebook/notebook-icon.png"
          alt=""
        />
        <div class="title">移动到笔记本</div>
      </template>
      <el-form ref="moveNoteFormRef" :model="moveNoteForm" :rules="moveNoteRules" @submit.prevent>
        <el-form-item prop="id">
          <el-select
            v-model="moveNoteForm.id"
            size="large"
            class="notebook-select"
            placeholder="选择笔记本"
          >
            <el-option
              v-for="item in notebookLists"
              :key="item.id"
              :disabled="item.id === activeNotebook"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer move-note-footer">
          <div class="new-note" @click="addNotebook">新建笔记本</div>
          <el-button class="cancel-btn" @click="moveNoteVisible = false">取消</el-button>
          <el-button
            class="confirm-btn"
            type="primary"
            @click="submitMoveNoteForm(moveNoteFormRef)"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <NoteDetail
      v-model="noteDetailVisible"
      :notebook-id="activeNotebook"
      :note-detail="noteDetail"
      @save="saveNote"
      @submit-import="submitImport"
    />
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useUserInfo } from '@renderer/hooks/checkLogin'
import {
  note_list,
  note_add,
  note_edit,
  notebook_add,
  notebook_edit,
  notebook_list,
  notebook_del,
  note_del,
  get_note_info
} from '@renderer/api/note'
import { on, off, emit } from '@renderer/utils/eventBus'
import { import_note } from '@renderer/api/repository'
import { get_user_knows } from '@renderer/api/chat'
import { formatTime } from '@renderer/utils/index.js'
import { convertToPlainText } from '@renderer/utils/convertToPlainText.js'
import html2Canvas from 'html2canvas'
import shareIcon from '@renderer/assets/contextMenu/share-icon.png'
import repositoryIcon from '@renderer/assets/contextMenu/repository-icon.png'
import { copyBase64ImageAsNormalImage, downloadBase64Image } from '@renderer/utils/imageCopy.js'
import moveIcon from '@renderer/assets/contextMenu/move-icon.png'
import renameIcon from '@renderer/assets/contextMenu/rename-icon.png'
import deleteIcon from '@renderer/assets/contextMenu/delete-icon.png'
let notebookVisible = ref(false)
let chatVisible = ref(false)
// 打开对话
const openChat = () => {
  if (!activeNotebook.value) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('请先选择笔记本')
    return
  }
  chatVisible.value = true
}
let noteDetailVisible = ref(false)
const formatTimeFun = (time) => {
  return formatTime(time)
}
const htmlToText = (html) => {
  return convertToPlainText(html)
}
const userInfo = useUserInfo()
let noteDetail = ref({
  title: '',
  content: '',
  type: 'add'
})
const beforeAddNote = () => {
  if (!activeNotebook.value) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('请先选择笔记本')
    return
  }
  noteDetail.value = {
    title: '',
    content: '',
    type: 'add'
  }
  noteDetailVisible.value = true
}
const beforeEditNote = (item) => {
  noteDetail.value = {
    id: item.id
  }
  getInfo()
}
const submitImport = () => {
  getInfo()
}
const getInfo = () => {
  get_note_info({ note_id: noteDetail.value.id }).then((res) => {
    if (res.code == 200) {
      noteDetail.value = {
        ...res.data,
        type: 'edit'
      }
      noteDetailVisible.value = true
    }
  })
}
const saveNote = (detail) => {
  var data = {
    notebook_id: activeNotebook.value,
    title: detail.title,
    content: detail.content
  }
  if (detail.type == 'add') {
    note_add(data).then((res) => {
      if (res.code == 200) {
        getNoteList()
        noteDetailVisible.value = false
        // eslint-disable-next-line no-undef
        ElMessage.primary('添加成功')
      }
    })
  } else {
    data.note_id = detail.id
    note_edit(data).then((res) => {
      if (res.code == 200) {
        getNoteList()
        noteDetailVisible.value = false
        // eslint-disable-next-line no-undef
        ElMessage.primary('编辑成功')
      }
    })
  }
}
let notebookFormRef = ref(null)
let notebookLists = ref([])
let noteLists = ref([])
let activeNotebook = ref('')
let notebookForm = ref({
  title: ''
})
let notebookRules = ref({
  title: [{ required: true, message: '请输入笔记本名称', trigger: 'blur' }]
})
const selecteFileIdList = computed(() => {
  return noteLists.value
    .filter((item) => item.checked)
    .map((item) => {
      return {
        fileId: item.file_key,
        fileName: item.title,
        fileUrl: item.file_path,
        id: item.id
      }
    })
})
const submitNotebookForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      notebook_add(notebookForm.value).then((res) => {
        if (res.code == 200) {
          getBookList()
          notebookVisible.value = false
        }
      })
    } else {
      console.log('表单验证失败')
    }
  })
}
const addNotebook = () => {
  notebookVisible.value = true
  nextTick(() => {
    notebookForm.value = {
      title: ''
    }
    notebookFormRef?.value.resetFields()
  })
}
let addRepositoryVisible = ref(false)
let repositoryFormRef = ref(null)
let repositoryForm = ref({
  id: '',
  title: ''
})
let repositoryRules = ref({
  id: [{ required: true, message: '请选择知识库', trigger: 'blur' }],
  title: [{ required: true, message: '请输入知识库标题', trigger: 'blur' }]
})
const repositoryOptions = ref([])
const getRepositoryList = () => {
  get_user_knows({ is_power: 1 }).then((res) => {
    if (res.code == 200) {
      repositoryOptions.value = res.data || []
    }
  })
}
const submitRepositoryForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      console.log('表单验证通过')
      import_note({
        knowledge_id: repositoryForm.value.id,
        note_ids: [activeNote.value.id],
        title: repositoryForm.value.title
      }).then((res) => {
        if (res.code == 200) {
          formRef.resetFields()
          // eslint-disable-next-line no-undef
          ElMessage.primary('添加成功')
          emit('refresh-repository')
          addRepositoryVisible.value = false
        }
      })
    } else {
      console.log('表单验证失败')
    }
  })
}
let moveNoteVisible = ref(false)
let moveNoteFormRef = ref(null)
let moveNoteForm = ref({
  id: ''
})
let moveNoteRules = ref({
  id: [{ required: true, message: '请选择笔记本', trigger: 'blur' }]
})
const submitMoveNoteForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      var data = {
        notebook_id: moveNoteForm.value.id,
        note_id: activeNote.value.id
      }
      note_edit(data).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage.primary('移动成功')
          getNoteList()
          formRef.resetFields()
          moveNoteVisible.value = false
        }
      })
    } else {
      console.log('表单验证失败')
    }
  })
}
let beforeShareVisible = ref(false)
let longImageVisible = ref(false)
let editorConfig = { placeholder: '请输入内容...' }
// let defaultConfig = {
//   excludeKeys: [
//     'group-image',
//     'group-video',
//     'insertVideo',
//     'unFullScreen',
//     'fullScreen',
//     'insertLink',
//     'todo',
//     'codeBlock',
//     'emotion',
//     'group-indent'
//   ]
// }
// let loading = ref(false)
const bookChange = (item) => {
  activeNotebook.value = item.id
  getNoteList()
}
let baseUrl = ref('')
// 分享笔记
const handleShare = (type) => {
  if (type === 'link') {
    // 链接分享
    navigator.clipboard.writeText(activeNote.value.html_path).then(() => {
      // eslint-disable-next-line no-undef
      ElMessage.primary('复制成功')
    })
  } else if (type === 'img') {
    // 生成长图
    // 下载长图逻辑
    longImageVisible.value = true
    nextTick(() => {
      html2Canvas(document.querySelector('.long-img-box'), { scale: 3, allowTaint: true })
        .then((canvas) => {
          baseUrl.value = canvas.toDataURL('image/png')
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }
  beforeShareVisible.value = false
}
// 复制长图
const copyLongImage = async () => {
  // 利用剪切版剪切长图
  try {
    await copyBase64ImageAsNormalImage(baseUrl.value)
    // eslint-disable-next-line no-undef
    ElMessage.primary('复制成功')
  } catch (error) {
    console.log(error)
  }
}
const handleDownloadLongImage = () => {
  // 下载长图逻辑
  downloadBase64Image(baseUrl.value, `预览图${new Date().getTime()}.png`)
}
const contextMenu = ref({ show: false, x: 0, y: 0, actionSheet: [] })
const searchValue = ref('')
const activeNote = ref(null)
const searchChange = () => {
  getNoteList()
}
// 编辑笔记本名称
const editNoteBookName = (item) => {
  if (!item.title.trim()) {
    getBookList()
    return
  }
  notebook_edit({ notebook_id: item.id, title: item.title }).then(() => {})
  item.isEdit = false
}
// 编辑笔记名称
const editNoteName = (item) => {
  if (!item.title.trim()) {
    getNoteList()
    return
  }
  note_edit({ note_id: item.id, title: item.title }).then(() => {})
  item.isEdit = false
}
// 右键菜单相关函数
const showContextMenu = (e, item, type) => {
  e.preventDefault()
  activeNote.value = item
  activeNote.value.type = type
  if (type == 'note') {
    item.checked = true
    if (selecteFileIdList.value.length > 1) {
      contextMenu.value = {
        show: true,
        x: e.clientX,
        y: e.clientY,
        actionSheet: [
          {
            name: '删除',
            icon: deleteIcon,
            action: 'delete'
          }
        ]
      }
    } else {
      contextMenu.value = {
        show: true,
        x: e.clientX,
        y: e.clientY,
        actionSheet: [
          {
            name: '重命名',
            icon: renameIcon,
            action: 'rename'
          },
          {
            name: '分享',
            icon: shareIcon,
            action: 'share'
          },
          {
            name: '添加到知识库',
            icon: repositoryIcon,
            action: 'addToRepository'
          },
          {
            name: '移动到笔记本',
            icon: moveIcon,
            action: 'moveToNotebook'
          },
          {
            name: '删除',
            icon: deleteIcon,
            action: 'delete'
          }
        ]
      }
    }
  } else if (type == 'notebook') {
    contextMenu.value = {
      show: true,
      x: e.clientX,
      y: e.clientY,
      actionSheet: [
        {
          name: '重命名',
          icon: renameIcon,
          action: 'rename'
        },
        {
          name: '删除',
          icon: deleteIcon,
          action: 'delete'
        }
      ]
    }
  }
}
const handleContextMenuAction = ({ action }) => {
  if (activeNote.value.type == 'note') {
    // 笔记相关操作
    if (action === 'rename') {
      // 重命名
      if (activeNote.value) {
        activeNote.value.isEdit = true
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
    } else if (action === 'share') {
      // 分享
      beforeShareVisible.value = true
    } else if (action === 'addToRepository') {
      // 添加到知识库
      getRepositoryList()
      // 初始化知识库表单
      repositoryForm.value = {
        id: '',
        title: ''
      }
      repositoryForm.value.title = activeNote.value.title
      addRepositoryVisible.value = true
      nextTick(() => {
        repositoryFormRef?.value.resetFields()
      })
    } else if (action === 'moveToNotebook') {
      // 移动到笔记本
      moveNoteForm.value.id = ''
      moveNoteForm.value.note_id = ''
      moveNoteVisible.value = true
      nextTick(() => {
        moveNoteFormRef.value.resetFields()
      })
    } else if (action === 'delete') {
      // 删除
      // eslint-disable-next-line no-undef
      ElMessageBox.confirm('确认删除吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          note_del({ note_id: selecteFileIdList.value.map((item) => item.id).join(',') }).then(
            (res) => {
              if (res.code == 200) {
                // eslint-disable-next-line no-undef
                ElMessage({
                  type: 'primary',
                  message: '删除成功'
                })
                // 刷新笔记列表
                getNoteList()
              }
            }
          )
        })
        .catch(() => {})
    }
  } else if (activeNote.value.type == 'notebook') {
    // 笔记本相关操作
    if (action === 'rename') {
      // 重命名
      if (activeNote.value) {
        activeNote.value.isEdit = true
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
    } else if (action === 'delete') {
      // 删除
      // eslint-disable-next-line no-undef
      ElMessageBox.confirm('确认删除吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          notebook_del({ notebook_id: activeNote.value.id }).then((res) => {
            if (res.code == 200) {
              // eslint-disable-next-line no-undef
              ElMessage({
                type: 'primary',
                message: '删除成功'
              })
              activeNotebook.value = ''
              notebookLists.value = []
              // 刷新笔记本列表
              getBookList()
            }
          })
        })
        .catch(() => {})
    }
  }
  contextMenu.value.show = false
}
let noteLoading = ref(true)
const getNoteList = () => {
  noteLoading.value = true
  note_list({ notebook_id: activeNotebook.value, title: searchValue.value })
    .then((res) => {
      if (res.code == 200) {
        noteLists.value = res.data || []
      }
    })
    .finally(() => {
      noteLoading.value = false
    })
}
let bookLoading = ref(true)
const getBookList = () => {
  bookLoading.value = true
  notebook_list({ title: searchValue.value })
    .then((res) => {
      if (res.code == 200) {
        notebookLists.value = res.data || []
        if (!activeNotebook.value || !notebookLists.value.length) {
          activeNotebook.value = notebookLists.value[0]?.id || ''
          if (activeNotebook.value) {
            getNoteList()
          } else {
            activeNotebook.value = ''
            noteLists.value = []
            noteLoading.value = false
          }
        }
      }
    })
    .finally(() => {
      bookLoading.value = false
    })
}
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}
const formatFileSize = (kb) => {
  if (!kb) return 0
  if (kb < 1024) {
    return kb + ' KB'
  } else if (kb < 1024 * 1024) {
    return (kb / 1024).toFixed(2) + ' MB'
  } else if (kb < 1024 * 1024 * 1024) {
    return (kb / (1024 * 1024)).toFixed(2) + ' GB'
  } else {
    return (kb / (1024 * 1024 * 1024)).toFixed(2) + ' TB'
  }
}
const refreshNoteList = () => {
  if (
    chatVisible.value ||
    beforeShareVisible.value ||
    addRepositoryVisible.value ||
    moveNoteVisible.value ||
    notebookVisible.value ||
    noteDetailVisible.value
  ) {
    return
  }
  getNoteList()
  hideContextMenu()
}
onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
  off('refresh-note-list', refreshNoteList)
})
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
  getBookList()
  on('refresh-note-list', refreshNoteList)
})
</script>

<style scoped lang="scss">
.notebook-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  background: var(--primary-bg-color);
  .left-box {
    box-sizing: border-box;
    padding: 20px;
    width: 332px;
    height: 100%;
    border-right: 1px solid #efefef;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    .common-box {
      flex-shrink: 0;
      margin-bottom: 20px;
      box-sizing: border-box;
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .common-box-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .icon {
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }

      .square-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        // border-radius: 4px;
        .square-icon {
          display: block;
          width: 18px;
          height: 18px;
        }
      }
    }

    .notebook-list {
      flex: 1;
      overflow-y: auto;
      .empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909090;
        line-height: 22px;
        .empty-text {
          margin-bottom: 16vh;
        }
      }
      &::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background-color: #dddcdc;

        &:hover {
          background-color: #909090;
        }
      }
      .item {
        position: relative;
        margin-bottom: 4px;
        box-sizing: border-box;
        padding: 0 36px 0 16px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: #737475;
        line-height: 18px;
        height: 36px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #f6f6f6;
        }

        &.active-note {
          background: var(--el-color-primary-light-9);
        }

        .icon-box {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          // border-radius: 2px;
          transition: all 0.2s;

          .icon {
            display: block;
            width: 16px;
            height: 16px;
          }
        }

        .title {
          flex: 1;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 18px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .center-box {
    flex: 1;
    min-width: 40%;
    height: 100%;
    padding: 13px 10px 20px 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    border-radius: 0 12px 12px 0;
    &.mr-chat {
      margin-right: 10px;
    }
    .center-head {
      flex-shrink: 0;
      padding-right: 10px;
      margin-bottom: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #fff;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--default-font-color);
        line-height: 22px;
      }

      .right-handle-box {
        display: flex;
        align-items: center;
        gap: 10px;

        .add-icon {
          flex-shrink: 0;
          margin-right: 10px;
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        :deep(.search-input) {
          width: 240px;
          height: 36px;

          .el-input__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 1px #efefef inset;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
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
      }
    }

    .center-content {
      flex: 1;
      padding-right: 10px;
      overflow-y: auto;
      .empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909090;
        line-height: 22px;
        .empty-text {
          margin-bottom: 16vh;
        }
      }
      &::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 2px;
        background-color: #dddcdc;

        &:hover {
          background-color: #909090;
        }
      }

      .note-item {
        position: relative;
        padding-top: 8px;
        padding-bottom: 19px;
        margin-bottom: 11px;
        border-bottom: 1px solid #efefef;
        .checkbox {
          height: fit-content;
          position: absolute;
          top: 12px;
          right: 0px;
          display: none;
        }
        &.active-note {
          .checkbox {
            display: block;
          }
        }
        &:last-of-type {
          border-bottom: none;
        }
        &:hover {
          .checkbox {
            display: block;
          }
        }
        .title {
          margin-bottom: 7px;
          font-size: 16px;
          color: var(--default-font-color);
          line-height: 22px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .des {
          margin-bottom: 11px;
          font-size: 14px;
          color: #909090;
          line-height: 18px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          .time,
          .size {
            font-size: 12px;
            color: #909090;
            line-height: 16px;
          }
        }
      }
    }
  }
  .right-box {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  :deep(.notebook-dialog) {
    .el-dialog {
      padding-bottom: 14px;
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
        .book-input,
        .repository-select,
        .notebook-select {
          .el-input__wrapper,
          .el-select__wrapper {
            height: 40px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: none;

            &.is-focus,
            &.is-focused {
              box-shadow: 0 0 0 1px var(--el-color-primary) inset;
            }
          }
          .el-textarea__inner {
            background: #f9f9f9;
            box-shadow: none;
            font-size: 14px;
            height: 122px;
            color: var(--default-font-color);
            border-radius: 8px;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }
      }
      .el-dialog__footer {
        padding-top: 0;
      }
      .dialog-footer {
        &.move-note-footer {
          padding-top: 16px;
        }
        .new-note {
          float: left;
          height: 36px;
          width: 90px;
          text-align: center;
          line-height: 34px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          color: var(--el-color-primary);
          border: 1px solid var(--el-color-primary);
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
        }
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
  :deep(.before-share-dialog) {
    &.longImg-share-dialog {
      .el-dialog {
        height: 486px;
      }
      .el-dialog__body {
        position: relative;
        height: 368px;
        background: #ededed;
        border-radius: 10px;
        overflow-y: auto;
        .long-img-box {
          padding: 50px 20px 20px;
          margin: 0 auto;
          width: 570px;
          min-height: 368px;
          background: #f9f9f9 url('@renderer/assets/notebook/share-long-img-bg.png') no-repeat
            center top/570px 368px;
          .head-box {
            .logo {
              display: block;
              margin: 0 auto 28px;
              width: 180px;
              height: 50px;
            }
            .author-box {
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              color: #909090;
              line-height: 20px;
            }
          }
          .long-view-box {
            padding: 20px 10px;
            background: #fff;
            border-radius: 10px;
            .note-title {
              padding: 0 10px;
              margin-bottom: 20px;
              font-size: 16px;
              font-weight: 600;
              color: var(--default-font-color);
              line-height: 22px;
            }
          }
        }
      }
      .el-dialog__footer {
        padding-top: 13px;
      }
    }
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
        .type-list {
          .type-item {
            margin-bottom: 10px;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            height: 76px;
            background: #f9f9f9;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            &:last-of-type {
              margin-bottom: 0;
            }
            &:active {
              background: #e9e9e9;
            }
            .icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }
            .right-type {
              flex: 1;
              .title {
                margin-bottom: 8px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
              }
              .des {
                font-size: 12px;
                color: #909090;
                line-height: 16px;
              }
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
          &:hover {
            opacity: 0.7;
          }
        }
      }
    }
  }
}
</style>
