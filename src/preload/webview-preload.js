/**
 * Webview 专用 Preload 脚本
 * 为 webview 内的网页注入 WebRTC 兼容层和状态检测能力
 */

// ===== WebRTC 兼容性补丁 =====
;(function () {
  console.log('[Webview Preload] Initializing WebRTC compatibility layer')

  // 1. 确保 RTCPeerConnection 可用
  if (typeof RTCPeerConnection === 'undefined') {
    if (typeof webkitRTCPeerConnection !== 'undefined') {
      window.RTCPeerConnection = webkitRTCPeerConnection
      console.log('[Webview Preload] Patched RTCPeerConnection from webkitRTCPeerConnection')
    } else {
      console.error('[Webview Preload] RTCPeerConnection is not available!')
    }
  }

  // 2. 确保 RTCSessionDescription 可用
  if (typeof RTCSessionDescription === 'undefined' && typeof webkitRTCSessionDescription !== 'undefined') {
    window.RTCSessionDescription = webkitRTCSessionDescription
  }

  // 3. 确保 RTCIceCandidate 可用
  if (typeof RTCIceCandidate === 'undefined' && typeof webkitRTCIceCandidate !== 'undefined') {
    window.RTCIceCandidate = webkitRTCIceCandidate
  }

  // 4. 确保 navigator.mediaDevices 可用
  if (!navigator.mediaDevices) {
    console.warn('[Webview Preload] navigator.mediaDevices is missing!')
  } else {
    // 5. 确保 getUserMedia 可用（补充旧版 API）
    if (!navigator.mediaDevices.getUserMedia) {
      const gum =
        navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
      if (gum) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          return new Promise((resolve, reject) => {
            gum.call(navigator, constraints, resolve, reject)
          })
        }
        console.log('[Webview Preload] Patched getUserMedia from legacy API')
      }
    }
  }

  // 6. 暴露 WebRTC 状态检测接口
  window.__webrtcReady = true
  window.__checkWebRTC = function () {
    return {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
      enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
      RTCPeerConnection: typeof RTCPeerConnection !== 'undefined',
      RTCSessionDescription: typeof RTCSessionDescription !== 'undefined',
      RTCIceCandidate: typeof RTCIceCandidate !== 'undefined',
      RTCDataChannel:
        typeof RTCPeerConnection !== 'undefined' &&
        'createDataChannel' in RTCPeerConnection.prototype
    }
  }

  console.log('[Webview Preload] WebRTC compatibility layer ready', window.__checkWebRTC())
})()
