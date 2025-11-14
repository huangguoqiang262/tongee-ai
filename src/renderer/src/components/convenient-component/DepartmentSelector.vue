<template>
  <div class="department-selector">
    <!-- 左侧选择树 -->
    <div class="left-tree">
      <div class="hd-label">可选列：{{ leftTreeCount }}</div>
      <el-tree
        style="width: 100%"
        :data="treeData"
        show-checkbox
        show-line
        :default-checked-keys="defaultCheckedKeys"
        node-key="diction_id"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ class: 'customNodeClass', label: 'name' }"
        @check="handleCheckChange"
        ref="leftTreeRef"
      >
      </el-tree>
    </div>

    <!-- 右侧已选择项显示 -->
    <div class="right-tree">
      <div class="hd-label">已选列：{{ rightTreeCount }}</div>
      <el-tree
        style="width: 100%"
        :data="selectedTreeData"
        node-key="diction_id"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ class: 'customNodeClass customNodeClassCopy', label: 'name' }"
      >
        <template #default="{ data }">
          <span class="el-tree-node__label">{{ data.name }}</span>
          <el-icon class="close-icon" @click="handleRemove(data)">
            <Close />
          </el-icon>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  tree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selected'])

const leftTreeRef = ref()
const treeData = ref(props.tree)
const selectedNodes = ref([])

// 计算左侧树和右侧树的计数
const leftTreeCount = computed(() => {
  return getAllNodesCount(treeData.value)
})

const rightTreeCount = computed(() => {
  return getAllNodesCount(selectedTreeData.value)
})

// 获取树中所有节点的数量
const getAllNodesCount = (nodes) => {
  let count = 0
  const traverse = (nodeList) => {
    nodeList.forEach(node => {
      count++
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return count
}

// 根据选中的节点生成右侧树数据
const selectedTreeData = computed(() => {
  if (selectedNodes.value.length === 0) return []

  // 深拷贝原始树数据
  const deepClone = (nodes) => {
    return nodes.map(node => ({
      ...node,
      children: node.children ? deepClone(node.children) : []
    }))
  }

  const clonedTree = deepClone(treeData.value)

  // 标记选中状态并过滤未选中的节点
  const markAndFilter = (nodes) => {
    const result = []

    nodes.forEach(node => {
      const isSelected = selectedNodes.value.some(selected =>
        selected.diction_id === node.diction_id
      )

      if (isSelected) {
        const newNode = { ...node }
        if (node.children && node.children.length > 0) {
          newNode.children = markAndFilter(node.children)
        }
        result.push(newNode)
      } else if (node.children && node.children.length > 0) {
        // 如果父节点未选中但子节点有选中的，需要保留父节点结构
        const filteredChildren = markAndFilter(node.children)
        if (filteredChildren.length > 0) {
          const newNode = { ...node, children: filteredChildren }
          result.push(newNode)
        }
      }
    })

    return result
  }

  return markAndFilter(clonedTree)
})

// 获取默认选中的节点keys
const defaultCheckedKeys = computed(() => {
  return selectedNodes.value.map(node => node.diction_id)
})

// 处理左侧树选中变化
const handleCheckChange = (checkedNodes, checkedData) => {
  // 获取所有选中的节点（包括半选状态的父节点）
  const checkedKeys = leftTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = leftTreeRef.value.getHalfCheckedKeys()

  // 从原始树数据中找出对应的节点，考虑父子关系
  const findNodesByKeys = (nodes) => {
    const result = []
    const traverse = (nodeList, parentFatherId = 0) => {
      nodeList.forEach(node => {
        // 构建节点的完整路径标识
        const nodeWithPath = {
          ...node,
          pathFatherId: parentFatherId
        }

        // 如果节点被选中（完全选中或半选中），则添加到结果中
        if (checkedKeys.includes(node.diction_id) || halfCheckedKeys.includes(node.diction_id)) {
          result.push(nodeWithPath)
        }

        if (node.children && node.children.length > 0) {
          // 传递当前节点的diction_id作为子节点的father_id
          traverse(node.children, node.diction_id)
        }
      })
    }
    traverse(nodes)
    return result
  }

  selectedNodes.value = findNodesByKeys(treeData.value)

  // 触发更新事件
  emit('update:selected', selectedNodes.value)
}

// 处理右侧树节点移除
const handleRemove = async (data) => {
  // 从选中节点列表中移除该节点及其所有子节点
  const removeNodeAndChildren = (node, parentFatherId = 0) => {
    // 先移除所有子节点
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => removeNodeAndChildren(child, node.diction_id))
    }

    // 再移除当前节点，根据diction_id和pathFatherId精确匹配
    selectedNodes.value = selectedNodes.value.filter(
      selected => !(selected.diction_id === node.diction_id && selected.pathFatherId === parentFatherId)
    )
  }

  removeNodeAndChildren(data, data.pathFatherId || 0)

  // 更新左侧树的选中状态
  await updateLeftTreeSelection()

  // 触发更新事件
  emit('update:selected', selectedNodes.value)
}

// 更新左侧树的选中状态
const updateLeftTreeSelection = async () => {
  if (!leftTreeRef.value) return

  // 等待DOM更新完成
  await nextTick()

  // 获取应该完全选中的节点keys
  const fullyCheckedKeys = selectedNodes.value.map(node => node.diction_id)

  // 获取应该半选的父节点
  const shouldBeHalfChecked = getHalfCheckedNodes(treeData.value, selectedNodes.value)
  const halfCheckedKeys = shouldBeHalfChecked.map(node => node.diction_id)

  // 先清除所有选中状态
  leftTreeRef.value.setCheckedKeys([], false)

  // 设置完全选中状态（不触发check事件避免循环）
  leftTreeRef.value.setCheckedKeys(fullyCheckedKeys, false)

  // 设置半选状态
  if (halfCheckedKeys.length > 0) {
    halfCheckedKeys.forEach(key => {
      const node = leftTreeRef.value.getNode(key)
      if (node) {
        // 设置半选状态，但确保不会触发check事件
        node.indeterminate = true
      }
    })
  }
}

// 获取应该半选的父节点
const getHalfCheckedNodes = (nodes, selectedNodes) => {
  const result = []

  const traverse = (nodeList, parentFatherId = 0) => {
    nodeList.forEach(node => {
      if (node.children && node.children.length > 0) {
        // 检查当前节点的子节点选中状态（考虑father_id）
        const childSelectedCount = countSelectedChildren(node, selectedNodes, node.diction_id)
        const totalChildren = countAllChildren(node)

        // 如果部分子节点被选中，但不是全部，则当前节点应该半选
        if (childSelectedCount > 0 && childSelectedCount < totalChildren) {
          result.push(node)
        }

        traverse(node.children, node.diction_id)
      }
    })
  }

  traverse(nodes)
  return result
}

// 计算节点下被选中的子节点数量（考虑father_id）
const countSelectedChildren = (node, selectedNodes, parentFatherId) => {
  let count = 0

  const traverse = (currentNode, currentFatherId) => {
    // 检查当前节点是否被选中（根据diction_id和father_id）
    const isSelected = selectedNodes.some(selected =>
      selected.diction_id === currentNode.diction_id && selected.pathFatherId === currentFatherId
    )

    if (isSelected) {
      count++
    }

    if (currentNode.children && currentNode.children.length > 0) {
      currentNode.children.forEach(child => traverse(child, currentNode.diction_id))
    }
  }

  traverse(node, parentFatherId)
  return count
}

// 计算节点下所有子节点数量
const countAllChildren = (node) => {
  let count = 0

  const traverse = (currentNode) => {
    count++

    if (currentNode.children && currentNode.children.length > 0) {
      currentNode.children.forEach(child => traverse(child))
    }
  }

  traverse(node)
  return count
}

// 设置选中的节点（外部调用）
const setSelectedNodes = (nodes) => {
  selectedNodes.value = nodes
  updateLeftTreeSelection()
}

// 获取选中的节点（外部调用）
const getSelectedNodes = () => {
  return selectedNodes.value
}

// 监听props.tree的变化
watch(() => props.tree, (newTree) => {
  treeData.value = newTree
  // 重置选中状态
  selectedNodes.value = []
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  setSelectedNodes,
  getSelectedNodes
})
</script>

<style scoped lang="scss">
.department-selector {
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 14px;
  color: #333;

  .left-tree, .right-tree {
    padding: 0 40px 0 34px;
    width: 50%;
    height: 100%;
    border-right: 1px solid #efefef;

    .hd-label {
      padding-left: 6px;
      margin-bottom: 10px;
      font-size: 14px;
      color: #909090;
      line-height: 16px;
    }
  }

  .right-tree {
    border-right: none;
  }

  .el-tree {
    padding-right: 40px;
    background: transparent;
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
        cursor: pointer;
        margin-left: 8px;

        &:hover {
          color: var(--el-color-primary-light-3);
        }
      }
    }

    .el-icon.el-tree-node__expand-icon {
      width: 14px;
      height: 14px;
      background: url('@renderer/assets/repository/unopened-icon.png') no-repeat center center/14px 14px;

      &.expanded {
        transform: rotate(0deg);
        background: url('@renderer/assets/repository/opened-icon.png') no-repeat center center/14px 14px;

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