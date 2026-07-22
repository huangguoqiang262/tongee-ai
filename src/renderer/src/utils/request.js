import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@renderer/stores/user'
var pendingRequest = new Map()
// 生成request的唯一key
var generateRequestKey = (config = {}) => {
  // 通过url，method，params，data生成唯一key，用于判断是否重复请求
  // params为get请求参数，data为post请求参数
  const { url, method, params, data } = config
  const postData = JSON.stringify(data)
  const queryString = JSON.stringify(params)
  return [url, method, queryString, postData].join('&')

  // return [method, url, qs.stringify(params), qs.stringify(data)].join('&');
}

// 将重复请求添加到pendingRequest中
var addPendingRequest = (config) => {
  const key = generateRequestKey(config)
  if (!pendingRequest.has(key)) {
    config.cancelToken = new axios.CancelToken((cancel) => {
      pendingRequest.set(key, cancel)
    })
  }
}

// 取消重复请求
var removePendingRequest = (config) => {
  const key = generateRequestKey(config)
  const cancelToken = pendingRequest.get(key)
  // console.log(cancelToken);

  if (cancelToken) {
    // const cancelToken = pendingRequest.get(key);
    cancelToken(key) // 取消之前发送的请求
    pendingRequest.delete(key) // 请求对象中删除requestKey
  }
}
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api'
})
// request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    new Promise(() => {
      // 处理重复请求
      removePendingRequest(config)
      // pendingRequest.clear()
      addPendingRequest(config)
    })
    // do something before request is sent
    if (userStore.token) {
      config.headers['Authorization'] = userStore.token
    }
    if (config.method === 'post') {
      if (config.data instanceof FormData) {
        return config
      } else {
        var data = {
          ...config.data,
          uniacid: userStore.uniacid || 2 // 这里假设 uniacid 的值为 2，你可以根据实际情况修改
        }
        config.data = data
      }
    } else {
      config.params = {
        ...config.params,
        uniacid: userStore.uniacid || 2 // 这里假设 uniacid 的值为 2，你可以根据实际情况修改
      }
    }
    return config
  },
  (error) => {
    pendingRequest.clear()
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    new Promise(() => {
      // 移除重复请求
      // pendingRequest.clear()
      removePendingRequest(response.config)
    })
    const res = response.data
    const indexs = response.config.responseType
    if (indexs === 'arraybuffer') {
      return Promise.resolve(
        'data:image/png;base64,' +
          window.btoa(
            new Uint8Array(res).reduce((data, byte) => data + String.fromCharCode(byte), '')
          )
      )
    }
    if (indexs === 'blob') {
      let fileName = decodeURI(response.headers['content-disposition']).replace(
        /attachment;filename=/,
        ''
      )

      return { data: res, name: fileName }
      // return  res
    }
    // if the custom code is not 20000, it is judged as an error.
    if (response.status != 200) {
      if (res.code === 300 || response.status === 401) {
        const userStore = useUserStore()
        userStore.reset()
        // return res
      } else {
        ElMessage({
          message: response.msg || 'Error',
          type: 'error',
          duration: 3 * 1000
        })
      }
      return Promise.reject(response.msg || 'Error')
    } else {
      if (res.code == 200) {
        return res
      } else {
        ElMessage({
          message: res.msg || 'Error',
          type: 'error',
          duration: 3 * 1000
        })
      }
      return Promise.reject(res.msg || 'Error')
    }
  },
  (error) => {
    const userStore = useUserStore()
    //如果是重复请求则不提示
    if (axios.isCancel(error)) {
      removePendingRequest(error.config || {}) 
      return Promise.reject(error)
    }
    const errorCode = error.response ? error.response.status : null

    if (errorCode == 401) {
      removePendingRequest(error.config || {}) 
      userStore.reset()
      return Promise.reject(error)
    }
    ElMessage({
      message: error.msg || 'Error',
      type: 'error',
      duration: 5 * 1000
    })
    removePendingRequest(error.config || {})
    return Promise.reject(error)
  }
)

export default service
