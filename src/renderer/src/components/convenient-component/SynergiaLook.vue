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
          <el-button class="refresh-box" size="small">
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
              <div class="value">10</div>
              <div class="title">协同进度</div>
              <div class="desc">协同修改人员</div>
            </div>
            <div class="statistics-item">
              <div class="value">5</div>
              <div class="title">已批准</div>
              <div class="desc">协同批准人</div>
            </div>
            <div class="statistics-item">
              <div class="value">2</div>
              <div class="title">待处理</div>
              <div class="desc">协同人待操作</div>
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
                  placeholder="搜索修改人员"
                  suffix-icon="Search"
                  @focus="modifiersVisible = true"
                />
                <el-divider v-show="modifiersVisible" class="divider" border-style="dashed" />
                <el-tree
                  v-show="modifiersVisible"
                  ref="modifiersRef"
                  style="width: 100%"
                  :data="modifiersTreeData"
                  node-key="ding_id"
                  :expand-on-click-node="false"
                  :props="{ class: 'customNodeClass', label: 'name' }"
                  :filter-node-method="modifiersFilterHandle"
                >
                  <template #default="{ data }">
                    <span class="el-tree-node__label">{{ data.name }}</span>
                    <el-icon class="close-icon" @click="addItem(data)">
                      <Plus />
                    </el-icon>
                  </template>
                </el-tree>
              </div>
              <div v-if="synergiaForm.modifiers.length" class="person-list">
                <div v-for="(tag, i) in synergiaForm.modifiers" :key="i" class="person-item">
                  <img class="avatar" :src="DefaultAvatar" alt="" />
                  <div class="item-box">
                    <div class="item-top">
                      <div class="name">李易峰</div>
                      <div class="status-box">
                        <div class="status">已反馈</div>
                        <div class="status">已确认</div>
                      </div>
                    </div>
                    <div class="item-bottom">
                      <div class="bottom-left">产品经理</div>
                      <div class="bottom-right">
                        <div class="progress-box">
                          <el-progress :show-text="false" :percentage="50" />
                        </div>
                        <div class="duration">1小时20分钟</div>
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
                  placeholder="搜索批准人员"
                  suffix-icon="Search"
                  @focus="approversVisible = true"
                />
                <el-divider v-show="approversVisible" class="divider" border-style="dashed" />
                <el-tree
                  v-show="approversVisible"
                  ref="approversRef"
                  style="width: 100%"
                  :data="approversTreeData"
                  node-key="ding_id"
                  :expand-on-click-node="false"
                  :props="{ class: 'customNodeClass', label: 'name' }"
                  :filter-node-method="approversFilterHandle"
                >
                  <template #default="{ data }">
                    <span class="el-tree-node__label">{{ data.name }}</span>
                    <el-icon class="close-icon" @click="addItem(data)">
                      <Plus />
                    </el-icon>
                  </template>
                </el-tree>
              </div>
              <div v-if="synergiaForm.approvers.length" class="person-list">
                <div v-for="(tag, i) in synergiaForm.approvers" :key="i" class="person-item">
                  <img class="avatar" :src="DefaultAvatar" alt="" />
                  <div class="item-box">
                    <div class="item-top">
                      <div class="name">李易峰</div>
                      <div class="status-box">
                        <div class="status">已反馈</div>
                        <div class="status">已确认</div>
                      </div>
                    </div>
                    <div class="item-bottom">
                      <div class="bottom-left">产品经理</div>
                      <div class="bottom-right">
                        <div class="progress-box">
                          <el-progress :show-text="false" :percentage="50" />
                        </div>
                        <div class="duration">1小时20分钟</div>
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
import cloneDeep from 'lodash.clonedeep'
// import { useUserInfo } from '@renderer/hooks/checkLogin'
import DefaultAvatar from '@renderer/assets/default-avatar.png'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
const synergiaLookVisible = defineModel({ type: Boolean })
// const emits = defineEmits(['setPermission'])
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
let synergiaFormRef = ref(null)
let synergiaForm = ref({
  finishTime: '',
  type: '',
  modifiers: [],
  approvers: [],
  file: null
})
const modifiersTreeData = ref([])
const approversTreeData = ref([])
watchEffect(() => {
  modifiersTreeData.value = cloneDeep(props.treeData)
  approversTreeData.value = cloneDeep(props.treeData)
})
let modifiersSearch = ref('')
let approversSearch = ref('')
let modifiersVisible = ref(false)
let approversVisible = ref(false)
let synergiaRules = ref({
  finishTime: [{ required: true, message: '请选择期待完成时间', trigger: ['blur'] }],
  type: [{ required: true, message: '请选择文件类型', trigger: ['blur'] }],
  modifiers: [{ required: true, message: '请选择修改人员', trigger: ['blur'] }],
  approvers: [{ required: true, message: '请选择批准人员', trigger: ['blur'] }],
  file: [{ required: true, message: '请上传文件', trigger: ['change'] }]
})
let fileTypes = ref([
  {
    title: '注册资料',
    id: '1'
  },
  {
    title: 'DHF资料',
    id: '2'
  },
  {
    title: 'DMR文件',
    id: '3'
  },
  {
    title: '体系文件',
    id: '4'
  },
  {
    title: '其他文件',
    id: '5'
  }
])
// 获取文件图标
const getFileIcon = (file) => {
  // 根据文件扩展名返回不同的图标
  const ext = file.name?.split('.').pop()?.toLowerCase()
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
const formatFileSize = (B) => {
  if (!B) return '0 B'
  if (B < 1024) {
    return B + ' B'
  } else if (B < 1024 * 1024) {
    return (B / 1024).toFixed(2) + ' KB'
  } else if (B < 1024 * 1024 * 1024) {
    return (B / (1024 * 1024)).toFixed(2) + ' MB'
  } else if (B < 1024 * 1024 * 1024 * 1024) {
    return (B / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  } else {
    return (B / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB'
  }
}
// 递归标记节点选中状态
const markSelectedNodes = (checkedNodes, type) => {
  let ding_ids = []
  checkedNodes.some((checkedNode) => {
    if (checkedNode.is_person) {
      ding_ids.push({
        ding_id: checkedNode.ding_id,
        father_id: checkedNode.father_id,
        name: checkedNode.name
      })
    }
  })
  //  treeData.map((node) => {
  //     const isSelected = checkedNodes.some((checkedNode) => checkedNode.ding_id === node.ding_id)
  //     if (isSelected) {
  //       console.log(isSelected);
  //       console.log(node.ding_id,66666);
  //       ding_ids.push(node.ding_id)
  //     }
  //     if (node.children && node.children.length > 0) {
  //       ding_ids = ding_ids.concat(markSelectedNodes(node.children, checkedNodes))
  //     }
  //   })
  if (ding_ids.length > 2 && type === '2') {
    // eslint-disable-next-line no-undef
    ElMessage.warning('最多只能选择2名批准人员')
    approversRef.value.setCheckedKeys(ding_ids.slice(0, 2).map((item) => item.ding_id))
    return ding_ids.slice(0, 2)
  }
  return ding_ids
}
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
  return data.name.includes(value)
}
const approversFilterHandle = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}
// const getCompleteSelectedTree = (personRef, type) => {
//   const tempCheckedNodes = personRef.value.getCheckedNodes(false, false)
//   // 标记选中状态
//   // const uids = markSelectedNodes(props.treeData, tempCheckedNodes)
//   const uids = markSelectedNodes(tempCheckedNodes, type)
//   return uids
// }
// const modifiersCheckChange = () => {
//   synergiaForm.value.modifiers = getCompleteSelectedTree(modifiersRef, '1')
// }
// const approversCheckChange = (e) => {
//   console.log(e);

//   synergiaForm.value.approvers = getCompleteSelectedTree(approversRef, '2')
// }
const addItem = (data) => {

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
                  font-size: 24px;
                  line-height: 32px;
                  font-family: DOUYINSANSBOLD;
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
