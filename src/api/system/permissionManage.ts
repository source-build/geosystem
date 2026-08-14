import Request from "../../utils/request";

/** API资源列表查询 */
export function queryAPIResourceList() {
  return Request.GET("/system/api-resource/list");
}

/** 查询资源映射列表，keyword 用于关键字筛选，parent_id 用于按目录筛选 */
export function queryResourceMappingList(params?: { keyword?: string; parent_id?: number }) {
  return Request.GET("/system/resource-mapping/list", params);
}

/** 创建资源映射 */
export function createResourceMapping(data: any) {
  return Request.POST("/system/resource-mapping", data);
}

/** 编辑资源映射 */
export function editResourceMapping(id: number, data: any) {
  return Request.PUT(`/system/resource-mapping/${id}`, data);
}

/** 删除资源映射 */
export function deleteResourceMapping(id: number) {
  return Request.DELETE(`/system/resource-mapping/${id}`);
}

/** 查询资源映射目录列表 */
export function queryResourceMappingDirectoryList() {
  return Request.GET("/system/resource-mapping/dir-list");
}

/** 创建资源映射目录 */
export function createResourceMappingDirectory(data: any) {
  return Request.POST("/system/resource-mapping/dir", data);
}

/** 获取资源映射Options */
export function queryResourceMappingOptions(params:any) {
  return Request.GET("/system/resource-mapping/options",params);
}

/** 获取资源映射分页列表 */
export function queryResourceMappingPage(params:any) {
  return Request.GET("/system/resource-mapping/page",params);
}


