import { app, globalShortcut, ipcMain } from 'electron'
import Screenshots from 'electron-screenshots'

// 辅助函数：确保窗口获得焦点并发送消息（Mac平台特殊处理）
const ensureFocusAndSend = (channel, data = null, delay = 0) => {
  if (!global.mainWindow || global.mainWindow.isDestroyed()) {
    console.error('主窗口不存在或已销毁')
    return
  }

  // IPC发送方法（作为备选）
  const sendViaIPC = () => {
    try {
      if (global.mainWindow.webContents.isDestroyed()) {
        return false
      }
      if (data !== null) {
        global.mainWindow.webContents.send(channel, data)
        console.log(`IPC发送成功: ${channel}`)
        return true
      } else {
        global.mainWindow.webContents.send(channel)
        console.log(`IPC发送成功: ${channel}`)
        return true
      }
    } catch (error) {
      console.error('IPC发送失败:', error)
      return false
    }
  }

  // 使用executeJavaScript直接调用监听器（Mac上最可靠的方法）
  const sendViaJS = (retryCount = 0) => {
    try {
      if (global.mainWindow.webContents.isDestroyed()) {
        console.error('webContents已被销毁')
        return false
      }

      // 检查webContents是否准备好
      const url = global.mainWindow.webContents.getURL()
      if (!url || url === 'about:blank') {
        console.log('webContents未准备好，等待...')
        if (retryCount < 10) {
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
              console.log('[截图] 开始执行截图回调JS');
              // 方法1: 使用preload暴露的专用函数（最可靠）
              if (window.customApi && window.customApi._triggerScreenshotEvent) {
                console.log('[截图] 使用_triggerScreenshotEvent');
                const result = window.customApi._triggerScreenshotEvent('${channel}', ${dataStr});
                if (result) {
                  console.log('[截图] _triggerScreenshotEvent执行成功');
                  return true;
                }
              }
              // 方法2: 直接调用已注册的监听器
              if (window.customApi && window.customApi._screenshotListener) {
                console.log('[截图] 直接调用_screenshotListener');
                window.customApi._screenshotListener(null, ${dataStr});
                console.log('[截图] _screenshotListener执行成功');
                return true;
              }
              console.warn('[截图] 未找到截图监听器');
              return false;
            } catch(e) {
              console.error('[截图] 执行截图回调失败:', e);
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
            console.log(`[截图] JS执行成功: ${channel}`, result)
          })
          .catch((err) => {
            console.error('[截图] executeJavaScript执行失败:', err)
            // 如果失败且还有重试次数，则重试
            if (retryCount < 5) {
              console.log(`[截图] 重试JS执行 (${retryCount + 1}/5)`)
              setTimeout(() => sendViaJS(retryCount + 1), 300)
            } else {
              console.error('[截图] JS执行失败，尝试使用IPC方法')
              // JS方法失败，尝试IPC方法
              sendViaIPC()
            }
          })
        return true
      }
      return false
    } catch (error) {
      console.error('[截图] JS发送失败:', error)
      if (retryCount < 5) {
        setTimeout(() => sendViaJS(retryCount + 1), 300)
      } else {
        // JS方法失败，尝试IPC方法
        sendViaIPC()
      }
      return false
    }
  }

  // 恢复窗口焦点（Mac上需要更激进的策略）
  const restoreFocus = (callback) => {
    if (process.platform === 'darwin') {
      console.log('[截图] 开始恢复窗口焦点...')

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
        const isFocused = global.mainWindow.isFocused()
        const isVisible = global.mainWindow.isVisible()

        console.log(`[截图] 检查焦点 (${attempts + 1}/15): focused=${isFocused}, visible=${isVisible}`)

        if (isFocused && isVisible) {
          // 窗口已获得焦点，再等待一小段时间确保稳定
          console.log('[截图] 窗口已获得焦点，等待稳定...')
          setTimeout(() => {
            callback()
          }, 300) // 增加等待时间到300ms
        } else if (attempts < 15) {
          // 继续尝试（增加尝试次数）
          setTimeout(() => {
            global.mainWindow.focus()
            global.mainWindow.moveTop()
            // 强制激活应用
            app.show()
            checkFocus(attempts + 1)
          }, 150) // 增加间隔时间
        } else {
          // 超时，直接执行
          console.warn('[截图] 窗口焦点恢复超时，强制执行')
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
    console.log(`[截图] 开始发送消息: ${channel}`)

    if (process.platform === 'darwin') {
      // Mac上：先恢复焦点，然后同时使用IPC和JS方法（双重保障）
      restoreFocus(() => {
        console.log('[截图] 窗口焦点已恢复，开始发送消息')

        // 先尝试IPC（可能在某些情况下工作）
        const ipcResult = sendViaIPC()

        // 无论IPC是否成功，都使用JS方法作为主要保障
        // 延迟执行JS方法，让IPC先尝试
        setTimeout(() => {
          sendViaJS()
        }, 100)

        // 如果IPC失败，再延迟一段时间后重试JS方法
        if (!ipcResult) {
          setTimeout(() => {
            console.log('[截图] IPC失败，重试JS方法')
            sendViaJS()
          }, 500)
        }
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
    const finalDelay = delay || 800 // 增加默认延迟到800ms
    console.log(`[截图] Mac平台，延迟 ${finalDelay}ms 后发送消息`)
    setTimeout(() => sendMessage(), finalDelay)
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
    console.log('[截图] 收到截图确定事件')
    // 发送截图数据到渲染进程
    // 在Mac上截取应用外内容时，需要更长的延迟来确保窗口恢复焦点
    ensureFocusAndSend('screenshot-ok', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 800 : 150)
  })

  // 点击保存按钮回调事件
  screenshots.on('save', (e, buffer, bounds) => {
    console.log('[截图] 收到截图保存事件')
    // 发送截图数据到渲染进程
    ensureFocusAndSend('screenshot-save', {
      buffer: buffer.toString('base64'),
      bounds: bounds
    }, process.platform === 'darwin' ? 800 : 150)
  })

  // 截图取消事件
  screenshots.on('cancel', () => {
    console.log('[截图] 收到截图取消事件')
    // 发送取消事件到渲染进程
    ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 400 : 100)
  })

  // esc取消
  globalShortcut.register('esc', () => {
    if (screenshots.$win?.isFocused()) {
      screenshots.endCapture()
      // 发送取消事件到渲染进程
      ensureFocusAndSend('screenshot-cancel', null, process.platform === 'darwin' ? 400 : 100)
    }
  })
}
