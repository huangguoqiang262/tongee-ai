import request from '@renderer/utils/request'
// 反馈类型树
export function feedback_type_tree(data) {
  return request({
    url: '/feedback/type_tree',
    method: 'post',
    data
  })
}
// 文档类型列表
export function feedback_doc_type(data) {
  return request({
    url: '/feedback/doc_type',
    method: 'post',
    data
  })
}
//添加反馈
export function feedback_add(data) {
  return request({
    url: '/feedback/add',
    method: 'post',
    data
  })
}

// 反馈历史
export function feedback_get_list(data) {
  return request({
    url: '/feedback/get_list',
    method: 'post',
    data
  })
}
// 标记已处理
export function feedback_mark(data) {
  return request({
    url: '/feedback/mark',
    method: 'post',
    data
  })
}
// 知识库使用手册
export function get_knowledge_manual(data) {
  return request({
    url: '/intelligence/get_knowledge_manual',
    method: 'post',
    data
  })
}
// 反馈常见问题
export function get_usually_questions(data) {
  return request({
    url: '/feedback/get_usually_questions',
    method: 'post',
    data
  })
}
