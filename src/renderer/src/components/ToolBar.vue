<template>
  <div class="toolbar">
    <div class="nav-buttons">
      <button class="nav-btn" :disabled="!canGoBack" @click="$emit('goBack')">
        <el-icon class="fas"><Back /></el-icon>
      </button>
      <button class="nav-btn" :disabled="!canGoForward" @click="$emit('goForward')">
        <el-icon class="fas"><Right /></el-icon>
      </button>
      <button v-if="!loading" class="nav-btn" @click="$emit('reload')">
        <el-icon class="fas"><RefreshRight /></el-icon>
      </button>
      <button v-else class="nav-btn" @click="$emit('stop')">
        <el-icon class="fas"><Close /></el-icon>
      </button>
    </div>

    <div class="address-bar">
      <input
        :value="addressBarUrl"
        type="text"
        class="address-input"
        placeholder="搜索或输入网址"
        @keyup.enter="$emit('navigate', $event.target.value)"
      />
    </div>

    <div class="action-buttons">
      <!-- 操作按钮 -->
    </div>
  </div>
</template>

<script setup>
defineProps({
  canGoBack: Boolean,
  canGoForward: Boolean,
  loading: Boolean,
  addressBarUrl: String
})

defineEmits(['goBack', 'goForward', 'reload', 'stop', 'navigate'])
</script>

<style scoped lang="scss">
.toolbar {
  width: calc(100% - 10px);
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px 8px 0px 0px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  margin-right: 15px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: var(--default-font-color);
  cursor: pointer;
  // transition: background 0.2s;
}

// .nav-btn:hover {
//   // background: #ccc;
// }

.nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.address-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #e8e8e8;
  border-radius: 24px;
  padding: 0 15px;
  height: 40px;
}

.lock-icon {
  margin-right: 8px;
  color: #27ae60;
}

.address-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #1a2530;
  font-size: 14px;
  outline: none;
  height: 100%;
}

.address-input::placeholder {
  color: #95a5a6;
}

.action-buttons {
  flex-shrink: 0;
  /* width: 20%; */
  display: flex;
  gap: 8px;
  margin-left: 15px;
}
</style>
