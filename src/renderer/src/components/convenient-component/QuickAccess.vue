<template>
  <div class="quick-access-box">
    <div class="head-box">
      <div class="head-left">
        <img class="unscramble-icon" src="@renderer/assets/quick-access-icon.png" alt="" />
        <div>快捷访问</div>
      </div>
      <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
    </div>
    <div v-infinite-scroll="loadData" class="content-box">
      <div class="list-box">
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item v-for="i in 5" :key="i" variant="text" style="margin: 10px 0" />
          </template>
          <template #default>
            <template v-if="list.length">
              <div v-for="(item, index) in list" :key="item.id" class="list-item">
                <img
                  class="del-icon"
                  src="@renderer/assets/clear-icon1.png"
                  alt=""
                  @click.stop="delItem(item, index)"
                />
                <img class="icon" :src="item.picUrl || defaultCover" alt="" />
                <div class="name">{{ item.title }}</div>
              </div>
            </template>
            <div v-else class="empty">暂无快捷访问项</div>
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { lists_access, del_access } from '@renderer/api/index'
import defaultCover from '@renderer/assets/repository/default-cover.png'
const emits = defineEmits(['closeMenu'])
const handleClose = () => {
  emits('closeMenu')
}
let pagination = ref({
  page: 1,
  page_size: 10,
  total: 0
})
let loading = ref(true)
let list = ref([])
const getList = (load = true) => {
  var data = {
    page: pagination.value.page,
    page_size: pagination.value.page_size
  }
  loading.value = load
  lists_access(data)
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
const delItem = (item, index) => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm('确认删除吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      del_access({ id: item.id }).then((res) => {
        if (res.code == 200) {
          // eslint-disable-next-line no-undef
          ElMessage({
            type: 'primary',
            message: '删除成功'
          })
          list.value.splice(index, 1)
        }
      })
    })
    .catch(() => {})
}
const loadData = () => {
  if (pagination.value.page * pagination.value.page_size >= pagination.value.total) {
    return
  }
  pagination.value.page++
  getList(false)
}
onMounted(() => {
  getList()
})
</script>

<style scoped lang="scss">
.quick-access-box {
  box-sizing: border-box;
  padding: 0 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 336px;
  background: #ffffff;
  box-shadow: 0px 2px 60px 8px rgba(0, 0, 0, 0.07);
  border-radius: 16px;
  user-select: none;
  overflow: hidden;
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
    padding: 15px 12px;
    font-size: 14px;
    color: var(--default-font-color);
    line-height: 22px;
    height: 260px;
    overflow-y: auto;
    background: #f9f9f9;
    border-radius: 10px;
    .list-box {
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      .empty {
        width: 100%;
        text-align: center;
        align-items: center;
        font-size: 13px;
        line-height: 200px;
        color: #909090;
      }
      .list-item {
        flex-shrink: 0;
        position: relative;
        width: 236px;
        height: 70px;
        background: #fff;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 14px;
        cursor: pointer;
        &:hover {
          .del-icon {
            display: block;
          }
        }
        .icon {
          width: 44px;
          height: 44px;
          border-radius: 4px;
          object-fit: cover;
        }
        .del-icon {
          display: none;
          position: absolute;
          top: -6px;
          right: -6px;
          z-index: 1;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .name {
          font-size: 14px;
          color: var(--default-font-color);
          line-height: 20px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
