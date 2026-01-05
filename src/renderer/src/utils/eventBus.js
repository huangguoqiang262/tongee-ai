import { ref } from 'vue'

// 创建事件总线
const eventBus = ref({})

// 监听事件
export const on = (event, callback) => {
  if (!eventBus.value[event]) {
    eventBus.value[event] = []
  }
  eventBus.value[event].push(callback)
}

// 触发事件
export const emit = (event, data) => {
  if (eventBus.value[event]) {
    eventBus.value[event].forEach((callback) => {
      callback(data)
    })
  }
}

// 移除事件监听
export const off = (event, callback) => {
  if (eventBus.value[event]) {
    const index = eventBus.value[event].indexOf(callback)
    if (index > -1) {
      eventBus.value[event].splice(index, 1)
    }
  }
}

export default eventBus
