<template>
  <div class="multi-avatar-container">
    <div class="avatar-list">
      <!-- 显示前5个头像 -->
      <div
        v-for="(avatar, index) in visibleAvatars"
        :key="index"
        class="avatar-item"
        :style="getAvatarStyle(index)"
      >
        <img v-if="avatar" :src="avatar" :alt="`用户头像${index + 1}`" class="avatar-image" />
        <div v-else class="avatar-placeholder">
          {{ getInitial(index) }}
        </div>
      </div>

      <!-- 超出5个时显示... -->
      <div v-if="hasMore" class="avatar-more" :style="getMoreStyle()">···</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 头像列表，可以是图片URL或用户对象
  avatars: {
    type: Array,
    default: () => []
  },
  // 头像大小
  size: {
    type: Number,
    default: 32
  },
  // 最大显示数量
  maxCount: {
    type: Number,
    default: 5
  },
  // 头像间距
  spacing: {
    type: Number,
    default: -8
  }
})

// 可见的头像列表
const visibleAvatars = computed(() => {
  return props.avatars.slice(0, props.maxCount)
})

// 是否还有更多头像
const hasMore = computed(() => {
  return props.avatars.length > props.maxCount
})

// 更多头像数量
// const moreCount = computed(() => {
//   return props.avatars.length - props.maxCount
// })

// 获取头像样式
const getAvatarStyle = (index) => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    marginLeft: index > 0 ? `${props.spacing}px` : '0',
    zIndex: index
  }
}

// 获取更多头像样式
const getMoreStyle = () => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    marginLeft: `${props.spacing}px`,
    zIndex: props.maxCount,
    fontSize: `${Math.max(12, props.size * 0.35)}px`
  }
}

// 获取头像占位符的字母
const getInitial = (index) => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  return names[index] || 'U'
}
</script>

<style scoped lang="scss">
.multi-avatar-container {
  display: inline-flex;
  align-items: center;
}

.avatar-list {
  display: flex;
  align-items: center;
}

.avatar-item {
  border-radius: 50%;
  border: 2px solid #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-more {
  border-radius: 50%;
  background: #f0f2f5;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
