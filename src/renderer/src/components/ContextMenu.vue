<template>
  <div v-if="show" class="context-menu" :style="{ left: x + 'px', top: y + 'px' }">
    <div class="context-menu-item" @click="$emit('action', 'new')">
      <i class="fas fa-plus"></i>
      <span>新建标签页</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="$emit('action', 'reload')">
      <i class="fas fa-redo"></i>
      <span>重新加载</span>
    </div>
    <div class="context-menu-item" @click="$emit('action', 'duplicate')">
      <i class="fas fa-copy"></i>
      <span>复制标签页</span>
    </div>
    <div class="context-menu-divider"></div>
    <div class="context-menu-item" @click="$emit('action', 'close')">
      <i class="fas fa-times"></i>
      <span>关闭标签页</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  x: Number,
  y: Number
})

defineEmits(['action'])
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 15px #e0e0e0;
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.context-menu-item {
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--default-font-color);
  transition: background 0.2s;
}

.context-menu-item:hover {
  background: #e0e0e0;
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
