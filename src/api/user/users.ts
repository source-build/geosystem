import Request from "@/utils/request";

/** 查询用户列表 */
export function queryUserList(params: any) {
  return Request.GET("/user/adm/user/list", params);
}

/** 获取用户状态统计 */
export function queryUserStatusCount(params: any) {
  return Request.GET("/user/adm/user/status-count", params);
}

/** 获取各平台类型用户统计 */
export function queryUserPlatformTypeCount(params: any) {
  return Request.GET("/user/adm/user/platform-type-count", params);
}

/** 查询登录记录列表 */
export function queryLoginRecordList(params: any) {
  return Request.GET("/user/adm/user/login-record-list", params);
}

/** 查询用户列表（租户权限） */
export function queryUserListFromTenant(params: any) {
  return Request.GET("/user/tenant/user/list", params);
}

/** 获取用户状态统计 */
export function queryUserStatusCountFromTenant(params: any) {
  return Request.GET("/user/tenant/user/status-count", params);
}

/** 获取各平台类型用户统计 */
export function queryUserPlatformTypeCountFromTenant(params: any) {
  return Request.GET("/user/tenant/user/platform-type-count", params);
}

/** 查询登录记录列表 */
export function queryLoginRecordListFromTenant(params: any) {
  return Request.GET("/user/tenant/user/login-record-list", params);
}