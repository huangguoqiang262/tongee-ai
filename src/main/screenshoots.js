import { app, globalShortcut, ipcMain } from 'electron'
import Screenshots from 'electron-screenshots'

// 辅助函数：确保窗口获得焦点并发送消息（Mac平台特殊处理）
const ensureFocusAndSend = (channel, data = null, delay = 0) => {
  if (!global.mainWindow || global.mainWindow.isDestroyed()) {
    return
  }

  const sendMessage = () => {
    // 在Mac上，需要特殊处理以确保应用和窗口都获得焦点
    if (process.platform === 'darwin') {
      // 先显示应用（如果应用在后台）
      app.show()
    }

    // 确保窗口可见并获得焦点
    if (!global.mainWindow.isVisible()) {
      global.mainWindow.show()
    }
    // 聚焦窗口（在Mac上这会同时激活应用）
    global.mainWindow.focus()

    // 发送消息到渲染进程
    if (data !== null) {
      global.mainWindow.webContents.send(channel, data)
    } else {
      global.mainWindow.webContents.send(channel)
    }
  }

  // 在Mac上，需要延迟以确保窗口完全获得焦点
  // 特别是在截取应用外内容后，窗口可能处于后台状态
  // 延迟时间可以根据实际情况调整（100-200ms通常足够）
  if (process.platform === 'darwin') {
    setTimeout(sendMessage, delay || 150)
  } else {
    sendMessage()
  }
}

export const initScreenshoots = () => {
  const screenshots = new Screenshots({ quality: 80 })
  ipcMain.on('trigger-screenshot', () => {
    // 触发截图功能
    screenshots.startCapture()
    if (global.mainWindow) {
      global.mainWindow.webContents.send('screenshot-start')
    }
  })
  // 注册截图快捷键
  globalShortcut.register('Alt+J', () => {
    screenshots.startCapture()
    // 发送截图开始事件到渲染进程
    if (global.mainWindow) {
      global.mainWindow.webContents.send('screenshot-start')
    }
  })

  // 点击确定按钮回调事件
  screenshots.on('ok', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-ok', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, 150)
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-save', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, 150)
  })
  // 截图取消事件
  screenshots.on('cancel', () => {
    // 发送取消事件到渲染进程
    ensureFocusAndSend('screenshot-cancel', null, 100)
  })
  // esc取消
  globalShortcut.register('esc', () => {
    if (screenshots.$win?.isFocused()) {
      screenshots.endCapture()
      // 发送取消事件到渲染进程
      ensureFocusAndSend('screenshot-cancel', null, 100)
    }
  })
}
