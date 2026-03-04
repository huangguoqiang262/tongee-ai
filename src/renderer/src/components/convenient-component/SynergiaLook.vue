<template>
  <div
    class="SynergiaUpload-box"
    @dragenter.stop.prevent=""
    @dragover.stop.prevent=""
    @dragleave.stop.prevent=""
    @drop.stop.prevent=""
  >
    <el-dialog
      v-model="synergiaLookVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      :show-close="false"
      modal-class="SynergiaUpload-box-dialog"
      width="65vw"
    >
      <template #header>
        <div class="header-left">
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/contextMenu/synergy-look-icon.png"
            alt=""
          />
          <div class="">查看协同</div>
        </div>
        <div class="header-right">
          <el-button class="refresh-box" size="small" @click="refresh">
            <el-icon class="refresh-icon" :class="{ refreshLoading: refreshLoading }"
              ><RefreshRight
            /></el-icon>
            刷新
          </el-button>
          <el-icon class="close-icon" @click="synergiaLookVisible = false"><Close /></el-icon>
        </div>
      </template>
      <div class="form-box">
        <div class="statistics-box">
          <div class="statistics-title">整体协同进度</div>
          <div class="statistics-list">
            <div class="statistics-item">
              <div class="value">{{ statisticsData.completed_nums || 0 }}</div>
              <div class="title">已完成</div>
              <div class="desc">已确认、批准协同人数</div>
            </div>
            <div class="statistics-item">
              <div class="value">{{ statisticsData.pending_nums || 0 }}</div>
              <div class="title">待处理</div>
              <div class="desc">待处理协同人数</div>
            </div>
            <div class="statistics-item">
              <div class="value">
                {{ statisticsData.total_time?.hour || 0 }} <span class="unit">h</span>
                {{ statisticsData.total_time?.minute || 0 }} <span class="unit">min</span>
              </div>
              <div class="title">总耗时</div>
              <div class="desc">文件总耗时</div>
            </div>
          </div>
        </div>
        <div class="content-box">
          <div class="left-container">
            <div class="left-form-box">
              <div class="head-title">协同人</div>
              <div class="tree-parent-box">
                <el-input
                  v-model="modifiersSearch"
                  class="input"
                  type="text"
                  placeholder="搜索添加协同人"
                  suffix-icon="Search"
                  @focus="modifiersVisible = true"
                />
                <el-divider v-show="modifiersVisible" class="divider" border-style="dashed" />
                <el-tree
                  v-show="modifiersVisible"
                  ref="modifiersRef"
                  style="width: 100%"
                  :data="modifiersTreeData"
                  node-key="key"
                  :expand-on-click-node="false"
                  :props="{ class: 'customNodeClass', label: 'title' }"
                  :filter-node-method="modifiersFilterHandle"
                >
                  <template #default="{ data }">
                    <span class="el-tree-node__label">{{ data.title }}</span>
                    <el-icon
                      v-if="data.type == 'user' && !data.editor_selected"
                      class="add-icon"
                      @click="addModifier(data)"
                    >
                      <Plus />
                    </el-icon>
                    <el-icon
                      v-else-if="data.type == 'user' && data.editor_selected"
                      class="add-icon check-icon"
                    >
                      <Check />
                    </el-icon>
                  </template>
                </el-tree>
              </div>
              <div v-if="modifiers.length" class="person-list">
                <div v-for="(tag, i) in modifiers" :key="i" class="person-item">
                  <img class="avatar" :src="tag.avatar || DefaultAvatar" alt="" />
                  <div class="item-box">
                    <div class="item-top">
                      <div class="name">{{ tag.name }}</div>
                      <div class="status-box">
                        <div v-if="tag.feedbacked == 1" class="status">已反馈</div>
                        <div v-else class="status info-status">未反馈</div>
                        <div v-if="tag.task_status == 1" class="status">已确认</div>
                        <div v-else class="status info-status">未确认</div>
                      </div>
                    </div>
                    <div class="item-bottom">
                      <div class="bottom-left">{{ tag.position }}</div>
                      <div class="bottom-right">
                        <div class="progress-box">
                          <el-progress
                            :show-text="false"
                            :percentage="formatTime(tag.end_time_diff, modifiers).percentage"
                          />
                        </div>
                        <div class="duration">
                          {{ formatTime(tag.end_time_diff, modifiers).timeConsuming }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="tip">
                <el-empty :image-size="80" description="暂无协同人" />
              </div>
            </div>
          </div>
          <div class="right-container">
            <div class="left-form-box">
              <div class="head-title">批准人</div>
              <div class="tree-parent-box">
                <el-input
                  v-model="approversSearch"
                  class="input"
                  type="text"
                  placeholder="搜索添加批准人"
                  suffix-icon="Search"
                  @focus="approversVisible = true"
                />
                <el-divider v-show="approversVisible" class="divider" border-style="dashed" />
                <el-tree
                  v-show="approversVisible"
                  ref="approversRef"
                  style="width: 100%"
                  :data="approversTreeData"
                  node-key="key"
                  :expand-on-click-node="false"
                  :props="{ class: 'customNodeClass', label: 'title' }"
                  :filter-node-method="approversFilterHandle"
                >
                  <template #default="{ data }">
                    <span class="el-tree-node__label">{{ data.title }}</span>
                    <el-icon
                      v-if="data.type == 'user' && !data.auditor_selected"
                      class="add-icon"
                      @click="addApprover(data)"
                    >
                      <Plus />
                    </el-icon>
                    <el-icon
                      v-else-if="data.type == 'user' && data.auditor_selected"
                      class="add-icon check-icon"
                    >
                      <Check />
                    </el-icon>
                  </template>
                </el-tree>
              </div>
              <div v-if="approvers.length" class="person-list">
                <div v-for="(tag, i) in approvers" :key="i" class="person-item">
                  <img class="avatar" :src="tag.avatar || DefaultAvatar" alt="" />
                  <div class="item-box">
                    <div class="item-top">
                      <div class="name">{{ tag.name }}</div>
                      <div class="status-box">
                        <div v-if="tag.task_status == 1" class="status">已确认</div>
                        <div v-else class="status info-status">未确认</div>
                      </div>
                    </div>
                    <div class="item-bottom">
                      <div class="bottom-left">{{ tag.position }}</div>
                      <div class="bottom-right">
                        <div class="progress-box">
                          <el-progress
                            :show-text="false"
                            :percentage="formatTime(tag.end_time_diff, approvers).percentage"
                          />
                        </div>
                        <div class="duration">
                          {{ formatTime(tag.end_time_diff, approvers).timeConsuming }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="tip">
                <el-empty :image-size="80" description="暂无批准人" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, watchEffect } from 'vue'
// import { useUserInfo } from '@renderer/hooks/checkLogin'
import DefaultAvatar from '@renderer/assets/default-avatar.png'
import {
  synergia_process_detail,
  org_organ_user_tree,
  synergia_add_process_user
} from '@renderer/api/repository.js'
const synergiaLookVisible = defineModel({ type: Boolean })
const emits = defineEmits(['refreshList'])
// const userInfo = useUserInfo()
let refreshLoading = ref(true)
let modifiersRef = ref(null)
let approversRef = ref(null)
const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  knowId: {
    type: [String, Number],
    default: ''
  },
  itemId: {
    type: [String, Number],
    default: ''
  }
})
const modifiersTreeData = ref([])
const approversTreeData = ref([])
let modifiersSearch = ref('')
let approversSearch = ref('')
let modifiersVisible = ref(false)
let modifiers = ref([])
let approvers = ref([])
let statisticsData = ref({})
let approversVisible = ref(false)
const refresh = () => {
  refreshLoading.value = true
  getSynergiaDetail()
  getTreeData()
}
// 获取组织人员树
const getTreeData = () => {
  org_organ_user_tree({ item_id: props.itemId }).then((res) => {
    if (res.code == 200) {
      modifiersTreeData.value = res.data
      approversTreeData.value = res.data
    }
  })
}
const formatTime = (targetTime, list) => {
  var timeObj = {
    timeConsuming: '0小时0分钟',
    percentage: 0
  }
  if (!targetTime) {
    return timeObj
  }
  // 查找list中end_time_diff最大值
  var max_diff = Math.max(...list.map((item) => item.end_time_diff))
  timeObj.percentage = Math.floor((targetTime / max_diff) * 100)
  var h = Math.floor(targetTime / 60 / 60)
  var min = Math.ceil((targetTime % 3600) / 60)
  timeObj.timeConsuming = `${h}小时${min}分钟`
  return timeObj
}
// 获取协同文件详情
const getSynergiaDetail = () => {
  synergia_process_detail({
    know_id: props.knowId,
    item_id: props.itemId
  })
    .then((res) => {
      modifiers.value = res.data.editors || []
      approvers.value = res.data.auditors || []
      statisticsData.value = {
        pending_nums: res.data.pending_nums,
        confirm_nums: res.data.confirm_nums,
        audit_nums: res.data.audit_nums,
        pending_collaborator_nums: res.data.pending_collaborator_nums,
        pending_approve_nums: res.data.pending_approve_nums,
        completed_nums: res.data.completed_nums,
        total_time: res.data.total_time
      }
    })
    .finally(() => {
      refreshLoading.value = false
    })
}
watchEffect(() => {
  if (synergiaLookVisible.value) {
    modifiersSearch.value = ''
    approversSearch.value = ''
    getSynergiaDetail()
    getTreeData()
  }
})
// 标记选中节点
// const findSelectedNodes = (data, key) => {
//   function traverse(nodes) {
//     nodes.map((node, index) => {
//       if (node[key]) {
//         nodes.splice(index, 1)
//       }
//       if (node.children && node.children.length > 0) {
//         traverse(node.children)
//       }
//     })
//   }

//   traverse(data)
// }
watch(modifiersSearch, (val) => {
  modifiersRef.value?.filter(val)
})
watch(approversSearch, (val) => {
  approversRef.value?.filter(val)
})
const hidePersonList = (e) => {
  if (!e.target.closest('.tree-parent-box') && modifiersVisible.value) {
    modifiersVisible.value = false
  }
  if (!e.target.closest('.tree-parent-box') && approversVisible.value) {
    approversVisible.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', hidePersonList)
})
onUnmounted(() => {
  document.removeEventListener('click', hidePersonList)
})
const modifiersFilterHandle = (value, data) => {
  if (!value) return true
  return data.title.includes(value)
}
const approversFilterHandle = (value, data) => {
  if (!value) return true
  return data.title.includes(value)
}
// 新增协同人
const addModifier = (data) => {
  var params = {
    item_id: props.itemId,
    ding_uid: data.ding_uid,
    dept_id: data.dept_id,
    position: data.position,
    user_type: 1
  }
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm(`确认添加${data.title}为协同人吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      synergia_add_process_user(params).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '新增协同人成功'
          })
          data.editor_selected = true
          emits('refreshList')
          getSynergiaDetail()
        }
      })
    })
    .catch(() => {})
}
// 新增批准人
const addApprover = (data) => {
  var params = {
    item_id: props.itemId,
    ding_uid: data.ding_uid,
    dept_id: data.dept_id,
    position: data.position,
    user_type: 2
  }
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm(`确认添加${data.title}为批准人吗？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      synergia_add_process_user(params).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '新增批准人成功'
          })
          data.auditor_selected = true
          emits('refreshList')
          getSynergiaDetail()
        }
      })
    })
    .catch(() => {})
}
</script>

<style scoped lang="scss">
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.SynergiaUpload-box {
  :deep(.SynergiaUpload-box-dialog) {
    .el-dialog {
      height: 672px;
      min-width: 1060px;
      padding: 17px 20px 20px;
      .el-dialog__header {
        padding-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-weight: 500;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0 25px;
          .refresh-box {
            align-items: center;
            width: 70px;
            height: 26px;
            border-radius: 6px;
            .refresh-icon {
              margin-right: 5px;
              &.refreshLoading {
                animation: rotate 1s linear infinite;
              }
            }
          }
          .close-icon {
            color: var(--el-color-info);
            font-size: 20px;
            cursor: pointer;
            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
        .dialog-header-del-icon {
          width: 16px;
          height: 16px;
        }
      }

      .el-dialog__body {
        padding-top: 8px;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;

        .form-box {
          box-sizing: border-box;
          .statistics-box {
            box-sizing: border-box;
            padding: 20px;
            height: 172px;
            width: 100%;
            background: #f9f9f9;
            border-radius: 10px;
            .statistics-title {
              margin-bottom: 30px;
              font-weight: 500;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 20px;
            }
            .statistics-list {
              display: flex;
              align-items: center;
              .statistics-item {
                flex-shrink: 0;
                width: 33.33%;
                text-align: center;
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
          }
          .content-box {
            box-sizing: border-box;
            width: 100%;
            height: calc(600px - 172px);
            background: #fff;
            border-radius: 10px;
            display: flex;
            align-items: flex-start;
            overflow: hidden;
            .head-title {
              flex-shrink: 0;
              margin-bottom: 16px;
              font-weight: 500;
              font-size: 14px;
              color: var(--default-font-color);
              line-height: 22px;
            }
            .left-container,
            .right-container {
              box-sizing: border-box;
              padding: 20px 10px 20px 0px;
              width: 50%;
              height: 100%;
              overflow: hidden;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              // .el-form-item.is-error {
              //   .el-select__wrapper,
              //   .el-input__wrapper {
              //     box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
              //   }
              // }
              .left-form-box {
                flex: 1;
                width: 100%;
                overflow-y: auto;
              }
              .el-form-item__label {
                color: var(--default-font-color);
              }
              .input {
                width: 100%;
                height: 48px;
                &.date-picker {
                  position: relative;
                  .el-input__wrapper {
                    padding-right: 33px;
                    .el-input__prefix {
                      position: absolute;
                      top: 50%;
                      right: 11px;
                      transform: translateY(-50%);
                      width: 22px;
                      height: 100%;
                      .el-icon {
                        margin-left: 8px;
                        margin-right: 0;
                      }
                    }
                  }
                }
                .el-select__wrapper {
                  height: 100%;
                  border-radius: 6px;
                  background: #f9f9f9;
                  box-shadow: 0 0 0 1px #f9f9f9 inset;
                  &.is-focus {
                    box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
                  }
                }
                .el-input__wrapper {
                  border-radius: 6px;
                  background: #f9f9f9;
                  box-shadow: 0 0 0 1px #f9f9f9 inset;
                  &.is-focus {
                    box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
                  }
                }
              }
              .tree-parent-box {
                width: 100%;
                background: #f9f9f9;
                border-radius: 6px;
                overflow: hidden;
                .divider {
                  margin: 0 auto;
                  width: calc(100% - 20px);
                }
              }
              .el-tree {
                padding: 20px 40px 20px 25px;
                background: #f9f9f9;
              }
              .customNodeClass {
                .el-tree-node__content {
                  height: 36px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background: transparent;

                  .el-tree-node__label {
                    flex: 1;
                    font-size: 14px;
                    color: var(--default-font-color);
                  }
                  .add-icon {
                    font-size: 16px;
                    color: var(--el-color-primary);
                    transition: all 0.2s ease-in-out;
                    &:hover {
                      transform: scale(1.2);
                    }
                    &.check-icon {
                      &:hover {
                        transform: scale(1);
                      }
                    }
                  }
                  .el-checkbox {
                    order: 2;
                    /* 将checkbox放到最后 */
                  }
                }
                .el-icon.el-tree-node__expand-icon {
                  width: 14px;
                  height: 14px;
                  background: url('@renderer/assets/repository/unopened-icon.png') no-repeat center
                    center/14px 14px;

                  &.expanded {
                    transform: rotate(0deg);
                    background: url('@renderer/assets/repository/opened-icon.png') no-repeat center
                      center/14px 14px;

                    svg {
                      display: none;
                    }
                  }

                  svg {
                    display: none;
                  }
                }
              }
              .tip {
                margin-top: 12px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                .el-empty__description p {
                  font-size: 12px !important;
                  color: #909090 !important;
                }
              }
              .person-list {
                padding-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px 5px;
                .person-item {
                  box-sizing: border-box;
                  padding: 16px 20px;
                  height: 76px;
                  width: 100%;
                  background: #f9f9f9;
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  overflow: hidden;
                  gap: 0 10px;
                  .avatar {
                    object-fit: cover;
                    width: 32px;
                    height: 32px;
                    border-radius: 4px;
                  }
                  .item-box {
                    flex: 1;
                    .item-top {
                      margin-bottom: 6px;
                      display: flex;
                      align-items: center;
                      gap: 0 16px;
                      overflow: hidden;
                      .name {
                        flex-shrink: 0;
                        max-width: 50%;
                        font-size: 14px;
                        color: var(--default-font-color);
                        line-height: 22px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                      }
                      .status-box {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        gap: 0 6px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        .status {
                          padding: 2px 5px;
                          font-size: 10px;
                          color: var(--el-color-primary);
                          line-height: 12px;
                          background: var(--el-color-primary-light-9);
                          border-radius: 2px;
                          border: 1px solid var(--el-color-primary);
                        }
                        .info-status {
                          border-color: #ccc;
                          color: #909090;
                          background: #ececec;
                        }
                      }
                    }
                    .item-bottom {
                      width: 100%;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      gap: 0 16px;
                      .bottom-left {
                        width: 50%;
                        font-size: 12px;
                        color: #909090;
                        line-height: 16px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                      }
                      .bottom-right {
                        display: flex;
                        align-items: center;
                        gap: 0 10px;
                        justify-content: flex-end;
                        width: 50%;
                        font-size: 12px;
                        color: #909090;
                        line-height: 16px;
                        .progress-box {
                          width: 112px;
                        }
                      }
                    }
                  }
                }
              }
              .foot-box {
                flex-shrink: 0;
                margin-top: 20px;
                width: 100%;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
                .cancel-btn,
                .confirm-btn {
                  height: 36px;
                  width: 112px;
                  border-radius: 8px;
                  border: none;
                  font-size: 14px;
                }

                .cancel-btn {
                  width: 80px;
                  background: #efefef;
                  color: var(--default-font-color);
                }
              }
            }
            .right-container {
              box-sizing: border-box;
              padding: 20px 0px 20px 10px;
              width: 50%;
              height: 100%;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
          }
        }
      }
    }
  }
}
</style>
