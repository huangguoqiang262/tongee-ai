import request from '@renderer/utils/request'
// 新增笔记本
export function notebook_add(data) {
  return request({
    url: '/notebook/add',
    method: 'post',
    data
  })
}
// 编辑笔记本
export function notebook_edit(data) {
  return request({
    url: '/notebook/edit',
    method: 'post',
    data
  })
}
//笔记本列表
export function notebook_list(data) {
  return request({
    url: '/notebook/list',
    method: 'post',
    data
  })
}

// 删除笔记本
export function notebook_del(data) {
  return request({
    url: '/notebook/del',
    method: 'post',
    data
  })
}
// 新增笔记
export function note_add(data) {
  return request({
    url: '/note/add',
    method: 'post',
    data
  })
}
// 编辑笔记
export function note_edit(data) {
  return request({
    url: '/note/edit',
    method: 'post',
    data
  })
}
// 笔记列表
export function note_list(data) {
  return request({
    url: '/note/list',
    method: 'post',
    data
  })
}
// 删除笔记
export function note_del(data) {
  return request({
    url: '/note/del',
    method: 'post',
    data
  })
}
// 笔记详情
export function get_note_info(data) {
  return request({
    url: '/note/get_note_info',
    method: 'post',
    data
  })
}