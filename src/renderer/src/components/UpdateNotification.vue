<template>
  <div v-if="showUpdate" class="update-notification">
    <div class="update-content">
      <!-- 头部区域 -->
      <div class="update-header">
        <div class="header-left">
          <el-icon class="header-icon"><Promotion /></el-icon>
          <h3>软件更新</h3>
        </div>
        <el-button
          v-if="!isDownloading && !isReadyToInstall"
          type="text"
          class="close-btn"
          :icon="Close"
          @click="closeUpdate"
        />
      </div>

      <!-- 主体内容 -->
      <div class="update-body">
        <!-- 检查更新状态 -->
        <div v-if="updateStatus === 'checking'" class="update-status">
          <div class="status-icon">
            <el-icon class="loading-icon"><Loading /></el-icon>
          </div>
          <div class="status-content">
            <h4>正在检查更新</h4>
            <p>请稍等，正在为您检查最新版本...</p>
          </div>
        </div>

        <!-- 有可用更新 -->
        <div v-else-if="updateStatus === 'available'" class="update-available">
          <div class="status-icon">
            <el-icon class="update-icon"><Download /></el-icon>
          </div>
          <div class="status-content">
            <h4>发现新版本</h4>
            <p class="version-info">
              版本号: <span class="version">{{ updateInfo?.version }}</span>
            </p>
            <div v-if="updateInfo?.releaseNotes" class="release-notes">
              <p class="notes-title">更新内容:</p>
              <p class="notes-content">{{ updateInfo.releaseNotes }}</p>
            </div>
            <p v-else class="default-notes">新版本包含性能优化和功能改进</p>
          </div>
          <div class="update-actions">
            <el-button
              type="primary"
              size="large"
              :loading="isDownloading"
              class="primary-btn"
              @click="downloadUpdate"
            >
              <template #loading>
                <el-icon class="is-loading"><Loading /></el-icon>
                下载中
              </template>
              <el-icon><Download /></el-icon>
              立即更新
            </el-button>
            <el-button size="large" class="secondary-btn" @click="remindLater">
              稍后提醒
            </el-button>
          </div>
        </div>

        <!-- 下载中 -->
        <div v-else-if="updateStatus === 'downloading'" class="update-downloading">
          <div class="status-icon">
            <el-icon class="download-icon"><Download /></el-icon>
          </div>
          <div class="status-content">
            <h4>正在下载更新</h4>
            <div class="progress-section">
              <el-progress
                :percentage="downloadProgress"
                :stroke-width="8"
                :show-text="false"
                class="custom-progress"
              />
              <div class="progress-info">
                <span class="progress-text">{{ downloadProgress }}%</span>
                <span class="progress-desc">已下载</span>
              </div>
            </div>
          </div>
          <div class="download-actions">
            <el-button
              :disabled="downloadProgress >= 100"
              size="large"
              class="cancel-btn"
              @click="cancelDownload"
            >
              取消下载
            </el-button>
          </div>
        </div>

        <!-- 准备安装 -->
        <div v-else-if="updateStatus === 'ready'" class="update-ready">
          <div class="status-icon">
            <el-icon class="success-icon"><CircleCheck /></el-icon>
          </div>
          <div class="status-content">
            <h4>更新准备就绪</h4>
            <p class="success-message">更新已下载完成，准备安装</p>
            <p class="ready-tip">安装完成后应用将自动重启</p>
          </div>
          <div class="ready-actions">
            <el-button type="primary" size="large" class="install-btn" @click="quitAndInstall">
              <el-icon><RefreshRight /></el-icon>
              立即重启并安装
            </el-button>
            <el-button size="large" class="secondary-btn" @click="installLater">
              稍后安装
            </el-button>
          </div>
        </div>

        <!-- 无更新 -->
        <div v-else-if="updateStatus === 'not-available'" class="update-not-available">
          <div class="status-icon">
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </div>
          <div class="status-content">
            <h4>已是最新版本</h4>
            <p class="current-version">当前版本: {{ currentVersion }}</p>
            <p class="congrats-message">您正在使用最新版本</p>
          </div>
          <div class="not-available-actions">
            <el-button type="primary" size="large" class="primary-btn" @click="closeUpdate">
              确定
            </el-button>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="updateStatus === 'error'" class="update-error">
          <div class="status-icon">
            <el-icon class="error-icon"><CircleClose /></el-icon>
          </div>
          <div class="status-content">
            <h4>检查更新失败</h4>
            <p class="error-detail">{{ errorMessage }}</p>
          </div>
          <div class="error-actions">
            <el-button type="primary" size="large" class="primary-btn" @click="retryCheck">
              <el-icon><Refresh /></el-icon>
              重试
            </el-button>
            <el-button size="large" class="secondary-btn" @click="closeUpdate"> 关闭 </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@renderer/stores/user'
import {
  Close,
  Loading,
  CircleCheck,
  InfoFilled,
  CircleClose,
  Promotion,
  Download,
  RefreshRight,
  Refresh
} from '@element-plus/icons-vue'

const userStore = useUserStore()

// 响应式数据
const showUpdate = ref(false)
const updateStatus = ref('idle') // idle, checking, available, downloading, ready, not-available, error
const updateInfo = ref({
  version: '',
  releaseDate: '',
  releaseNotes: ''
})
const downloadProgress = ref(0)
const isDownloading = ref(false)
const isReadyToInstall = ref(false)
const errorMessage = ref('')
const currentVersion = ref('')
const checkTimeout = ref(null)

// 检查更新 - 事件驱动版本
const checkForUpdates = async (silent = false) => {
  if (!window.customApi?.checkForUpdates) {
    if (!silent) {
      ElMessage.error('更新功能不可用')
    }
    return
  }

  // 重置状态
  resetUpdateState()
  updateStatus.value = 'checking'

  if (!silent) {
    showUpdate.value = true
  }

  try {
    // 清除之前的超时
    if (checkTimeout.value) {
      clearTimeout(checkTimeout.value)
    }

    // 触发检查更新
    await window.customApi.checkForUpdates()
    console.log('已触发更新检查，等待状态通知...')

    // 设置检查超时（15秒）
    checkTimeout.value = setTimeout(() => {
      if (updateStatus.value === 'checking') {
        console.log('更新检查超时，设置为无更新状态')
        updateStatus.value = 'not-available'
        if (!silent) {
          showUpdate.value = true
          // 获取当前版本显示
          getCurrentVersion()
        }
      }
    }, 5000)
  } catch (error) {
    console.error('检查更新失败:', error)
    updateStatus.value = 'error'
    errorMessage.value = error.message || '网络连接失败，请检查网络设置'
    if (!silent) {
      showUpdate.value = true
    }
  }
}

// 下载更新
const downloadUpdate = async () => {
  if (!window.customApi?.downloadUpdate) {
    ElMessage.error('下载功能不可用')
    return
  }

  isDownloading.value = true
  updateStatus.value = 'downloading'
  downloadProgress.value = 0

  try {
    await window.customApi.downloadUpdate()
  } catch (error) {
    console.error('下载更新失败:', error)
    updateStatus.value = 'error'
    errorMessage.value = error.message || '下载失败，请检查网络连接'
    isDownloading.value = false
  }
}

// 取消下载
const cancelDownload = async () => {
  try {
    await ElMessageBox.confirm('确定要取消下载吗？', '取消下载', {
      confirmButtonText: '确定',
      cancelButtonText: '继续下载',
      type: 'warning'
    })

    // 重置状态
    updateStatus.value = 'available'
    isDownloading.value = false
    downloadProgress.value = 0
  } catch {
    // 用户选择继续下载
  }
}

// 重启并安装
const quitAndInstall = async () => {
  if (!window.customApi?.quitAndInstall) {
    ElMessage.error('安装功能不可用')
    return
  }

  try {
    await ElMessageBox.confirm('应用将重启以完成更新，请保存好您的工作', '确认安装', {
      confirmButtonText: '立即重启',
      cancelButtonText: '稍后重启',
      type: 'warning'
    })

    await window.customApi.quitAndInstall()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('安装更新失败:', error)
      ElMessage.error('安装更新失败')
    }
  }
}

// 更新状态监听 - 核心事件处理
const handleUpdateStatus = (event, status) => {
  console.log('收到更新状态:', status)

  // 清除超时定时器
  if (checkTimeout.value) {
    clearTimeout(checkTimeout.value)
    checkTimeout.value = null
  }

  switch (status.stage) {
    case 'available':
      // 有可用更新
      updateStatus.value = 'available'
      updateInfo.value = {
        version: status.version || '',
        releaseDate: status.releaseDate || '',
        releaseNotes: status.releaseNotes || '新版本包含性能优化和功能改进'
      }
      userStore.version = status.version || userStore.version
      ElMessage.info(`发现新版本 ${status.version}`)
      break

    case 'downloading':
      // 下载进度更新
      updateStatus.value = 'downloading'
      downloadProgress.value = Math.round(status.percent || 0)
      break

    case 'downloaded':
      // 下载完成
      updateStatus.value = 'ready'
      isDownloading.value = false
      isReadyToInstall.value = true
      downloadProgress.value = 100
      ElMessage.primary('更新下载完成，准备安装')
      break

    case 'error':
      // 错误处理
      updateStatus.value = 'error'
      errorMessage.value = status.error || '更新过程中出现错误'
      isDownloading.value = false
      ElMessage.error('更新失败: ' + (status.error || '未知错误'))
      break

    default:
      console.warn('未知的更新状态:', status.stage)
  }
}

// 辅助函数
const getCurrentVersion = async () => {
  if (window.customApi?.getAppVersion) {
    try {
      currentVersion.value = await window.customApi.getAppVersion()
    } catch (error) {
      console.error('获取当前版本失败:', error)
      currentVersion.value = '未知'
    }
  }
}

const resetUpdateState = () => {
  updateInfo.value = {
    version: '',
    releaseDate: '',
    releaseNotes: ''
  }
  downloadProgress.value = 0
  isDownloading.value = false
  isReadyToInstall.value = false
  errorMessage.value = ''
}

// 用户交互方法
const remindLater = () => {
  showUpdate.value = false
  updateStatus.value = 'idle'
  // 设置2小时后再次提醒
  setTimeout(
    () => {
      checkForUpdates(true) // 静默检查
    },
    60 * 60 * 1000
  )
}

const installLater = () => {
  showUpdate.value = false
  updateStatus.value = 'idle'
  isReadyToInstall.value = false
}

const closeUpdate = () => {
  showUpdate.value = false
  updateStatus.value = 'idle'
  resetUpdateState()
}

const retryCheck = () => {
  checkForUpdates()
}

// 自动检查更新（应用启动时）
const autoCheckUpdates = () => {
  // 检查上次检查时间，避免频繁检查
  const lastCheck = localStorage.getItem('lastUpdateCheck')
  const now = Date.now()

  if (!lastCheck || now - parseInt(lastCheck) > 60 * 60 * 1000) {
    // 1小时检查一次
    checkForUpdates() // 静默检查
  }
}

// 生命周期
onMounted(() => {
  // 监听更新状态事件
  if (window.customApi?.onUpdateStatus) {
    window.customApi.onUpdateStatus(handleUpdateStatus)
  }

  // 应用启动时自动检查更新
  autoCheckUpdates()
})

onUnmounted(() => {
  // 清理工作
  if (checkTimeout.value) {
    clearTimeout(checkTimeout.value)
  }
  isDownloading.value = false
  isReadyToInstall.value = false
})

// 暴露方法给父组件
defineExpose({
  checkForUpdates,
  showUpdate: showUpdate.value
})
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  animation: fadeIn 0.3s ease-out;
}

.update-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 20px;
  min-width: 480px;
  max-width: 560px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s ease-out;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.update-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--default-font-color);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--el-color-primary);
}

.update-body {
  text-align: center;
}

.status-icon {
  margin-bottom: 20px;
}

.loading-icon,
.update-icon,
.download-icon,
.success-icon,
.info-icon,
.error-icon {
  font-size: 64px;
  padding: 16px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.1);
}

.loading-icon {
  color: var(--el-color-primary);
  animation: rotate 2s linear infinite;
}

.update-icon {
  color: var(--el-color-primary);
  background: rgba(103, 194, 58, 0.1);
}

.download-icon {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.success-icon {
  color: var(--el-color-primary);
  background: rgba(103, 194, 58, 0.1);
}

.info-icon {
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
}

.error-icon {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.status-content {
  margin-bottom: 24px;
}

.status-content h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.status-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.version-info {
  font-size: 15px !important;
  font-weight: 500;
}

.version {
  color: var(--el-color-primary);
  font-weight: 600;
}

.release-notes {
  background: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.notes-title {
  font-weight: 600;
  color: var(--el-color-primary) !important;
  margin-bottom: 8px !important;
}

.notes-content {
  color: #4b5563 !important;
  line-height: 1.6 !important;
}

.default-notes {
  color: #9ca3af !important;
  font-style: italic;
}

.progress-section {
  margin: 20px 0;
}

.custom-progress {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.progress-desc {
  font-size: 14px;
  color: #9ca3af;
}

.success-message {
  color: var(--el-color-primary) !important;
  font-weight: 500;
}

.congrats-message {
  color: var(--el-color-primary) !important;
  font-weight: 500;
}

.ready-tip,
.current-version,
.error-detail {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
}

.error-detail {
  color: #f56c6c !important;
  background: rgba(245, 108, 108, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #f56c6c;
}

.update-actions,
.ready-actions,
.download-actions,
.error-actions,
.not-available-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.primary-btn {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.secondary-btn {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px 24px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  transform: translateY(-1px);
}

.cancel-btn,
.install-btn {
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.install-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 520px) {
  .update-content {
    min-width: 90%;
    margin: 20px;
    padding: 24px;
  }

  .update-actions,
  .ready-actions,
  .download-actions,
  .error-actions,
  .not-available-actions {
    flex-direction: column;
    gap: 8px;
  }

  .status-icon .el-icon {
    font-size: 48px;
  }
}
</style>
