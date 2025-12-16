import request from '@renderer/utils/request'
// 获取保养计划
export function get_maintenance_plan(data) {
  return request({
    url: '/maintenance/get_maintenance_plan',
    method: 'post',
    data
  })
}
//修改保养计划
export function maintenance_edit(data) {
  return request({
    url: '/maintenance/edit',
    method: 'post',
    data
  })
}
//上传保养计划
export function maintenance_upload(data) {
  return request({
    url: '/maintenance/upload',
    method: 'post',
    data
  })
}
