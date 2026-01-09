<template>
  <div class="manual-box disabled-tools-chat">
    <div v-if="!catalogueShow" class="catalogue" @click="catalogueClick(true)">目录</div>
    <div v-if="catalogueShow" class="left-box">
      <div class="common-box">
        <div class="common-box-left">目录</div>
        <div class="square-icon-box" @click="catalogueClick(false)">
          <img class="square-icon" src="@renderer/assets/close-chat-icon.png" alt="" />
        </div>
      </div>
      <div v-infinite-scroll="loadData" class="notebook-list">
        <el-skeleton animated :loading="loading">
          <template #template>
            <el-skeleton-item v-for="i in 10" :key="i" variant="text" style="margin: 10px 0" />
          </template>
          <template #default>
            <template v-if="list.length">
              <div
                v-for="value in list"
                :key="value.id"
                :class="{ 'active-note': itemId == value.item_id }"
                class="item"
                @click="itemChange(value)"
              >
                <div class="vertical-marker"></div>
                <div class="title">{{ value.title }}</div>
              </div>
            </template>
            <div v-else class="empty">
              <div class="empty-text">暂无数据</div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
    <div class="center-box" :class="{ 'mr-chat': chatVisible }">
      <div class="center-head">
        <div class="title"></div>
        <div class="right-handle-box">
          <div v-if="!chatVisible" class="open-chat" @click="openChat">
            <img class="logo" src="@renderer/assets/logo.png" alt="" />
            问问糖源
          </div>
        </div>
      </div>
      <div v-loading="!html && loading" class="center-content">
        <v-md-preview v-if="html" :text="html"></v-md-preview>
        <div v-else class="empty-content">
          <el-empty :image-size="120" description="暂无内容" />
        </div>
      </div>
    </div>
    <div v-if="chatVisible" class="right-box">
      <EnchiridionChat :know-id="knowId" :item-id="itemId" @close-chat="chatVisible = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { useUserStore } from '@renderer/stores/user'
import { get_knowledge_manual } from '@renderer/api/feedback'
// import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
let chatVisible = ref(false)
let catalogueShow = ref(true)
const catalogueClick = (show) => {
  catalogueShow.value = show
}
let itemId = ref('')
let knowId = ref('')
let html = ref('')
const itemChange = (value) => {
  itemId.value = value.item_id
  html.value = replaceImgStyle(value.content || '')
}
// const userStore = useUserStore()
// const userInfo = useUserInfo()
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
let loading = ref(true)
let list = ref([])
// 打开对话
const openChat = () => {
  if (!knowId.value) {
    // eslint-disable-next-line no-undef
    ElMessage.warning('暂无手册可以对话')
    return
  }
  chatVisible.value = true
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
}
const replaceImgStyle = (html) => {
  const newStyle = 'vertical-align: middle;max-width:100%;height:auto !important;'
  const imgRegex = /<img[^>]*>/gi
  return html.replace(imgRegex, (match) => {
    const styleRegex = /style="([^"]*)"/i
    const styleMatch = match.match(styleRegex)
    if (styleMatch) {
      // 已有style，替换或添加新样式
      const oldStyle = styleMatch[1].toLowerCase()
      const newAttr = `style="${newStyle}${oldStyle}"`
      return match.replace(styleRegex, newAttr)
    } else {
      // 无style，直接添加新样式
      return match.replace('<img', `<img style="${newStyle}"`)
    }
  })
}

const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  loading.value = load
  get_knowledge_manual(data)
    .then((res) => {
      knowId.value = res.data.know_info?.know_id || ''
      list.value = list.value.concat(res.data.list.data || [])
      pagination.value.total = res.data.list.total
      pagination.value.page = res.data.list.current_page
      pagination.value.page_size = res.data.list.per_page
      if (!itemId.value && list.value.length) {
        itemId.value = list.value[0].item_id
        html.value = replaceImgStyle(list.value[0].content || '')
      }
    })
    .finally(() => {
      loading.value = false
    })
}
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.manual-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  position: relative;
  background: var(--primary-bg-color);
  overflow: hidden;
  .catalogue {
    width: 32px;
    height: 64px;
    background: #efefef;
    border-radius: 0px 12px 12px 0px;
    display: flex;
    justify-content: center;
    writing-mode: tb;
    align-items: center;
    position: absolute;
    top: 60px;
    left: 0;
    cursor: pointer;
  }

  .left-box {
    box-sizing: border-box;
    padding: 20px;
    width: 292px;
    height: 100%;
    border-right: 1px solid #efefef;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    .common-box {
      flex-shrink: 0;
      margin-bottom: 20px;
      box-sizing: border-box;
      // padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;

      .common-box-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;

        .icon {
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      }

      .square-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        // border-radius: 4px;
        .square-icon {
          display: block;
          width: 18px;
          height: 18px;
        }
      }
    }

    .notebook-list {
      flex: 1;
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
      .empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: #909090;
        line-height: 22px;
        .empty-text {
          margin-bottom: 16vh;
        }
      }
      .item {
        position: relative;
        margin-bottom: 4px;
        box-sizing: border-box;
        // padding: 0 36px 0 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 16px;
        color: var(--default-font-color);
        line-height: 22px;
        height: 34px;
        border-radius: 6px;
        cursor: pointer;
        // &:hover {
        //   background: #f6f6f6;
        // }

        .vertical-marker {
          flex-shrink: 0;
          width: 4px;
          height: 14px;
          border-radius: 4px;
          background-color: transparent;
        }

        .title {
          flex: 1;
          box-sizing: border-box;
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 22px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        &.active-note {
          .vertical-marker {
            background-color: var(--el-color-primary);
          }
          .title {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .center-box {
    flex: 1;
    min-width: 43%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    background: #fff;
    border-radius: 0 12px 12px 0;
    &.mr-chat {
      margin-right: 10px;
    }
    .center-head {
      flex-shrink: 0;
      max-width: 770px;
      width: 100%;
      padding-right: 10px;
      margin: 0 auto 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: #fff;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: var(--default-font-color);
        line-height: 22px;
      }

      .right-handle-box {
        display: flex;
        align-items: center;
        gap: 10px;

        .add-icon {
          flex-shrink: 0;
          margin-right: 10px;
          display: block;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        :deep(.search-input) {
          width: 240px;
          height: 36px;

          .el-input__wrapper {
            background-color: #f9f9f9 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 0 1px #efefef inset;

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
            }
          }
        }

        .open-chat {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 99px;
          height: 36px;
          font-size: 14px;
          color: var(--default-font-color);
          background: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:active {
            background: #e9e9e9;
          }

          .logo {
            flex-shrink: 0;
            display: block;
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    .center-content {
      flex: 1;
      user-select: text;
      margin: 0 auto;
      max-width: 770px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      overflow-y: auto;
      // box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.1);
      .empty-content {
        box-sizing: border-box;
        padding-top: 20vh;
        height: 100%;
      }
    }
  }
  .right-box {
    flex: 1;
    height: 100%;
    overflow: hidden;
    // display: flex;
    // flex-direction: column;
    // border-left: 1px solid #efefef;
  }
}
</style>
