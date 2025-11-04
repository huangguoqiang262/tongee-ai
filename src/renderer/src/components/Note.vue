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
        <div class="item active-note">
          <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div>
          <div class="title">糖吉医疗最新文献更新</div>
        </div>
        <div v-for="value in 28" :key="value" class="item">
          <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div>
          <div class="title">糖吉医疗最新文献更新</div>
        </div>
        <div class="item">
          <div class="icon-box">
            <img class="icon" src="@renderer/assets/notebook/note-icon.png" alt="" />
          </div>
          <div class="title">糖吉医疗最新文献更新</div>
        </div>
      </div>
    </div>
    <div class="center-box">
      <div class="center-head">
        <div class="title">工作笔记</div>
        <div class="right-handle-box">
          <img class="add-icon" src="@renderer/assets/repository/add-icon.png" alt="" />
          <el-input
            v-model="searchValue"
            class="search-input"
            :prefix-icon="Search"
            clearable
            placeholder="搜索笔记"
          ></el-input>
          <div class="open-chat">
            <img class="logo" src="@renderer/assets/logo.png" alt="" />
            问问糖源
          </div>
        </div>
      </div>
      <div class="center-content">
        <div
          v-for="item in noteList"
          :key="item.id"
          class="note-item"
          @contextmenu="(e) => showContextMenu(e, item)"
        >
          <div class="title">
            <el-input
              v-if="item.isEdit"
              v-model="item.title"
              autofocus
              class="create-input"
              placeholder="请输入笔记名称"
              @keyup.enter="editNoteName(item)"
              @blur="editNoteName(item)"
            />
            <template v-else>{{ item.title }}</template>
          </div>
          <div class="des">{{ item.des }}</div>
          <div class="item-bottom">
            <div class="time">{{ item.time }}</div>
            <div class="size">{{ item.size }}</div>
          </div>
        </div>
      </div>
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
            <div class="author">创建人：李白</div>
            <el-divider direction="vertical" />
            <div class="time-box">更新时间：2025.09.18</div>
          </div>
        </div>
        <div class="long-view-box">
          <div class="note-title">春天到了</div>
          <!-- <Toolbar :default-config="defaultConfig" :editor="editorRef" mode="default" /> -->
          <Editor
            v-model="noteContent"
            class="editor-content"
            :default-config="editorConfig"
            mode="default"
            @on-created="handleCreated"
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
      <el-form ref="notebookFormRef" :model="notebookForm" :rules="notebookRules">
        <el-form-item prop="title">
          <el-input
            v-model="notebookForm.title"
            class="book-input"
            size="large"
            placeholder="请输入笔记本名称"
          />
        </el-form-item>
        <el-form-item prop="desc">
          <el-input
            v-model="notebookForm.desc"
            class="book-input"
            size="large"
            resize="none"
            type="textarea"
            placeholder="请输入笔记本描述"
          />
        </el-form-item>
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
      <el-form ref="repositoryFormRef" :model="repositoryForm" :rules="repositoryRules">
        <el-form-item prop="id">
          <el-select
            v-model="repositoryForm.id"
            size="large"
            class="repository-select"
            placeholder="请先选择知识库"
          >
            <el-option-group v-for="group in options" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item prop="title">
          <el-input
            v-model="repositoryForm.title"
            class="book-input"
            size="large"
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
            创建
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
      <el-form ref="moveNoteFormRef" :model="moveNoteForm" :rules="moveNoteRules">
        <el-form-item prop="id">
          <el-select
            v-model="moveNoteForm.id"
            size="large"
            class="notebook-select"
            placeholder="选择笔记本"
          >
            <el-option-group v-for="group in options" :key="group.label" :label="group.label">
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
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
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted, nextTick } from 'vue'
import html2Canvas from 'html2canvas'
import shareIcon from '@renderer/assets/contextMenu/share-icon.png'
import repositoryIcon from '@renderer/assets/contextMenu/repository-icon.png'
import moveIcon from '@renderer/assets/contextMenu/move-icon.png'
import renameIcon from '@renderer/assets/contextMenu/rename-icon.png'
import deleteIcon from '@renderer/assets/contextMenu/delete-icon.png'
let notebookVisible = ref(false)
let notebookFormRef = ref(null)
let notebookForm = ref({
  title: '',
  desc: ''
})
let notebookRules = ref({
  title: [{ required: true, message: '请输入笔记本名称', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入笔记本描述', trigger: 'blur' }]
})
const submitNotebookForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      console.log('表单验证通过')
      notebookVisible.value = false
    } else {
      console.log('表单验证失败')
    }
  })
}
const addNotebook = () => {
  notebookVisible.value = true
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
const options = ref([
  {
    label: '知识库1',
    options: [
      { value: 'repo1', label: '知识库1-1' },
      { value: 'repo2', label: '知识库1-2' }
    ]
  },
  {
    label: '知识库2',
    options: [
      { value: 'repo3', label: '知识库2-1' },
      { value: 'repo4', label: '知识库2-2' }
    ]
  }
])
const submitRepositoryForm = async (formRef) => {
  formRef.validate((valid) => {
    if (valid) {
      console.log('表单验证通过')
      addRepositoryVisible.value = false
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
      console.log('表单验证通过')
      moveNoteVisible.value = false
    } else {
      console.log('表单验证失败')
    }
  })
}
let beforeShareVisible = ref(false)
let longImageVisible = ref(false)
let noteContent =
  ref(`春天是探索自然、感受生命力的好时节，下面这份春游攻略希望能给你带来灵感。我先用一个表格汇总不同类型的春游选择，方便你快速了解：
春游类型
推荐地点举例
核心体验
🌸 踏青赏花型
陕西汉中（油菜花海）、辽宁抚顺（梨花）、浙江杭州（桃花、樱花）、河南汝州（综合性花海）
沉浸于壮观花海，感受春日繁花似锦
🏞️ 自然山水型
广东信宜（李花谷、竹海）、辽宁抚顺（国家森林公园）、驻马店嵖岈山
登山徒步、湖滨漫步，享受清新空气与宁静
🏘️ 文化寻踪型
河北邯郸（磁州窑文化与梅文化）、安徽滁州（醉翁文化）、云南石屏（古城与非遗）、河南汝州（汝瓷文化）
将赏花与探寻历史文化、非遗体验相结合
🚴 休闲运动型
北京顺义（骑行、登山）、杭州“三江两岸”（户外探险）
在运动中感受春天，增加游玩趣味性
🌿 田园乡村型
全国各地春季乡村旅游线路
体验田园慢生活，品尝当地特色美食
💡 春游实用建议
规划行程：提前了解目的地的花期（如抚顺梨花4月下旬至5月初最盛）和天气。尽量错峰出行，选择工作日或清晨能提升体验。
准备装备：舒适的鞋服、雨具、防晒用品、饮用水、适量零食是基础。根据活动类型准备相应装备，如登山杖、骑行护具、相机等。
注意安全：遵守景区规定，勿到未开发区域探险。看管好小孩和老人。自驾提前查路线，注意路况。
文明出游：爱护花草树木和文物古迹，不乱丢垃圾。
💎 总结
春游的关键在于拥抱自然、放松心情。你可以根据自己的兴趣和时间，从以上推荐中选择合适的目的地。
希望这些信息能帮助你规划一次愉快的春游。如果你对某个特定地区或者某种特定类型的春游（比如主要是赏花，或者重点是亲子活动）更感兴趣，我可以为你提供更具体的建议。
`)
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
let baseUrl = ref('')
// 分享笔记
const handleShare = (type) => {
  if (type === 'link') {
    // 链接分享
  } else if (type === 'img') {
    // 生成长图
    // 下载长图逻辑
    html2Canvas(document.querySelector('.long-img-box'), { scale: 3 })
      .then((canvas) => {
        baseUrl.value = canvas.toDataURL('image/png')
        // loading.value = baseUrl.value ? false : true
      })
      .catch((err) => {
        console.log(err)

        // loading.value = true
      })
    longImageVisible.value = true
  }
  beforeShareVisible.value = false
}
// 复制长图
const copyLongImage = () => {
  // 复制长图逻辑
}
const handleDownloadLongImage = () => {
  // 下载长图逻辑
  const link = document.createElement('a')
  link.href = baseUrl.value
  link.download = '春天到了.png'
  link.click()
}
const noteList = ref([
  {
    id: 1,
    title: '医疗器械注册流程笔记',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '123KB'
  },
  {
    id: 2,
    title: '质量管理体系要点',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '123KB'
  },
  {
    id: 3,
    title: '临床评价需求总结',
    des: '整理了医疗器械注册的全流程，包括所需材料，时间节点和注意事项…',
    time: '昨天18:09',
    size: '13KB'
  }
])
const contextMenu = ref({ show: false, x: 0, y: 0, actionSheet: [] })
const searchValue = ref('')
const activeNote = ref(null)
// 编辑笔记名称
const editNoteName = (item) => {
  item.isEdit = false
}
// 右键菜单相关函数
const showContextMenu = (e, item) => {
  e.preventDefault()
  activeNote.value = item
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
const handleContextMenuAction = ({ action }) => {
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
    addRepositoryVisible.value = true
  } else if (action === 'moveToNotebook') {
    // 移动到笔记本
    moveNoteVisible.value = true
  } else if (action === 'delete') {
    // 删除
    // eslint-disable-next-line no-undef
    ElMessageBox.confirm('确认删除吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // eslint-disable-next-line no-undef
        ElMessage({
          type: 'primary',
          message: '删除成功'
        })
      })
      .catch(() => {})
  }
  contextMenu.value.show = false
}
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
})
</script>

<style scoped lang="scss">
.notebook-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;

  .left-box {
    box-sizing: border-box;
    padding: 20px;
    width: 332px;
    height: 100%;
    border-right: 1px solid #efefef;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
        line-height: 16px;
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
          line-height: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .center-box {
    flex: 1;
    height: 100%;
    padding: 13px 10px 20px 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

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
        padding-top: 8px;
        padding-bottom: 19px;
        margin-bottom: 11px;
        border-bottom: 1px solid #efefef;

        &:last-of-type {
          border-bottom: none;
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
          line-height: 16px;
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
  :deep(.notebook-dialog) {
    .el-dialog {
      padding-bottom: 14px;
      .el-dialog__header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .dialog-header-del-icon {
          width: 20px;
          height: 20px;
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
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            .note-title {
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
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .dialog-header-del-icon {
          width: 20px;
          height: 20px;
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
        }
      }
    }
  }
}
</style>
