import { app, globalShortcut, ipcMain } from 'electron'
import Screenshots from 'electron-screenshots'

// 辅助函数：确保窗口获得焦点并发送消息（Mac平台特殊处理）
const ensureFocusAndSend = (channel, data = null, delay = 0) => {
  if (!global.mainWindow || global.mainWindow.isDestroyed()) {
    return
  }

  // 发送消息的核心函数
  const sendViaIPC = () => {
    try {
      if (global.mainWindow.webContents.isDestroyed()) {
        return false
      }
      if (data !== null) {
        global.mainWindow.webContents.send(channel, data)
      } else {
        global.mainWindow.webContents.send(channel)
      }
      return true
    } catch (error) {
      console.error('IPC发送失败:', error)
      return false
    }
  }

  // 使用executeJavaScript直接调用监听器（更可靠的方法）
  const sendViaJS = () => {
    try {
      if (global.mainWindow.webContents.isDestroyed()) {
        return false
      }

      // 构建JavaScript代码来直接触发监听器
      let script = ''

      if (channel === 'screenshot-ok' && data !== null) {
        // 使用preload中暴露的_triggerScreenshotEvent函数（只触发监听器，不触发IPC）
        const dataStr = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
        script = `
          (function() {
            try {
              // 只使用_triggerScreenshotEvent，它会直接调用监听器而不触发IPC事件
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                window.customApi._triggerScreenshotEvent('${channel}', ${dataStr});
                return true;
              }
              // 备选：直接调用已注册的监听器
              if (window.customApi && window.customApi._screenshotListener) {
                window.customApi._screenshotListener(null, ${dataStr});
                return true;
              }
              return false;
            } catch(e) {
              console.error('执行截图回调失败:', e);
              return false;
            }
          })();
        `
      } else if (channel === 'screenshot-save' && data !== null) {
        const dataStr = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
        script = `
          (function() {
            try {
              // 对于save和cancel事件，直接触发IPC事件（因为这些事件通常只有IPC监听器）
              if (window.ipcRenderer && window.ipcRenderer.emit) {
                window.ipcRenderer.emit('${channel}', null, ${dataStr});
                return true;
              }
              return false;
            } catch(e) {
              console.error('执行截图保存回调失败:', e);
              return false;
            }
          })();
        `
      } else if (channel === 'screenshot-cancel') {
        script = `
          (function() {
            try {
              // 对于cancel事件，直接触发IPC事件
              if (window.ipcRenderer && window.ipcRenderer.emit) {
                window.ipcRenderer.emit('${channel}', null);
                return true;
              }
              return false;
            } catch(e) {
              console.error('执行截图取消回调失败:', e);
              return false;
            }
          })();
        `
      }

      if (script) {
        global.mainWindow.webContents.executeJavaScript(script).catch(err => {
          console.error('executeJavaScript执行失败:', err)
        })
        return true
      }
      return false
    } catch (error) {
      console.error('JS发送失败:', error)
      return false
    }
  }

  // 恢复窗口焦点
  const restoreFocus = () => {
    if (process.platform === 'darwin') {
      // Mac上先激活应用
      app.show()
    }

    // 确保窗口可见
    if (!global.mainWindow.isVisible()) {
      global.mainWindow.show()
    }

    // 聚焦窗口
    global.mainWindow.focus()

    // Mac上额外操作：确保窗口在最前面
    if (process.platform === 'darwin') {
      global.mainWindow.moveTop()
    }
  }

  // 主发送函数
  const sendMessage = () => {
    // 先恢复焦点
    restoreFocus()

    if (process.platform === 'darwin') {
      // Mac上：同时使用IPC和JS方法，通过去重机制避免重复触发
      // 这是因为当截图区域超过应用窗口时，IPC可能无法送达，但不会抛出异常
      // 所以我们需要同时使用两种方法，确保消息能够送达

      // 先尝试IPC
      sendViaIPC()

      // 无论IPC是否成功，都使用JS方法作为保障
      // 去重机制会确保即使两种方法都触发，也只处理一次
      const trySendViaJS = () => {
        setTimeout(() => {
          sendViaJS()
        }, 150) // 稍微延迟，让IPC先尝试
      }

      if (global.mainWindow.isFocused()) {
        trySendViaJS()
      } else {
        const onFocus = () => {
          global.mainWindow.removeListener('focus', onFocus)
          trySendViaJS()
        }
        global.mainWindow.once('focus', onFocus)
        // 超时后强制发送
        setTimeout(() => {
          global.mainWindow.removeListener('focus', onFocus)
          trySendViaJS()
        }, 2000)
      }
    } else {
      // 非Mac平台直接发送
      sendViaIPC()
    }
  }

  // 在Mac上，需要延迟以确保截图窗口完全关闭
  // 当截图区域超过应用窗口时，需要更长的延迟来确保窗口恢复焦点
  if (process.platform === 'darwin') {
    setTimeout(() => sendMessage(), delay || 500)
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
    // 在Mac上截取应用外内容时，需要更长的延迟来确保窗口恢复焦点
    // 使用较长的延迟（500ms）确保截图窗口完全关闭
    ensureFocusAndSend('screenshot-ok', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 500 : 150)
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-save', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 500 : 150)
  })

  // 截图取消事件
  screenshots.on('cancel', () => {
    // 发送取消事件到渲染进程
    ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 200 : 100)
  })

  // esc取消
  globalShortcut.register('esc', () => {
    if (screenshots.$win?.isFocused()) {
      screenshots.endCapture()
      // 发送取消事件到渲染进程
      ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 200 : 100)
    }
  })
}
