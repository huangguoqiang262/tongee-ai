import request from '@renderer/utils/request'
// 手机验证码登录
export function login(data) {
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}
// 账号密码登录
export function passlogin(data) {
  return request({
    url: '/login/passlogin',
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
// 注册
export function register(data) {
  return request({
    url: '/login/register',
    method: 'post',
    data
  })
}
// 获取后台用户个人信息
export function getInfo(data) {
  return request({
    // url: "/common/get_user_info",
    url: '/user/user_info',
    method: 'post',
    data
  })
}
// 修改用户昵称
export function edit_user(data) {
  return request({
    url: '/user/edit_user',
    method: 'post',
    data
  })
}
//获取用户园区和企业的关系列表
export function get_user_park_company_rel(data) {
  if (localStorage.getItem('loginType') && localStorage.getItem('loginType') == 3) {
    data.type = localStorage.getItem('loginType')
  }
  return request({
    url: '/common/get_user_park_company_rel',
    method: 'post',
    data
  })
}
// 后台用户密码修改
export function editPassword(data) {
  return request({
    url: '/admin_user_v4/edit_password',
    method: 'post',
    data
  })
}

// 获取项目域名
export function getDomain(data) {
  return request({
    url: '/common/get_domain',
    method: 'post',
    data
  })
}

// 获取登录验证码
export function getCaptcha() {
  return request({
    url: '/login/captcha',
    method: 'get'
  })
}

// 修改自己密码
export function editMyPass(data) {
  return request({
    url: '/common/my_edit_password',
    method: 'post',
    data
  })
}
