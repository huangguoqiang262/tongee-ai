<template>
  <div class="DialogueSettings-box">
    <div class="head-box">
      <div class="head-left">
        <img
          class="unscramble-icon"
          src="@renderer/assets/chat-icon/dialogueSettings-icon.png"
          alt=""
        />
        <div>模型设置</div>
      </div>
      <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
    </div>
    <div class="content-box">
      <div class="content-item">
        <div class="label">FrequencyPenalty（频率惩罚）</div>
        <el-slider
          v-model="configuration.frequency_penalty"
          size="small"
          :min="-2.0"
          :step="0.1"
          :max="2.0"
          :marks="frequencyPenaltyMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">PresencePenalty（存在惩罚）</div>
        <el-slider
          v-model="configuration.presence_penalty"
          size="small"
          :min="-2.0"
          :step="0.1"
          :max="2.0"
          :marks="presencePenaltyMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">Seed（种子）</div>
        <el-slider
          v-model="configuration.seed"
          size="small"
          :min="-1"
          :step="1"
          :max="2048"
          :marks="seedMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">Temperature（温度）</div>
        <el-slider
          v-model="configuration.temperature"
          size="small"
          :min="0"
          :step="0.1"
          :max="2"
          :marks="temperatureMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">TopP（最高频率）</div>
        <el-slider
          v-model="configuration.top_p"
          size="small"
          :min="0.1"
          :step="0.1"
          :max="1"
          :marks="topPMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">VectorShardNumber（知识库分片数量）</div>
        <el-slider
          v-model="configuration.vector_shard_number"
          size="small"
          :min="0"
          :step="1"
          :max="100"
          :marks="vectorShardNumberMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">SimilarityThreshold（相似性阈值）</div>
        <el-slider
          v-model="configuration.similarity_threshold"
          size="small"
          :min="0"
          :step="0.1"
          :max="1.0"
          :marks="similarityThresholdMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item">
        <div class="label">ContextNumber（上下文数量）</div>
        <el-slider
          v-model="configuration.context_number"
          size="small"
          :min="0"
          :step="1"
          :max="30"
          :marks="contextNumberMarks"
          @change="handleChange"
        />
      </div>
      <div class="content-item switch-item">
        <div class="label">EnableThinking（是否思考）</div>
        <el-switch v-model="configuration.enable_thinking" @change="handleChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  // 模型默认配置
  config: {
    type: Object,
    default: () => ({
      frequency_penalty: 0,
      presence_penalty: 0,
      seed: 100,
      temperature: 0.7,
      top_p: 0.5,
      vector_shard_number: 10,
      similarity_threshold: 0.5,
      context_number: 5,
      enable_thinking: true
    })
  },
  // 模型当前配置
  modelConfig: {
    type: Object,
    default: () => ({
      frequency_penalty: 0,
      presence_penalty: 0,
      seed: 100,
      temperature: 0.7,
      top_p: 0.5,
      vector_shard_number: 10,
      similarity_threshold: 0.5,
      context_number: 5,
      enable_thinking: true
    })
  }
})
const configuration = ref({
  frequency_penalty: 0,
  presence_penalty: 0,
  seed: 100,
  temperature: 0.7,
  top_p: 0.5,
  vector_shard_number: 10,
  similarity_threshold: 0.5,
  context_number: 5,
  enable_thinking: true
})
const emits = defineEmits(['closeSettings', 'change'])
const handleClose = () => {
  emits('closeSettings')
}
const frequencyPenaltyMarks = ref({
  '-2': '-2.0',
  [props.config.frequency_penalty]: '默认',
  2: '2.0'
})
const presencePenaltyMarks = ref({
  '-2': '-2.0',
  [props.config.presence_penalty]: '默认',
  2: '2.0'
})
const seedMarks = ref({
  '-1': '-1',
  [props.config.seed]: '默认',
  2048: '2048'
})
const temperatureMarks = ref({
  0: '0',
  [props.config.temperature]: '默认',
  2: '2'
})
const topPMarks = ref({
  0.1: '0.1',
  [props.config.top_p]: '默认',
  1: '1'
})
const vectorShardNumberMarks = ref({
  0: '0',
  [props.config.vector_shard_number]: '默认',
  100: '100'
})
const similarityThresholdMarks = ref({
  0: '0',
  [props.config.similarity_threshold]: '默认',
  1.0: '1.0'
})
const contextNumberMarks = ref({
  0: '0',
  [props.config.context_number]: '默认',
  30: '30'
})
watchEffect(() => {
  configuration.value = props.modelConfig
})
watchEffect(() => {
  frequencyPenaltyMarks.value = {
    '-2': '-2.0',
    [props.config.frequency_penalty]: '默认',
    2: '2.0'
  }
  presencePenaltyMarks.value = {
    '-2': '-2.0',
    [props.config.presence_penalty]: '默认',
    2: '2.0'
  }
  seedMarks.value = {
    '-1': '-1',
    [props.config.seed]: '默认',
    2048: '2048'
  }
  temperatureMarks.value = {
    0: '0',
    [props.config.temperature]: '默认',
    2: '2'
  }
  topPMarks.value = {
    0.1: '0.1',
    [props.config.top_p]: '默认',
    1: '1'
  }
  vectorShardNumberMarks.value = {
    0: '0',
    [props.config.vector_shard_number]: '默认',
    100: '100'
  }
  similarityThresholdMarks.value = {
    0: '0',
    [props.config.similarity_threshold]: '默认',
    1.0: '1.0'
  }
  contextNumberMarks.value = {
    0: '0',
    [props.config.context_number]: '默认',
    30: '30'
  }
})
const handleChange = () => {
  emits('change', configuration.value)
}
</script>

<style scoped lang="scss">
.DialogueSettings-box {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  user-select: none;
  overflow: hidden;
  .head-box {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
    padding-bottom: 20px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .head-left {
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 14px;
      color: var(--default-font-color);
      line-height: 20px;

      .unscramble-icon {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
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
    box-sizing: border-box;
    padding: 0 26px;
    height: calc(100% - 40px);
    overflow-y: auto;
    .content-item {
      margin-bottom: 36px;
      width: 100%;
      &:nth-last-of-type(1) {
        margin-bottom: 0;
      }
      &.switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .label {
        margin-bottom: 5px;
        font-size: 14px;
        color: var(--default-font-color);
        line-height: 20px;
      }
      :deep(.el-slider__button) {
        width: 16px !important;
        height: 16px !important;
      }
      :deep(.el-slider__stop) {
        &:nth-last-of-type(1),
        &:nth-of-type(1) {
          background-color: transparent;
        }
      }
    }
  }
}
</style>
