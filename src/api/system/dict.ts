import Request from "@/utils/request";

/* 查询字典值（公开接口） */
export function queryDictValuesRquest(label: string) {
  return Request.GET(`/system/common/dict/values?label=${label}`);
}

/* 字典列表 */
export function queryDictList(params: any) {
  return Request.GET("/system/dict/list", params);
}

/* 字典值列表 */
export function queryDictValueList(params: any) {
  return Request.GET("/system/dict/value-list", params);
}

/* 创建字典 */
export function createDict(params: any) {
  return Request.POST("/system/dict/add", params);
}

/* 更新字典 */
export function updateDict(id: any, params: any) {
  return Request.PUT(`/system/dict/put/${id}`, params);
}

/* 删除字典 */
export function deleteDict(id: any) {
  return Request.DELETE(`/system/dict/del/${id}`);
}
