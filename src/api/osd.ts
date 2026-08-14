import Request from "@/utils/request";

/** 获取腾讯云(COS)对象存储STS临时访问凭证 */
export function queryCosBucketAuth(params:any) {
  return Request.GET("/system/document-center/cos-bucket-auth",params);
}

/** 获取阿里云(OSS)对象存储STS临时访问凭证 */
export function queryOssBucketAuth() {
  return Request.GET("/system/document-center/oss-bucket-auth");
}

/** 查询静态资源目录的临时访问密钥 */
export function queryStaticAccessKey(isDir: string, key: string) {
  return Request.GET("/system/resource-dir/static-access-key", {isDir,key});
}

/** 查询对象存储域名 */
export function queryOsdDomain() {
  return Request.GET("/system/common/settings/osd-domain");
}

