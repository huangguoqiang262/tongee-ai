<template>
  <div
    class="SynergiaUpload-box"
    @dragenter.stop.prevent=""
    @dragover.stop.prevent=""
    @dragleave.stop.prevent=""
    @drop.stop.prevent=""
  >
    <el-dialog
      v-model="synergiaUploadVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      modal-class="SynergiaUpload-box-dialog"
      width="65vw"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/popover/synergia-icon.png"
          alt=""
        />
        <div class="">协同文件</div>
      </template>
      <div class="form-box">
        <div class="content-box">
          <div class="left-container">
            <el-form
              ref="synergiaFormRef"
              label-position="top"
              :model="synergiaForm"
              :rules="synergiaRules"
              hide-required-asterisk
              label-width="auto"
              class="left-form-box"
            >
              <div class="head-title">文件信息</div>
              <el-form-item label="文件类型" prop="type_id">
                <el-select
                  v-model="synergiaForm.type_id"
                  class="input"
                  placeholder="请选择文件类型"
                >
                  <el-option
                    v-for="item in fileTypes"
                    :key="item.id"
                    :label="item.title"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="期待完成时间" prop="finishTime">
                <el-date-picker
                  v-model="synergiaForm.finishTime"
                  class="input date-picker"
                  type="date"
                  placeholder="选择时间"
                  value-format="x"
                  :disabled-date="disabledDate"
                />
              </el-form-item>
              <el-form-item label="修改人员" prop="modifiers">
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
                    show-checkbox
                    node-key="key"
                    :expand-on-click-node="false"
                    :props="{ class: 'customNodeClass', label: 'title' }"
                    :filter-node-method="modifiersFilterHandle"
                    @check="modifiersCheckChange"
                  >
                  </el-tree>
                </div>
                <div v-if="synergiaForm.modifiers.length" class="person-list">
                  <el-tag
                    v-for="(tag, i) in synergiaForm.modifiers"
                    :key="i"
                    closable
                    round
                    type="primary"
                    @close="removeModifier(i)"
                  >
                    {{ tag.title }}
                  </el-tag>
                </div>
                <div v-else class="tip">未选择人员</div>
              </el-form-item>
              <el-form-item label="批准人员（最多两名）" prop="approvers">
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
                    show-checkbox
                    node-key="key"
                    :expand-on-click-node="false"
                    :props="{ class: 'customNodeClass', label: 'title' }"
                    :filter-node-method="approversFilterHandle"
                    @check-change="approversCheckChange"
                  >
                  </el-tree>
                </div>
                <div v-if="synergiaForm.approvers.length" class="person-list">
                  <el-tag
                    v-for="(tag, i) in synergiaForm.approvers"
                    :key="i"
                    closable
                    round
                    type="primary"
                    @close="removeApprover(i)"
                  >
                    {{ tag.title }}
                  </el-tag>
                </div>
                <div v-else class="tip">未选择人员</div>
              </el-form-item>
            </el-form>
            <div class="foot-box">
              <el-button class="cancel-btn" size="small" @click="synergiaUploadVisible = false"
                >取消</el-button
              >
              <el-button class="confirm-btn" size="small" type="primary" @click="handleAdd(item)"
                >上传协同文件</el-button
              >
            </div>
          </div>
          <div class="right-container">
            <div class="head-title">文件上传</div>
            <el-upload
              class="upload-box"
              drag
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleFiileChange"
              accept=".doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            >
              <documentSvgIcon class="document-icon" />
              <div class="tip-title">将文档拖动至此或选择文档</div>
              <div class="tip-format">
                支持.doc,.xls,.xlsx,.csv,.pdf,.txt,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif等格式
              </div>
              <el-button class="btn-box" type="primary">选择文件</el-button>
            </el-upload>
            <div v-if="synergiaForm.file" class="uploaded-box">
              <div class="uploaded-title">已选文件</div>
              <div class="uploaded-list">
                <div class="uploaded-item">
                  <img class="icon" :src="getFileIcon(synergiaForm.file)" alt="" />
                  <div class="item-content">
                    <div class="item-name">{{ synergiaForm.file.name }}</div>
                    <div class="item-size-ext">
                      <span class="ext">
                        {{ synergiaForm.file.name.split('.').pop().toUpperCase() }}
                      </span>
                      <span>{{ formatFileSize(synergiaForm.file.size) }}</span>
                    </div>
                  </div>
                  <el-icon class="close-icon" color="#737475" @click="handleRemove(item)"
                    ><Close
                  /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, onMounted, onUnmounted } from 'vue'
import {
  org_organ_user_tree,
  synergia_upload_file,
  synergia_type_list
} from '@renderer/api/repository'
// import cloneDeep from 'lodash.clonedeep'
// import { useUserInfo } from '@renderer/hooks/checkLogin'
// import DefaultAvatar from '@renderer/assets/default-avatar.png'
import documentSvgIcon from '@renderer/assets/documentInterpretation/document-icon.svg'
import excelIcon from '@renderer/assets/file-icons/excel-large-icon.png'
import imgIcon from '@renderer/assets/file-icons/img-large-icon.png'
import pdfIcon from '@renderer/assets/file-icons/pdf-large-icon.png'
import pptIcon from '@renderer/assets/file-icons/ppt-large-icon.png'
import txtIcon from '@renderer/assets/file-icons/txt-large-icon.png'
import wordIcon from '@renderer/assets/file-icons/word-large-icon.png'
import csvIcon from '@renderer/assets/file-icons/csv-large-icon.png'
const synergiaUploadVisible = defineModel({ type: Boolean })
// const userInfo = useUserInfo()
let modifiersRef = ref(null)
let approversRef = ref(null)
const props = defineProps({
  knowId: {
    type: [String, Number],
    default: ''
  },
  parentItemId: {
    type: [String, Number],
    default: ''
  }
})
const emits = defineEmits(['refreshList'])
let synergiaFormRef = ref(null)
let synergiaForm = ref({
  finishTime: '',
  type_id: '',
  modifiers: [],
  approvers: [],
  file: null
})
let fileTypes = ref([])
const modifiersTreeData = ref([])
const approversTreeData = ref([])
// 获取类型列表
const getTypeList = () => {
  synergia_type_list({}).then((res) => {
    if (res.code == 200) {
      fileTypes.value = res.data
    }
  })
}
// 获取组织人员树
const getTreeData = () => {
  org_organ_user_tree({}).then((res) => {
    if (res.code == 200) {
      modifiersTreeData.value = res.data
      approversTreeData.value = res.data
    }
  })
}
let modifiersSearch = ref('')
let approversSearch = ref('')
let modifiersVisible = ref(false)
let approversVisible = ref(false)
let synergiaRules = ref({
  finishTime: [{ required: true, message: '请选择期待完成时间', trigger: ['blur'] }],
  type_id: [{ required: true, message: '请选择文件类型', trigger: ['blur'] }],
  modifiers: [{ required: true, message: '请选择修改人员', trigger: ['change'] }],
  approvers: [{ required: true, message: '请选择批准人员', trigger: ['change'] }],
  file: [{ required: true, message: '请上传文件', trigger: ['change'] }]
})
// 文件选取回调
const handleFiileChange = (file) => {
  const allowedTypes = [
    '.txt',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.pdf',
    '.doc',
    '.docx',
    '.csv',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx'
  ]
  const fileExt = '.' + file.raw.name.split('.').pop().toLowerCase()
  if (!allowedTypes.includes(fileExt)) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('不支持的文件类型')
    return
  }
  synergiaForm.value.file = file.raw
}
// 删除文件
const handleRemove = () => {
  synergiaForm.value.file = null
}
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
  let persons = []
  checkedNodes.some((checkedNode) => {
    if (checkedNode.type == 'user') {
      persons.push({
        ding_uid: checkedNode.ding_uid,
        dept_id: checkedNode.dept_id,
        position: checkedNode.position,
        key: checkedNode.key,
        title: checkedNode.title
      })
    }
  })
  if (persons.length > 2 && type === '2') {
    approversRef.value.setCheckedKeys(
      persons.slice(0, 2).map((item) => item.key),
      false
    )
    return persons.slice(0, 2)
  }
  return persons
}
// 删除修改人员
const removeModifier = (index) => {
  synergiaForm.value.modifiers.splice(index, 1)
  modifiersRef.value.setCheckedKeys(
    synergiaForm.value.modifiers.map((item) => item.key),
    false
  )
}
// 删除批准人员
const removeApprover = (index) => {
  synergiaForm.value.approvers.splice(index, 1)
  approversRef.value.setCheckedKeys(
    synergiaForm.value.approvers.slice(0, 2).map((item) => item.key),
    false
  )
}
const disabledDate = (time) => {
  return time.getTime() < new Date(new Date().toLocaleDateString()).getTime()
}
// 处理添加成员
const handleAdd = () => {
  if (synergiaFormRef.value) {
    synergiaFormRef.value.validate((valid) => {
      if (valid) {
        if (!synergiaForm.value.file) {
          // eslint-disable-next-line no-undef
          ElMessage.warning('请上传文件')
          return
        }
        var data = {
          completion_time: parseInt(synergiaForm.value.finishTime / 1000),
          type_id: synergiaForm.value.type_id,
          editors: JSON.stringify(synergiaForm.value.modifiers),
          auditors: JSON.stringify(synergiaForm.value.approvers),
          'file[]': synergiaForm.value.file,
          parent_item_id: props.parentItemId,
          knowledge_id: props.knowId
        }
        synergia_upload_file(data).then((res) => {
          if (res.code == 200) {
            // eslint-disable-next-line no-undef
            ElMessage.primary('上传成功')
            // 重置表单
            synergiaForm.value = {
              finishTime: '',
              type_id: '',
              modifiers: [],
              approvers: [],
              file: null
            }
            synergiaFormRef.value.resetFields()
            // 重置树状图选中状态
            modifiersRef.value.setCheckedKeys([], false)
            approversRef.value.setCheckedKeys([], false)
            emits('refreshList')
            // 隐藏弹窗
            synergiaUploadVisible.value = false
          }
        })
      }
    })
  }
  // emits('setPermission', {
  //   type: 'allowable',
  //   data: {
  //     join_id: item.id
  //   }
  // })
}
watchEffect(() => {
  if (synergiaUploadVisible.value) {
    modifiersSearch.value = ''
    approversSearch.value = ''
    getTypeList()
    getTreeData()
  }
})
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
const getCompleteSelectedTree = (personRef, type) => {
  const tempCheckedNodes = personRef.value.getCheckedNodes(false, false)
  // 标记选中状态
  const uids = markSelectedNodes(tempCheckedNodes, type)
  return uids
}
const modifiersCheckChange = () => {
  synergiaForm.value.modifiers = getCompleteSelectedTree(modifiersRef, '1')
  synergiaFormRef.value.validateField('modifiers')
}
const approversCheckChange = () => {
  synergiaForm.value.approvers = getCompleteSelectedTree(approversRef, '2')
  synergiaFormRef.value.validateField('approvers')
}
</script>

<style scoped lang="scss">
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
        padding-top: 8px;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;

        .form-box {
          box-sizing: border-box;
          .content-box {
            box-sizing: border-box;
            width: 100%;
            height: 596px;
            background: #fff;
            border-radius: 10px;
            border: 1px solid #efefef;
            display: flex;
            align-items: flex-start;
            overflow: hidden;
            .head-title {
              flex-shrink: 0;
              margin-bottom: 20px;
              font-weight: 600;
              font-size: 16px;
              color: var(--default-font-color);
              line-height: 22px;
            }
            .left-container {
              box-sizing: border-box;
              padding: 20px 10px 20px 20px;
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
              }
              .person-list {
                padding-top: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px 5px;
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
              padding: 20px 20px 20px 10px;
              width: 50%;
              height: 100%;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              .upload-box {
                flex: 1;
                overflow: hidden;
                .el-upload {
                  width: 100%;
                  height: 100%;
                }
                .el-upload-dragger {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  height: 100%;
                  background: #f9f9f9;
                  border-radius: 10px;
                }

                .document-icon {
                  margin-bottom: 20px;
                  width: 28px;
                  height: 33px;
                }

                .tip-title {
                  margin-bottom: 10px;
                  font-size: 14px;
                  color: var(--default-font-color);
                  line-height: 20px;
                }

                .tip-format {
                  margin-bottom: 40px;
                  font-size: 14px;
                  color: #aeaeae;
                  line-height: 20px;
                }

                .btn-box {
                  margin-bottom: 60px;
                  width: 104px;
                  height: 36px;
                  border-radius: 8px;
                }
              }
              .uploaded-box {
                .uploaded-title {
                  margin: 20px 0 14px;
                  font-size: 14px;
                  color: var(--default-font-color);
                  line-height: 20px;
                }
                .uploaded-list {
                  .uploaded-item {
                    box-sizing: border-box;
                    padding: 12px 10px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 0 4px;
                    width: 100%;
                    height: 80px;
                    background: #f9f9f9;
                    border-radius: 4px;
                    overflow: hidden;
                    .icon {
                      flex-shrink: 0;
                      align-self: center;
                      width: 36px;
                      height: 36px;
                    }
                    .item-content {
                      flex: 1;
                      overflow: hidden;
                      .item-name {
                        margin-bottom: 14px;
                        font-size: 14px;
                        color: var(--default-font-color);
                        line-height: 20px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                      }
                      .item-size-ext {
                        font-size: 10px;
                        color: #909090;
                        line-height: 12px;
                        .ext {
                          margin-right: 8px;
                          text-transform: uppercase;
                        }
                      }
                    }
                    .close-icon {
                      flex-shrink: 0;
                      align-self: center;
                      font-size: 18px;
                      cursor: pointer;
                      &:hover {
                        color: var(--el-color-primary);
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
}
</style>
