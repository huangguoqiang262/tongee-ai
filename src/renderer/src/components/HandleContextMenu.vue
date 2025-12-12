<template>
  <div
    v-if="show"
    ref="handleContextMenuRef"
    class="handleContextMenu"
    :style="{ left: pageX + 'px', top: pageY + 'px' }"
  >
    <template v-for="(item, index) in actionSheet" :key="index">
      <el-popover
        v-if="item.children && item.children.length"
        popper-class="context-menu-popover"
        trigger="hover"
        placement="right-start"
        :width="168"
        :show-arrow="false"
      >
        <template #reference>
          <div class="context-menu-item" @click="$emit('action', item)">
            <img class="icon" :src="item.icon" alt="" />
            <span class="title">{{ item.name }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </template>
        <div class="common-handle-box">
          <div
            v-for="childrenItem in item.children"
            :key="childrenItem.name"
            class="item"
            :class="{
              active: item.action == 'permission' && childrenItem.action == permissionType
            }"
            @click="$emit('action', childrenItem)"
          >
            <img class="icon" :src="childrenItem.icon" alt="" />
            <div class="title">{{ childrenItem.name }}</div>
          </div>
        </div>
      </el-popover>

      <div v-else class="context-menu-item" @click="$emit('action', item)">
        <img class="icon" :src="item.icon" alt="" />
        <span class="title">{{ item.name }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
let handleContextMenuRef = ref(null)
let props = defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  permissionType: [Number, String],
  actionSheet: {
    type: Array,
    default: () => []
  }
})
let pageX = computed(() => {
  let handleContextMenu = handleContextMenuRef.value || {}
  if (props.x + handleContextMenu.clientWidth > window.innerWidth) {
    return window.innerWidth - handleContextMenu.clientWidth
  } else {
    return props.x
  }
})
let pageY = computed(() => {
  let handleContextMenu = handleContextMenuRef.value || {}
  if (props.y + handleContextMenu.clientHeight > window.innerHeight) {
    return window.innerHeight - handleContextMenu.clientHeight
  } else {
    return props.y
  }
})
defineEmits(['action'])
</script>

<style scoped lang="scss">
.handleContextMenu {
  box-sizing: border-box;
  padding: 10px 8px;
  position: fixed;
  background: #fff;
  box-shadow: 0px 2px 20px 8px rgba(0, 0, 0, 0.07);
  border: 1px solid var(--el-popover-border-color);
  border-radius: 8px;
  z-index: 9999;
  min-width: 146px;
  overflow: hidden;
  transition: all 0.3s;
}

.context-menu-item {
  padding: 5px 10px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 22px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  color: var(--default-font-color);

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    width: 16px;
    height: 16px;
  }

  .title {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.context-menu-item:hover {
  background: var(--primary-bg-color);
}

.context-menu-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #95a5a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}
</style>
<style lang="scss">
.context-menu-popover {
  border-radius: 8px !important;
  padding: 12px 8px !important;
  width: 168px !important;
  .common-handle-box {
    .item {
      padding: 5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 22px;
      border-radius: 4px;
      cursor: pointer;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        background: var(--primary-bg-color);
      }
      &.active {
        background: var(--el-color-primary-light-9);
      }
      .title {
        flex: 1;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .icon {
        flex-shrink: 0;
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>
