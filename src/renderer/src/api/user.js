import request from '@renderer/utils/request'
// 手机验证码登录
export function login(data) {
  return request({
    url: '/login/mobile_login',
    method: 'post',
    data
  })
}
// 账号密码登录
export function passlogin(data) {
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}
export function logout(data) {
  return request({
    url: '/login/logout',
    method: 'post',
    data
  })
}

// 获取短信验证码
export function send_code(data) {
  return request({
    url: '/login/send_code',
    method: 'post',
    data
  })
}
// 获取后台用户个人信息
export function user_info(data) {
  return request({
    // url: "/common/get_user_info",
    url: '/user/user_info',
    method: 'post',
    data
  })
}
// 修改用户密码/昵称
export function edit_user(data) {
  return request({
    url: '/user/edit_user',
    method: 'post',
    data
  })
}

// 校验短信验证码
export function check_sms_code(data) {
  return request({
    url: '/login/check_sms_code',
    method: 'post',
    data
  })
}
// 忘记密码-设置新密码
export function set_new_pass(data) {
  return request({
    url: '/login/set_new_pass',
    method: 'post',
    data
  })
}
// 获取登录页条目
export function get_login_item(data) {
  return request({
    url: '/system/get_login_item',
    method: 'post',
    data
  })
}
// 登录推荐知识库列表
export function getLoginKnowList(data) {
  return request({
    url: '/intelligence/getLoginKnowList',
    method: 'post',
    data
  })
}
// 跳过登录知识库推荐
export function skipLogin(data) {
  return request({
    url: '/user/skipLogin',
    method: 'post',
    data
  })
}
// 一键申请加入登录推荐知识库
export function applyAllLoginShowKnows(data) {
  return request({
    url: '/intelligence/applyAllLoginShowKnows',
    method: 'post',
    data
  })
}
