import request from '@renderer/utils/request'
// 知识库列表
export function get_know_list(data) {
  return request({
    url: '/recycle/get_know_list',
    method: 'post',
    data
  })
}
// 文件列表
export function get_file_list(data) {
  return request({
    url: '/recycle/get_file_list',
    method: 'post',
    data
  })
}
//清空回收站
export function clean_all(data) {
  return request({
    url: '/recycle/clean_all',
    method: 'post',
    data
  })
}
// 清空回收站中的单个文件或知识库
export function clean_one(data) {
  return request({
    url: '/recycle/clean_one',
    method: 'post',
    data
  })
}
// 还原
export function restore(data) {
  return request({
    url: '/recycle/restore',
    method: 'post',
    data
  })
}
