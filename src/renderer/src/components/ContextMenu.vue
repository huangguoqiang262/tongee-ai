<template>
  <div v-if="show" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }">
    <div
      v-for="item in actions"
      :key="item.action"
      class="context-menu-item"
      :class="{ disabled: item.disabled }"
      @click="handleAction(item.action, item.disabled)"
    >
      <span>{{ item.title }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  show: Boolean,
  x: Number,
  y: Number,
  tabs: {
    type: Array,
    default: () => []
  },
  tabId: {
    type: [String, Number],
    default: ''
  }
})
let whiteList = [
  'SearchHome',
  'HomePage',
  'ImageProductionChat',
  'IntelligentWritingChat',
  'ChatPage',
  'DocumentDetail'
]
const actions = ref([
  {
    title: '新建标签页',
    action: 'new',
    disabled: false
  },
  {
    title: '复制标签页',
    action: 'duplicate',
    disabled: false
  },
  {
    title: '关闭标签页',
    action: 'close',
    disabled: false
  },
  {
    title: '关闭其他标签页',
    action: 'close-others',
    disabled: false
  },
  {
    title: '关闭右侧标签页',
    action: 'close-right',
    disabled: false
  }
])
watchEffect(() => {
  const tabIndex = props.tabs.findIndex((tab) => tab.id === props.tabId)
  if (tabIndex !== -1) {
    actions.value[1].disabled = !whiteList.includes(props.tabs[tabIndex].url)
    if (tabIndex == props.tabs.length - 1) {
      actions.value[4].disabled = true
    } else if (props.tabs.length == 1) {
      actions.value[3].disabled = true
      actions.value[4].disabled = true
    } else {
      actions.value[3].disabled = false
      actions.value[4].disabled = false
    }
  } else {
    actions.value[1].disabled = false
    actions.value[3].disabled = false
    actions.value[4].disabled = false
  }
})
const emits = defineEmits(['action'])
const handleAction = (action, disabled) => {
  if (disabled) {
    return
  }
  emits('action', action)
}
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px #e0e0e0;
  z-index: 1000;
  padding: 8px 0;
  min-width: 150px;
  overflow: hidden;
}

.context-menu-item {
  padding: 10px 15px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--default-font-color);
  transition: background 0.2s;
  &.disabled {
    cursor: not-allowed;
    color: #66686b;
  }
}

.context-menu-item:hover {
  background: var(--primary-bg-color);
}

.context-menu-divider {
  height: 1px;
  background: #e0e0e0;
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
