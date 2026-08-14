import Request from "../../utils/request";

/** 获取用户角色 */
export function getRoleForUser(id:any) {
  return Request.GET(`/authentication/policy-auth/role-for-user/${id}`);
}

/** 授权（将角色分配给用户） */
export function addUserGroupingPolicy(data: any) {
  return Request.POST("/authentication/policy-auth/user-policy", data);
}

/** 删除策略 */
export function removeUserGroupingPolicy(data: any) {
  return Request.PUT(`/authentication/policy-auth/remove-user-policy`, data);
}
