<template>
  <div class="online-file-selection-box">
    <el-dialog
      v-model="onlineFileVisible"
      :close-on-click-modal="false"
      align-center
      :show-close="false"
      destroy-on-close
      modal-class="online-file-selection-box-dialog"
      width="850"
    >
      <template #header>
        <div class="head-left">
          <img
            class="dialog-header-del-icon"
            src="@renderer/assets/upload-files/continue-uploading-icon.png"
            alt=""
          />
          <div class="">导入内容</div>
        </div>
        <div class="head-right">
          <el-input class="search-input" clearable placeholder="搜索"></el-input>
          <el-icon class="close-icon" @click="close"><Close /></el-icon>
        </div>
      </template>
      <div class="online-file-box">
        <div class="path-box">
          <div class="history-btns">
            <el-icon class="icon"><Back /></el-icon>
            <el-icon class="icon"><Right /></el-icon>
            <el-divider direction="vertical" />
          </div>
          <div class="path">
            <span
              v-for="(item, index) in pathlist"
              :key="item.id"
              class="path-item"
              :class="{ active: index === pathlist.length - 1 }"
              >{{ item.name }}
              <el-icon v-if="index !== pathlist.length - 1" class="icon"><ArrowRight /></el-icon>
            </span>
          </div>
        </div>
        <div class="file-list">
          <div v-for="item in props.files" :key="item.id" class="file-item">
            <el-checkbox v-model="item.checked" class="check" />
            <div class="item-content">
              <div class="content-left">
                <img :src="item.cover" alt="" />
                <div class="title">{{ item.name }}</div>
              </div>
              <div class="type">{{ item.type.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="is_checked">已选择 {{ checkedFiles.length }} 个文件</div>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="close">取消</el-button>
          <el-button
            class="confirm-btn"
            :disabled="checkedFiles.length === 0"
            type="primary"
            @click="submitImport"
          >
            导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const onlineFileVisible = defineModel({ type: Boolean })
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['submitImport'])
let pathlist = ref([
  {
    name: '知识库',
    id: 'base',
    level: 0
  },
  {
    name: '个人知识库',
    id: 'personal',
    level: 1
  },
  {
    name: '公共知识库',
    id: 'public',
    level: 1
  }
])
// 已选择的文件数量
const checkedFiles = computed(() => {
  return props.files.filter((item) => item.checked)
})
const close = () => {
  onlineFileVisible.value = false
}
onMounted(() => {
  console.log(props.list, 666)
})
// 提交
const submitImport = () => {
  emits('submitImport', checkedFiles.value)
  onlineFileVisible.value = false
}
</script>

<style scoped lang="scss">
.online-file-selection-box {
  :deep(.online-file-selection-box-dialog) {
    .el-dialog {
      padding: 13px 20px 14px;
      .el-dialog__header {
        padding-bottom: 13px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-weight: 500;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;
        .head-left {
          display: flex;
          align-items: center;
          gap: 10px;
          .dialog-header-del-icon {
            width: 20px;
            height: 20px;
          }
        }
        .head-right {
          display: flex;
          align-items: center;
          gap: 20px;
          .close-icon {
            color: #737475;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.2s linear;
            &:hover {
              color: var(--el-color-primary);
            }
          }
          .search-input {
            width: 230px;
            .el-input__wrapper {
              background-color: #f9f9f9 !important;
              border-radius: 6px !important;
              box-shadow: 0 0 0 1px #efefef inset;

              &.is-focus {
                box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
              }
            }
          }
        }
      }

      .el-dialog__body {
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        overflow: hidden;
        height: 368px;
        background: #f9f9f9;
        border-radius: 10px;
        .online-file-box {
          box-sizing: border-box;
          .path-box {
            padding: 0 20px;
            height: 50px;
            display: flex;
            border-bottom: 1px solid #efefef;
            .history-btns {
              flex-shrink: 0;
              height: 50px;
              display: flex;
              align-items: center;
              gap: 18px;
              font-size: 18px;
              color: #ccc;
              line-height: 22px;
              .icon {
                cursor: not-allowed;
              }
            }
            .path {
              flex: 1;
              margin-left: 18px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              .path-item {
                display: inline-flex;
                align-items: center;
                font-size: 14px;
                line-height: 50px;
                color: #909090;
                cursor: pointer;
                .icon {
                  line-height: 50px;
                  margin: 0 2px;
                }
                &.active {
                  color: var(--default-font-color);
                }
              }
            }
          }
          .file-list {
            padding: 10px 20px;
            height: 316px;
            overflow-y: auto;
            .file-item {
              overflow: hidden;
              width: 100%;
              height: 36px;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 16px;
              line-height: 22px;
              color: var(--default-font-color);
              cursor: pointer;
              .item-content {
                flex: 1;
                overflow: hidden;
                display: flex;
                align-items: center;
                .content-left {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  overflow: hidden;
                  img {
                    flex-shrink: 0;
                    width: 18px;
                    height: 18px;
                    border-radius: 2px;
                  }
                  .title {
                    flex: 1;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                  }
                }
                .type {
                  flex-shrink: 0;
                  font-size: 14px;
                  line-height: 24px;
                  color: #737475;
                }
              }
              .check {
                flex-shrink: 0;
                .el-checkbox__inner {
                  width: 18px;
                  height: 18px;
                }
              }
            }
          }
        }
      }
      .el-dialog__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .is_checked {
          font-size: 14px;
          color: #909090;
          line-height: 16px;
        }
        .dialog-footer {
          flex-shrink: 0;
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
}
</style>
