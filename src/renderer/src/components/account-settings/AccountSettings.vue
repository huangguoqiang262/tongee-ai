<template>
  <div class="Recycled-box">
    <div class="square">
      <div class="page-title-box">
        <div class="page-title">账号设置</div>
      </div>
      <div class="content-box">
        <div class="account-box">
          <div class="account-left">
            <img class="buddha" src="@renderer/assets/default-avatar.png" alt="" />
            <div class="name">糖源AI</div>
          </div>
          <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
        </div>
        <div class="general-title">通用设置</div>
        <div class="handle-box">
          <div class="handle-item">
            <div class="label">外观选择配置</div>
            <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in appearanceList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select>
          </div>
          <div class="handle-item">
            <div class="label">ai划词工具栏</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item">
            <div class="label">首选大模型</div>
            <el-select v-model="memberPrivileges" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in appearanceList"
                :key="item.action"
                :label="item.name"
                :value="item.action"
              />
            </el-select>
          </div>
          <div class="handle-item">
            <div class="label">知识库使用手册</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
          <div class="handle-item">
            <div class="label">帮助与反馈</div>
            <img class="icon" src="@renderer/assets/repository/down-icon.png" alt="" />
          </div>
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
          <el-button class="confirm-btn" type="primary" @click="clearRecycled = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 外观选择
let appearanceList = ref([
  {
    name: '跟随系统',
    action: 'public'
  }
])
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
const tabHandle = (id) => {
  activeTab.value = id
}
let dateValue = ref([])
const list = ref(Array(6))
let clearRecycled = ref(false)
let beforeClearChange = () => {
  clearRecycled.value = true
}
onMounted(() => {})
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
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 22px;
        font-weight: 500;
        color: var(--default-font-color);
        line-height: 30px;
      }
    }

    :deep(.content-box) {
      flex: 1;
      overflow: hidden;
      .account-box {
        // width: 808px;
        height: 100px;
        background: #f9f9f9;
        border-radius: 8px;
        padding: 0 23px 0 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .account-left {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          .buddha {
            width: 60px;
            height: 60px;
            border-radius: 8px;
          }
          .name {
            font-family: PingFangSC, PingFang SC;
            font-weight: 500;
            font-size: 18px;
            color: #221815;
            line-height: 24px;
          }
        }
        .icon {
          width: 15px;
          height: 16px;
          transform: rotate(-90deg);
        }
      }
      .general-title {
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 16px;
        color: #909090;
        line-height: 22px;
        margin-top: 40px;
        margin-bottom: 24px;
      }
      .handle-box {
        padding: 0 19px;
        background: #f9f9f9;
        border-radius: 8px;
        overflow: hidden;
        .el-select__wrapper {
          background-color: #eaeaea !important;
          border-radius: 4px !important;
          box-shadow: 0 0 0 1px #f9f9f9 inset;
          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
          }
        }
        .handle-item {
          padding: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #efefef;
          &:last-of-type {
            border-bottom: none;
          }
          .label {
            flex-shrink: 0;
            font-weight: 500;
            font-size: 16px;
            color: var(--default-font-color);
            line-height: 22px;
          }
          .icon {
            width: 16px;
            height: 16px;
            transform: rotate(-90deg);
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
