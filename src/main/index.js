import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  MenuItem,
  protocol,
  dialog,
  shell,
  screen,
  webFrameMain
} from 'electron'
// 在文件顶部添加导入
import { autoUpdater, CancellationToken } from 'electron-updater'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initScreenshoots } from './screenshoots'

// ===== WebRTC 相关 Chromium 命令行开关 =====
// 启用屏幕捕获（getDisplayMedia / 屏幕共享）
app.commandLine.appendSwitch('enable-usermedia-screen-capturing')
// 启用 WebRTC 相关实验特性
app.commandLine.appendSwitch('enable-features', 'WebRTC,WebRTC-H264WithOpenH264FFmpeg,WebRTCPipeWireCapturer')
// 允许自动播放音视频（WebRTC 远程流自动播放）
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
// 注意：ignore-certificate-errors 会改变 TLS 握手行为，可能导致 WAF 检测异常，禁用
// app.commandLine.appendSwitch('ignore-certificate-errors')
// 允许内网 OnlyOffice 来源访问媒体设备；长期应将 Document Server 切换为 HTTPS
app.commandLine.appendSwitch(
  'unsafely-treat-insecure-origin-as-secure',
  ['http://localhost', 'http://192.168.1.187:9999', 'http://192.168.11.241:9999'].join(',')
)
// ===== WebRTC 命令行开关结束 =====

// import icon from '../../resources/icon.png?asset'
let mainWindow = null // 全局窗口变量
const configuredWebviewSessions = new WeakSet()
const configuredPermissionSessions = new WeakSet()
const configuredJitsiLogoRedirectSessions = new WeakSet()
const onlyOfficeJitsiPluginOrigin = 'https://onlyoffice.github.io'
const onlyOfficeJitsiPluginPath = '/sdkjs-plugins/content/jitsi/index.html'
const onlyOfficeDocumentServerOrigins = new Set([
  'http://192.168.1.187:9999',
  'http://192.168.11.241:9999'
])
const jitsiIframeAllow =
  'camera; microphone; display-capture; autoplay; fullscreen; screen-wake-lock; clipboard-write; speaker-selection'
const jitsiPermissionsPolicyHeader =
  'camera=*, microphone=*, display-capture=*, autoplay=*, fullscreen=*, screen-wake-lock=*, clipboard-write=*, speaker-selection=*'
const topOnlyOfficePolicyScript = `
(() => {
  const marker = '__tongeeTopOnlyOfficePolicy__'
  const reloadMarker = 'tongeeOnlyofficePolicyReloaded'
  const targetOrigins = ${JSON.stringify([...onlyOfficeDocumentServerOrigins])}
  const requiredPermissions = ['screen-wake-lock', 'speaker-selection']
  const pageUrl = new URL(window.location.href)
  const isApplicationMainFrame = window.top === window && (
    (pageUrl.protocol === 'http:' && pageUrl.hostname === 'localhost') ||
    pageUrl.protocol === 'file:' ||
    pageUrl.protocol === 'app:'
  )
  if (!isApplicationMainFrame) return

  const matchesDocumentServer = (iframe) => {
    if (!(iframe instanceof HTMLIFrameElement)) return false
    try {
      const url = new URL(iframe.getAttribute('src') || '', document.baseURI)
      return targetOrigins.includes(url.origin)
    } catch {
      return false
    }
  }
  const applyPolicy = (iframe) => {
    if (!matchesDocumentServer(iframe)) return
    const previousAllow = iframe.getAttribute('allow') || ''
    const existingPermissions = previousAllow
      .split(';')
      .map((directive) => directive.trim().split(/\\s+/)[0].toLowerCase())
      .filter(Boolean)
    const missingPermissions = requiredPermissions.filter(
      (permission) => !existingPermissions.includes(permission)
    )
    if (missingPermissions.length === 0) return

    const normalizedPreviousAllow = previousAllow.trim()
    const separator = normalizedPreviousAllow.endsWith(';') ? ' ' : '; '
    const newAllow = normalizedPreviousAllow
      ? normalizedPreviousAllow + separator + missingPermissions.join('; ')
      : missingPermissions.join('; ')
    iframe.setAttribute('allow', newAllow)

    if (!iframe.dataset[reloadMarker] && iframe.isConnected) {
      const src = iframe.getAttribute('src')
      if (src) {
        iframe.dataset[reloadMarker] = 'true'
        iframe.setAttribute('src', src)
      }
    }
  }
  const applyTree = (node) => {
    if (!(node instanceof Element)) return
    applyPolicy(node)
    node.querySelectorAll('iframe').forEach((iframe) => applyPolicy(iframe))
  }

  if (window[marker]) {
    document.querySelectorAll('iframe').forEach((iframe) => applyPolicy(iframe))
    return
  }

  window[marker] = { observer: null }
  document.querySelectorAll('iframe').forEach((iframe) => applyPolicy(iframe))
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        applyPolicy(mutation.target)
        return
      }
      mutation.addedNodes.forEach(applyTree)
    })
  })
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  })
  window[marker].observer = observer
})()
`
const outerJitsiPolicyScript = `
(() => {
  const marker = '__tongeeOnlyOfficeOuterJitsiPolicy__'
  const targetOrigin = ${JSON.stringify(onlyOfficeJitsiPluginOrigin)}
  const targetPath = ${JSON.stringify(onlyOfficeJitsiPluginPath)}
  const allow = ${JSON.stringify(jitsiIframeAllow)}
  const requiredPermissions = allow.split(';').map((value) => value.trim()).filter(Boolean)

  const existingState = window[marker]
  const state = existingState || { observer: null, reloadPerformed: false }
  if (!existingState) window[marker] = state
  const matchesPlugin = (iframe) => {
    if (!(iframe instanceof HTMLIFrameElement)) return false
    try {
      const url = new URL(iframe.getAttribute('src') || '', document.baseURI)
      return url.origin === targetOrigin && url.pathname === targetPath
    } catch {
      return false
    }
  }
  const applyPolicy = (iframe) => {
    if (!matchesPlugin(iframe)) return
    const previousAllow = iframe.getAttribute('allow') || ''
    const previousPermissions = previousAllow
      .split(';')
      .map((value) => value.trim().split(/\\s+/)[0])
      .filter(Boolean)
    const needsNavigationPolicyRefresh = requiredPermissions.some(
      (permission) => !previousPermissions.includes(permission)
    )

    iframe.setAttribute('allow', allow)
    iframe.setAttribute('allowfullscreen', '')

    if (needsNavigationPolicyRefresh && !state.reloadPerformed && iframe.isConnected) {
      state.reloadPerformed = true
      const src = iframe.getAttribute('src')
      if (src) {
        iframe.setAttribute('src', src)
      }
    }
  }
  const applyTree = (node) => {
    if (!(node instanceof Element)) return
    applyPolicy(node)
    node.querySelectorAll('iframe').forEach(applyPolicy)
  }

  if (existingState) {
    document.querySelectorAll('iframe').forEach(applyPolicy)
    return
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        applyPolicy(mutation.target)
        return
      }
      mutation.addedNodes.forEach(applyTree)
    })
  })
  state.observer = observer
  document.querySelectorAll('iframe').forEach(applyPolicy)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  })
})()
`
const jitsiLogoFallbackUrl =
  'https://onlyoffice.github.io/sdkjs-plugins/content/jitsi/resources/light/icon.png'
const failedJitsiLogoUrls = [
  'chrome-extension://kglhbbefdnlheedjiejgomgmfplipfeb/jitsi-logo-48x48.png',
  'chrome-extension://eeecajlpbgjppibfledfihobcabccihn/jitsi-logo-48x48.png'
]
const jitsiIframePermissionScript = `
(() => {
  const marker = '__tongeeOnlyOfficeJitsiPermissions__'
  if (window[marker]) return

  const allow = ${JSON.stringify(jitsiIframeAllow)}
  const updateIframe = (iframe) => {
    if (!(iframe instanceof HTMLIFrameElement) || !iframe.closest('#meet')) return false
    try {
      const src = iframe.getAttribute('src')
      if (!src) return false
      const url = new URL(src, document.baseURI)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
      iframe.setAttribute('allow', allow)
      iframe.setAttribute('allowfullscreen', '')
      return true
    } catch {
      return false
    }
  }
  const updateTree = (node) => {
    if (!(node instanceof Element)) return
    updateIframe(node)
    node.querySelectorAll('iframe').forEach(updateIframe)
  }

  window[marker] = { observer: null }
  document.querySelectorAll('#meet iframe').forEach(updateIframe)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        updateIframe(mutation.target)
        return
      }
      mutation.addedNodes.forEach(updateTree)
    })
  })
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  })
  window[marker].observer = observer
})()
`
const isOnlyOfficeJitsiPluginFrame = (value) => {
  try {
    const url = new URL(value)
    return url.origin === onlyOfficeJitsiPluginOrigin && url.pathname === onlyOfficeJitsiPluginPath
  } catch {
    return false
  }
}
const isOnlyOfficeDocumentServerFrame = (frame) => {
  try {
    return onlyOfficeDocumentServerOrigins.has(frame.origin) ||
      onlyOfficeDocumentServerOrigins.has(new URL(frame.url).origin)
  } catch {
    return false
  }
}
const allowedPermissions = [
  'media',
  'mediaKeySystem',
  'geolocation',
  'notifications',
  'midi',
  'midiSysex',
  'pointerLock',
  'fullscreen',
  'openExternal',
  'clipboard-sanitized-write',
  'display-capture'
]

function configureSessionPermissions(targetSession) {
  if (configuredPermissionSessions.has(targetSession)) return
  configuredPermissionSessions.add(targetSession)

  targetSession.setPermissionCheckHandler((webContents, permission) => {
    void webContents
    return allowedPermissions.includes(permission)
  })

  targetSession.setPermissionRequestHandler((webContents, permission, callback) => {
    void webContents
    const allowed = allowedPermissions.includes(permission)
    callback(allowed)
  })
}

let tray = null // 托盘实例变量
let cancellationToken = new CancellationToken()
let updateRetryCount = 0
const maxUpdateRetries = 3
const updaterCacheDir = join(app.getPath('userData'), 'tongee-app-updater')
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
const preferredWindowSize = { width: 1260, height: 800 }
const preferredMinimumWindowSize = { width: 960, height: 640 }

function getWindowSizeForDisplay(display) {
  const { width, height } = display.workAreaSize

  return {
    width: Math.min(preferredWindowSize.width, width),
    height: Math.min(preferredWindowSize.height, height),
    minWidth: Math.min(preferredMinimumWindowSize.width, width),
    minHeight: Math.min(preferredMinimumWindowSize.height, height)
  }
}

function keepWindowInWorkArea(window, display = screen.getDisplayMatching(window.getBounds())) {
  if (!window || window.isDestroyed()) return

  const { x, y, width: workAreaWidth, height: workAreaHeight } = display.workArea
  const size = getWindowSizeForDisplay(display)
  window.setMinimumSize(size.minWidth, size.minHeight)

  if (window.isMaximized() || window.isFullScreen()) return

  const bounds = window.getBounds()
  const width = Math.min(bounds.width, workAreaWidth)
  const height = Math.min(bounds.height, workAreaHeight)
  const maxX = x + workAreaWidth - width
  const maxY = y + workAreaHeight - height

  window.setBounds({
    x: Math.min(Math.max(bounds.x, x), maxX),
    y: Math.min(Math.max(bounds.y, y), maxY),
    width,
    height
  })
}

function createWindow() {
  // Create the browser window.
  const size = getWindowSizeForDisplay(screen.getPrimaryDisplay())
  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: size.minWidth,
    minHeight: size.minHeight,
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
      experimentalFeatures: true,
      autoplayPolicy: 'no-user-gesture-required' // WebRTC 自动播放音视频流
    }
  })
  configureSessionPermissions(mainWindow.webContents.session)
  const mainSession = mainWindow.webContents.session
  if (!configuredJitsiLogoRedirectSessions.has(mainSession)) {
    configuredJitsiLogoRedirectSessions.add(mainSession)
    // 仅替换已确认失效的 Jitsi 扩展 Logo。
    mainSession.webRequest.onBeforeRequest({ urls: failedJitsiLogoUrls }, (details, callback) => {
      void details
      callback({ redirectURL: jitsiLogoFallbackUrl })
    })
    // 对 OnlyOffice/Jitsi 链路上的文档响应注入 Permissions-Policy 并移除 CSP 限制，
    // 在 JS 执行前生效，避免 iframe allow 属性的时序竞争。
    mainSession.webRequest.onHeadersReceived((details, callback) => {
      const responseHeaders = details.responseHeaders || {}
      const setResponseHeader = (name, value) => {
        const headerName = Object.keys(responseHeaders).find(
          (key) => key.toLowerCase() === name.toLowerCase()
        )
        const key = headerName || name
        responseHeaders[key] = [value]
      }
      const normalizedUrl = details.url.toLowerCase()
      const isPolicyRelevantDoc =
        details.resourceType === 'subFrame' ||
        details.resourceType === 'mainFrame' ||
        details.resourceType === 'xhr'
      const isJitsiRelated =
        normalizedUrl.includes('onlyoffice.github.io/sdkjs-plugins/content/jitsi') ||
        normalizedUrl.includes('meet.jit.si') ||
        normalizedUrl.includes('192.168.1.187:9999') ||
        normalizedUrl.includes('192.168.11.241:9999')

      if (isPolicyRelevantDoc && isJitsiRelated) {
        // 移除或修改 CSP 头，允许 Worker 和跨源资源加载
        const cspKey = Object.keys(responseHeaders).find(
          (key) => key.toLowerCase() === 'content-security-policy'
        )
        if (cspKey && Array.isArray(responseHeaders[cspKey])) {
          responseHeaders[cspKey] = responseHeaders[cspKey].map((policy) => {
            // 移除 frame-ancestors 限制，允许被嵌入
            let modified = policy.replace(/frame-ancestors\s+[^;]*;?/gi, '')
            // 放宽 worker-src 限制，允许创建 Web Worker
            modified = modified.replace(
              /worker-src\s+[^;]*;?/gi,
              'worker-src *;'
            )
            // 放宽 script-src 限制，确保 Jitsi JS 能正常加载
            modified = modified.replace(
              /script-src\s+([^;]*);?/gi,
              "script-src $1 'unsafe-inline' 'unsafe-eval';"
            )
            return modified.trim()
          })
        }
        // 注入 Permissions-Policy
        setResponseHeader('Permissions-Policy', jitsiPermissionsPolicyHeader)
        callback({ responseHeaders })
        return
      }
      callback({})
    })
  }
  global.mainWindow = mainWindow
  mainWindow.webContents.on('dom-ready', () => {
    const frame = mainWindow.webContents.mainFrame
    frame.executeJavaScript(topOnlyOfficePolicyScript).catch(() => {})
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
  // 配置通过特殊按键ALT+SHIFT+F12打开开发者工具
  mainWindow.webContents.on('did-frame-finish-load', (
    event,
    isMainFrame,
    frameProcessId,
    frameRoutingId
  ) => {
    void event
    if (isMainFrame) return
    const frame = webFrameMain.fromId(frameProcessId, frameRoutingId)
    if (!frame || frame.isDestroyed()) return

    if (isOnlyOfficeDocumentServerFrame(frame)) {
      frame.executeJavaScript(outerJitsiPolicyScript).catch(() => {})
    }

    if (!isOnlyOfficeJitsiPluginFrame(frame.url)) return

    const parentFrame = frame.parent
    if (parentFrame && !parentFrame.isDestroyed() && isOnlyOfficeDocumentServerFrame(parentFrame)) {
      parentFrame.executeJavaScript(outerJitsiPolicyScript).catch(() => {})
    }

    // 插件加载完成后提前补充 Jitsi iframe 权限委派。
    frame.executeJavaScript(jitsiIframePermissionScript).catch(() => {})
  })
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

  // ===== will-attach-webview: webview 附加前提前配置权限（比 did-attach-webview 更早） =====
  const chromeVersion = process.versions.chrome
  const webviewUserAgent =
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`
  mainWindow.webContents.on('will-attach-webview', (event, webPreferences) => {
    // 提前为 webview 启用 WebRTC 相关权限
    webPreferences.autoplayPolicy = 'no-user-gesture-required'
    webPreferences.webSecurity = true
    webPreferences.userAgent = webviewUserAgent
    const webviewPreloadPath = join(__dirname, '../preload/webview-preload.js')
    if (fs.existsSync(webviewPreloadPath)) {
      webPreferences.preload = webviewPreloadPath
    }
  })

  mainWindow.webContents.on('did-attach-webview', (event, wc) => {
    wc.setWindowOpenHandler((details) => {
      mainWindow.webContents.send('webview-new-window', wc.id, details)
      return { action: 'deny' }
    })

    const webviewSession = wc.session
    if (!configuredWebviewSessions.has(webviewSession)) {
      configuredWebviewSessions.add(webviewSession)

      // ===== 移除 X-Frame-Options / CSP frame-ancestors 限制 =====
      webviewSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders }
        if (responseHeaders['x-frame-options']) {
          delete responseHeaders['x-frame-options']
        }
        if (responseHeaders['content-security-policy']) {
          responseHeaders['content-security-policy'] = responseHeaders['content-security-policy'].map(
            (policy) => policy.replace(/frame-ancestors\s+[^;]+;?/gi, '')
          )
        }

        if (details.resourceType === 'mainFrame' && [202, 400, 412].includes(details.statusCode)) {
          mainWindow.webContents.send('antibot-detected', details.url)
        }

        callback({ responseHeaders })
      })
    }

    // OnlyOffice 使用主窗口 session；外部 webview 使用独立 session，两者都需配置权限
    configureSessionPermissions(webviewSession)

    // 监听媒体设备访问状态
    wc.on('media-started-playing', () => {
      console.log('[WebRTC] 媒体开始播放')
    })
    wc.on('media-paused', () => {
      console.log('[WebRTC] 媒体暂停')
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
  screen.on('display-metrics-changed', (_, display, changedMetrics) => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    if (!changedMetrics.includes('workArea') && !changedMetrics.includes('scaleFactor')) return

    const windowDisplay = screen.getDisplayMatching(mainWindow.getBounds())
    if (windowDisplay.id === display.id) keepWindowInWorkArea(mainWindow, windowDisplay)
  })
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
    tray.setToolTip('糖源AI')
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
  // 渲染进程请求用系统浏览器打开 URL（用于反爬网站）
  ipcMain.on('renderer-open-external', (_, url) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      shell.openExternal(url)
    }
  })
  createWindow()

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://192.168.1.187:3000/updates',
    channel: 'latest' // 明确指定更新通道
  })
  autoUpdater.requestHeaders = { insecure: 'true' } // 跳过证书验证
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.autoDownload = false
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
        cancellationToken = new CancellationToken()
        autoUpdater.downloadUpdate(cancellationToken).catch(() => {
          // CancellationError，忽略
        })
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
  updateRetryCount = 0
  // 每次下载前创建新的 CancellationToken
  cancellationToken = new CancellationToken()
  autoUpdater.downloadUpdate(cancellationToken).catch(() => {
    // CancellationError，忽略
  })
})

ipcMain.handle('cancel-download', async () => {
  // 通过 CancellationToken 取消下载
  cancellationToken.cancel()
  // 清理已下载的部分缓存文件
  try {
    if (fs.existsSync(updaterCacheDir)) {
      const files = fs.readdirSync(updaterCacheDir)
      files.forEach((file) => {
        const filePath = join(updaterCacheDir, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      })
    }
  } catch (err) {
    console.error('Error clearing cache on cancel:', err)
  }
  return true
})

ipcMain.handle('quit-install', async () => {
  app.isQuitting = true
  autoUpdater.quitAndInstall()
})
ipcMain.handle('clear-update-cache', async () => {
  try {
    if (fs.existsSync(updaterCacheDir)) {
      const files = fs.readdirSync(updaterCacheDir)
      files.forEach((file) => {
        const filePath = join(updaterCacheDir, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      })
    }
    console.log('更新缓存已清理')
    return true
  } catch (err) {
    console.error('清理更新缓存失败:', err)
    return false
  }
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
