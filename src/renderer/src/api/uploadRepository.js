import request from '@renderer/utils/request'
// 创建文件任务
export function create_folder_task(data) {
  return request({
    url: '/know/upload/create_folder_task',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}
// 获取文件任务列表
export function task_list(data) {
  return request({
    url: '/know/upload/task_list',
    method: 'get',
    params: data
  })
}
// 获取文件任务详情
export function task_detail(data) {
  return request({
    url: '/know/upload/task_detail',
    method: 'get',
    data
  })
}

// 获取文件列表及上传进度
export function task_file_list(data) {
  return request({
    url: '/know/upload/task_file_list',
    method: 'get',
    params: data
  })
}
// 删除文件任务
export function delete_task(data) {
  return request({
    url: '/know/upload/delete_task',
    method: 'post',
    data
  })
}
