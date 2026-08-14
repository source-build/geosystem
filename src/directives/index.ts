import type { App } from "vue";
import { vPermission } from "./permission";

/**
 * 注册全局自定义指令
 * 在 main.ts 中调用 installDirectives(app) 即可
 */
export function installDirectives(app: App) {
  app.directive("permission", vPermission);
}
