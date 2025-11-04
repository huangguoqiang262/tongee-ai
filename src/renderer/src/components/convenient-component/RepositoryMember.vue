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
          </div>
        </div>
        <div class="content-box">
          <div v-if="activeTab === '1'" class="member-list-box">
            <div class="member-header">
              <div class="member-header-item">成员</div>
              <div class="member-header-item member-header-item-role">项目角色</div>
            </div>
            <div v-for="item in memberList" :key="item.id" class="member-item">
              <div class="item-left">
                <img :src="item.avatar || DefaultAvatar" alt="" class="member-avatar" />
                <div class="member-name">{{ item.name }}</div>
              </div>
              <div class="item-right">
                <el-select v-model="item.role" placeholder="请选择角色">
                  <el-option label="普通成员" value="member" />
                  <el-option label="管理员" value="admin" />
                </el-select>
              </div>
            </div>
          </div>
          <div v-if="activeTab === '2'" class="member-list-box">
            <div class="member-header">
              <div class="member-header-item">成员</div>
              <div class="member-header-item member-header-item-role">操作</div>
            </div>
            <div v-for="item in memberList" :key="item.id" class="member-item">
              <div class="item-left">
                <img :src="item.avatar || DefaultAvatar" alt="" class="member-avatar" />
                <div class="member-name">{{ item.name }}</div>
              </div>
              <div class="item-right">
                <el-button class="confirm-btn" size="small" type="primary">确认添加</el-button>
              </div>
            </div>
          </div>
          <div v-if="activeTab === '3'" class="add-member-box">
            <div class="hd-label">可选列：99</div>
            <el-tree
              ref="organizationRef"
              style="width: 100%"
              :data="selectedItems"
              show-checkbox
              node-key="value"
              :default-checked-keys="['5', '6', '10']"
              default-expand-all
              :expand-on-click-node="false"
              :props="{ class: 'customNodeClass', label: 'name' }"
              @check="handleCheckChange"
            >
            </el-tree>
            <div class="foot-box">
              <el-button class="confirm-btn" type="primary">确认</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DefaultAvatar from '@renderer/assets/default-avatar.png'
const repositoryVisible = defineModel({ type: Boolean })
let organizationRef = ref(null)
let checkedNodes = ref([])
// const props = defineProps({
//   type: {
//     type: String,
//     default: 'private'
//   }
// })
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
let memberList = ref([
  {
    name: '张三',
    id: '1'
  },
  {
    name: '李四',
    id: '2'
  },
  {
    name: '王五',
    id: '3'
  },
  {
    name: '赵六',
    id: '4'
  },
  {
    name: '钱七',
    id: '5'
  },
  {
    name: '孙八',
    id: '6'
  },
  {
    name: '周九',
    id: '7'
  }
])
const selectedItems = ref([
  {
    name: '所有部门',
    value: '1',
    pid: '0',
    children: [
      {
        name: '人力资源',
        value: '2',
        pid: '1',
        children: [
          {
            name: '李白',
            value: '4',
            pid: '2',
          },
          {
            name: '王大陆',
            value: '7',
            pid: '2',
          },
          {
            name: '王小文',
            value: '8',
            pid: '2',
          }
        ]
      },
      {
        name: '研发部',
        value: '3',
        pid: '1',
        children: [
          {
            name: '胡杨',
            value: '5',
            pid: '3',
          },
          {
            name: '李晓',
            value: '6',
            pid: '3',
          },
          {
            name: '李阳',
            value: '9',
            pid: '3',
          }
        ]
      },
      {
        name: '销售部',
        value: '4',
        pid: '1',
        children: [
          {
            name: '王芳',
            value: '10',
            pid: '4'
          },
          {
            name: '王岩',
            value: '11',
            pid: '4'
          }
        ]
      }
    ]
  }
])
// 递归标记节点选中状态
const markSelectedNodes = (treeData, checkedNodes) => {
  return treeData.map((node) => {
    const isSelected = checkedNodes.some((checkedNode) => checkedNode.value === node.value)
    const newNode = {
      ...node,
      selected: isSelected
    }

    if (node.children && node.children.length > 0) {
      newNode.children = markSelectedNodes(node.children, checkedNodes)
    }

    return newNode
  })
}
const getCompleteSelectedTree = () => {
  const checkedNodes = organizationRef.value.getCheckedNodes(false, false)
  // 标记选中状态
  const markedTree = markSelectedNodes(selectedItems.value, checkedNodes)
  return markedTree
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
        padding-bottom: 28px;
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
        overflow: hidden;

        .form-box {
          box-sizing: border-box;
          .tab-list-box {
            overflow: hidden;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 9px;
            .tab-item {
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
              .hd-label {
                position: sticky;
                left: 0;
                top: 0;
                z-index: 1;
                background: #f9f9f9;
                padding-top: 5px;
                padding-left: 6px;
                margin-bottom: 10px;
                font-size: 14px;
                color: #909090;
                line-height: 16px;
              }
              .el-tree {
                padding-right: 40px;
                background: transparent;
                height: calc(100% - 95px);
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
