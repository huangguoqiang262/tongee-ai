import request from '@renderer/utils/request'
// 列表
export function get_knows(data) {
  return request({
    url: '/intelligence/get_knows',
    method: 'post',
    data
  })
}
// 创建
export function create_know(data) {
  return request({
    url: '/intelligence/create_know',
    method: 'post',
    data
  })
}
//编辑
export function edit_know(data) {
  return request({
    url: '/intelligence/edit_know',
    method: 'post',
    data
  })
}

// 删除
export function del_know(data) {
  return request({
    url: '/intelligence/del_know',
    method: 'post',
    data
  })
}
// 类型列表
export function know_types(data) {
  return request({
    url: '/intelligence/know_types',
    method: 'post',
    data
  })
}
// 上传文件
export function upload_know_file(data) {
  return request({
    url: '/intelligence/upload_know_file',
    method: 'post',
    data
  })
}

// 添加网址
export function create_know_website(data) {
  return request({
    url: '/intelligence/create_know_website',
    method: 'post',
    data
  })
}
// 删除文件
export function del_know_file(data) {
  return request({
    url: '/intelligence/del_know_file',
    method: 'post',
    data
  })
}
// 获取知识库的所有文件
export function get_know_files(data) {
  return request({
    url: '/intelligence/get_know_files',
    method: 'post',
    data
  })
}
// 设置知识库权限
export function set_know_permission(data) {
  return request({
    url: '/intelligence/set_know_permission',
    method: 'post',
    data
  })
}
// 获得知识库权限
export function get_know_permission(data) {
  return request({
    url: '/intelligence/get_know_permission',
    method: 'post',
    data
  })
}
// 获得知识库成员
export function get_know_persons(data) {
  return request({
    url: '/intelligence/get_know_persons',
    method: 'post',
    data
  })
}
// 设置知识库成员权限
export function set_know_person(data) {
  return request({
    url: '/intelligence/set_know_person',
    method: 'post',
    data
  })
}
// 用户申请加入知识库
export function apply_know_join(data) {
  return request({
    url: '/intelligence/apply_know_join',
    method: 'post',
    data
  })
}
// 知识库申请人员列表
export function apply_know_persons(data) {
  return request({
    url: '/intelligence/apply_know_persons',
    method: 'post',
    data
  })
}
// 同意申请人员加入知识库
export function apply_know_agree(data) {
  return request({
    url: '/intelligence/apply_know_agree',
    method: 'post',
    data
  })
}
// 知识库申请未读数
export function know_apply_number(data) {
  return request({
    url: '/intelligence/know_apply_number',
    method: 'post',
    data
  })
}
// 添加知识库人员
export function add_know_person(data) {
  return request({
    url: '/intelligence/add_know_person',
    method: 'post',
    data
  })
}
// 导入笔记
export function import_note(data) {
  return request({
    url: '/intelligence/import_note',
    method: 'post',
    data
  })
}
// 上传文件夹到知识库
export function uploadFloder(data) {
  return request({
    url: '/ntelligence/uploadFloder',
    method: 'post',
    data
  })
}
// 首页常用知识库
export function commonly_used_knows(data) {
  return request({
    url: '/intelligence/commonly_used_knows',
    method: 'post',
    data
  })
}
// 根据分类获取模型
export function get_type_models(data) {
  return request({
    url: '/intelligence/get_type_models',
    method: 'post',
    data
  })
}
// 首页问题
export function get_index_question(data) {
  return request({
    url: '/intelligence/get_index_question',
    method: 'post',
    data
  })
}

// 详情
export function get_know_info(data) {
  return request({
    url: '/intelligence/get_know_info',
    method: 'post',
    data
  })
}

