<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除。</p>
    </div>
  </div>
</template>

<script setup></script>
<style scoped lang="scss">
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.not-found-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.not-found h1 {
  font-size: 8rem;
  margin: 0;
  font-weight: 700;
  opacity: 0.8;
}

.not-found h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.not-found p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}
</style>
