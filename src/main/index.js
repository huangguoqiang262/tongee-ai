import { app, BrowserWindow, ipcMain, Tray, Menu, MenuItem, protocol, dialog } from 'electron'
// 在文件顶部添加导入
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
let mainWindow = null // 全局窗口变量
let tray = null // 托盘实例变量
const gotTheLock = app.requestSingleInstanceLock()
// 新增多开限制逻辑（必须在协议注册前添加）
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // 当第二个实例启动时，激活现有窗口
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow()
    } else {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
}
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1260, // 初始宽度
    height: 800, // 初始高度
    minWidth: 1260, // 最小宽度
    minHeight: 800, // 最小高度
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: 'rgba(0,0,0,0)',
    ...(process.platform !== 'darwin'
      ? {
          titleBarOverlay: {
            color: 'rgba(0,0,0,0)',
            height: 52,
            symbolColor: 'black'
          }
        }
      : {}),
    autoHideMenuBar: true,
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false, // 禁用 nodeIntegration
      contextIsolation: true, // 启用上下文隔离
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      webgl: true,
      experimentalFeatures: true
    }
  })
  global.mainWindow = mainWindow
  // 打开控制台
  // mainWindow.webContents.openDevTools()
  // // 点击关闭按钮最小化到托盘
  // mainWindow.on('close', (event) => {
  //   // 阻止窗口默认关闭行为
  //   event.preventDefault()
  //   // 隐藏主窗口
  //   mainWindow.hide()
  //   // 显示系统托盘提示
  //   if (tray) tray.displayBalloon({ title: '应用已最小化', content: '点击托盘图标恢复窗口' })
  // })
  // 配置通过特殊按键ALT+SHIFT+F12打开开发者工具
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.alt && input.shift) {
      event.preventDefault()
      mainWindow.webContents.openDevTools()
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    mainWindow.webContents.send('main-window-new-window', details)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('did-attach-webview', (event, wc) => {
    wc.setWindowOpenHandler((details) => {
      mainWindow.webContents.send('webview-new-window', wc.id, details)
      return { action: 'deny' }
    })
  })
  // 添加快捷键监听
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((process.platform === 'darwin' ? input.meta : input.alt) && input.key === 'j') {
      event.preventDefault()
      // 触发截图
      mainWindow.webContents.send('trigger-screenshot')
    }
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('context-menu', (event, params) => {
    // 创建自定义右键菜单
    const menu = new Menu()
    // 添加粘贴选项
    if (params.isEditable) {
      menu.append(
        new MenuItem({
          label: '粘贴',
          role: 'paste' // 使用内置的粘贴功能
        })
      )
    }

    // 添加其他常用选项
    menu.append(
      new MenuItem({
        label: '复制',
        role: 'copy', // 使用内置的复制功能
        enabled: !!params.selectionText // 仅当有选中文本时启用
      })
    )
    menu.append(
      new MenuItem({
        label: '剪切',
        role: 'cut', // 使用内置的剪切功能
        enabled: !!params.selectionText // 仅当有选中文本时启用
      })
    )

    // 显示菜单
    menu.popup({ window: mainWindow })
  })
}
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// 监听 open-directory-dialog 事件
ipcMain.handle('open-directory-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!canceled) {
    return filePaths[0]
  }
  return null
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  initScreenshoots()
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.tongee.ai')
  // 创建系统托盘
  if (!tray) {
    const iconPath = is.dev
        ? join(__dirname, '../../build/icon.png')
        : join(process.resourcesPath, 'build/icon.png'), // 修改此行
      tray = new Tray(iconPath)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示窗口',
        click: () => {
          if (!mainWindow || mainWindow.isDestroyed()) {
            createWindow() // 窗口不存在时重新创建
            return
          }
          mainWindow.show()
        }
      },
      {
        label: '退出应用',
        click: () => {
          app.quit()
        }
      }
    ])
    tray.setToolTip('糖吉AI')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
      // 添加窗口状态检查
      if (!mainWindow || mainWindow.isDestroyed()) {
        createWindow() // 窗口不存在时重新创建
        return
      }

      // 安全操作窗口显示状态
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })
  }
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://192.168.1.187:3000/updates',
    channel: 'latest' // 明确指定更新通道
  })
  autoUpdater.requestHeaders = { insecure: 'true' } // 跳过证书验证
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.autoDownload = false
  let updateRetryCount = 0
  const maxUpdateRetries = 3
  const updaterCacheDir = join(app.getPath('userData'), 'tongee-app-updater')
  // 更新事件处理
  autoUpdater.on('update-available', ({ version }) => {
    mainWindow.webContents.send('update-status', {
      stage: 'available',
      version
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update-status', {
      stage: 'downloading',
      percent: progress.percent.toFixed(1),
      bytesPerSecond: (progress.bytesPerSecond / 1024).toFixed(0),
      transferred: (progress.transferred / 1024 / 1024).toFixed(1),
      total: (progress.total / 1024 / 1024).toFixed(1)
    })
  })

  autoUpdater.on('update-downloaded', () => {
    updateRetryCount = 0 // 重置重试计数
    mainWindow.webContents.send('update-status', {
      stage: 'downloaded'
    })
  })

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error)
    if (updateRetryCount < maxUpdateRetries) {
      updateRetryCount++
      console.log(`Retrying update download (${updateRetryCount}/${maxUpdateRetries})`)
      // 清空缓存目录中的下载文件
      try {
        if (fs.existsSync(updaterCacheDir)) {
          const files = fs.readdirSync(updaterCacheDir)
          files.forEach(file => {
            const filePath = join(updaterCacheDir, file)
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath)
            }
          })
        }
      } catch (err) {
        console.error('Error clearing cache:', err)
      }
      setTimeout(() => {
        autoUpdater.downloadUpdate()
      }, 2000) // 2秒后重试
    } else {
      mainWindow.webContents.send('update-status', {
        stage: 'error',
        error: error.message
      })
    }
  })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
    }
    // 不直接退出，保留托盘图标
    mainWindow = null
    global.mainWindow = mainWindow
  }
})
// 添加 IPC 处理
ipcMain.handle('check-updates', async () => {
  return autoUpdater.checkForUpdates()
})

ipcMain.handle('download-update', async () => {
  autoUpdater.downloadUpdate()
})

ipcMain.handle('quit-install', async () => {
  app.isQuitting = true
  autoUpdater.quitAndInstall()
})
ipcMain.handle('get-app-version', async () => {
  return app.getVersion()
})
if (process.platform === 'win32') {
  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
} else {
  process.on('SIGTERM', () => {
    app.quit()
  })
}
app.on('before-quit', () => {
  app.isQuitting = true
  // 退出时销毁托盘实例
  if (tray) {
    tray.destroy()
  }
})
import { initScreenshoots } from './screenshoots'
