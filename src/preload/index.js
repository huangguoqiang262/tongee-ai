import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
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
  onScreenshotOk: (callback) => {
    // 先移除旧的监听器
    if (customApi._screenshotListener) {
      ipcRenderer.removeListener('screenshot-ok', customApi._screenshotListener)
    }
    // 创建新的监听器
    customApi._screenshotListener = (event, data) => {
      callback(event, data)
    }
    ipcRenderer.on('screenshot-ok', customApi._screenshotListener)
  },
  onScreenshotSave: (callback) => ipcRenderer.on('screenshot-save', callback),
  onScreenshotCancel: (callback) => ipcRenderer.on('screenshot-cancel', callback),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-install'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
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
