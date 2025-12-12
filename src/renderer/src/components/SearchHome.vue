<template>
  <div class="search-home" @click="handleClick">
    <div class="logo-box">
      <img class="logo" src="@renderer/assets/home/large-logo.png" alt="" />
    </div>
    <div class="search-box">
      <MessageInput ref="messageInput" key="input" class="message-input"> </MessageInput>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const messageInput = ref(null)
const handleClick = (e) => {
  messageInput.value?.focusChange(e)
}
</script>

<style scoped lang="scss">
.search-home {
  height: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .logo-box {
    margin-bottom: 58px;
    text-align: center;
    flex-shrink: 0;
    .logo {
      width: 274px;
      height: 77px;
      object-fit: contain;
    }
    .logo-text {
      font-weight: 700;
      font-size: 32px;
      color: var(--default-font-color);
    }
  }
  .search-box {
    width: 100%;
    .message-input {
      width: 100%;
      max-width: 770px;
      margin: 0 auto;
    }
  }
}
</style>
