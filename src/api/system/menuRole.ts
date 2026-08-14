import Request from "../../utils/request";

/** 查询角色菜单（根据角色ID） */
export function queryRoleMenu(id: any) {
  return Request.GET(`/system/system-menu-role/role-menus/${id}`);
}

/** 增加权限 */
export function addMenuRoleAuth(data: any) {
  return Request.POST("/system/system-menu-role/add", data);
}

/** 删除权限 */
export function delMenuRoleAuth(data: any) {
  return Request.DELETE("/system/system-menu-role/del", data);
}
