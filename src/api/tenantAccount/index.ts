import Request from "@/utils/request";

/** 获取租户账户信息 */
export function getTenantAccountInfo() {
  return Request.GET("/user/tenant/account/info");
}

/** 获取租户用户账户信息 */
export function getTenantUserAccountInfo() {
  return Request.GET("/user/tenant-user/account/info");
}

/** 获取租户账户流水记录 */
export function getTenantAccountRecords(params: any) {
  return Request.GET("/user/tenant/account/record-list", params);
}
