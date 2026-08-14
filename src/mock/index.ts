/**
 * 演示版 Mock 拦截层
 *
 * 开启方式：.env 中 VITE_DEMO_MODE=true
 * 开启后所有 HTTP 请求不再发往后端，而是返回 src/mock/data/ 下
 * 从真实环境抓取的响应快照，使项目可以脱离后端独立运行。
 *
 * 数据文件与接口路径的对应关系见 PATH_FILE_MAP；
 * 带路径参数的接口（如 /xxx/:id）见 DYNAMIC_MATCHERS。
 */

const modules = import.meta.glob("./data/*.json", { eager: true });

/** 数据文件名（不含 .json）=> 加载后的响应体 */
const dataFiles: Record<string, any> = {};
for (const [file, mod] of Object.entries(modules)) {
  const stem = file.replace(/^.*\//, "").replace(/\.json$/, "");
  dataFiles[stem] = (mod as any).default;
}

/** 接口路径（GET，不含查询参数）=> 数据文件名 */
const PATH_FILE_MAP: Record<string, string> = {
  // ---- 启动必需 ----
  "/system/system-menu/user-menus": "system_system_menu_user_menus",
  "/system/system-menu/user-buttons": "system_system_menu_user_buttons",
  "/system/common/settings/osd-domain":
    "system_common_settings_osd_domain",
  "/user/tenant-user/user/dept": "user_tenant_user_user_dept",
  "/user/tenant-user/account/info": "user_tenant_user_account_info",
  "/user/tenant-user/pricing/info": "user_tenant_user_pricing_info",

  // ---- 系统管理 ----
  "/system/system-menu/menu-all": "system_system_menu_menu_all",
  "/system/dict/list": "system_dict_list",
  "/system/dict/value-list": "system_dict_value_list",
  "/system/common/dict/values": "system_common_dict_values_q",
  "/system/system-role/list": "system_system_role_list",
  "/system/system-role/fixed-roles": "system_system_role_fixed_roles",
  "/system/system-role/tree": "system_system_role_tree",
  "/system/system-role/permissions": "system_system_role_permissions_q",
  "/system/role-inheritance/list": "system_role_inheritance_list",
  "/system/resource-mapping/options": "system_resource_mapping_options",
  "/system/resource-mapping/list": "system_resource_mapping_list",
  "/system/resource-mapping/page": "system_resource_mapping_page_q",
  "/system/resource-mapping/dir-list": "system_resource_mapping_dir_list",
  "/system/api-resource/list": "system_api_resource_list",
  "/user/adm/user/list": "user_adm_user_list_q",
  "/user/adm/user/search": "user_adm_user_search_q",
  "/user/adm/user/status-count": "user_adm_user_status_count",
  "/user/adm/user/platform-type-count": "user_adm_user_platform_type_count",
  "/user/adm/user/login-record-list": "user_adm_user_login_record_list_q",
  "/user/adm/tags/list": "user_adm_tags_list_q",
  "/user/adm/tags/options": "user_adm_tags_options",
  "/user/adm/tenant/list": "user_adm_tenant_list_q",
  "/user/common/tenant/options": "user_common_tenant_options",

  // ---- GEO 诊断（旗舰演示） ----
  "/geo/tenant-user/ai-diagnose-task/report-list":
    "geo_tenant_user_ai_diagnose_task_report_list",
  "/geo/tenant-user/ai-diagnose-task/latest-list":
    "geo_tenant_user_ai_diagnose_task_latest_list",
};

/** 带路径参数的接口：正则 => 数据文件名 */
const DYNAMIC_MATCHERS: Array<[RegExp, string]> = [
  [
    /^\/geo\/tenant-user\/ai-diagnose-task\/report-detail\/\d+$/,
    "geo_tenant_user_ai_diagnose_task_report_detail_30",
  ],
  [
    /^\/system\/system-menu-role\/role-menus\/\d+$/,
    "system_system_menu_role_role_menus_9",
  ],
];

/** 登录接口：任意账号均可登录，返回演示身份 */
const LOGIN_MOCKS: Record<string, any> = {
  "/user/common/login/admin": dataFiles["user_common_login_admin"],
  "/user/common/login/tenant": dataFiles["user_common_login_tenant"],
};

/** 演示模式开关 */
export const DEMO_MODE: boolean = import.meta.env.VITE_DEMO_MODE === "true";

/** 未采集到的 GET 接口的兜底响应（空数据，避免页面崩溃） */
function fallbackGet(): any {
  return { code: 0, msg: "演示数据未采集", result: [] };
}

/** 演示环境下写操作的兜底响应 */
function fallbackWrite(): any {
  return { code: 0, msg: "演示环境数据只读，完整版支持该操作", result: null };
}

/**
 * 解析 Mock 响应
 * @returns 响应体；返回 undefined 表示该请求不归 Mock 管（正常发往后端）
 */
export function resolveMock(method: string, path: string): any | undefined {
  const m = method.toUpperCase();
  const clean = path.split("?")[0];

  // 登录：无论传什么账号密码都放行
  if (m === "POST" && LOGIN_MOCKS[clean]) {
    return LOGIN_MOCKS[clean];
  }

  if (m === "GET") {
    if (PATH_FILE_MAP[clean] && dataFiles[PATH_FILE_MAP[clean]]) {
      return dataFiles[PATH_FILE_MAP[clean]];
    }
    for (const [pattern, stem] of DYNAMIC_MATCHERS) {
      if (pattern.test(clean) && dataFiles[stem]) {
        return dataFiles[stem];
      }
    }
    return fallbackGet();
  }

  // 其余写操作（POST/PUT/DELETE/PATCH）
  return fallbackWrite();
}
