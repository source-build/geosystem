import Request from "@/utils/request";

/** 批量查询用户基本信息（id / 昵称 / 头像），ids 最多 100 个 */
export function batchUserInfo(ids: number[]) {
  return Request.GET("/user/adm/user/batch-info", { ids: ids.join(",") });
}

/** 搜索后台用户（按账号模糊搜索，分页） */
export function searchAdminUser(params: {account?: string;page: number;page_size: number}) {
  return Request.GET("/user/adm/user/search", params);
}

/** 查询当前用户所属租户与部门（无租户上下文/查不到时字段为空，不报错） */
export function getUserTenantDept() {
  return Request.GET("/user/tenant-user/user/dept");
}
