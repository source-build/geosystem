import Request from "../../utils/request";

/** 角色列表 */
export function roleList(params: any) {
  return Request.GET("/system/system-role/list", params);
}

/** 角色树结构 */
export function roleTree() {
  return Request.GET("/system/system-role/tree");
}

/** 创建角色 */
export function addRole(data: any) {
  return Request.POST("/system/system-role", data);
}

/** 编辑角色 */
export function editRole(id: any, data: any) {
  return Request.PUT(`/system/system-role/${id}`, data);
}

/** 删除角色 */
export function delRole(id: any) {
  return Request.DELETE(`/system/system-role/${id}`);
}

/** 查询角色已有权限 */
export function queryRolePermissions(params: { role_name: string }) {
  return Request.GET("/system/system-role/permissions", params);
}

/** 移除角色权限 */
export function removeRolePermission(data: any) {
  return Request.DELETE("/system/system-role/permission", data);
}

/** 批量移除角色权限 */
export function removeRolePermissions(data: { role_name: string; resource_names: string[] }) {
  return Request.POST("/system/system-role/remove-permissions", data);
}

/** 新增角色权限 */
export function addRolePermissions(data: any) {
  return Request.POST("/system/system-role/assign-permissions", data);
}
