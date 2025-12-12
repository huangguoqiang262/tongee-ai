import request from '@renderer/utils/request'
// 智能文档类型( 新 )
export function doc_type_tree(data) {
  return request({
    url: '/creativity/doc_type_tree',
    method: 'post',
    data
  })
}
// 图片生成风格列表
export function get_image_style(data) {
  return request({
    url: '/creativity/get_image_style',
    method: 'post',
    data
  })
}
//图片生成关键词列表
export function get_image_cueword(data) {
  return request({
    url: '/creativity/get_image_cueword',
    method: 'post',
    data
  })
}
//智能文档统计
export function doc_create_count(data) {
  return request({
    url: '/creativity/doc_create_count',
    method: 'post',
    data
  })
}
