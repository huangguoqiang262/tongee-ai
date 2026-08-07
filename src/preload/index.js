import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
ipcRenderer.on('main-window-new-window', (e, details) => {
  // 发送自定义事件到页面
  window.dispatchEvent(
    new CustomEvent('main-window-new-window', {
      detail: details
    })
  )
})
ipcRenderer.on('webview-new-window', (e, webContentsId, details) => {
  const webview = document.getElementById('webview')
  webview.dispatchEvent(
    new CustomEvent('new-window', {
      detail: {
        ...details
      }
    })
  )
})
// Custom APIs for renderer
const customApi = {
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', callback)
  },
  triggerScreenshot: () => ipcRenderer.send('trigger-screenshot'),
  onScreenshotStart: (callback) => ipcRenderer.on('screenshot-start', callback),
  _screenshotListener: null,
  _lastScreenshotData: null, // 用于去重
  _lastScreenshotTime: 0,
  onScreenshotOk: (callback) => {
    // 先移除旧的监听器
    if (customApi._screenshotListener) {
      ipcRenderer.removeListener('screenshot-ok', customApi._screenshotListener)
    }
    // 创建新的监听器（带去重机制）
    customApi._screenshotListener = (event, data) => {
      // 去重：如果数据相同且时间间隔很短（500ms内），认为是重复触发，只处理一次
      const now = Date.now()
      const dataStr = JSON.stringify(data)
      if (customApi._lastScreenshotData === dataStr && now - customApi._lastScreenshotTime < 500) {
        console.log('检测到重复的截图事件，已忽略')
        return
      }
      customApi._lastScreenshotData = dataStr
      customApi._lastScreenshotTime = now
      callback(event, data)
    }
    ipcRenderer.on('screenshot-ok', customApi._screenshotListener)
  },
  // 直接触发截图事件的函数（用于Mac平台，当IPC失败时）
  // 注意：这个函数只应该在没有IPC成功时使用，避免重复触发
  _triggerScreenshotEvent: (channel, data) => {
    try {
      // 只触发已注册的监听器，不触发IPC事件（避免与IPC重复）
      // 监听器内部已经有去重机制
      if (channel === 'screenshot-ok' && customApi._screenshotListener) {
        customApi._screenshotListener(null, data)
        return true
      }
      // 对于其他事件，触发IPC事件（因为这些事件可能没有专门的监听器）
      if (channel !== 'screenshot-ok') {
        ipcRenderer.emit(channel, null, data)
        return true
      }
      return false
    } catch (error) {
      console.error('触发截图事件失败:', error)
      return false
    }
  },
  onScreenshotSave: (callback) => ipcRenderer.on('screenshot-save', callback),
  onScreenshotCancel: (callback) => ipcRenderer.on('screenshot-cancel', callback),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-install'),
  clearUpdateCache: () => ipcRenderer.invoke('clear-update-cache'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  checkScreenRecordingPermission: () => ipcRenderer.invoke('check-screen-recording-permission'),
  // ... existing code ...
  // ... existing code ...
  readDir: (dirPath, maxDepth = 10) => {
    return new Promise((resolve, reject) => {
      const buildDirectoryTree = async (dir, currentDepth = 0) => {
        if (currentDepth > maxDepth) {
          return {
            name: path.basename(dir),
            path: dir,
            type: 'directory',
            children: [],
            fileCount: 0, // 文件总数为0
            truncated: true // 标记被截断
          }
        }

        try {
          const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
          const tree = {
            name: path.basename(dir),
            path: dir,
            type: 'directory',
            children: [],
            fileCount: 0 // 初始化文件总数
          }

          let currentDirFileCount = 0

          for (const dirent of dirents) {
            const fullPath = path.join(dir, dirent.name)

            if (dirent.isDirectory()) {
              const subTree = await buildDirectoryTree(fullPath, currentDepth + 1)
              tree.children.push(subTree)
              // 累加子目录的文件总数
              tree.fileCount += subTree.fileCount
            } else if (dirent.isFile()) {
              // 检查文件扩展名，只添加允许的文件类型
              const allowedExts = [
                '.doc',
                '.xls',
                '.xlsx',
                '.pdf',
                '.txt',
                '.docx',
                '.ppt',
                '.pptx',
                '.png',
                '.jpg',
                '.jpeg',
                '.gif'
              ]
              const fileExt = path.extname(dirent.name).toLowerCase()

              if (allowedExts.includes(fileExt)) {
                try {
                  const stats = await fs.promises.stat(fullPath)
                  tree.children.push({
                    name: dirent.name,
                    path: fullPath,
                    type: 'file',
                    size: stats.size,
                    modified: stats.mtime,
                    extension: fileExt
                  })
                  // 当前目录文件计数增加
                  currentDirFileCount++
                } catch (statError) {
                  console.log(statError)

                  // 如果获取文件信息失败，只添加基本信息
                  // tree.children.push({
                  //   name: dirent.name,
                  //   path: fullPath,
                  //   type: 'file',
                  //   extension: fileExt
                  // })
                  // // 当前目录文件计数增加
                  // currentDirFileCount++
                }
              }
            }
          }

          // 累加当前目录的文件数到总文件数
          tree.fileCount += currentDirFileCount

          return tree
        } catch (error) {
          console.error(`读取目录 ${dir} 失败:`, error)
          return {
            name: path.basename(dir),
            path: dir,
            type: 'directory',
            children: [],
            fileCount: 0, // 错误情况下文件总数为0
            error: error.message
          }
        }
      }

      buildDirectoryTree(dirPath)
        .then((tree) => resolve(tree))
        .catch((error) => reject(error))
    })
  },
  // 主进程处理函数修改
  readFileAsFileObject: async (filePath) => {
    try {
      const buffer = await fs.promises.readFile(filePath)
      const stats = await fs.promises.stat(filePath)

      return {
        // 传递可序列化的元数据
        meta: {
          name: path.basename(filePath),
          type: mime.lookup(filePath) || 'application/octet-stream',
          size: stats.size,
          lastModified: stats.mtimeMs
        },
        arrayBuffer: buffer.buffer
      }
    } catch (error) {
      console.error('文件读取失败:', error)
      return null
    }
  },
  joinPath: (...args) => path.join(...args),
  // 标签管理
  createTab: (url) => ipcRenderer.invoke('create-tab', url),
  closeTab: (tabId) => ipcRenderer.send('close-tab', tabId),
  switchTab: (tabId) => ipcRenderer.send('switch-tab', tabId),
  updateTab: (tabId, props) => ipcRenderer.send('update-tab', tabId, props),
  detachTab: (tabData) => ipcRenderer.invoke('detach-tab', tabData),

  // 窗口控制
  maximize: () => ipcRenderer.send('maximize-window'),
  minimize: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // 事件监听
  onTabUpdated: (callback) => ipcRenderer.on('tab-updated', callback),
  onTabActivated: (callback) => ipcRenderer.on('tab-activated', callback),

  // 右键菜单
  showTabMenu: (options) => ipcRenderer.send('show-tab-menu', options),
  showWindowMenu: (options) => ipcRenderer.send('show-window-menu', options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('customApi', customApi)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.customApi = customApi
}
