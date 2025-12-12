<template>
  <div class="square-box">
    <div class="square">
      <div class="head">
        <div class="title">知识库广场</div>
        <div class="search-box">
          <el-input
            v-model="searchVal"
            clearable
            class="search-input"
            size="large"
            placeholder="搜索知识库"
            :suffix-icon="searchVal ? '' : Search"
            @change="resetList"
          />
        </div>
      </div>
      <div class="square-content">
        <div ref="tabsContainer" class="tabs">
          <template v-for="(tab, i) in tabs" :key="i">
            <div
              v-if="showMoreTab ? (!isExpand ? i < visibleTabNum - 1 : true) : true"
              class="tab-item"
              :class="{ 'active-tab': tab.id == activeTab }"
              @click="tabHandle(tab.id)"
            >
              {{ tab.title }}
            </div>
          </template>
          <template v-if="showMoreTab">
            <div v-if="!isExpand" class="more-tab" @click="isExpand = true">
              展开<el-icon class="more-tab-icon"><ArrowDown /></el-icon>
            </div>
            <div v-else class="more-tab" @click="isExpand = false">
              收起<el-icon class="more-tab-icon"><ArrowUp /></el-icon>
            </div>
          </template>
        </div>
        <el-skeleton class="list-box" :loading="dataLoading" animated>
          <template #template>
            <div v-for="item in 8" :key="item" class="list-item skeleton-item">
              <el-skeleton-item class="logo-skeleton" />
              <div class="item-right">
                <div class="right-top">
                  <el-skeleton-item class="title"></el-skeleton-item>
                  <el-skeleton-item class="desc"></el-skeleton-item>
                </div>
                <div class="right-bottom">
                  <div class="_left">
                    <el-skeleton-item variant="text" class="avatar" />
                    <el-skeleton-item variant="text"></el-skeleton-item>
                    <el-skeleton-item variant="text"></el-skeleton-item>
                    <el-skeleton-item variant="text"></el-skeleton-item>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #default>
            <div v-if="list.length" v-infinite-scroll="loadData" class="list-box">
              <div v-for="item in list" :key="item.id" class="list-item">
                <img class="logo" :src="item.picurl || defaultCover" alt="" />
                <div class="item-right">
                  <div class="right-top">
                    <div class="title">{{ item.title }}</div>
                    <div class="desc">
                      {{ item.desc || '暂无描述' }}
                    </div>
                  </div>
                  <div class="right-bottom">
                    <div class="_left">
                      <img class="avatar" :src="item.user_avatar || defaultAvatar" alt="" />
                      <span>{{ item.user_name || '' }}</span>
                      <div class="line"></div>
                      <span>{{ item.item_count }}个内容</span>
                      <div class="line"></div>
                      <span> {{ item.user_count }}人加入 </span>
                    </div>
                    <div v-if="item.already_joined" class="_operation is_join">已加入</div>
                    <div v-else class="_operation" @click="joinKnowledge(item)">加入知识库</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-box">
              <el-empty :image-size="120" description="暂无知识库" />
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { know_types, getKnowSquareList, apply_know_join } from '@renderer/api/repository'
import defaultCover from '@renderer/assets/repository/default-cover.png'
import defaultAvatar from '@renderer/assets/default-avatar.png'
let searchVal = ref('')
let tabs = ref([])
let activeTab = ref('')
const tabHandle = (id) => {
  activeTab.value = id
  resetList()
}
let dataLoading = ref(false)
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
const resetList = () => {
  list.value = []
  pagination.value.page = 1
  pagination.value.page_size = 10
  pagination.value.total = 0
  getList()
}
let tabsContainer = ref(null)
// 是否显示更多
let showMoreTab = ref(false)
// 是否展开
let isExpand = ref(false)
let visibleTabNum = ref(tabs.value.length)
const calculateMoreTab = () => {
  let tabsContainerWidth = tabsContainer.value.clientWidth
  let tabWidth = 0
  const childrenArray = Array.from(tabsContainer.value.children)
  childrenArray.some((item, i) => {
    if (i == tabs.value.length - 1) {
      tabWidth += item.clientWidth
    } else {
      tabWidth += item.clientWidth + 40
    }
    if (tabWidth > tabsContainerWidth) {
      showMoreTab.value = true
    }
    if (tabWidth >= tabsContainerWidth && showMoreTab.value && !isExpand.value) {
      visibleTabNum.value = i
      return true
    }
  })
}
const joinKnowledge = (item) => {
  apply_know_join({
    know_id: item.id
  }).then((res) => {
    if (res.code == 200) {
      if (res.data.join_status == 1) {
        // eslint-disable-next-line no-undef
        ElMessage.primary('加入成功')
        item.already_joined = 1
      } else {
        // eslint-disable-next-line no-undef
        ElMessage.primary('申请已提交')
      }
    }
  })
}
const list = ref([])
const getTabList = () => {
  know_types({}).then((res) => {
    if (res.code == 200) {
      tabs.value = res.data
      if (tabs.value.length) {
        tabs.value.unshift({
          id: '',
          title: '全部'
        })
        activeTab.value = tabs.value[0].id
        calculateMoreTab()
      }
      getList()
    }
  })
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
}
const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size,
    type_id: activeTab.value,
    title: searchVal.value
  }
  dataLoading.value = load
  getKnowSquareList(data)
    .then((res) => {
      if (res.code == 200) {
        list.value = list.value.concat(res.data.data || [])
        pagination.value.total = res.data.total
        pagination.value.page = res.data.current_page
        pagination.value.page_size = res.data.per_page
      }
    })
    .finally(() => {
      dataLoading.value = false
    })
}
onMounted(() => {
  getTabList()
})
</script>

<style scoped lang="scss">
.square-box {
  box-sizing: border-box;
  padding: 50px 20px 10px;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 16px;
  overflow-y: auto;
  .square {
    width: 100%;
    max-width: 910px;
    height: 100%;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .head {
      flex-shrink: 0;
      margin-bottom: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 22px;
        font-weight: 500;
        color: var(--default-font-color);
        line-height: 30px;
      }
      .search-box {
        .search-input {
          :deep(.el-input__wrapper) {
            background: #f9f9f9;
            border-radius: 20px;
            width: 280px;
            padding-left: 20px;
            font-size: 14px;
            .el-input__inner {
              color: var(--default-font-color);
            }
          }
        }
      }
    }
    .square-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .tabs {
        margin-bottom: 30px;
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
        .more-tab {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-items: center;
          font-size: 14px;
          color: #555555;
          line-height: 22px;
          cursor: pointer;
          .more-tab-icon {
            flex-shrink: 0;
            font-size: 12px;
            margin-left: 3px;
          }
        }
      }
      .list-box {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 16px;
        .list-item {
          box-sizing: border-box;
          padding: 18px 20px 16px;
          overflow: hidden;
          width: calc(50% - 8px);
          height: 110px;
          display: flex;
          align-items: center;
          gap: 0 10px;
          border-radius: 16px;
          border: 1px solid #d8d8d8;
          &.skeleton-item {
            &:hover {
              background: inherit !important;
            }
          }
          &:hover {
            background: rgba(0, 0, 0, 0.02);
          }
          .logo {
            flex-shrink: 0;
            width: 64px;
            height: 64px;
            background: #ffffff;
            border-radius: 8px;
            object-fit: cover;
          }
          .logo-skeleton {
            flex-shrink: 0;
            width: 64px;
            height: 64px;
            border-radius: 8px;
            object-fit: cover;
          }
          .item-right {
            flex: 1;
            overflow: hidden;
            .right-top {
              width: 100%;
              margin-bottom: 8px;
              .title {
                margin-bottom: 4px;
                font-size: 14px;
                color: var(--default-font-color);
                line-height: 22px;
              }
              .desc {
                font-size: 12px;
                color: #737475;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
            .right-bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              ._left {
                flex: 1;
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #737475;
                line-height: 16px;
                .avatar {
                  margin-right: 4px;
                  flex-shrink: 0;
                  width: 18px;
                  height: 18px;
                  object-fit: cover;
                  border-radius: 50%;
                }
                .line {
                  margin: 0 6px;
                  width: 1px;
                  height: 10px;
                  background: #ccc;
                }
              }
              ._operation {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 76px;
                height: 26px;
                border-radius: 6px;
                border: 1px solid var(--el-color-primary-light-8);
                font-size: 12px;
                color: var(--el-color-primary);
                line-height: 16px;
                cursor: pointer;
                &.is_join {
                  background: #ccc;
                  color: #fff;
                }
                &:active {
                  opacity: 0.7;
                }
              }
            }
          }
        }
      }
      .empty-box {
        padding-top: 100px;
        width: 100%;
        .empty-text {
          font-size: 14px;
          color: #737475;
          line-height: 22px;
        }
      }
    }
  }
}
</style>
