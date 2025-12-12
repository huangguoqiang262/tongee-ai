<template>
  <div class="Recycled-box">
    <div class="square">
      <div class="page-title-box">
        <div class="page-title">回收站</div>
        <div class="right-head-box">
          <div class="filter-box" @click="refresh">
            <img class="filter-icon" src="@renderer/assets/refresh-icon.png" alt="" />
            刷新
          </div>
          <div class="export-box" @click="beforeClearChange">清空回收站</div>
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
        <div v-infinite-scroll="loadData" class="repository-box">
          <el-skeleton :loading="loading" animated>
            <template #template>
              <div class="list-box">
                <div v-for="item in 6" :key="item" class="list-item">
                  <el-skeleton-item
                    variant="text"
                    class="left-icon"
                    src="@renderer/assets/feedback-icon.png"
                    alt=""
                  />
                  <div class="center-box">
                    <el-skeleton-item
                      variant="text"
                      style="width: 30%; display: block"
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
                    <el-skeleton-item
                      variant="text"
                      style="width: 60%; display: block"
                      class="size"
                    ></el-skeleton-item>
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <div v-if="activeTab == '1'" class="list-box">
                <template v-if="list.length">
                  <div
                    v-for="item in list"
                    :key="item.id + activeTab"
                    class="list-item"
                    @contextmenu="showContextMenu(item, $event)"
                  >
                    <img class="left-icon" src="@renderer/assets/feedback-icon.png" alt="" />
                    <div class="center-box">
                      <div class="title">{{ item.title }}</div>
                      <div class="desc">
                        {{ item.user_name || ''
                        }}{{ item.user_dept ? '(' + item.user_dept + ')' : '' }}
                      </div>
                    </div>
                    <div class="time-box">
                      <div class="time">{{ formatTimeFun(item.delete_time) }}删除</div>
                      <div class="size">{{ formatFileSize(item.total_space) }}</div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">
                  <el-empty :image-size="120" description="暂无数据" />
                </div>
              </div>
              <div v-if="activeTab == '2'" class="list-box">
                <template v-if="list.length">
                  <div
                    v-for="item in list"
                    :key="item.id + activeTab"
                    class="list-item"
                    @contextmenu="showContextMenu(item, $event)"
                  >
                    <img class="left-icon" src="@renderer/assets/file-icon1.png" alt="" />
                    <div class="center-box">
                      <div class="title">{{ item.title }}</div>
                      <div class="desc desc1">{{ item.original_path }}</div>
                      <div class="author">
                        {{ item.user_name || ''
                        }}{{ item.user_dept ? '(' + item.user_dept + ')' : '' }}
                      </div>
                    </div>
                    <div class="time-box">
                      <div class="time">{{ formatTimeFun(item.delete_time) }}删除</div>
                      <div class="size">{{ formatFileSize(item.file_space) }}</div>
                    </div>
                  </div>
                </template>
                <div v-else class="empty">
                  <el-empty :image-size="120" description="暂无数据" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="clearRecycled"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="title">确认清空回收站</div>
      </template>
      <span>您确定要清空整个回收站吗？此操作将永久删除所有项目且不可撤销！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="clearRecycled = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="confirmClear"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
    <HandleContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :permission-type="contextMenu.permission_type"
      :action-sheet="contextMenu.actionSheet"
      @action="handleContextMenuAction"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { get_know_list, get_file_list, restore, clean_all, clean_one } from '@renderer/api/Recycled'
import { formatTime } from '@renderer/utils/index.js'
import restoreIcon from '@renderer/assets/restore-icon.png'
import delIcon from '@renderer/assets/del-icon.png'
let tabs = ref([
  {
    id: '1',
    name: '知识库'
  },
  {
    id: '2',
    name: '文件'
  }
])
let activeTab = ref('1')
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
const formatTimeFun = (time) => {
  return formatTime(time)
}
let loading = ref(true)
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
const activeItem = ref({})
let clearRecycled = ref(false)
let beforeClearChange = () => {
  clearRecycled.value = true
}
// 刷新
const refresh = () => {
  pagination.value = {
    page: 1,
    page_size: 10,
    total: 0
  }
  list.value = []
  getList()
}
const confirmClear = () => {
  clean_all().then((res) => {
    if (res.code == 200) {
      clearRecycled.value = false
      // eslint-disable-next-line no-undef
      ElMessage.success('清空回收站成功')
      refresh()
    }
  })
}
const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  loading.value = load
  if (activeTab.value == '1') {
    get_know_list(data)
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
    get_file_list(data)
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
  }
}
const contextMenu = ref({ show: true, x: 0, y: 0, actionSheet: [] })
// 右键菜单相关函数
const showContextMenu = (item, e) => {
  activeItem.value = item
  contextMenu.value = {
    show: true,
    permission_type: 'cannotView',
    x: e.clientX,
    y: e.clientY,
    actionSheet: [
      {
        name: '一键还原',
        icon: restoreIcon,
        action: 'restore'
      },
      {
        name: '永久删除',
        icon: delIcon,
        action: 'del'
      }
    ]
  }
}
const handleContextMenuAction = ({ action }) => {
  if (action === 'restore') {
    // 一键还原
    restore({ ids: [activeItem.value.recycle_id] }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage.success('一键还原成功')
        refresh()
      }
    })
  } else if (action === 'del') {
    // 永久删除
    clean_one({ recycle_id: activeItem.value.recycle_id }).then((res) => {
      if (res.code == 200) {
        // eslint-disable-next-line no-undef
        ElMessage.success('永久删除成功')
        refresh()
      }
    })
  }
  // contextMenu.value.show = false
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
}
const hideContextMenu = (e) => {
  if (contextMenu.value.show && !e.target.closest('.context-menu')) {
    contextMenu.value.show = false
  }
}
const formatFileSize = (kb) => {
  if (!kb) return '0 KB'
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
onMounted(() => {
  document.addEventListener('click', hideContextMenu)
  refresh()
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
        box-sizing: border-box;
        padding: 0 20px;
        background: #f9f9f9;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        .list-box {
          // overflow-y: auto;
          .empty {
            padding-top: 80px;
            height: 460px;
            font-size: 13px;
            text-align: center;
            line-height: 20px;
            color: #909090;
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
            }

            .center-box {
              flex: 1;

              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
              }

              .desc {
                margin-top: 10px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;

                &.desc1 {
                  margin-top: 4px;
                }
              }

              .author {
                margin-top: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
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
