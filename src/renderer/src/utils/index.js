import { ElMessage } from 'element-plus'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}
/**
 *
 * @param {String} startTime  开始时间
 * @param {String} endTime    结束时间
 * @return {Number}    day (天数)
 */
export function getDay(startTime, endTime) {
  var day = 0
  if (startTime && endTime) {
    var start = new Date(startTime).getTime()
    var end = new Date(endTime).getTime()
    if (start <= end) {
      day = parseInt((end - start) / (1000 * 60 * 60 * 24)) + 1
    }
  }
  return day
}
function copyMarkdown(content) {
  const textarea = document.createElement('textarea')
  textarea.value = content // 注入Markdown内容
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select() // 自动选中文本
  document.execCommand('copy') // 执行复制命令
  document.body.removeChild(textarea) // 移除临时元素
}

// 复制
export const handleCopyMsg = async (data) => {
  const { content, type } = data
  // 文本
  if (type === 'text') {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          ElMessage({
            message: '复制成功',
            type: 'success'
          })
        })
        .catch(() => {
          ElMessage({
            message: '复制失败',
            type: 'error'
          })
        })
    } else {
      // 降级到传统方法
      copyMarkdown(content)
    }
  }
  // // 图片
  // if (type === 'image') {
  // }
}
