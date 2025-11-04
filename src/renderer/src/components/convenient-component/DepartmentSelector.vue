<template>
  <div class="department-selector">
    <!-- 左侧选择树 -->
    <div class="left-tree">
      <div class="hd-label">可选列：99</div>
      <el-tree
        style="width: 100%"
        :data="selectedItems"
        show-checkbox
        node-key="value"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ class: 'customNodeClass', label: 'name' }"
        @check="handleCheckChange"
      >
      </el-tree>
    </div>

    <!-- 右侧已选择项显示 -->
    <div class="left-tree">
      <div class="hd-label">已选列：99</div>
      <el-tree
        style="width: 100%"
        :data="selectedItems"
        node-key="value"
        default-expand-all
        :expand-on-click-node="false"
        :props="{ class: 'customNodeClass customNodeClassCopy', label: 'name' }"
      >
        <template #default="{ data }">
          <span class="el-tree-node__label">{{ data.name }}</span>
          <el-icon class="close-icon">
            <Close />
          </el-icon>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
const handleCheckChange = (checkedNodes, checkedData) => {
  console.log(checkedNodes, checkedData)
}
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

    .hd-label {
      padding-left: 6px;
      margin-bottom: 10px;
      font-size: 14px;
      color: #909090;
      line-height: 16px;
    }
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
        /* 将checkbox放到最后 */
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
