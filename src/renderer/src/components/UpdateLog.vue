<template>
  <div class="notebook-box">
    <div v-if="!catalogueShow" class="catalogue" @click="catalogueClick(true)">目录</div>
    <div v-if="catalogueShow" class="left-box">
      <div class="common-box">
        <div class="common-box-left">目录</div>
        <div class="square-icon-box" @click="catalogueClick(false)">
          <img class="square-icon" src="@renderer/assets/close-chat-icon.png" alt="" />
        </div>
      </div>
      <div class="notebook-list">
        <el-skeleton animated :loading="loading">
          <template #template>
            <el-skeleton-item v-for="i in 10" :key="i" variant="text" style="margin: 10px 0" />
          </template>
          <template #default>
            <template v-if="list.length">
              <el-anchor
                :container="containerRef"
                direction="vertical"
                type="default"
                :offset="0"
                select-scroll-top
                @click="handleClick"
              >
                <el-anchor-link
                  v-for="(value, index) in list"
                  :key="value.id"
                  class="anchor-item"
                  :href="'#version' + index"
                  :title="value.version + '主要更新'"
                />
              </el-anchor>
            </template>
            <div v-else class="empty">
              <div class="empty-text">暂无数据</div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
    <div class="center-box">
      <div ref="containerRef" class="center-content">
        <template v-if="list.length">
          <div
            v-for="(value, index) in list"
            :id="'version' + index"
            :key="value.id"
            class="version-item"
          >
            <h3>{{ value.version }}主要更新</h3>
            <v-md-preview :text="replaceImgStyle(value.content)"></v-md-preview>
          </div>
        </template>
        <div v-else class="empty-content">
          <el-empty :image-size="120" description="暂无内容" />
        </div>
      </div>
    </div>
    <div v-if="chatVisible" class="right-box">
      <!-- <EnchiridionChat :know-id="knowId" :item-id="itemId" @close-chat="chatVisible = false" /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { useUserStore } from '@renderer/stores/user'
import { uplogsNoPaginate } from '@renderer/api/update'
// import { useCheckLogin, useUserInfo } from '@renderer/hooks/checkLogin'
let containerRef = ref(null)
let chatVisible = ref(false)
let catalogueShow = ref(true)
const catalogueClick = (show) => {
  catalogueShow.value = show
}
// let itemId = ref('')
// let knowId = ref('')
// let html = ref('')
const handleClick = (e) => {
  e.preventDefault()
}
// const userStore = useUserStore()
// const userInfo = useUserInfo()
//   let pagination = ref({
//     page: 1,
//     page_size: 10,
//     total: 0
//   })
let loading = ref(true)
let list = ref([])
//   const loadData = () => {
//     if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
//       return
//     }
//     pagination.value.page++
//     getList(false)
//   }
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
  // var data = {
  //   page: pagination.value.page,
  //   page_size: pagination.value.page_size
  // }
  loading.value = load
  uplogsNoPaginate()
    .then((res) => {
      list.value = res.data || []
      // knowId.value = res.data.know_info?.know_id || ''
      // list.value = list.value.concat(res.data.list.data || [])
      // pagination.value.total = res.data.list.total
      // pagination.value.page = res.data.list.current_page
      // pagination.value.page_size = res.data.list.per_page
      // if (!itemId.value && list.value.length) {
      //   itemId.value = list.value[0].item_id
      //   html.value = replaceImgStyle(list.value[0].content || '')
      // }
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
.notebook-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  position: relative;
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
      :deep(.anchor-item) {
        .el-anchor__link {
          padding: 8px 0;
          font-size: 14px;
        }
      }
    }
  }

  .center-box {
    flex: 1;
    min-width: 400px;
    height: 100%;
    padding: 20px 0;
    overflow: hidden;
    user-select: text;
    .center-content {
      height: 100%;
      padding: 0 20px;
      overflow-y: auto;
      margin: 0 auto;
      max-width: 810px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 12px;
      .empty-content {
        box-sizing: border-box;
        padding-top: 20vh;
        height: 100%;
      }
      .version-item {
        :deep(.vuepress-markdown-body) {
          padding: 10px !important;
        }
      }
    }
  }
  .right-box {
    padding: 10px 20px 0;
    height: 100%;
    min-width: 375px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-left: 1px solid #efefef;
  }
}
</style>
