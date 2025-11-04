<template>
  <div class="sidebar-box">
    <img class="logo-img" src="@renderer/assets/default-avatar.png" alt="糖源AI" @click="accountClick()"/>
    <div class="memu-box">
      <div v-for="item in menuList" :key="item.url" class="menu-item" @click="handleClick(item)">
        <el-tooltip effect="light" content="" placement="right">
          <template #content> {{ item.name }} </template>
          <img class="menu-icon" :src="item.icon" alt="" />
        </el-tooltip>
      </div>
      <div class="transverse-line"></div>
      <div class="common-knowledge">
        <img class="menu-icon" src="@renderer/assets/menu/common-knowledge-icon.png" alt="" />
        <div class="sub-menu">
          <div class="sub-menu-item">
            <img class="sub-menu-icon" src="@renderer/assets/menu/management-icon.png" alt="" />
          </div>
          <div class="sub-menu-item">
            <img class="sub-menu-icon" src="@renderer/assets/menu/management-icon.png" alt="" />
          </div>
          <div class="sub-menu-item">
            <img class="sub-menu-icon" src="@renderer/assets/menu/management-icon.png" alt="" />
          </div>
        </div>
      </div>
    </div>
    <div class="record-menu">
      <div
        v-for="item in recordMenuList"
        :key="item.url"
        class="menu-item"
        @click="handleClick(item)"
      >
        <el-tooltip effect="light" content="" placement="right">
          <template #content> {{ item.name }} </template>
          <img class="menu-icon" :src="item.icon" alt="" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import repositoryIcon from '@renderer/assets/menu/repository-icon.png'
import noteIcon from '@renderer/assets/menu/note-icon.png'
import managementIcon from '@renderer/assets/menu/management-icon.png'
import messageCenterIcon from '@renderer/assets/menu/message-center-icon.png'
import recycledIcon from '@renderer/assets/menu/recycled-icon.png'
import historyIcon from '@renderer/assets/menu/history-icon.png'
const addNewTab = inject('addNewTab')
const menuList = ref([
  {
    name: '知识库',
    url: 'RepositoryStore',
    icon: repositoryIcon
  },
  {
    name: '笔记',
    url: 'Note',
    icon: noteIcon
  },
  {
    name: '管理后台',
    url: 'Management',
    icon: managementIcon
  }
])
const recordMenuList = ref([
  {
    name: '消息中心',
    url: 'MessageCenter',
    icon: messageCenterIcon
  },
  {
    name: '回收站',
    url: 'Recycled',
    icon: recycledIcon
  },
  {
    name: '历史记录',
    url: 'History',
    icon: historyIcon
  }
])
const handleClick = (item) => {
  addNewTab({
    url: item.url,
    title: item.name,
    icon: item.icon,
    isInternal: true
  })
}

const accountClick = () => {
  addNewTab({
    url: 'AccountSettings',
    title: '账户设置',
    icon: repositoryIcon,
    isInternal: true
  })
}
</script>

<style scoped lang="scss">
.sidebar-box {
  box-sizing: border-box;
  padding: 55px 10px 20px;
  flex-shrink: 0;
  width: 66px;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  app-region: drag;
  .logo-img {
    display: block;
    margin: 0 auto 26px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    -webkit-user-drag: none;
    -moz-user-drag: none;
    -ms-user-drag: none;
    user-drag: none;
    app-region: none;
  }
  .memu-box {
    flex: 1;
    flex-shrink: 0;
    width: 40px;
    app-region: none;
    .menu-item {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-bottom: 26px;
      border-radius: 8px;
      color: var(--default-font-color);
      font-size: 14px;
      border-radius: 6px;
      .menu-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      &:hover {
        background: #e0e0e0;
      }
    }
    .transverse-line {
      margin: 0 auto 10px;
      width: 21px;
      height: 1px;
      background: #dfdfdf;
    }
    .common-knowledge {
      box-sizing: border-box;
      padding: 13px 0;
      border-radius: 20px;
      height: 46px;
      overflow: hidden;
      background: transparent;
      transition: all 0.3s ease-in-out;
      &:hover {
        height: 148px;
        background: #ccc;
      }
      .menu-icon {
        display: block;
        margin: 0 auto 14px;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      .sub-menu {
        .sub-menu-item {
          margin: 0 auto 14px;
          .sub-menu-icon {
            display: block;
            margin: 0 auto;
            width: 20px;
            height: 20px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .record-menu {
    flex-shrink: 0;
    width: 40px;
    app-region: none;
    .menu-item {
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-bottom: 14px;
      border-radius: 8px;
      cursor: pointer;
      color: var(--default-font-color);
      font-size: 14px;
      border-radius: 6px;
      .menu-icon {
        width: 20px;
        height: 20px;
      }
      &:hover {
        background: #e0e0e0;
      }
    }
  }
}
</style>
