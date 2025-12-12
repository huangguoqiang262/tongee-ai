import request from '@renderer/utils/request'
// 首页问题(问问知识库)
export function get_index_question(data) {
  return request({
    url: '/intelligence/get_index_question',
    method: 'post',
    data
  })
}
//删除快捷访问
export function del_access(data) {
  return request({
    url: '/home/del_access',
    method: 'post',
    data
  })
}
//快捷访问列表
export function lists_access(data) {
  return request({
    url: '/home/lists_access',
    method: 'post',
    data
  })
}
//文档解读-文件列表
export function get_file_list(data) {
  return request({
    url: '/ai_desc/get_file_list',
    method: 'post',
    data
  })
}
