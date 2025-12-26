import { app, globalShortcut, ipcMain } from 'electron'
import Screenshots from 'electron-screenshots'

// 辅助函数：确保窗口获得焦点并发送消息（Mac平台特殊处理）
const ensureFocusAndSend = (channel, data = null, delay = 0) => {
  if (!global.mainWindow || global.mainWindow.isDestroyed()) {
    return
  }

  // 使用executeJavaScript直接调用监听器（Mac上唯一可靠的方法）
  const sendViaJS = (retryCount = 0) => {
    try {
      if (global.mainWindow.webContents.isDestroyed()) {
        console.error('webContents已被销毁')
        return false
      }

      // 检查webContents是否准备好
      if (!global.mainWindow.webContents.isLoading() && global.mainWindow.webContents.getURL()) {
        // webContents已准备好，可以执行JS
      } else {
        console.log('webContents未准备好，等待...')
        if (retryCount < 5) {
          setTimeout(() => sendViaJS(retryCount + 1), 200)
          return false
        }
      }

      // 构建JavaScript代码来直接触发监听器
      let script = ''

      if (channel === 'screenshot-ok' && data !== null) {
        // 使用preload中暴露的_triggerScreenshotEvent函数
        const dataStr = JSON.stringify(data).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
        script = `
          (function() {
            try {
              console.log('开始执行截图回调JS');
              // 方法1: 使用preload暴露的专用函数（最可靠）
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                console.log('使用_triggerScreenshotEvent');
                window.customApi._triggerScreenshotEvent('${channel}', ${dataStr});
                return true;
              }
              // 方法2: 直接调用已注册的监听器
              if (window.customApi && window.customApi._screenshotListener) {
                console.log('直接调用_screenshotListener');
                window.customApi._screenshotListener(null, ${dataStr});
                return true;
              }
              console.warn('未找到截图监听器');
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
        global.mainWindow.webContents.executeJavaScript(script)
          .then((result) => {
            console.log(`JS执行成功: ${channel}`, result)
          })
          .catch((err) => {
            console.error('executeJavaScript执行失败:', err)
            // 如果失败且还有重试次数，则重试
            if (retryCount < 3) {
              setTimeout(() => sendViaJS(retryCount + 1), 300)
            }
          })
        return true
      }
      return false
    } catch (error) {
      console.error('JS发送失败:', error)
      if (retryCount < 3) {
        setTimeout(() => sendViaJS(retryCount + 1), 300)
      }
      return false
    }
  }

  // 恢复窗口焦点（Mac上需要更激进的策略）
  const restoreFocus = (callback) => {
    if (process.platform === 'darwin') {
      // Mac上先激活应用
      app.show()

      // 确保窗口可见
      if (!global.mainWindow.isVisible()) {
        global.mainWindow.show()
      }

      // 聚焦窗口
      global.mainWindow.focus()
      global.mainWindow.moveTop()

      // 等待窗口真正获得焦点
      const checkFocus = (attempts = 0) => {
        if (global.mainWindow.isFocused() && global.mainWindow.isVisible()) {
          // 窗口已获得焦点，再等待一小段时间确保稳定
          setTimeout(() => {
            callback()
          }, 200)
        } else if (attempts < 10) {
          // 继续尝试
          setTimeout(() => {
            global.mainWindow.focus()
            global.mainWindow.moveTop()
            checkFocus(attempts + 1)
          }, 100)
        } else {
          // 超时，直接执行
          console.warn('窗口焦点恢复超时，强制执行')
          callback()
        }
      }

      checkFocus()
    } else {
      // 非Mac平台
      if (!global.mainWindow.isVisible()) {
        global.mainWindow.show()
      }
      global.mainWindow.focus()
      callback()
    }
  }

  // 主发送函数
  const sendMessage = () => {
    if (process.platform === 'darwin') {
      // Mac上：完全依赖JS方法，等待窗口恢复焦点后再执行
      restoreFocus(() => {
        // 窗口已恢复焦点，执行JS方法
        sendViaJS()
      })
    } else {
      // 非Mac平台：先尝试IPC，失败则使用JS
      try {
        if (!global.mainWindow.webContents.isDestroyed()) {
          if (data !== null) {
            global.mainWindow.webContents.send(channel, data)
          } else {
            global.mainWindow.webContents.send(channel)
          }
        }
      } catch (error) {
        console.error('IPC发送失败，使用JS方法:', error)
        sendViaJS()
      }
    }
  }

  // 在Mac上，需要延迟以确保截图窗口完全关闭
  // 当截图区域超过应用窗口时，需要更长的延迟
  if (process.platform === 'darwin') {
    setTimeout(() => sendMessage(), delay || 600)
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
    }, process.platform === 'darwin' ? 600 : 150)
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-save', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 600 : 150)
  })

  // 截图取消事件
  screenshots.on('cancel', () => {
    // 发送取消事件到渲染进程
    ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 300 : 100)
  })

  // esc取消
  globalShortcut.register('esc', () => {
    if (screenshots.$win?.isFocused()) {
      screenshots.endCapture()
      // 发送取消事件到渲染进程
      ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 300 : 100)
    }
  })
}
