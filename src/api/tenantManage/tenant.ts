import Request from "@/utils/request";

/**
 * 查询租户选项
 */
export function queryTenantOptions() {
  return Request.GET("/user/common/tenant/options");
}

/**
 * 查询租户列表
 */
export function queryTenantList(params: any) {
  return Request.GET("/user/adm/tenant/list", params);
}

/**
 * 新增租户
 */
export function createTenant(data: any) {
  return Request.POST("/user/adm/tenant", data);
}

/**
 * 更新租户
 */
export function updateTenant(id: string, data: any) {
  return Request.PUT(`/user/adm/tenant/${id}`, data);
}

/**
 * 更新租户状态
 * @param id 租户ID
 * @param status 状态（0:启用，1:禁用）
 */
export function updateTenantStatus(id: string, status: number) {
  return Request.PUT(`/user/adm/tenant/status/${id}?status=${status}`);
}

/**
 * 删除租户
 */
export function deleteTenant(id: string) {
  return Request.DELETE(`/user/adm/tenant/${id}`);
}

/**
 * 获取租户详情
 * @param id 租户ID
 */
export function getTenantDetail(id: string) {
  return Request.GET(`/user/adm/tenant/${id}`);
}