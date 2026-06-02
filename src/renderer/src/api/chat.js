import request from '@renderer/utils/request'
// 获取用户知识库
export function get_user_knows(data) {
  return request({
    url: '/chat/get_user_knows',
    method: 'post',
    data
  })
}
// 创建对话
export function create_chat(data) {
  return request({
    url: '/chat/create_chat',
    method: 'post',
    data
  })
}
//编辑对话
export function update_chat(data) {
  return request({
    url: '/chat/update_chat',
    method: 'post',
    data
  })
}

// 获取对话聊天记录
export function get_chat_word(data) {
  return request({
    url: '/chat/get_chat_word',
    method: 'post',
    data
  })
}
// 根据文件key获取文件信息
export function get_use_file(data) {
  return request({
    url: '/chat/get_use_file',
    method: 'post',
    data
  })
}
// 上传附件
export function upload_attach(data) {
  return request({
    url: '/chat/upload_attach',
    method: 'post',
    data
  })
}
// 对话列表
export function chat_lists(data) {
  return request({
    url: '/chat/chat_lists',
    method: 'post',
    data
  })
}
// 删除对话
export function del_chat(data) {
  return request({
    url: '/chat/del_chat',
    method: 'post',
    data
  })
}
// 清空对话
export function del_all_chat(data) {
  return request({
    url: '/chat/del_all_chat',
    method: 'post',
    data
  })
}

// 获取单个对话(默认创建)
export function getChatInfo(data) {
  return request({
    url: '/chat/getChatInfo',
    method: 'post',
    data
  })
}
// 清空单个对话
export function delChatOne(data) {
  return request({
    url: '/chat/delChatOne',
    method: 'post',
    data
  })
}
// 对话反馈
export function chat_feedback(data) {
  return request({
    url: '/chat/feedback',
    method: 'post',
    data
  })
}
// 对话反馈类型
export function feedbackType(data) {
  return request({
    url: '/chat/feedbackType',
    method: 'post',
    data
  })
}
// 问答历史提问文案修改
export function modifyChatHistory(data) {
  return request({
    url: '/chat/modifyChatHistory',
    method: 'post',
    data
  })
}

// 获取对话聊天记录html
export function getChatHtml(data) {
  return request({
    url: '/chat/getChatHtml',
    method: 'post',
    data
  })
}
// 设置默认模型
export function set_default_model(data) {
  return request({
    url: '/chat/set_default_model',
    method: 'post',
    data
  })
}
// 文生图保存
export function text_to_image_call(data) {
  return request({
    url: '/intelligence/text_to_image_call?uniacid=2',
    method: 'post',
    data
  })
}
// 知识库对话记录列表
export function know_chat_lists(data) {
  return request({
    url: '/chat/know_chat_lists',
    method: 'post',
    data
  })
}
// 获取场景列表
export function scene_list(data) {
  return request({
    url: '/scene/list',
    method: 'post',
    data
  })
}
// 创建自定义场景
export function scene_create(data) {
  return request({
    url: '/scene/create',
    method: 'post',
    data
  })
}
// 编辑自定义场景
export function scene_update(data) {
  return request({
    url: '/scene/update',
    method: 'post',
    data
  })
}
// 删除自定义场景
export function scene_del(data) {
  return request({
    url: '/scene/del',
    method: 'post',
    data
  })
}