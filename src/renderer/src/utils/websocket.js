var ws //websocket实例
var lockReconnect = false //避免重复连接
var uniqueId = null
var wsUrl = process.env.VUE_APP_OSS_URL
if (
  window.sessionStorage.getItem('uniqueId') &&
  window.sessionStorage.getItem('uniqueId') != 'undefined'
) {
  uniqueId = window.sessionStorage.getItem('uniqueId')
} else {
  uniqueId = Math.floor(Math.random() * Date.now()).toString(36)
}
window.sessionStorage.setItem('uniqueId', uniqueId)

var timeout = 4000
var timeoutObj = null
function createWebSocket(url) {
  try {
    ws = new WebSocket(url)
    initEventHandle()
  } catch (e) {
    reconnect(url)
  }
}

function initEventHandle() {
  ws.onclose = function (e) {
    // console.log(e);
    reconnect(wsUrl)
  }
  ws.onerror = function () {
    reconnect(wsUrl)
  }
  ws.onopen = function () {
    ws.send(
      JSON.stringify({
        type: 'login',
        uid: localStorage.getItem('userId'),
        uniqueId: uniqueId
      })
    )
    //心跳检测重置
    heartCheck.start()
  }
  ws.getMess = function (event) {
    // console.log(event)
    //如果获取到消息，心跳检测重置
    //拿到任何消息都说明当前连接是正常的
    // if(event.rea)
    if (JSON.parse(event.data).type == 'heart') {
      heartCheck.start()
    }
  }
}

function reconnect(url) {
  if (lockReconnect) return
  lockReconnect = true
  //没连接上会一直重连，设置延迟避免请求过多
  setTimeout(function () {
    createWebSocket(url)
    lockReconnect = false
  }, 5000)
}

//心跳检测
var heartCheck = {
  reset: function () {
    clearTimeout(timeoutObj)
    return heartCheck
  },
  start: function () {
    timeoutObj && clearTimeout(timeoutObj)
    timeoutObj = setTimeout(function () {
      // console.log("心跳");
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      //onmessage拿到返回的心跳就说明连接正常
      ws.send(
        JSON.stringify({
          type: 'heart',
          uid: localStorage.getItem('userId'),
          uniqueId: uniqueId
        })
      )
    }, timeout)
  }
}

createWebSocket(wsUrl)

export { ws }
