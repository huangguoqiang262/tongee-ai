import { app, globalShortcut, ipcMain } from 'electron'
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
        // 使用preload中暴露的_triggerScreenshotEvent函数
        const dataStr = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
        script = `
          (function() {
            try {
              // 方法1: 使用preload暴露的专用函数（最可靠）
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                window.customApi._triggerScreenshotEvent('${channel}', ${dataStr});
                return true;
              }
              // 方法2: 直接调用已注册的监听器
              if (window.customApi && window.customApi._screenshotListener) {
                window.customApi._screenshotListener(null, ${dataStr});
                return true;
              }
              // 方法3: 触发IPC事件监听器（通过模拟ipcRenderer事件）
              if (window.ipcRenderer && window.ipcRenderer.emit) {
                window.ipcRenderer.emit('${channel}', null, ${dataStr});
              }
              // 方法4: 触发自定义事件
              if (window.dispatchEvent) {
                const event = new CustomEvent('${channel}', { detail: ${dataStr} });
                window.dispatchEvent(event);
              }
              return true;
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
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                window.customApi._triggerScreenshotEvent('${channel}', ${dataStr});
              }
              if (window.ipcRenderer && window.ipcRenderer.emit) {
                window.ipcRenderer.emit('${channel}', null, ${dataStr});
              }
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('${channel}', { detail: ${dataStr} }));
              }
              return true;
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
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                window.customApi._triggerScreenshotEvent('${channel}', null);
              }
              if (window.ipcRenderer && window.ipcRenderer.emit) {
                window.ipcRenderer.emit('${channel}', null);
              }
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('${channel}'));
              }
              return true;
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
  }

  // 主发送函数
  const sendMessage = () => {
    // 先恢复焦点
    restoreFocus()

    if (process.platform === 'darwin') {
      // Mac上使用双重保障：同时使用IPC和JS方法
      // 先尝试IPC
      const ipcSuccess = sendViaIPC()

      // 无论IPC是否成功，都使用JS方法作为保障（更可靠）
      setTimeout(() => {
        sendViaJS()
      }, 50)

      // 如果IPC失败，等待窗口焦点后再重试
      if (!ipcSuccess) {
        const onFocus = () => {
          global.mainWindow.removeListener('focus', onFocus)
          setTimeout(() => {
            sendViaIPC()
            sendViaJS()
          }, 100)
        }

        if (global.mainWindow.isFocused()) {
          setTimeout(() => {
            sendViaIPC()
            sendViaJS()
          }, 100)
        } else {
          global.mainWindow.once('focus', onFocus)
          // 超时后强制发送
          setTimeout(() => {
            global.mainWindow.removeListener('focus', onFocus)
            sendViaIPC()
            sendViaJS()
          }, 2000)
        }
      }
    } else {
      // 非Mac平台直接发送
      sendViaIPC()
    }
  }

  // 在Mac上，需要延迟以确保截图窗口完全关闭
  if (process.platform === 'darwin') {
    setTimeout(() => sendMessage(), delay || 400)
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
    ensureFocusAndSend('screenshot-ok', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 400 : 150)
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-save', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 400 : 150)
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
