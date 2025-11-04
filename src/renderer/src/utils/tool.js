import store from '../store'
export function pathDispose(paths, cy) {
  var list = paths.map((item) => {
    if (cy == 1) {
      return store.getters.imageUrl + item
    } else {
      return store.getters.imageOss + item
    }
  })
  return list
}
// 权限校验
export function checkPermission(path, privateRoles = []) {
  var commonRoleList = store.getters.roles
  var is_super = store.getters.userInfo.is_super
  if (is_super == 1) {
    return commonRoleList.includes(path)
  } else {
    return privateRoles.includes(path)
  }
}
