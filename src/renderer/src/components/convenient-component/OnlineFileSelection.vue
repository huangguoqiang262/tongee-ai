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
          <el-input
            v-model="searchText"
            class="search-input"
            clearable
            placeholder="搜索"
            @change="refreshList"
          ></el-input>
          <el-icon class="close-icon" @click="close"><Close /></el-icon>
        </div>
      </template>
      <div class="online-file-box">
        <div class="path-box">
          <div class="history-btns">
            <el-icon
              class="icon"
              :style="{
                cursor: pathList.length > 1 ? 'pointer' : 'not-allowed',
                color: pathList.length > 1 ? 'var(--default-font-color)' : '#ccc'
              }"
              @click="backPath"
              ><Back
            /></el-icon>
            <el-icon class="icon"><Right /></el-icon>
            <el-divider direction="vertical" />
          </div>
          <div class="path">
            <div
              v-for="(item, index) in pathList"
              :key="item.id"
              class="path-item"
              :class="{ active: index === pathList.length - 1 }"
              @click="pathChange(index)"
            >
              <el-icon class="icon" :style="{ opacity: index == 0 ? 0 : 1 }"
                ><ArrowRight
              /></el-icon>
              {{ item.title }}
            </div>
          </div>
        </div>
        <div class="file-list">
          <el-skeleton :loading="loading" animated :throttle="{ leading: 500, initVal: true }">
            <template #template>
              <el-skeleton-item v-for="i in 6" :key="i" variant="text" style="margin: 10px 0" />
            </template>
            <template #default>
              <template v-if="list.length">
                <div
                  v-for="(item, index) in list"
                  :key="index + '-' + item.id"
                  class="file-item"
                  :class="{ active: checkedFiles.length && item.id == checkedFiles[0].id }"
                  @click="handleCheckChange(item, !item.checked)"
                >
                  <el-checkbox
                    v-if="item.item_type == 1"
                    v-model="item.checked"
                    class="check"
                    @click.stop="() => {}"
                  />
                  <div class="item-content">
                    <div class="content-left">
                      <img
                        v-if="item.item_type == 1"
                        :src="item.file_icon"
                        alt=""
                        @error="(e) => (e.target.src = defaultImg)"
                      />
                      <catalogueSvgIcon v-else-if="item.item_type == 2" class="cover-img" />
                      <img
                        v-if="item.item_type == 3"
                        :src="item.file_icon"
                        alt=""
                        @error="(e) => (e.target.src = defaultImg)"
                      />
                      <img
                        v-else-if="item.next_type == 2 && !item.is_public"
                        :src="personageRepositoryIcon"
                        alt=""
                      />
                      <img
                        v-else-if="item.next_type == 2 && item.is_public"
                        :src="commonRepositoryIcon"
                        alt=""
                      />
                      <template v-else-if="item.next_type == 3">
                        <img v-if="item.picurl" :src="item.picurl" alt="" />
                        <defaultCoverSvg v-else class="cover-img" />
                      </template>
                      <div class="title">
                        {{ item.title }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="empty">暂无数据</div>
            </template>
          </el-skeleton>
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import commonRepositoryIcon from '@renderer/assets/repository/common-repository-icon.png'
import personageRepositoryIcon from '@renderer/assets/repository/personage-repository-icon.png'
import defaultCoverSvg from '@renderer/assets/repository/default-cover.svg'
import catalogueSvgIcon from '@renderer/assets/upload-files/catalogue-icon.svg'
import defaultImg from '@renderer/assets/repository/default-img.png'
import { get_file_list } from '@renderer/api/index'
const onlineFileVisible = defineModel({ type: Boolean })
const list = ref([])
const emits = defineEmits(['submitImport'])
let pathList = ref([
  {
    title: '知识库',
    id: 0,
    level: 0,
    next_type: 1
  }
])
let activePath = computed(() => {
  return pathList.value[pathList.value.length - 1]
})
let loading = ref(true)
let searchText = ref('')
// 已选择的文件数量
const checkedFiles = computed(() => {
  return list.value.filter((item) => item.checked)
})
const close = () => {
  onlineFileVisible.value = false
}
const pathChange = (i) => {
  pathList.value = removeItemsAfterIndex(pathList.value, i)
  nextTick(() => {
    searchText.value = ''
    refreshList()
  })
}
const removeItemsAfterIndex = (array, index) => {
  if (index > -1 && index < array.length) {
    array.splice(index + 1, array.length - index - 1)
  }
  return array
}
const handleCheckChange = (item, e) => {
  if (item.next_type == 1 || item.next_type == 2) {
    pathList.value.push({
      ...item
    })
    searchText.value = ''
    refreshList()
    return
  } else if (item.next_type == 3) {
    pathList.value.push({
      ...item,
      know_id: item.id
    })
    searchText.value = ''
    refreshList()
    return
  } else if (item.item_type == 2) {
    pathList.value.push({
      ...item,
      know_id: activePath.value.know_id
    })
    searchText.value = ''
    refreshList()
    return
  }
  item.checked = e
}
const refreshList = () => {
  loading.value = true
  list.value = []
  var data = {
    keyword: searchText.value
  }
  if (activePath.value.next_type == 1) {
    data.type = 1
  } else if (activePath.value.next_type == 2) {
    data.type = 2
    data.is_public = activePath.value.is_public
  } else if (activePath.value.next_type == 3) {
    data.know_id = activePath.value.know_id
  } else {
    data.know_id = activePath.value.know_id
    data.parent_item_id = activePath.value.id
  }
  get_file_list(data)
    .then((res) => {
      if (res.code == 200) {
        list.value = res.data || []
        loading.value = false
      }
    })
    .finally(() => {
      loading.value = false
    })
}
// 点击返回
const backPath = () => {
  if (activePath.value.level == 0) {
    return
  }
  pathList.value.pop()
  searchText.value = ''
  refreshList()
}
watch(
  () => onlineFileVisible.value,
  (newVal) => {
    if (newVal) {
      refreshList()
    } else {
      pathList.value = [
        {
          title: '知识库',
          id: 0,
          level: 0,
          next_type: 1
        }
      ]
      list.value = []
      searchText.value = ''
    }
  },
  {
    immediate: true
  }
)
onMounted(() => {})
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
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 22px;
        .head-left {
          display: flex;
          align-items: center;
          gap: 10px;
          .dialog-header-del-icon {
            width: 16px;
            height: 16px;
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
            padding: 10px 10px;
            height: 316px;
            overflow-y: auto;
            .empty {
              text-align: center;
              font-size: 13px;
              line-height: 220px;
              color: #909090;
            }
            .file-item {
              box-sizing: border-box;
              padding: 0 10px;
              overflow: hidden;
              width: 100%;
              height: 36px;
              display: flex;
              align-items: center;
              gap: 10px;
              font-size: 16px;
              line-height: 22px;
              color: var(--default-font-color);
              border-radius: 6px;
              cursor: pointer;
              &:hover {
                background: #f3f3f3;
              }
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
                  .cover-img {
                    flex-shrink: 0;
                    width: 18px;
                    height: 18px;
                    border-radius: 2px;
                    color: var(--el-color-primary);
                  }
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
          line-height: 18px;
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
