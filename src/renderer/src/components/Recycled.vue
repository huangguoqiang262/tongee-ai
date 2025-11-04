<template>
  <div class="Recycled-box">
    <div class="square">
      <div class="page-title-box">
        <div class="page-title">回收站</div>
        <div class="right-head-box">
          <div class="filter-box" :class="{ active: dateValue && dateValue.length > 0 }">
            <img class="filter-icon" src="@renderer/assets/refresh-icon.png" alt="" />
            刷新
          </div>
          <div class="export-box" @click="beforeClearChange">清空回收站</div>
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
            <el-popover
              popper-class="Recycled-handle-popover"
              placement="bottom"
              trigger="hover"
              :width="146"
              :offset="-58"
              :show-arrow="false"
            >
              <template #reference>
                <div class="list-item">
                  <img class="left-icon" src="@renderer/assets/feedback-icon.png" alt="" />
                  <div class="center-box">
                    <div class="title">产品注册申报指南</div>
                    <div class="desc">张工(研发部)</div>
                  </div>
                  <div class="time-box">
                    <div class="time">2天前删除</div>
                    <div class="size">2.4MB</div>
                  </div>
                </div>
              </template>
              <div class="handle-box">
                <div class="handle-item">
                  <img class="icon" src="@renderer/assets/restore-icon.png" alt="" />
                  一键还原
                </div>
                <div class="handle-item">
                  <img class="icon" src="@renderer/assets/del-icon.png" alt="" />
                  永久删除
                </div>
              </div>
            </el-popover>
          </div>
        </div>
        <div v-if="activeTab == '2'" class="repository-box">
          <div class="list-box">
            <div v-for="item in list" :key="item" class="list-item">
              <img class="left-icon" src="@renderer/assets/file-icon1.png" alt="" />
              <div class="center-box">
                <div class="title">产品技术要求V2.3.pdf</div>
                <div class="desc desc1">/项目文件/ABC项目/技术文档/产品技术要求</div>
                <div class="author">张研究员（临床注册部）</div>
              </div>
              <div class="time-box">
                <div class="time">2天前删除</div>
                <div class="size">2.4MB</div>
              </div>
            </div>
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

            .left-icon {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }

            .center-box {
              flex: 1;

              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
              }

              .desc {
                margin-top: 10px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;

                &.desc1 {
                  margin-top: 4px;
                }
              }

              .author {
                margin-top: 8px;
                font-size: 12px;
                color: #909090;
                line-height: 16px;
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
