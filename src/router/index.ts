import { createRouter, createWebHistory } from "vue-router";
import { hasUserInfo } from "../utils/auth";
import { usePermissionStore } from "../store/permission";
import { useMenuStore } from "@/store/menu";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

nprogress.configure({ showSpinner: false });

export const routes: any = [
  {
    path: "/",
    redirect: "/admin/dashboard",
  },
  {
    path: "/login",
    name: "login",
    meta: { title: "登录" },
    component: async () => await import("@/views/common/tenantLogin/index.vue"),
  },
  {
    path: "/sl",
    name: "sl",
    meta: { title: "登录" },
    component: async () => await import("@/views/common/login/index.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    meta: { title: "后台管理系统", root: true },
    component: async () => await import("@/layout/index.vue"),
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        meta: { title: "仪表盘" },
        component: async () => await import("@/views/dashboard/index.vue"),
      },
      {
        path: "biz/sitebuilder/editor/:id",
        name: "sitebuilder-editor",
        hidden: true,
        meta: { title: "站点编辑器", hidden: true },
        component: async () => await import("@/views/biz/sitebuilder/editor/index.vue"),
      },
    ],
  },
  {
    path: "/biz",
    name: "biz",
    meta: { title: "后台管理系统", root: true },
    component: async () => await import("@/layout/index.vue"),
    children: [],
  },
  {
    path: "/aura",
    name: "aura",
    meta: { title: "意境 AI", root: true, standalone: true },
    component: async () => await import("@/layout/auraAI/index.vue"),
    redirect: "/aura/workspace",
    children: [
      {
        path: "workspace",
        name: "aura-workspace",
        meta: { title: "AI 创作工作台" },
        component: async () => await import("@/views/auraAI/workspace/index.vue"),
      },
      {
        path: "product-showcase",
        name: "aura-product-showcase",
        meta: { title: "AI 商品套图" },
        component: async () => await import("@/views/auraAI/productShowcase/index.vue"),
      },
      {
        path: "fashion-showcase",
        name: "aura-fashion-showcase",
        meta: { title: "AI 服饰套图" },
        component: async () => await import("@/views/auraAI/fashionShowcase/index.vue"),
      },
      {
        path: "works",
        name: "aura-works",
        meta: { title: "我的作品" },
        component: async () => await import("@/views/auraAI/works/index.vue"),
      },
      {
        path: "compute",
        name: "aura-compute",
        meta: { title: "算力中心" },
        component: async () => await import("@/views/auraAI/compute/index.vue"),
      },
      {
        path: "preview/:capability?",
        name: "aura-preview",
        meta: { title: "完整版能力预览" },
        component: async () => await import("@/views/auraAI/placeholder.vue"),
      },
    ],
  },
  {
    path: "/404",
    name: "404",
    meta: { title: "" },
    component: () => import("@/views/error/404.vue"),
  },
  {
    path: "/:pathMatch(.*)",
    name: "notFound",
    hidden: true,
    redirect: "/404",
  },
];

const openRouters = ["/login", "/sl"];

const router: any = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to: any, from: any, next: any) => {
  nprogress.start();

  // 白名单路由
  if (openRouters.some((e) => e == to.path)) {
    next();
    document.querySelector(".loader-container")?.remove();
    return;
  }

  if (to.meta?.title && to.name != "404") {
    document.title = import.meta.env.VITE_APP_NAME + "｜" + to.meta.title;
  }

  const paths = to.path.split("/");
  // 匹配所有 root 域下的路由（admin、biz 等），非 root 域不添加标签
  const rootSegment = paths[1] || "";
  const isRootRoute = routes.some(
    (r: any) => r.meta?.root && !r.meta?.standalone && r.path === `/${rootSegment}`,
  );
  if (isRootRoute) {
    useMenuStore().selectTagHandler(
      to.path,
      to.fullPath,
      to.meta?.title || String(to.name),
      to.meta,
    );
  }

  const store = usePermissionStore();
  try {
    // 找不到用户信息，重新登录
    if (!hasUserInfo()) {
      next({ path: `/login?redirect=${to.path}`, replace: true });
      return;
    }

    // 拉取
    if (!store.menuIsPull) {
      await store.pullMenusRequest();

      document.querySelector(".loader-container")?.remove();

      // 这里用于消除 No match found for location with path 警告
      // 由于使用了动态路由，首次无法找到会跳转404，所以首次需要强制在跳转一次正确的路由
      if (to.path == "/404" && to.redirectedFrom) {
        next({
          path: to.redirectedFrom.fullPath,
          query: to.redirectedFrom.query,
          replace: true,
        });
      } else {
        next({ ...to, replace: true });
      }
      return;
    }
  } catch (error: any) {
    showToastFail(error.err_msg || error);
    next({ path: `/login`, replace: true });
    return;
  }

  next();
});

router.afterEach(() => {
  nprogress.done();
});

export default router;
