<template>
  <div class="load-box" @click.stop="rotate">
    <div class="text">
      {{ loadingText }}
    </div>
    <div v-if="loadingText === '思考中'" class="loading">
      <!--  三个 div 三个黑点 -->
      <div></div>
      <div></div>
      <div></div>
    </div>
    <img
      v-if="reasoningContentText.length"
      class="rotate"
      :style="{ transform: spread ? 'rotate(180deg)' : '' }"
      src="@renderer/assets/down-icon.png"
      alt=""
    />
  </div>
</template>
<script setup>
const props = defineProps({
  loadingText: {
    type: String,
    default: '思考中'
  },
  spread: {
    type: Boolean,
    default: false
  },
  reasoningContentText: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:spread'])
const rotate = () => {
  if (props.reasoningContentText.length) {
    emits('update:spread', !props.spread)
  }
}
</script>
<style lang="scss" scoped>
.load-box {
  display: flex;
  align-items: flex-end;
  font-size: 14px;
  max-width: 140px;
  width: fit-content;
  // background: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  user-select: none;
  .text {
    color: #909090;
  }
}
.rotate {
  width: 12px;
  height: 12px;
  margin-left: 10px;
  align-self: center;
  transition: all 0.2s linear;
}
.loading {
  flex-shrink: 0;
  // 三个黑点水平展示
  display: flex;
  // 三个黑点均匀分布在54px中
  justify-content: space-around;
  color: #000;
  width: 34px;

  div {
    background-color: currentColor;
    border: 0 solid currentColor;
    width: 5px;
    height: 5px;
    // 变成黑色圆点
    border-radius: 100%;
    // 播放我们下面定义的动画，每次动画持续0.7s且循环播放。
    animation: ball-beat 0.7s -0.15s infinite linear;
  }

  div:nth-child(2n-1) {
    // 慢0.5秒
    animation-delay: -0.5s;
  }
}

// 动画定义
@keyframes ball-beat {
  // 关键帧定义，在50%的时候是颜色变透明，且缩小。
  50% {
    opacity: 0.2;
    transform: scale(0.75);
  }
  // 在100%时是回到正常状态，浏览器会自动在这两个关键帧间平滑过渡。
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
