<template>
  <div class="quick-access-box">
    <div class="head-box">
      <div class="head-left">
        <img class="unscramble-icon" src="@renderer/assets/quick-access-icon.png" alt="" />
        <div>快捷访问</div>
      </div>
      <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
    </div>
    <div class="content-box">
      <div class="list-box">
        <div v-for="item in list" :key="item.id" class="list-item">
          <img class="icon" src="@renderer/assets/empty.png" alt="" />
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emits = defineEmits(['closeMenu'])
const handleClose = () => {
  emits('closeMenu')
}
let list = ref([
  {
    name: '糖源医疗最新科研文献更新',
    id: 1,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 2,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 3,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 4,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 5,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 6,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 7,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 8,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 9,
    url: 'https://www.sugar-source.com/medical-research/'
  },
  {
    name: '糖源医疗最新科研文献更新',
    id: 10,
    url: 'https://www.sugar-source.com/medical-research/'
  }
])
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
    padding: 16px 12px;
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
      .list-item {
        width: 236px;
        height: 70px;
        background: #fff;
        border-radius: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 14px;
        .icon {
          width: 44px;
          height: 44px;
          border-radius: 4px;
          object-fit: cover;
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
