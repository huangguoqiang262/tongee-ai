import request from '@renderer/utils/request'
// 更新日志不分页
export function uplogsNoPaginate(data) {
  return request({
    url: '/front/uplogsNoPaginate',
    method: 'post',
    data
  })
}
//更新日志详情
export function up_info(data) {
  return request({
    url: '/front/up_info',
    method: 'post',
    data
  })
}
