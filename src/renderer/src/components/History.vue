<template>
  <div class="Recycled-box">
    <div class="square">
      <div class="page-title-box">
        <div class="page-title">历史记录</div>
        <div class="right-head-box">
          <div class="filter-box">
            <img class="filter-icon" src="@renderer/assets/refresh-icon.png" alt="" />
            刷新
          </div>
          <div class="export-box" @click="beforeClearChange">清空记录</div>
        </div>
      </div>
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ 'active-tab': tab.id == activeTab }"
          @click="tabHandle(tab.id)"
        >
          {{ tab.name }}
        </div>
      </div>
      <div class="content-box">
        <div v-if="activeTab == '1'" class="repository-box">
          <div class="list-box">
            <div class="list-item">
              <img class="left-icon" src="@renderer/assets/answers-icon.png" alt="" />
              <div class="center-box">
                <div class="title">医疗器械注册申报需要准备哪些材料？</div>
                <div class="desc">
                  医疗器械注册申报需要准备产品技术需求，、临床评价资料、风险管理资料、产品检验报告等核心材料，具体根据产品分类和注册路径有所不同
                </div>
                <div class="souce-box">
                  <img class="icon" src="@renderer/assets/souce-icon.png" alt="" />
                  来源：《医疗器械注册管理办法》第三章
                </div>
              </div>
              <div class="time-box">
                <div class="time">2025.9.10</div>
                <div class="size">
                  <img
                    class="icon"
                    src="@renderer/assets/edit-icon.png"
                    alt=""
                    @click="beforeRenameChange"
                  />
                  <img
                    class="icon"
                    src="@renderer/assets/del-icon1.png"
                    alt=""
                    @click="beforeDelChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="activeTab == '2'" class="repository-box">
          <div class="list-box">
            <div v-for="item in list" :key="item" class="list-item">
              <img class="left-icon" src="@renderer/assets/webpage-icon.png" alt="" />
              <div class="center-box">
                <div class="title">产品技术要求V2.3.pdf</div>
                <div class="desc desc1">/项目文件/ABC项目/技术文档/产品技术要求</div>
              </div>
              <div class="time-box">
                <div class="time">2天前删除</div>
                <div class="size">
                  <img
                    class="icon"
                    src="@renderer/assets/del-icon1.png"
                    alt=""
                    @click="beforeDelChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 清空所有 -->
    <el-dialog
      v-model="clearHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="">确认清空</div>
      </template>
      <span>您确定要清空所有问答历史记录吗？此操作将永久删除所有项目且不可撤销！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="clearHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="clearHistory = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 删除单条 -->
    <el-dialog
      v-model="delHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/del-icon.png" alt="" />
        <div class="">确认删除</div>
      </template>
      <span>您确定要删除这条历史记录吗？此操作不可撤销！</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="delHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="delHistory = false">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 重命名 -->
    <el-dialog
      v-model="renameHistory"
      draggable
      align-center
      modal-class="clear-recycled-dialog"
      width="390"
    >
      <template #header>
        <img class="dialog-header-del-icon" src="@renderer/assets/rename-icon.png" alt="" />
        <div class="">重命名记录</div>
      </template>
      <el-form ref="renameFormRef" :model="renameForm" :rules="renameRules" class="rename-form">
        <el-form-item prop="renameInput" style="margin-bottom: 0">
          <el-input
            v-model="renameForm.renameInput"
            class="rename-input"
            size="large"
            placeholder="请输入新名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="renameHistory = false">取消</el-button>
          <el-button class="confirm-btn" type="primary" @click="submitRenameForm(renameFormRef)">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
let tabs = ref([
  {
    id: '1',
    name: '问答历史'
  },
  {
    id: '2',
    name: '网页浏览历史'
  }
])
let activeTab = ref('1')
const tabHandle = (id) => {
  activeTab.value = id
}
const list = ref(Array(6))
let clearHistory = ref(false)
let beforeClearChange = () => {
  clearHistory.value = true
}
let delHistory = ref(false)
let beforeDelChange = () => {
  delHistory.value = true
}
let renameHistory = ref(false)
let beforeRenameChange = () => {
  renameHistory.value = true
}
let renameForm = ref({
  renameInput: ''
})
let renameRules = ref({
  renameInput: [{ required: true, message: '请输入新名称', trigger: 'blur' }]
})
let renameFormRef = ref(null)
const submitRenameForm = (FormRef) => {
console.log(FormRef);

  FormRef.validate((valid) => {
    if (valid) {
      console.log('表单验证通过')
    } else {
      console.log('表单验证失败')
    }
  })
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
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .page-title {
        font-size: 22px;
        font-weight: 500;
        color: var(--default-font-color);
        line-height: 30px;
      }

      .right-head-box {
        display: flex;
        align-items: center;
        gap: 10px;

        .filter-box {
          width: 70px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid #efefef;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 12px;
          color: var(--default-font-color);
          cursor: pointer;

          &:active {
            opacity: 0.6;
          }

          &.active {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary-light-8);
          }

          .filter-icon {
            width: 12px;
            height: 12px;
          }
        }

        .export-box {
          width: 76px;
          height: 26px;
          background: var(--el-color-primary);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #fff;
          cursor: pointer;

          &:active {
            opacity: 0.6;
          }
        }
      }
    }

    .tabs {
      margin-bottom: 20px;
      flex-shrink: 0;
      width: 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px 40px;

      .tab-item {
        flex-shrink: 0;
        font-size: 14px;
        color: #555555;
        line-height: 22px;
        cursor: pointer;
        transition: all 0.2s linear;

        &.active-tab {
          color: var(--el-color-primary);
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .content-box {
      flex: 1;
      overflow: hidden;

      .repository-box {
        max-height: 100%;
        width: 100%;
        box-sizing: border-box;
        padding: 0 20px;
        background: #f9f9f9;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .head {
          flex-shrink: 0;
          padding-top: 20px;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .search-box {
            .search-input {
              :deep(.el-input__wrapper) {
                background: #fff;
                border-radius: 20px;
                width: 280px;
                padding-left: 20px;
                font-size: 14px;

                .el-input__inner {
                  color: var(--default-font-color);
                  height: 32px;
                }
              }
            }
          }
        }

        .list-box {
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

          .list-item {
            padding: 20px 0;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;

            &:last-child {
              border-bottom: none;
            }
            &:hover {
              .time-box {
                .size {
                  visibility: visible;
                }
              }
            }
            .left-icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }

            .center-box {
              flex: 1;
              overflow: hidden;
              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .desc {
                margin-top: 4px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &.desc1 {
                  margin-top: 10px;
                }
              }
              .souce-box {
                margin-top: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
                .icon {
                  width: 12px;
                  height: 12px;
                  vertical-align: middle;
                  margin-right: 8px;
                }
              }
              .btns {
                display: flex;
                gap: 10px;

                .btn {
                  box-sizing: border-box;
                  min-width: 76px;
                  padding: 5px 8px;
                  font-size: 12px;
                  text-align: center;
                  color: var(--el-color-primary);
                  line-height: 16px;
                  border-radius: 6px;
                  border: 1px solid var(--el-color-primary-light-8);
                  cursor: pointer;

                  &:active {
                    opacity: 0.6;
                  }

                  &.btn1 {
                    color: var(--default-font-color);
                    border-color: #efefef;
                  }

                  &.btn2 {
                    color: #909090;
                    border-color: #efefef;
                  }
                }
              }
            }

            .time-box {
              flex-shrink: 0;
              font-size: 12px;
              color: #909090;
              line-height: 22px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: flex-end;

              .size {
                margin-bottom: 1px;
                display: flex;
                align-items: center;
                gap: 16px;
                visibility: hidden;
                .icon {
                  flex-shrink: 0;
                  width: 14px;
                  height: 14px;
                  cursor: pointer;
                }
              }
            }
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
        .rename-input {
          .el-input__wrapper {
            background: #f9f9f9;
            box-shadow: none;
            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
            .el-input__inner {
              font-size: 14px;
              color: var(--default-font-color);
            }
          }
        }
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
