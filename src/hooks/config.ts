import { queryOsdDomain } from "@/api/osd";
import { reactive } from "vue";

interface SystemConfig {
  [key: string]: any;
}

// 系统配置
const systemConfig = reactive<SystemConfig>({});
// 存储配置
export const storeConfig = reactive<SystemConfig>({});
const storageCache = localStorage.getItem("storage");
if (storageCache) {
  const obj = JSON.parse(storageCache);
  Object.keys(obj).forEach((key) => {
    storeConfig[key] = obj[key];
  });
}

// 从localStorage获取配置
function loadConfigFromStorage(): SystemConfig | null {
  const config = localStorage.getItem("system-config");
  return config ? JSON.parse(config) : null;
}

// 保存当前配置到localStorage
function saveCurrentConfigToStorage(): void {
  localStorage.setItem("system-config", JSON.stringify(systemConfig));
}

/** 初始化系统配置 */
export function initSystemConfig(): void {
  const config = loadConfigFromStorage();
  if (config) {
    Object.assign(systemConfig, config);
  }
}

/** 初始化存储配置 */
export async function initConfigStore() {
  try {
    const { data: response } = await queryOsdDomain();
    if (response.result) {
      storeConfig.osdDomain = response.result;
    }
    localStorage.setItem("storage", JSON.stringify({ ...storeConfig }));
  } catch (error: any) {
    if (!localStorage.getItem("storage")) {
      showToastFail("系统配置加载异常，请刷新页面");
    }
  }
}

export function initConfigGlobal() {
  initSystemConfig();
  initConfigStore();
}

export { systemConfig, saveCurrentConfigToStorage };
