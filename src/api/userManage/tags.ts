import Request from "@/utils/request";

/** 新增标签 */
export function addTags(data: any) {
  return Request.POST("/user/adm/tags/add", data);
}

/** 编辑标签 */
export function editTags(id: any, data: any) {
  return Request.PUT("/user/adm/tags/" + id, data);
}

/** 删除标签 */
export function delTags(id: any) {
  return Request.DELETE("/user/adm/tags/" + id);
}

/** 标签列表 */
export function queryTags(params: any) {
  return Request.GET("/user/adm/tags/list", params);
}

/** 标签选项列表 */
export function getTagsOptions() {
  return Request.GET("/user/adm/tags/options");
}
