import { defineStore } from "pinia";
import router, { routes } from "../router/index";
import { useMenuStore } from "./menu";
import { queryUserMenuList, queryUserButtons } from "@/api/system/menu";
import { isDynamicPattern, matchPath } from "@/utils/pathMatch";
import LockedFeature from "@/components/f-locked/index.vue";

/** 按钮权限加载的 Promise，指令可通过 waitForButtonPermissions() 等待其完成 */
let _bpPromise: Promise<void> = Promise.resolve();

/** 等待按钮权限加载完成 */
export function waitForButtonPermissions(): Promise<void> {
  return _bpPromise;
}

/** 获取当前路由路径（已去除 vite base 前缀） */
function getCurrentRoutePath(): string {
  return router.currentRoute.value.path;
}

/** 按钮权限项 */
export interface ButtonPermission {
  name: string;
  describe: string;
}

/**
 * 路由路径模式 key => 按钮权限列表
 * key 为菜单路由地址（如 /admin/system/menu 或 /admin/user/:id）
 */
export type ButtonPermissionMap = Record<string, ButtonPermission[]>;

/** 权限管理模块 */
export const usePermissionStore = defineStore("permission", {
  state: () => ({
    /** 是否已拉取菜单信息 */
    menuIsPull: false as boolean,
    /** 需要缓存的组件名称列表 */
    cacheComponentNameList: [] as Array<string>,
    /** 按钮权限映射（路由路径 => 按钮权限列表） */
    buttonPermissions: {} as ButtonPermissionMap,
  }),
  getters: {
    /** 是否为超级管理员（后端返回 {"*": nil} 标识） */
    isSuperAdmin(): boolean {
      return "*" in this.buttonPermissions;
    },
  },
  actions: {
    /** 拉取当前用户的菜单信息 */
    async pullMenusRequest() {
      const { data: response } = await queryUserMenuList();
      const rows: Array<any> = response.result || [];
      if (response.code != 0) {
        throw response;
      }

      // 无数据，已拉取
      if (rows.length == 0) {
        this.menuIsPull = true;
        return;
      }

      let menus = [];
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        // 目录
        if (item.type == 1) {
          item.children = [];
        }
        menus.push(item);
      }

      const routeAllPathToCompMap = import.meta.glob(`@/views/**/*.vue`, {
        eager: true,
      });

      // 构建一级路由映射：meta.root=true 的静态路由  path首段 => name
      const rootRouteMap: Record<string, string> = {};
      for (const route of routes) {
        if (route.meta?.root && route.path && route.name) {
          rootRouteMap[route.path.replace(/^\//, "")] = String(route.name);
        }
      }
      const defaultParent = "admin";

      let menuStore = useMenuStore();
      if (menus.length > 0) {
        menuStore.menus = this.handleSourceRow(menus);
        this.addRouter(
          routeAllPathToCompMap,
          menuStore.menus,
          rootRouteMap,
          defaultParent,
        );
      }

      router.addRoute({
        path: "/:pathMatch(.*)",
        redirect: "/404",
      });

      // 拉取按钮权限
      this.loadButtonPermissions();

      this.menuIsPull = true;
    },

    /** 拉取当前用户的按钮权限 */
    async loadButtonPermissions() {
      _bpPromise = (async () => {
        try {
          const { data: res } = await queryUserButtons();
          this.buttonPermissions = res.result || {};
        } catch {
          // 按钮权限拉取失败不阻塞流程
        }
      })();
      await _bpPromise;
    },

    /** 根据当前浏览器路径获取按钮权限列表
     * 自动处理动态路由参数匹配（如 /foo/:id 匹配 /foo/123）
     */
    getButtonsByPath(currentPath: string): ButtonPermission[] {
      // 1. 精确匹配
      if (this.buttonPermissions[currentPath]) {
        return this.buttonPermissions[currentPath];
      }

      // 2. 动态路由匹配：遍历所有 key，将 :param 段转为正则进行匹配
      const keys = Object.keys(this.buttonPermissions);
      for (const pattern of keys) {
        if (isDynamicPattern(pattern) && matchPath(pattern, currentPath)) {
          return this.buttonPermissions[pattern];
        }
      }

      return [];
    },

    /** 检查当前路径下是否拥有指定按钮权限
     * @param permissionName 权限字符（如 "add"、"edit"）
     * @param path 路由路径，不传则自动获取当前路由路径（已去除 base 前缀）
     */
    hasPermission(permissionName: string, path?: string): boolean {
      if (this.isSuperAdmin) return true;
      const currentPath = path || getCurrentRoutePath();
      const buttons = this.getButtonsByPath(currentPath);
      return buttons.some((btn) => btn.name === permissionName);
    },

    handleSourceRow(source: Array<any>) {
      let children = [];
      for (let i = 0; i < source.length; i++) {
        const item = source[i];
        if (item.parent_id > 0) {
          this.childToParent(item, source);
        } else {
          children.push(item);
        }
      }
      return children;
    },

    handleSourceEqualRow(source: Array<any>) {
      let children = [];
      for (let i = 0; i < source.length; i++) {
        const item = source[i];
        if (item.parent_id > 0) {
          this.childToParent(item, source);
        }
        children.push(item);
      }
      return children;
    },

    childToParent(item: any, source: Array<any>) {
      for (let i = 0; i < source.length; i++) {
        if (source[i].id == item.parent_id) {
          item.pid = source[i].id;
          source[i].children.push(item);
          return;
        }
      }
    },

    addRouter(
      comPMap: Record<string, unknown>,
      array: Array<any>,
      rootRouteMap: Record<string, string>,
      defaultParent: string,
    ) {
      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (item.path) {
          const modu: any = comPMap[item.path];
          // 视图不存在（体验版已裁剪的模块）：注册锁定页，保证菜单可点且不 404
          const component = modu ? modu.default : LockedFeature;
          if (modu && item.cache == 1) {
            this.cacheComponentNameList.push(item.route_name);
          }
          const firstSegment = item.addr?.split("/")[1] || "";
          const parentName = rootRouteMap[firstSegment] || defaultParent;

          router.addRoute(parentName, {
            path: item.addr,
            name: item.id,
            component: component,
            meta: {
              title: item.name,
              pid: item.pid || 0,
              icon: item.icon,
              icon_action: item.icon_action,
              icon_type: item.icon_type,
              show: item.show,
              status: item.status,
            },
          });
        }
        if (item.children && item.children.length > 0) {
          this.addRouter(comPMap, item.children, rootRouteMap, defaultParent);
        }
      }
    },
  },
});
