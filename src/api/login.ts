import Request from "@/utils/request";

/* 管理员登录 */
export function adminLogin(params: any) {
  return Request.POST("/user/common/login/admin", params);
}

/* 租户登录 */
export function tenantLogin(params: any) {
  return Request.POST("/user/common/login/tenant", params);
}

/* 创建超级管理员微信授权二维码 */
export function createRootAdminWxAuthQrcode() {
  return Request.POST("/user/adm/admin-wx-auth/bind/root-qrcode");
}

/* 创建管理员微信授权二维码 */
export function createAdminWxAuthQrcode() {
  return Request.POST("/user/adm/admin-wx-auth/bind/qrcode");
}

/* 检查超级管理员微信授权绑定状态 */
export function checkRootAdminWxAuthBind() {
  return Request.GET("/user/adm/admin-wx-auth/is-bind/root");
}

/* 查询管理员微信授权列表 */
export function queryAdminWxAuthLis() {
  return Request.GET("/user/adm/admin-wx-auth/admin-list");
}

/* 确认管理员微信授权 */
export function confirmAdminWxAuthBind(id:any) {
  return Request.PUT("/user/adm/admin-wx-auth/confirm/"+id);
}

/* 删除管理员微信授权 */
export function deleteAdminWxAuth(id:any) {
  return Request.DELETE("/user/adm/admin-wx-auth/delete/"+id);
}

/* 创建组合管理员微信授权二维码 */
export function createTenantAdminWxAuthQrcode() {
  return Request.POST("/user/tenant/admin-wx-auth/bind/qrcode");
}

/* 查询当前租户绑定状态 */
export function checkTenantAdminWxAuthBind() {
  return Request.GET("/user/tenant/admin-wx-auth/is-bind");
}

/* 获取微信登录二维码 */
export function getTenantAdminWxAuthLoginQrCode() {
  return Request.GET("/user/common/login/tenant/wx-qrcode");
}

/* 查询微信登录扫码状态 */
export function checkTenantLoginWxQrCodeStatus(id:string) {
  return Request.GET("/user/common/login/tenant/wx-qrcode-check/"+id);
}

/* 微信二维码登录 */
export function tenantWxQrCodeLogin(id:string,data:any) {
  return Request.POST("/user/common/login/tenant/wx-qrcode/"+id,data);
}

/* 获取微信登录二维码 */
export function getRootAdminWxAuthLoginQrCode() {
  return Request.GET("/user/common/login/admin/wx-qrcode");
}

/* 查询微信登录扫码状态 */
export function checkRootLoginWxQrCodeStatus(id:string) {
  return Request.GET("/user/common/login/admin/wx-qrcode-check/"+id);
}

/* 微信二维码登录 */
export function rootWxQrCodeLogin(id:string,data:any) {
  return Request.POST("/user/common/login/admin/wx-qrcode/"+id,data);
}