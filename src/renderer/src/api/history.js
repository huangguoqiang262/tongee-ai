import request from '@renderer/utils/request'
// 创建网址浏览记录
export function add_web_log(data) {
  return request({
    url: '/history/add_web_log',
    method: 'post',
    data
  })
}
// 获取网址浏览记录
export function get_web_log(data) {
  return request({
    url: '/history/get_web_log',
    method: 'post',
    data
  })
}
//清空网址浏览记录
export function del_web_log(data) {
  return request({
    url: '/history/del_web_log',
    method: 'post',
    data
  })
}
//清空网址浏览记录(单个)
export function del_web_log_one(data) {
  return request({
    url: '/history/del_web_log_one',
    method: 'post',
    data
  })
}
//协同历史
export function synergia_history_list(data) {
  return request({
    url: '/collaboration/history_list',
    method: 'post',
    data
  })
}
