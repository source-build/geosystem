import Request from "../../utils/request";

/** 所有菜单 */
export function allMenu() {
  return Request.GET("/system/system-menu/menu-all");
}

/** 查询用户菜单列表 */
export function queryUserMenuList() {
  return Request.GET("/system/system-menu/user-menus");
}

/** 创建菜单 */
export function addMenu(data: any) {
  return Request.POST("/system/system-menu/menu", data);
}

/** 编辑菜单 */
export function editMenu(id: any, data: any) {
  return Request.PUT(`/system/system-menu/menu/${id}`, data);
}

/** 删除菜单 */
export function delMenu(id: any) {
  return Request.DELETE(`/system/system-menu/menu/${id}`);
}

/** 更新菜单排序 */
export function updateMenuNumber(id: any,data:any) {
  return Request.PATCH(`/system/system-menu/menu/${id}/number`,data);
}

/** 获取用户按钮权限 */
export function queryUserButtons() {
  return Request.GET("/system/system-menu/user-buttons");
}
