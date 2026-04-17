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

// 删除知识库
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
// 知识库文件设置内容权限(限制创建者、管理员)
export function setKnowItemPermission(data) {
  return request({
    url: '/intelligence/setKnowItemPermission',
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
// 拒绝申请人员加入知识库
export function apply_know_refuse(data) {
  return request({
    url: '/intelligence/apply_know_refuse',
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
// 首页侧栏知识库列表
export function getIndexLeftKnowList(data) {
  return request({
    url: '/intelligence/getIndexLeftKnowList',
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
// 知识库文件设置标签(仅限自己创建的)
export function setTags(data) {
  return request({
    url: '/intelligence/setTags',
    method: 'post',
    data
  })
}
// 知识库文件置顶/取消置顶(仅限自己创建的)
export function doTopKnowFile(data) {
  return request({
    url: '/intelligence/doTopKnowFile',
    method: 'post',
    data
  })
}
// 删除 文件|文件夹|网址
export function delItem(data) {
  return request({
    url: '/intelligence/delItem',
    method: 'post',
    data
  })
}
// 添加快捷访问
export function add_access(data) {
  return request({
    url: '/home/add_access',
    method: 'post',
    data
  })
}
// 创建文件夹
export function create_dir(data) {
  return request({
    url: '/intelligence/create_dir',
    method: 'post',
    data
  })
}
// 重命名项目(包含文件，网址，文件夹)
export function reNameItem(data) {
  return request({
    url: '/intelligence/reNameItem',
    method: 'post',
    data
  })
}
// 用户退出加入知识库
export function withdraw_join(data) {
  return request({
    url: '/intelligence/withdraw_join',
    method: 'post',
    data
  })
}
// 知识库广场列表
export function getKnowSquareList(data) {
  return request({
    url: '/intelligence/getKnowSquareList',
    method: 'post',
    data
  })
}

// 协同
// 组织人员树
export function org_organ_user_tree(data) {
  return request({
    url: '/collaboration/org_organ_user_tree',
    method: 'post',
    data
  })
}
// 获取文件类型列表
export function synergia_type_list(data) {
  return request({
    url: '/collaboration/type_list',
    method: 'post',
    data
  })
}
// 创建协同流程（上传文件）
export function synergia_upload_file(data) {
  return request({
    url: '/collaboration/upload_file',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// 查看协同(详情)
export function synergia_process_detail(data) {
  return request({
    url: '/collaboration/process_detail',
    method: 'post',
    data
  })
}
// 协同人确认完成任务
export function synergia_task_complete(data) {
  return request({
    url: '/collaboration/task_complete_collaborate',
    method: 'post',
    data
  })
}
// 审批人完成审批
export function synergia_complete_approve(data) {
  return request({
    url: '/collaboration/task_complete_approve',
    method: 'post',
    data
  })
}
// 协同入库审批
export function synergia_audit_in_know(data) {
  return request({
    url: '/collaboration/audit_in_know',
    method: 'post',
    data
  })
}
// 协同标记已反馈
export function synergia_simple_feedback(data) {
  return request({
    url: '/collaboration/simple_feedback',
    method: 'post',
    data
  })
}
// 协同新增协同流程人员
export function synergia_add_process_user(data) {
  return request({
    url: '/collaboration/add_process_user',
    method: 'post',
    data
  })
}
// 协同获取项目用户状态
export function get_project_user_status(data) {
  return request({
    url: '/collaboration/get_project_user_status',
    method: 'post',
    data
  })
}
// 文件更换知识库或文件夹
export function changeKnowFilePosition(data) {
  return request({
    url: '/intelligence/changeKnowFilePosition',
    method: 'post',
    data
  })
}
// 用户知识库列表-移动文件
export function getKnowFolders(data) {
  return request({
    url: '/intelligence/getKnowFolders',
    method: 'post',
    data
  })
}
// 删除协同成员
export function del_process_user(data) {
  return request({
    url: '/collaboration/del_process_user',
    method: 'post',
    data
  })
}
