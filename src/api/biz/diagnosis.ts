import Request from "@/utils/request";

/** 创建AI诊断任务 */
export function createAIDiagnoseTask(data: any) {
  return Request.POST("/geo/tenant-user/ai-diagnose-task/add", data);
}

/** 查询定价信息 */
export function queryPricingInfo() {
  return Request.GET("/user/tenant-user/pricing/info");
}

/** 查询最新诊断任务列表 */
export function queryLatestTaskList() {
  return Request.GET("/geo/tenant-user/ai-diagnose-task/latest-list");
}

/** 取消AI诊断任务 */
export function cancelDiagnoseTask(data: any) {
  return Request.PUT("/geo/tenant-user/ai-diagnose-task/cancel", data);
}

/** 查询诊断报告详情 */
export function getDiagnoseReportDetail(id: string | number) {
  return Request.GET("/geo/tenant-user/ai-diagnose-task/report-detail/"+id);
}

/** 查询诊断报告列表 */
export function getDiagnoseReportList(params: {
  page: number;
  page_size: number;
  name?: string;
  status?: number;
}) {
  return Request.GET("/geo/tenant-user/ai-diagnose-task/report-list", params);
}
