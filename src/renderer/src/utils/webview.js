export function normalizeWebviewUrl (url) {
  if (!url || typeof url !== 'string') return url
  try {
    const parsed = new URL(url)
    parsed.pathname = parsed.pathname.replace(/^\/{2,}/, '/')
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * 安全地调用 <webview>.loadURL
 *
 * Electron 的 <webview> 必须在元素 attach 到 DOM 且发出 'dom-ready' 之后
 * 才能调用 loadURL，否则会抛出：
 *   "The WebView must be attached to the DOM and the dom-ready event emitted
 *    before this method can be called."
 *
 * 本工具在 webview 尚未 ready 时，把目标 URL 暂存到元素上，
 * 并监听一次 'dom-ready'，待其就绪后自动执行加载，避免直接抛错与死循环。
 *
 * @param {HTMLElement} webview <webview> 元素实例
 * @param {string} url 目标地址
 * @param {(wv: HTMLElement) => boolean} [shouldLoad] 可选预判断，
 *        返回 false 时跳过（例如当前 URL 已等于目标 URL）
 * @returns {boolean} 是否已尝试加载
 */
export function safeLoadURL (webview, url, shouldLoad) {
  if (!webview || !url || typeof webview.loadURL !== 'function') return false
  if (shouldLoad && !shouldLoad(webview)) return false

  const targetUrl = normalizeWebviewUrl(url)
  if (webview.__domReadyLoaded) {
    try {
      const currentUrl = safeGetURL(webview)
      const currentBase = currentUrl.replace(/#.*$/, '')
      const targetBase = targetUrl.replace(/#.*$/, '')
      if (currentBase && currentBase === targetBase && currentUrl !== targetUrl) {
        const hash = new URL(targetUrl).hash
        webview.executeJavaScript(`location.hash = ${JSON.stringify(hash)}`).catch(() => {})
        return true
      }
      const loadResult = webview.loadURL(targetUrl)
      if (loadResult && typeof loadResult.catch === 'function') {
        loadResult.catch((e) => {
          if (!e || !String(e.message || e).includes('ERR_ABORTED')) {
            console.warn('[webview] loadURL failed', e)
          }
        })
      }
      return true
    } catch (e) {
      if (!String(e.message || e).includes('ERR_ABORTED')) {
        console.warn('[webview] loadURL failed', e)
      }
      return false
    }
  }

  // 未就绪：暂存待加载 URL，等待 dom-ready 后由 onWebviewDomReady 执行
  webview.__pendingUrl = targetUrl
  if (!webview.__domReadyBound) {
    webview.__domReadyBound = true
    webview.addEventListener(
      'dom-ready',
      () => {
        webview.__domReadyLoaded = true
        const pending = webview.__pendingUrl
        webview.__pendingUrl = null
        if (pending && typeof webview.loadURL === 'function') {
          try {
            const loadResult = webview.loadURL(pending)
            if (loadResult && typeof loadResult.catch === 'function') {
              loadResult.catch((e) => {
                if (!e || !String(e.message || e).includes('ERR_ABORTED')) {
                  console.warn('[webview] loadURL failed on dom-ready', e)
                }
              })
            }
          } catch (e) {
            if (!String(e.message || e).includes('ERR_ABORTED')) {
              console.warn('[webview] loadURL failed on dom-ready', e)
            }
          }
        }
      },
      { once: true }
    )
  }
  return false
}

/**
 * 在 webview 元素首次就绪（或每次 setWebviewRef）时调用，
 * 确保 pending 的 URL 能被消费，且标记 ready 状态。
 * @param {HTMLElement} webview
 */
export function markWebviewReady (webview) {
  if (!webview) return
  webview.__domReadyLoaded = true
  const pending = webview.__pendingUrl
  if (pending) {
    webview.__pendingUrl = null
    try {
      const loadResult = webview.loadURL(pending)
      if (loadResult && typeof loadResult.catch === 'function') {
        loadResult.catch((e) => {
          if (!e || !String(e.message || e).includes('ERR_ABORTED')) {
            console.warn('[webview] loadURL failed in markWebviewReady', e)
          }
        })
      }
    } catch (e) {
      if (!String(e.message || e).includes('ERR_ABORTED')) {
        console.warn('[webview] loadURL failed in markWebviewReady', e)
      }
    }
  }
}

/**
 * 安全读取 <webview> 当前 URL。
 * webview 未 attach 到 DOM / 未 dom-ready 时调用 getURL() 会抛出：
 *   "The WebView must be attached to the DOM and the dom-ready event emitted
 *    before this method can be called."
 * 此处统一 catch，返回空字符串，避免崩溃。
 * @param {HTMLElement} webview
 * @returns {string}
 */
export function safeGetURL (webview) {
  if (!webview || typeof webview.getURL !== 'function') return ''
  try {
    const url = webview.getURL()
    return url || ''
  } catch {
    return ''
  }
}
