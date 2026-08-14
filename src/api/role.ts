import Request from "@/utils/request";

/** 角色 Options */
export function roleOptions() {
  return Request.GET("/system/system-role/options");
}

/** 获取系统内置角色列表 */
export function getSystemFixedRoles() {
  return Request.GET("/system/system-role/fixed-roles");
}