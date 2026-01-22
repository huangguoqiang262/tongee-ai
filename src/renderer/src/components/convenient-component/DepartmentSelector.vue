<template>
  <div class="department-selector">
    <!-- 左侧选择树 -->
    <div class="left-tree">
      <div class="tree-head-box">
        <div class="hd-label">
          可选列：{{ selectedCount ? availableCount - selectedCount : availableCount }}
        </div>
        <el-input
          v-model="filterText"
          class="filter-left-input"
          clearable
          size="small"
          placeholder="输入进行筛选"
        />
      </div>
      <el-tree
        ref="leftTreeRef"
        style="width: 100%"
        class="left-tree-content"
        :data="treeData"
        show-checkbox
        node-key="fullKey"
        :default-expand-all="false"
        :expand-on-click-node="false"
        :props="treeProps"
        :filter-node-method="customfilterHandle"
        @check="handleLeftTreeCheck"
      >
      </el-tree>
    </div>

    <!-- 右侧已选择项显示 -->
    <div class="left-tree">
      <div class="tree-head-box">
        <div class="hd-label">已选列：{{ selectedCount }}</div>
        <div></div>
      </div>
      <el-tree
        style="width: 100%"
        class="left-tree-content"
        :data="selectedTreeData"
        node-key="fullKey"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ class: 'customNodeClass customNodeClassCopy', label: 'name' }"
      >
        <template #default="{ data }">
          <span class="el-tree-node__label">{{ data.name }}</span>
          <el-icon class="close-icon" @click="removeItem(data)">
            <Close />
          </el-icon>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
const emit = defineEmits(['editTree'])
const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  }
})
// 筛选文本
let filterText = ref('')

// 左侧树引用
const leftTreeRef = ref()

// 树配置
const treeProps = {
  class: 'customNodeClass',
  label: 'name',
  children: 'children'
}
watch(filterText, (val) => {
  leftTreeRef.value?.filter(val)
})
const customfilterHandle = (value, data) => {
  if (!value) return true
  return data.name.includes(value)
}
// 选中的keys - 只包含子级节点
const checkedKeys = ref([])

// 可用数据
const treeData = ref(props.treeData)
// 初始化数据，确保每个节点都有selected字段和fullKey
const initTreeData = (data) => {
  return data.map((node) => {
    const newNode = {
      ...node,
      selected: node.selected || false,
      fullKey: String(node.diction_id) + String(node.parent_diction_id)
    }

    if (node.children && node.children.length > 0) {
      newNode.children = initTreeData(node.children)
    }

    return newNode
  })
}

// 计算选中的树数据 - 根据selected字段过滤
const selectedTreeData = computed(() => {
  // 从原始数据中过滤出selected为true的节点，保持树形结构
  const filterTree = (nodes) => {
    const result = []

    nodes.forEach((node) => {
      // 如果当前节点被选中，保留整个节点
      if (node.selected) {
        const newNode = { ...node }
        if (node.children && node.children.length > 0) {
          newNode.children = filterTree(node.children)
        }
        result.push(newNode)
      }
      // 如果当前节点有子节点且子节点中有被选中的，保留当前节点但过滤子节点
      else if (node.children && node.children.length > 0) {
        const filteredChildren = filterTree(node.children)
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren
          })
        }
      }
    })

    return result
  }
  emit('editTree', treeData.value)
  return filterTree([...treeData.value])
})

// 计算数量 - 只统计用户节点
const availableCount = computed(() => {
  return countUserNodes(treeData.value)
})

const selectedCount = computed(() => {
  return checkedKeys.value.length
})

// 统计用户节点数量
const countUserNodes = (nodes) => {
  let count = 0
  const countNodes = (nodeList) => {
    nodeList.forEach((node) => {
      // 只统计用户类型
      // if (node.type === 'user') {
      count++
      // }
      if (node.children && node.children.length > 0) {
        countNodes(node.children)
      }
    })
  }
  countNodes(nodes)
  return count
}

// 左侧树选中事件
const handleLeftTreeCheck = (checkedNode, checkInfo) => {
  // 获取所有选中的节点keys - 只包含子级节点
  checkedKeys.value = checkInfo.checkedKeys

  // 更新树的selected状态
  updateSelectedStatus(treeData.value, checkedKeys.value)
}

// 更新树的selected状态
const updateSelectedStatus = (nodes, checkedKeys) => {
  nodes.forEach((node) => {
    const isSelected = checkedKeys.includes(node.fullKey)
    node.selected = isSelected

    if (node.children && node.children.length > 0) {
      updateSelectedStatus(node.children, checkedKeys)
    }
  })
}

// 右侧移除项 - 使用左侧树API
const removeItem = (data) => {
  if (leftTreeRef.value) {
    // 递归取消选中所有子节点
    const uncheckChildren = (node) => {
      leftTreeRef.value.setChecked(node.fullKey, false, false)
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => uncheckChildren(child))
      }
    }

    // 取消选中当前节点及其所有子节点
    uncheckChildren(data)

    // 获取更新后的选中状态
    nextTick(() => {
      const currentCheckedKeys = leftTreeRef.value.getCheckedKeys() || []
      const halfCheckedKeys = leftTreeRef.value.getHalfCheckedKeys() || []

      // 合并全选和半选状态
      const allCheckedKeys = [...currentCheckedKeys, ...halfCheckedKeys]

      // 更新checkedKeys
      checkedKeys.value = allCheckedKeys

      // 更新selected状态
      updateSelectedStatus(treeData.value, allCheckedKeys)
    })
  }
}

// 获取所有选中的节点keys - 只获取子级节点
const getSelectedKeys = (nodes) => {
  const keys = []
  const traverse = (nodeList) => {
    nodeList.forEach((node) => {
      // 如果节点被选中，就加入keys
      if (node.selected) {
        keys.push(node.fullKey)
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return keys
}

watch(
  () => props.treeData,
  (newData) => {
    treeData.value = initTreeData(newData)
    // 初始化checkedKeys - 只包含子级节点
    checkedKeys.value = getSelectedKeys(treeData.value)
    // 初始化左侧树的选中状态
    nextTick(() => {
      if (leftTreeRef.value) {
        leftTreeRef.value.setCheckedKeys(checkedKeys.value)
      }
    })
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.department-selector {
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 14px;
  color: #333;

  .left-tree {
    padding: 0 40px 0 34px;
    width: 50%;
    height: 100%;
    border-right: 1px solid #efefef;
    .tree-head-box {
      box-sizing: border-box;
      padding-left: 6px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0 30px;
      height: 28px;
      .hd-label {
        font-size: 14px;
        color: #909090;
        line-height: 18px;
        margin-bottom: 0;
      }
      :deep(.filter-left-input) {
        flex: 1;
        height: 28px;
        font-size: 12px;
        .el-input__wrapper {
          border-radius: 6px !important;
          padding: 1px 10px;
        }
      }
    }
  }
  .left-tree-content {
    height: calc(100% - 16px) !important;
  }
  .el-tree {
    padding-right: 40px;
    background: transparent;
    height: calc(100% - 2px);
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

  :deep(.customNodeClass) {
    background: transparent;

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
      }
    }

    &.customNodeClassCopy {
      .el-tree-node__label {
        color: var(--el-color-primary);
      }

      .close-icon {
        color: var(--el-color-primary);
      }
    }

    .el-icon.el-tree-node__expand-icon {
      width: 14px;
      height: 14px;
      background: url('@renderer/assets/repository/unopened-icon.png') no-repeat center center/14px
        14px;

      &.expanded {
        transform: rotate(0deg);
        background: url('@renderer/assets/repository/opened-icon.png') no-repeat center center/14px
          14px;

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
</style>
