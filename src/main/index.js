import { app, shell, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import { join } from 'path'
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
    width: 1060, // 初始宽度
    height: 800, // 初始高度
    minWidth: 1060, // 最小宽度
    minHeight: 800, // 最小高度
    show: false,
    autoHideMenuBar: true,
    icon: is.dev
      ? join(__dirname, '../../build/icon.ico')
      : join(process.resourcesPath, 'build/icon.ico'), // 修改此行
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false, // 禁用 nodeIntegration
      contextIsolation: true, // 启用上下文隔离
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
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
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.tongee.ai')
  // 创建系统托盘
  if (!tray) {
    const iconPath = is.dev
        ? join(__dirname, '../../build/icon.ico')
        : join(process.resourcesPath, 'build/icon.ico'), // 修改此行
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
  }
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
