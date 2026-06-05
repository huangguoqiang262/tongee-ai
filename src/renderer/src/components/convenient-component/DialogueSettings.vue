<template>
  <div class="DialogueSettings-box">
    <!-- ==================== 场景列表视图 ==================== -->
    <template v-if="currentView === 'list'">
      <div class="head-box">
        <div class="head-left">
          <img
            class="unscramble-icon"
            src="@renderer/assets/chat-icon/dialogueSettings-icon.png"
            alt=""
          />
          <div>场景选择</div>
        </div>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
      <div class="scene-list-box">
        <div
          v-for="scene in sceneList"
          :key="scene.id"
          class="scene-item"
          :class="{ 'scene-item--selected': selectedSceneId === scene.id }"
          @click="handleSelectScene(scene)"
        >
          <img v-if="scene.image" class="scene-logo" :src="scene.image" alt="">
          <defaultSceneSvg v-else class="scene-logo" />
          <div class="scene-info">
            <div class="scene-title">{{ scene.name }}</div>
            <el-popover
              popper-class="scene-popper"
              :teleported="false"
              placement="bottom-end"
            >
              <template #reference>
                <div class="scene-desc">{{ scene.description }}</div>
              </template>
              <div class="scene-desc-popover">{{ scene.description }}</div>
            </el-popover>
          </div>
          <!-- 自定义场景：编辑/删除操作 -->
          <div v-if="scene.is_customize == 1" class="scene-actions" @click.stop>
            <el-icon class="action-icon edit-icon" @click="handleEditScene(scene)"><Edit /></el-icon>
            <el-icon class="action-icon delete-icon" @click="handleDeleteScene(scene)"><Delete /></el-icon>
          </div>
          <el-icon v-if="selectedSceneId === scene.id" class="scene-check" color="var(--el-color-primary)"><Check /></el-icon>

        </div>
        <!-- 添加自定义场景按钮 -->
        <div class="add-scene-btn" @click="switchToCreate">
          <el-icon><Plus /></el-icon>
          <span>添加自定义场景</span>
        </div>
      </div>
    </template>

    <!-- ==================== 创建自定义场景视图 ==================== -->
    <template v-else>
      <div class="head-box">
        <div class="head-left">
          <el-icon class="back-icon" @click="switchToList"><ArrowLeft /></el-icon>
          <div>{{ editingSceneId ? '编辑场景' : '创建场景' }}</div>
        </div>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
      <div class="content-box">
        <!-- 场景名称 -->
        <div class="content-item">
          <div class="label">场景名称</div>
          <el-input v-model="sceneName" placeholder="请输入场景名称" maxlength="30" show-word-limit />
        </div>
        <!-- 场景描述 -->
        <div class="content-item">
          <div class="label">场景描述</div>
          <el-input
            v-model="sceneDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入场景描述"
            maxlength="200"
            show-word-limit
          />
        </div>
        <!-- 场景Logo -->
        <div class="content-item">
          <div class="label">场景Logo</div>
          <el-upload
            class="scene-cover-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            name="file[]"
            :headers="{ Authorization: token }"
            :on-success="handleLogoSuccess"
          >
          <div class="cover-box">
                <img
                  class="edit-cover-icon"
                  src="@renderer/assets/repository/edit-cover-icon.png"
                  alt=""
                />
                <img v-if="sceneLogo" :src="sceneLogo" class="cover" />
                <defaultSceneSvg v-else class="cover" />
              </div>
          </el-upload>
        </div>

        <div class="divider-line"></div>

        <!-- 以下为参数配置 -->
        <div class="content-item">
          <div class="label">FrequencyPenalty（频率惩罚）</div>
          <el-slider
            v-model="configuration.frequency_penalty"
            size="small"
            :min="-2.0"
            :step="0.1"
            :max="2.0"
            :marks="frequencyPenaltyMarks"
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
          />
        </div>
        <div class="content-item">
          <div class="label">Temperature（温度）</div>
          <el-slider
            v-model="configuration.temperature"
            size="small"
            :min="0"
            :step="0.1"
            :max="1"
            :marks="temperatureMarks"
          />
        </div>
        <div class="content-item">
          <div class="label">TopP（最高频率）</div>
          <el-slider
            v-model="configuration.top_p"
            size="small"
            :min="0"
            :step="0.1"
            :max="1"
            :marks="topPMarks"
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
          />
        </div>
        <div class="content-item switch-item">
          <div class="label">EnableThinking（是否思考）</div>
          <el-switch v-model="configuration.enable_thinking" />
        </div>
        <!-- 保存按钮 -->
        <div class="save-btn-box">
          <el-button type="primary" :loading="saving" @click="handleSaveScene">{{ editingSceneId ? '更新场景' : '保存场景' }}</el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { scene_list, scene_create, scene_update, scene_del } from '@renderer/api/chat'
import { useUserStore } from '@renderer/stores/user'
import defaultSceneSvg from '@renderer/assets/repository/default-scene-svg.svg'
const uploadUrl = import.meta.env.VITE_API_BASE_URL + '/api/common/upload'
const token = computed(() => useUserStore().token)

const handleLogoSuccess = (res) => {
  if (res.data && res.data[0]) {
    sceneLogo.value = res.data[0].url
  }
}

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
      enable_thinking: true,
      scene_id: 0
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
      enable_thinking: true,
      scene_id: 0
    })
  }
})

const emits = defineEmits(['closeSettings', 'change'])

// 当前视图：list | create
const currentView = ref('list')

// 场景列表
const sceneList = ref([])
const selectedSceneId = ref(props.modelConfig.scene_id)
const loading = ref(false)
const saving = ref(false)

// 自定义场景表单
const sceneName = ref('')
const sceneDescription = ref('')
const sceneLogo = ref('')
const editingSceneId = ref(null) // 编辑中的场景ID，null表示新建

// 配置参数（复用现有参数结构）
const configuration = ref({
  frequency_penalty: 0,
  presence_penalty: 0,
  seed: 100,
  temperature: 0.7,
  top_p: 0.5,
  vector_shard_number: 10,
  similarity_threshold: 0.5,
  context_number: 5,
  enable_thinking: true,
  scene_id: 0
})

// ---------- 滑块标记 ----------
const frequencyPenaltyMarks = ref({})
const presencePenaltyMarks = ref({})
const seedMarks = ref({})
const temperatureMarks = ref({})
const topPMarks = ref({})
const vectorShardNumberMarks = ref({})
const similarityThresholdMarks = ref({})
const contextNumberMarks = ref({})

const updateMarks = () => {
  const cfg = props.config
  frequencyPenaltyMarks.value = { '-2': '-2.0', [cfg.frequency_penalty]: '默认', 2: '2.0' }
  presencePenaltyMarks.value = { '-2': '-2.0', [cfg.presence_penalty]: '默认', 2: '2.0' }
  seedMarks.value = { '-1': '-1', [cfg.seed]: '默认', 2048: '2048' }
  temperatureMarks.value = { 0: '0', [cfg.temperature]: '默认', 1: '1' }
  topPMarks.value = { 0: '0', [cfg.top_p]: '默认', 1: '1' }
  vectorShardNumberMarks.value = { 0: '0', [cfg.vector_shard_number]: '默认', 100: '100' }
  similarityThresholdMarks.value = { 0: '0', [cfg.similarity_threshold]: '默认', 1.0: '1.0' }
  contextNumberMarks.value = { 0: '0', [cfg.context_number]: '默认', 30: '30' }
}

watchEffect(() => {
  configuration.value = { ...props.modelConfig }
  selectedSceneId.value = props.modelConfig.scene_id
  updateMarks()
})

// ---------- 接口调用 ----------
// 获取场景列表
const fetchSceneList = async () => {
  loading.value = true
  try {
    const res = await scene_list({})
    if (res.data) {
      sceneList.value = res.data.list || res.data || []
    }
  } catch (err) {
    console.error('获取场景列表失败:', err)
  } finally {
    loading.value = false
  }
}

// ---------- 视图切换 ----------
const switchToCreate = () => {
  // 重置表单为当前配置或默认值
  configuration.value = { ...props.config }
  sceneName.value = ''
  sceneDescription.value = ''
  sceneLogo.value = ''
  editingSceneId.value = null
  updateMarks()
  currentView.value = 'create'
}

const switchToList = () => {
  editingSceneId.value = null
  currentView.value = 'list'
  // 刷新列表
  fetchSceneList()
}

// ---------- 关闭 ----------
const handleClose = () => {
  emits('closeSettings')
}

// ---------- 选择场景 ----------
const handleSelectScene = (scene) => {
  selectedSceneId.value = scene.id
  // 提取配置参数返回，保持与原来 @change 返回的一致
  const configParams = {
    frequency_penalty: scene.params.frequency_penalty ?? props.config.frequency_penalty,
    presence_penalty: scene.params.presence_penalty ?? props.config.presence_penalty,
    seed: scene.params.seed ?? props.config.seed,
    temperature: scene.params.temperature ?? props.config.temperature,
    top_p: scene.params.top_p ?? props.config.top_p,
    vector_shard_number: scene.params.vector_shard_number ?? props.config.vector_shard_number,
    similarity_threshold: scene.params.similarity_threshold ?? props.config.similarity_threshold,
    context_number: scene.params.context_number ?? props.config.context_number,
    enable_thinking: scene.params.enable_thinking ?? props.config.enable_thinking,
    scene_id: scene.id ?? 0
  }
  emits('change', configParams)
  handleClose()
}

// ---------- 编辑场景 ----------
const handleEditScene = (scene) => {
  editingSceneId.value = scene.id
  sceneName.value = scene.name || ''
  sceneDescription.value = scene.description || ''
  sceneLogo.value = scene.image || ''
  configuration.value = {
    frequency_penalty: scene.params.frequency_penalty ?? props.config.frequency_penalty,
    presence_penalty: scene.params.presence_penalty ?? props.config.presence_penalty,
    seed: scene.params.seed ?? props.config.seed,
    temperature: scene.params.temperature ?? props.config.temperature,
    top_p: scene.params.top_p ?? props.config.top_p,
    vector_shard_number: scene.params.vector_shard_number ?? props.config.vector_shard_number,
    similarity_threshold: scene.params.similarity_threshold ?? props.config.similarity_threshold,
    context_number: scene.params.context_number ?? props.config.context_number,
    enable_thinking: scene.params.enable_thinking ?? props.config.enable_thinking
  }
  updateMarks()
  currentView.value = 'create'
}

// ---------- 删除场景 ----------
const handleDeleteScene = async (scene) => {
  try {
    await ElMessageBox.confirm(`确定要删除场景"${scene.name}"吗？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await scene_del({ id: scene.id })
    ElMessage.primary('场景删除成功')
    // 如果删除的是当前选中的场景，清除选中状态
    if (selectedSceneId.value === scene.id) {
      selectedSceneId.value = null
    }
    fetchSceneList()
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除场景失败:', err)
      ElMessage.error('删除场景失败，请重试')
    }
  }
}

// ---------- 保存自定义场景 ----------
const handleSaveScene = async () => {
  if (!sceneName.value.trim()) {
    ElMessage.warning('请输入场景名称')
    return
  }
  saving.value = true
  try {
    const params = {
      name: sceneName.value.trim(),
      description: sceneDescription.value.trim(),
      image: sceneLogo.value.trim(),
      params: {
        ...configuration.value
      }
    }
    if (editingSceneId.value) {
      // 编辑模式
      params.id = editingSceneId.value
      await scene_update(params)
      ElMessage.primary('场景更新成功')
    } else {
      // 新建模式
      await scene_create(params)
      ElMessage.primary('场景创建成功')
    }
    // 成功后返回列表
    switchToList()
  } catch (err) {
    console.error('保存场景失败:', err)
    ElMessage.error('保存场景失败，请重试')
  } finally {
    saving.value = false
  }
}

// ---------- 初始化 ----------
onMounted(() => {
  fetchSceneList()
  updateMarks()
})
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

  // ---------- 头部 ----------
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

      .back-icon {
        margin-right: 8px;
        font-size: 16px;
        cursor: pointer;
        color: var(--default-font-color);
        &:hover {
          color: var(--el-color-primary);
        }
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

  // ---------- 场景列表 ----------
  .scene-list-box {
    box-sizing: border-box;
    overflow-y: auto;
    flex: 1;

    .scene-item {
      display: flex;
      align-items: center;
      padding: 12px 12px;
      margin-bottom: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background: #f5f7fa;
        border-color: #e4e7ed;
      }

      &--selected {
        background: var(--el-color-primary-light-9) !important;
        border-color: var(--el-color-primary) !important;
      }

      .scene-logo {
        flex-shrink: 0;
        margin-right: 12px;
        border-radius: 12px;
        width: 40px;
        height: 40px;
        object-fit: cover;
        color: var(--el-color-primary);
      }

      .scene-info {
        flex: 1;
        min-width: 0;
        position: relative;
        .scene-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--default-font-color);
          line-height: 20px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .scene-desc {
          font-size: 12px;
          color: #909399;
          line-height: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :deep(.scene-popper) {
          max-width: 100%;
          width: auto !important;
          .scene-desc-popover {
            font-size: 12px;
            color: #737475;
            line-height: 18px;
          }
        }
      }

      .scene-check {
        flex-shrink: 0;
        margin-left: 8px;
        font-size: 18px;
      }

      .scene-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
        display: none;
        transition: opacity 0.2s ease, visibility 0.2s ease;

        .action-icon {
          font-size: 18px;
          color: #909399;
          padding: 2px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;

          &.edit-icon:hover {
            color: var(--el-color-primary);
            background: #ecf5ff;
          }

          &.delete-icon:hover {
            color: #f56c6c;
            background: #fef0f0;
          }
        }
      }

      &:hover .scene-actions {
        display: flex;
      }
    }

    .add-scene-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
      margin-top: 4px;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      cursor: pointer;
      color: #909399;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        background: #f5f7fa;
      }

      .el-icon {
        margin-right: 6px;
        font-size: 16px;
      }
    }
  }

  // ---------- 创建场景表单 ----------
  .content-box {
    box-sizing: border-box;
    padding: 0 26px;
    height: calc(100% - 40px);
    overflow-y: auto;

    .divider-line {
      height: 1px;
      background: #ebeef5;
      margin-bottom: 28px;
    }

    .content-item {
      margin-bottom: 28px;
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

      :deep(.el-slider__marks-text) {
        color: var(--default-font-color);
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

    .save-btn-box {
      margin-top: 16px;
      padding-bottom: 16px;
      display: flex;
      justify-content: flex-end;

      .el-button {
        min-width: 100px;
      }
    }

    :deep(.scene-cover-uploader) {
        margin-top: 16px;
        width: 90px;
        height: 90px;
        .el-upload {
          box-sizing: border-box;
          border-radius: 10px;
          border: 1px dashed var(--el-border-color);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: var(--el-transition-duration-fast);
          .cover-box {
            position: relative;
            .edit-cover-icon {
              display: block;
              position: absolute;
              bottom: 4px;
              right: 4px;
              width: 24px;
              height: 24px;
            }
            .cover {
              box-sizing: border-box;
              padding: 10px;
              display: block;
              width: 90px;
              height: 90px;
              border-radius: 12px;
              object-fit: cover;
              color: var(--el-color-primary);
            }
          }
          &:hover {
            border-color: var(--el-color-primary);
          }
        }
      }
  }
}
</style>
