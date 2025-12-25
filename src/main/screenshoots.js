import { globalShortcut, ipcMain } from 'electron'
import Screenshots from 'electron-screenshots'

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
    if (global.mainWindow) {
      global.mainWindow.focus()
      global.mainWindow.webContents.send('screenshot-ok', {
        buffer: buffer.toString('base64'),
        bounds: bounds
      })
    }
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    if (global.mainWindow) {
      global.mainWindow.webContents.send('screenshot-save', {
        buffer: buffer.toString('base64'),
        bounds: bounds
      })
    }
  })
  // 截图取消事件
  screenshots.on('cancel', () => {
    // 发送取消事件到渲染进程
    if (global.mainWindow) {
      global.mainWindow.webContents.send('screenshot-cancel')
    }
  })
  // esc取消
  globalShortcut.register('esc', () => {
    if (screenshots.$win?.isFocused()) {
      screenshots.endCapture()
      // 发送取消事件到渲染进程
      if (global.mainWindow) {
        global.mainWindow.webContents.send('screenshot-cancel')
      }
    }
  })
}
