import request from '@renderer/utils/request'
// 获取系统消息
export function get_system_msg(data) {
  return request({
    url: '/common/get_system_msg',
    method: 'post',
    data
  })
}
// 文件更新通知
export function get_file_logs(data) {
  return request({
    url: '/history/get_file_logs',
    method: 'post',
    data
  })
}
//清空网址浏览记录
export function get_list(data) {
  return request({
    url: '/feedback/get_list',
    method: 'post',
    data
  })
}
// 导出反馈
export function export_feedback(data) {
  return request({
    url: '/feedback/export',
    method: 'post',
    data
  })
}
// 获取通知列表
export function synergia_message_list(data) {
  return request({
    url: '/collaboration/message_list',
    method: 'post',
    data
  })
}
