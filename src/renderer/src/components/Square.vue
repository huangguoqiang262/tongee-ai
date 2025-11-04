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
          />
        </div>
      </div>
      <div class="square-content">
        <div ref="tabsContainer" class="tabs">
          <template v-for="(tab, i) in tabs" :key="tab.id">
            <div
              v-if="showMoreTab ? (!isExpand ? i < visibleTabNum - 1 : true) : true"
              class="tab-item"
              :class="{ 'active-tab': tab.id == activeTab }"
              @click="tabHandle(tab.id)"
            >
              {{ tab.name }}
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
        <div v-if="list.length" class="list-box">
          <div class="list-item">
            <img class="logo" src="@renderer/assets/logo.png" alt="" />
            <div class="item-right">
              <div class="right-top">
                <div class="title">知识库广场</div>
                <div class="desc">
                  知识库广场是一个知识管理平台，提供了知识库的创建、管理、分享和使用等功能。
                </div>
              </div>
              <div class="right-bottom">
                <div class="_left">
                  <img class="avatar" src="@renderer/assets/default-avatar.png" alt="" />
                  <span>李白</span>
                  <div class="line"></div>
                  <span>6个内容</span>
                  <div class="line"></div>
                  <span> 54人加入 </span>
                </div>
                <div class="_operation">加入知识库</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-box">
          <el-empty :image-size="120" description="暂无知识库" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
let searchVal = ref('')
let tabs = ref([
  {
    id: '',
    name: '全部'
  },
  {
    id: '2',
    name: '文献类'
  },
  {
    id: '3',
    name: '科普类'
  },
  {
    id: '4',
    name: '数据类'
  },
  {
    id: '5',
    name: '教学类'
  },
  {
    id: '6',
    name: '参考数据'
  },
  {
    id: '7',
    name: '科研类'
  }
])
let activeTab = ref('')
const tabHandle = (id) => {
  activeTab.value = id
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
const list = ref([])
onMounted(() => {
  calculateMoreTab()
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
        height: 100px;
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
