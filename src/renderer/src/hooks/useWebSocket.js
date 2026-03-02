// useWebSocket.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
/**
 *
 * @param {*} url
 * @param { reconnectInterval,maxReconnectAttempts,heartbeatInterval,heartbeatTimeout,heartbeatMessage,onOpen,onMessage,onClose,onError,onHeartbeatTimeout } options 参数对象
 *
 * @param { reconnectInterval } options.reconnectInterval 重连间隔时间，单位毫秒
 * @param { maxReconnectAttempts } options.maxReconnectAttempts 最大重连尝试次数
 * @param { heartbeatInterval } options.heartbeatInterval 心跳发送间隔，默认30秒
 * @param { heartbeatTimeout } options.heartbeatTimeout 心跳超时时间，默认10秒
 * @param { heartbeatMessage } options.heartbeatMessage 心跳消息内容，默认'heartbeat'
 * @param { onOpen } options.onOpen 连接成功回调
 * @param { onMessage } options.onMessage 消息回调
 * @param { onClose } options.onClose 关闭回调
 * @param { onError } options.onError 错误回调
 * @param { onHeartbeatTimeout } options.onHeartbeatTimeout 心跳超时回调
 * @returns
 */
const useWebSocket = (url, options) => {
  const defaultOptions = {
    reconnectInterval: 3000,
    maxReconnectAttempts: 6,
    heartbeatInterval: 30000, // 心跳发送间隔，默认30秒
    heartbeatTimeout: 10000,   // 心跳超时时间，默认10秒
    heartbeatMessage: {
      type: 'breath',
      data: 'heartbeat'
    },  // 心跳消息内容
    onOpen: () => {},
    onMessage: () => {},
    onClose: () => {},
    onError: () => {},
    onHeartbeatTimeout: () => {}, // 心跳超时回调
    ...options
  }

  const socket = ref(null)
  const isConnected = ref(false)
  const reconnectInterval = defaultOptions.reconnectInterval || 3000 // 重连间隔时间，单位毫秒
  const maxReconnectAttempts = defaultOptions.maxReconnectAttempts || 6 // 最大重连尝试次数，null 表示无限尝试
  const heartbeatInterval = defaultOptions.heartbeatInterval || 30000 // 心跳发送间隔
  const heartbeatTimeout = defaultOptions.heartbeatTimeout || 10000 // 心跳超时时间
  const heartbeatMessage = defaultOptions.heartbeatMessage || 'heartbeat' // 心跳消息

  let reconnectAttempts = 0
  let heartbeatTimer = null // 心跳发送定时器
  let heartbeatTimeoutTimer = null // 心跳超时检测定时器
  let lastHeartbeatTime = 0 // 最后一次收到心跳响应的时间
  let isHeartbeatActive = false // 心跳是否活跃
  let isUnmounted = false // 组件是否已卸载
  // 清理心跳定时器
  const clearHeartbeatTimers = () => {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer)
      heartbeatTimer = null
    }
    if (heartbeatTimeoutTimer) {
      clearTimeout(heartbeatTimeoutTimer)
      heartbeatTimeoutTimer = null
    }
  }

  // 判断是否为心跳消息
  const isHeartbeatMessage = (message) => {
    // 可以根据实际协议调整判断逻辑
    try {
      const msg = JSON.parse(message)
      return msg.type === heartbeatMessage.type
    } catch (error) {
      console.log(error);
      return false
    }
  }

  // 处理心跳响应
  const handleHeartbeatResponse = () => {
    lastHeartbeatTime = Date.now()
    clearTimeout(heartbeatTimeoutTimer)
    heartbeatTimeoutTimer = null
  }

  // 发送心跳
  const sendHeartbeat = () => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN && isHeartbeatActive) {
      try {
        socket.value.send(JSON.stringify(heartbeatMessage))
        // 设置心跳超时检测
        setHeartbeatTimeout()
      } catch (error) {
        console.error('发送心跳失败:', error)
      }
    }
  }

  // 设置心跳超时检测
  const setHeartbeatTimeout = () => {
    clearTimeout(heartbeatTimeoutTimer)
    heartbeatTimeoutTimer = setTimeout(() => {
      handleHeartbeatTimeout()
    }, heartbeatTimeout)
  }

  // 处理心跳超时
  const handleHeartbeatTimeout = () => {
    if (isUnmounted) return
    defaultOptions.onHeartbeatTimeout()

    // 关闭当前连接
    if (socket.value) {
      socket.value.close()
    }

    // 尝试重连
    if (maxReconnectAttempts === null || reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        reconnectAttempts++
        connect()
      }, reconnectInterval)
    }
  }

  // 启动心跳
  const startHeartbeat = () => {
    if (!isHeartbeatActive || isUnmounted) return

    // 清除之前的定时器
    clearHeartbeatTimers()

    // 发送心跳
    sendHeartbeat()

    // 设置下一次心跳
    heartbeatTimer = setTimeout(() => {
      // 检查是否已卸载
      if (!isUnmounted) {
        startHeartbeat()
      }
    }, heartbeatInterval)
  }

  const connect = () => {
    if (isUnmounted) {
      return
    }
    // 清理之前的心跳定时器
    clearHeartbeatTimers()

    socket.value = new WebSocket(url)

    socket.value.addEventListener('open', () => {
      isConnected.value = true
      reconnectAttempts = 0
      isHeartbeatActive = true
      // 启动心跳机制
      startHeartbeat()
      defaultOptions.onOpen()
    })

    socket.value.addEventListener('message', (event) => {
      // 处理心跳响应
      if (isHeartbeatMessage(event.data)) {
        handleHeartbeatResponse()
      }

      defaultOptions.onMessage(event.data)
    })

    socket.value.addEventListener('close', (event) => {
      isConnected.value = false
      isHeartbeatActive = false

      // 清理心跳定时器
      clearHeartbeatTimers()

      defaultOptions.onClose(event)
      if (maxReconnectAttempts === null || reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++
          connect()
        }, reconnectInterval)
      }
    })

    socket.value.addEventListener('error', (error) => {
      defaultOptions.onError(error)
    })
  }

  // 手动发送心跳（可用于外部调用）
  const sendHeartbeatManually = () => {
    sendHeartbeat()
  }

  // 获取心跳状态
  const getHeartbeatStatus = () => {
    return {
      isActive: isHeartbeatActive,
      lastHeartbeatTime,
      interval: heartbeatInterval,
      timeout: heartbeatTimeout
    }
  }

  const sendMessage = (message) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(message)
    }
  }

  onMounted(() => {
    connect()
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    // 停止心跳机制
    isHeartbeatActive = false
    if (socket.value) {
      socket.value.close()
    }
    // 清理所有定时器
    clearHeartbeatTimers()
  })

  return {
    socket,
    isConnected,
    sendMessage,
    sendHeartbeat: sendHeartbeatManually, // 暴露手动发送心跳的方法
    getHeartbeatStatus // 暴露获取心跳状态的方法
  }
}

export default useWebSocket
