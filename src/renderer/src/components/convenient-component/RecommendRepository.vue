<template>
  <div class="RecommendRepository-overly">
    <div class="quick-access-box">
      <div class="head-box">
        <div class="head-left">
          <img
            class="unscramble-icon"
            src="@renderer/assets/contextMenu/repository-icon.png"
            alt=""
          />
          <div>选择知识库</div>
        </div>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
      <div :infinite-scroll-distance="1" v-infinite-scroll="loadData" class="content-box">
        <el-skeleton class="list-box" :loading="loading" animated>
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
            <div v-if="list.length" :infinite-scroll-distance="1" v-infinite-scroll="loadData" class="list-box">
              <div v-for="item in list" :key="item.id" class="list-item">
                <img v-if="item.picurl" class="logo" :src="item.picurl" alt="" />
                <defaultCoverSvg v-else class="logo" />
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
      <div class="footer-btns">
        <el-button class="cancel-btn" @click="skip">跳过</el-button>
        <el-button v-if="list.length" class="confirm-btn" type="primary" @click="submitForm">
          一键申请全部
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apply_know_join } from '@renderer/api/repository'
import { getLoginKnowList, skipLogin, applyAllLoginShowKnows, user_info } from '@renderer/api/user'
import { useUserStore } from '@renderer/stores/user'
import defaultCoverSvg from '@renderer/assets/repository/default-cover.svg'
import defaultAvatar from '@renderer/assets/default-avatar.png'
const emits = defineEmits(['closeMenu'])
const handleClose = () => {
  skipLogin({}).then((res) => {
    if (res.code == 200) {
      emits('closeMenu')
      getUserInfo()
    }
  })
}
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
const userStore = useUserStore()
const getUserInfo = () => {
  user_info({}).then((res) => {
    if (res.code == 200) {
      userStore.updateUser(res.data?.user_info)
    }
  })
}
const skip = () => {
  skipLogin({}).then((res) => {
    if (res.code == 200) {
      emits('closeMenu')
      getUserInfo()
    }
  })
}
const submitForm = () => {
  applyAllLoginShowKnows({}).then((res) => {
    if (res.code == 200) {
      emits('closeMenu')
      getUserInfo()
    }
  })
}
let loading = ref(true)
let list = ref([])
const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  loading.value = load
  getLoginKnowList(data)
    .then((res) => {
      if (res.code == 200) {
        list.value = list.value.concat(res.data.data)
        pagination.value.total = res.data.total
        pagination.value.page = res.data.current_page
        pagination.value.page_size = res.data.per_page
      }
    })
    .finally(() => {
      loading.value = false
    })
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
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
        var joinList = list.value.filter((item) => !item.already_joined)
        if (joinList.length == 0) {
          emits('closeMenu')
          getUserInfo()
        }
      } else {
        // eslint-disable-next-line no-undef
        ElMessage.primary('申请已提交')
      }
    }
  })
}
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.RecommendRepository-overly {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(241, 241, 241, 0.82);
  z-index: 0;
}
.quick-access-box {
  box-sizing: border-box;
  padding: 0 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 950px;
  height: 484px;
  background: #ffffff;
  box-shadow: 0px 2px 60px 8px rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  user-select: none;
  overflow: hidden;
  z-index: 8;
  .head-box {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 54px;

    .head-left {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: var(--default-font-color);
      line-height: 22px;

      .unscramble-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 10px;
        vertical-align: middle;
      }
    }

    .close-icon {
      color: #737475;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s linear;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
  .content-box {
    height: 362px;
    width: 100%;
  }
  .list-box {
    width: 100%;
    height: 100%;
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
        color: var(--el-color-primary);
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
              border-color: #ccc;
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
  .footer-btns {
    flex-shrink: 0;
    height: 64px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    .cancel-btn,
    .confirm-btn {
      height: 36px;
      width: 110px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
    }

    .cancel-btn {
      width: 80px;
      background: #efefef;
      color: var(--default-font-color);
    }
  }
}
</style>
