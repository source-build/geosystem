import Request from "../../utils/request";

/** 角色继承关系列表 */
export function roleInheritanceList() {
  return Request.GET("/system/role-inheritance/list");
}

/** 添加角色继承 */
export function addRoleInheritance(data: { child_role: string; parent_role: string }) {
  return Request.POST("/system/role-inheritance", data);
}

/** 取消角色继承 */
export function removeRoleInheritance(data: { child_role: string; parent_role: string }) {
  return Request.DELETE("/system/role-inheritance", data);
}
