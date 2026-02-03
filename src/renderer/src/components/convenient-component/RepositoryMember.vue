<template>
  <div class="repository-member-box">
    <el-dialog
      v-model="repositoryVisible"
      draggable
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      modal-class="repository-member-box-dialog"
      width="390"
    >
      <template #header>
        <img
          class="dialog-header-del-icon"
          src="@renderer/assets/repository/cysz-icon.png"
          alt=""
        />
        <div class="">成员设置</div>
      </template>
      <div class="form-box">
        <div class="tab-list-box">
          <div
            v-for="item in tabList"
            :key="item.id"
            class="tab-item"
            :class="{ active: activeTab === item.id }"
            @click="tabChange(item.id)"
          >
            {{ item.name }}
            <div v-if="item.id === '2' && props.unreadApplyNumber > 0" class="unreadApplyNumber">
              {{ props.unreadApplyNumber > 99 ? 99 : props.unreadApplyNumber }}
            </div>
          </div>
        </div>
        <div class="content-box">
          <div v-if="activeTab === '1'" class="member-list-box">
            <div class="member-header">
              <div class="member-header-item">成员</div>
              <div class="member-header-item member-header-item-role">项目角色</div>
            </div>
            <template v-if="props.memberList.length">
              <div v-for="item in props.memberList" :key="item.id" class="member-item">
                <div class="item-left">
                  <img :src="item.user_avatar || DefaultAvatar" alt="" class="member-avatar" />
                  <div class="member-name">{{ item.user_name }}</div>
                </div>
                <div class="item-right">
                  <template v-if="item.is_creator == 1">
                    <div class="creator">创建者</div>
                  </template>
                  <el-select
                    v-else
                    v-model="item.is_manager"
                    :disabled="item.ding_uid == userInfo.ding_uid"
                    placeholder="请选择角色"
                    @change="handlePermissionsChange(item)"
                  >
                    <el-option label="普通成员" :value="0" />
                    <el-option label="管理员" :value="1" />
                    <el-option label="移出" :value="2" />
                  </el-select>
                </div>
              </div>
            </template>
            <div v-else class="no-member">暂无成员</div>
          </div>
          <div v-if="activeTab === '2'" class="member-list-box">
            <div class="member-header">
              <div class="member-header-item">成员</div>
              <div class="member-header-item member-header-item-role">操作</div>
            </div>
            <template v-if="props.applyList.length">
              <div v-for="item in props.applyList" :key="item.id" class="member-item">
                <div class="item-left">
                  <img :src="item.avatar || DefaultAvatar" alt="" class="member-avatar" />
                  <div class="member-name">{{ item.name }}</div>
                </div>
                <div class="item-right">
                  <el-button
                    class="confirm-btn"
                    size="small"
                    type="primary"
                    @click="handleAdd(item)"
                    >确认添加</el-button
                  >
                </div>
              </div>
            </template>
            <div v-else class="no-member">暂无申请</div>
          </div>
          <div v-if="activeTab === '3'" class="add-member-box">
            <template v-if="props.treeData.length">
              <div class="tree-head-box">
                <el-input
                  v-model="filterText"
                  class="filter-left-input"
                  size="small"
                  clearable
                  placeholder="输入进行筛选"
                />
                <div class="hd-label">可选列：{{ choosableCount(props.treeData) }}</div>
              </div>
              <el-tree
                ref="organizationRef"
                style="width: 100%"
                :data="props.treeData"
                show-checkbox
                node-key="ding_id"
                :default-expand-all="false"
                :expand-on-click-node="false"
                :props="{ class: 'customNodeClass', label: 'name' }"
                :filter-node-method="customfilterHandle"
                @check="handleCheckChange"
              >
              </el-tree>
              <div class="foot-box">
                <el-button
                  :disabled="!checkedNodes.length"
                  class="confirm-btn"
                  type="primary"
                  @click="handleConfirm"
                  >确认</el-button
                >
              </div>
            </template>
            <div v-else class="empty">暂无可选成员</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserInfo } from '@renderer/hooks/checkLogin'
import DefaultAvatar from '@renderer/assets/default-avatar.png'
const repositoryVisible = defineModel({ type: Boolean })
const emits = defineEmits(['setPermission'])
const userInfo = useUserInfo()
let organizationRef = ref(null)
let checkedNodes = ref([])
const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  memberList: {
    type: Array,
    default: () => []
  },
  applyList: {
    type: Array,
    default: () => []
  },
  unreadApplyNumber: {
    type: Number,
    default: 0
  }
})
let tabList = ref([
  {
    name: '成员',
    id: '1'
  },
  {
    name: '申请',
    id: '2'
  },
  {
    name: '添加成员',
    id: '3'
  }
])
let activeTab = ref('1')
const tabChange = (id) => {
  activeTab.value = id
}
// 统计用户节点数量
const choosableCount = (nodes) => {
  let count = 0
  const countNodes = (nodeList) => {
    nodeList.forEach((node) => {
      // 只统计用户类型
      if (node.is_person) {
        count++
      }
      if (node.children && node.children.length > 0) {
        countNodes(node.children)
      }
    })
  }
  countNodes(nodes)
  return count
}
// 递归标记节点选中状态
const markSelectedNodes = (checkedNodes) => {
  let ding_ids = []
  checkedNodes.some((checkedNode) => {
    if (checkedNode.is_person) {
      ding_ids.push(checkedNode.ding_id)
    }
  })
  return ding_ids
}
const handleConfirm = () => {
  emits('setPermission', {
    type: 'join',
    data: {
      ding_ids: checkedNodes.value.join(',')
    }
  })
}
// 处理添加成员
const handleAdd = (item) => {
  emits('setPermission', {
    type: 'allowable',
    data: {
      join_id: item.id
    }
  })
}
// 处理权限变更
const handlePermissionsChange = (item) => {
  var option = {
    type: 'member',
    data: {
      ding_uid: item.ding_uid,
      is_manager: item.is_manager,
      is_remove: item.is_manager == 2 ? 1 : 0
    }
  }
  emits('setPermission', option)
}
// 筛选文本
let filterText = ref('')
watch(filterText, (val) => {
  organizationRef.value?.filter(val)
})
const customfilterHandle = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}
const getCompleteSelectedTree = () => {
  const tempCheckedNodes = organizationRef.value.getCheckedNodes(false, false)
  // 标记选中状态
  // const uids = markSelectedNodes(props.treeData, tempCheckedNodes)
  const uids = markSelectedNodes(tempCheckedNodes)
  return uids
}
const handleCheckChange = () => {
  checkedNodes.value = getCompleteSelectedTree()
}
</script>

<style scoped lang="scss">
.repository-member-box {
  :deep(.repository-member-box-dialog) {
    .el-dialog {
      height: 492px;
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
          .tab-list-box {
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 9px;
            .tab-item {
              position: relative;
              width: 110px;
              height: 32px;
              line-height: 30px;
              text-align: center;
              font-size: 14px;
              color: var(--default-font-color);
              background: #f9f9f9;
              border-radius: 6px;
              border: 1px solid #f9f9f9;
              cursor: pointer;
              transition: all 0.2s linear;
              &.active {
                background: var(--el-color-primary-light-9);
                border-color: var(--el-color-primary);
                color: var(--el-color-primary);
                &:hover {
                  opacity: 0.8;
                }
              }
              .unreadApplyNumber {
                position: absolute;
                top: -2px;
                right: 15px;
                width: 16px;
                height: 16px;
                background: #ff5151;
                border-radius: 50%;
                font-size: 10px;
                color: #fff;
                text-align: center;
                line-height: 16px;
              }
            }
          }
          .content-box {
            width: 100%;
            height: 354px;
            background: #f9f9f9;
            border-radius: 8px;
            padding: 9px 0px 0;
            .member-list-box {
              padding: 0 19px;
              height: 100%;
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
              .member-header {
                position: sticky;
                left: 0;
                top: 0;
                z-index: 1;
                background: #f9f9f9;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                font-size: 14px;
                color: #909090;
                line-height: 30px;
                .member-header-item {
                  flex-shrink: 0;
                  width: 76px;
                  text-align: center;
                  &.member-header-item-role {
                    width: 124px;
                  }
                }
              }
              .no-member {
                height: 260px;
                line-height: 260px;
                text-align: center;
                font-size: 13px;
                color: #909090;
              }
              .member-item {
                display: flex;
                align-items: center;
                gap: 10px;
                height: 51px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 20px;
                border-bottom: 1px solid #efefef;
                .item-left {
                  flex: 1;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  .member-avatar {
                    display: block;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                  }
                  .member-name {
                    flex-shrink: 0;
                  }
                }
                .item-right {
                  flex-shrink: 0;
                  width: 124px;
                  .creator {
                    width: 100%;
                    padding: 0 12px;
                  }
                  .el-select__wrapper {
                    background-color: #eaeaea !important;
                    border-radius: 4px !important;
                    box-shadow: 0 0 0 1px #f9f9f9 inset;
                    &.is-focus {
                      box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
                    }
                  }
                  .confirm-btn {
                    display: block;
                    width: 82px;
                    height: 26px;
                    margin: 0 10px 0 auto;
                  }
                }
              }
            }
            .add-member-box {
              padding: 0 19px;
              width: 100%;
              height: 100%;
              .tree-head-box {
                box-sizing: border-box;
                position: sticky;
                left: 0;
                top: 0;
                z-index: 1;
                padding-top: 5px;
                padding-left: 6px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0 20px;
                background: #f9f9f9;
                .hd-label {
                  font-size: 14px;
                  color: #909090;
                  line-height: 18px;
                }
                .filter-left-input {
                  flex: 1;
                  height: 28px;
                  font-size: 12px;
                  .el-input__wrapper {
                    border-radius: 6px !important;
                    padding: 1px 10px;
                  }
                }
              }
              .el-tree {
                padding-right: 40px;
                background: transparent;
                height: calc(100% - 110px);
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
              }
              .empty {
                height: 260px;
                line-height: 260px;
                text-align: center;
                font-size: 13px;
                color: #909090;
              }
              .foot-box {
                height: 63px;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
                border-top: 1px solid #efefef;
                .confirm-btn {
                  width: 80px;
                  height: 36px;
                  border-radius: 8px;
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
            }
          }
        }
      }
    }
  }
}
</style>
