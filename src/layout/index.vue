<template>
  <div class="layout" @click="layoutClick">
    <div class="app-notice" v-show="noticeShow"></div>
    <div class="layout-container" :style="`top:${noticeShow ? 40 : 0}px`">
      <aside-menu />
      <div class="layout-main">
        <!-- 导航栏 -->
        <div class="navbar-container animation-show">
          <div
            class="system-title animation-show"
            v-if="breadcrumbList.length == 0"
          >
            {{ enterprise }}
          </div>
          <div class="flex-1" v-else>
            <el-breadcrumb separator-icon="ArrowRight">
              <el-breadcrumb-item
                class="animation-show"
                v-for="(item, index) in breadcrumbList"
                ><span :style="{'color': index == breadcrumbList.length - 1 ? '#1d2432' : '#606266'}">{{ item.name }}</span></el-breadcrumb-item
              >
            </el-breadcrumb>
          </div>
          <div class="right-info">
            <f-svg-icon name="aura" size="28" style="border-radius: 8px;transform: translateX(10px);"/>
            <AuraAIEntry />
            <div class="active">
              <!-- <button
                @click="toggleDark()"
                class="theme-toggle"
                :aria-label="`切换为${isDark ? '浅色' : '深色'}模式`"
              >
                {{ isDark ? "🌙" : "☀️" }}
              </button> -->
              <el-tooltip effect="dark" content="通知">
                <f-svg-icon
                  name="notice"
                  class="cursor-pointer"
                  size="25"
                  color="#606266"
                />
              </el-tooltip>
              <el-tooltip effect="dark" content="设置">
                <f-svg-icon
                  name="setting"
                  class="cursor-pointer"
                  size="18"
                  color="#606266"
                  @click="settingDrawerVisible = true"
                />
              </el-tooltip>
            </div>
            <div class="user-info">
              <f-image class="avatar" adminAvatar />
              <el-dropdown>
                <div class="user-meta">
                  <div class="user-meta-top">
                    <span class="nickname">{{ userInfo.nick_name }}</span>
                    <el-icon><CaretBottom /></el-icon>
                  </div>
                  <div class="tenant-name" v-if="tenantName">{{ tenantName }}</div>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="logout"
                      >退出登录</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
        <!-- 标签页 -->
        <div class="tabs-container animation-show">
          <div class="left-box">
            <el-tag
              class="tag"
              :class="{ 'tag-active': dashboardSelect }"
              @click="selectDashboardHandler"
            >
              <div class="tag-box">
                <span class="label">仪表盘</span>
              </div>
            </el-tag>
          </div>
          <div class="line"></div>
          <div class="content-box">
            <div class="tabs">
              <el-tag
                v-for="(item, index) in tags"
                class="tag"
                :class="{ 'tag-active': item.select }"
                :id="`tab-${index}`"
                @click="handlerSelect(item)"
                @contextmenu.prevent="handlerContextmenu(index)"
              >
                <div class="tag-box">
                  <!-- 图标 -->
                  <template v-if="item.meta">
                    <!-- 本地图标 -->
                    <template v-if="item.meta.icon_type == 1">
                      <f-svg-icon
                        :name="item.meta.icon"
                        :color="
                          item.select ? 'var(--el-color-primary)' : '#717377'
                        "
                        class="meta-icon"
                      />
                    </template>
                    <div v-else style="width: 5px"></div>
                  </template>
                  <span class="label">{{ tagDisplayNames[item.path] }}</span>
                  <el-icon
                    class="icon"
                    @click.stop="handlerRemoveTag(item)"
                    style="opacity: 0"
                    ><Close
                  /></el-icon>
                </div>
              </el-tag>
            </div>
          </div>
        </div>
        <!-- 页面容器 -->
        <div class="_page_container animation-show">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="perStore.cacheComponentNameList">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>

    <!-- 菜单右键菜单 -->
    <div
      class="contextmenu-container"
      v-if="contextmenu.show"
      :style="contextmenuStyle"
    >
      <div class="content">
        <div class="item" @click="handlerContextmenuCloseOther">
          <span class="label">关闭其他</span>
        </div>
        <div class="item" @click="handlerContextmenuCloseAll">
          <span class="label">关闭所有</span>
        </div>
        <div
          class="item"
          @click="handlerContextmenuCloseLeft"
          v-if="contextmenu.isLeft"
        >
          <span class="label">关闭左侧</span>
        </div>
        <div
          class="item"
          @click="handlerContextmenuCloseRight"
          v-if="contextmenu.isRight"
        >
          <span class="label">关闭右侧</span>
        </div>
      </div>
      <!-- <div class="footer">
        <div class="item">
          <span class="label">置左</span>
        </div>
      </div> -->
    </div>
    <!-- 右侧抽屉(设置) -->
    <settingDrawer v-model:visible="settingDrawerVisible" />
    <!-- 演示版：获取完整版源码悬浮按钮 -->
    <f-contact />
  </div>
</template>
<script setup lang="ts" name="layout">
import asideMenu from "./aside.vue";
import { delTokenUser, getLocalStoreUserInfo, hasUserInfo } from "@/utils/auth";
import bus from "@/utils/bus";
import { TagItem, useMenuStore } from "@/store/menu";
import { usePermissionStore } from "@/store/permission";
import settingDrawer from "./components/settingDrawer.vue";
import AuraAIEntry from "./components/AuraAIEntry.vue";
import fContact from "@/components/f-contact/index.vue";
import { closeSSE } from "@/sse/sse";
import { getUserTenantDept } from "@/api/user/userBrief";

const router = useRouter();
const route = useRoute();
const tags = ref<Array<TagItem>>([]);
// 选择仪表盘
const dashboardSelect = ref(false);
// 系统设置抽屉
const settingDrawerVisible = ref(false);
// 权限
const perStore = usePermissionStore();
// 菜单
const menuStore = useMenuStore();
tags.value = menuStore.tags;
// 全局通知
const noticeShow = ref(false);
let cachMenuTags: any = localStorage.getItem("menu-tags");
if (cachMenuTags) {
  menuStore.tags = JSON.parse(cachMenuTags);
  tags.value = menuStore.tags;
}
// 企业名称
const enterprise = import.meta.env.VITE_APP_ENTERPRISE;
// 用户信息
const userInfo: Ref = ref("");
// 当前用户所属租户名（顶栏展示；接口异常或为空则不展示，静默处理）
const tenantName = ref("");
/** 加载当前用户所属租户名（失败/为空时静默，不提示也不展示） */
const loadTenantName = async () => {
  try {
    const { data: res } = await getUserTenantDept();
    const name = res?.result?.tenant_name;
    if (name) tenantName.value = name;
  } catch {
    // 接口异常静默处理：不提示、不展示
  }
};
let isLogout = false;
// 右键菜单
const contextmenu = reactive({
  show: false,
  x: 0,
  y: 0,
  isLeft: false,
  isRight: false,
  index: -1,
});
// 面包屑列表
const breadcrumbList = ref<any[]>([]);
let previousTagsLength = ref(0);

// 右键菜单样式
const contextmenuStyle = computed(() => {
  return {
    left: contextmenu.x + "px",
    top: contextmenu.y + "px",
  };
});
/** 标签显示名称映射（同名标签拼接父级 title 区分） */
const tagDisplayNames = computed(() => {
  const list = tags.value;
  const nameCount: Record<string, number> = {};
  for (const t of list) {
    const n = (t as any).name;
    nameCount[n] = (nameCount[n] || 0) + 1;
  }
  const result: Record<string, string> = {};
  for (const t of list) {
    const name = (t as any).name;
    if ((nameCount[name] || 0) <= 1) {
      result[(t as any).path] = name;
      continue;
    }
    const parentTitle = findParentTitle(menuStore.menus, (t as any).path);
    result[(t as any).path] = parentTitle ? parentTitle + "/" + name : name;
  }
  return result;
});

// 监听标签
watch(menuStore.tags, (tags: any) => {
  if (isLogout) return;

  const newTagAdded = tags.length > previousTagsLength.value;
  previousTagsLength.value = tags.length;
  tags.value = tags;
  const itemIndex = tags.findIndex((e: any) => e.select);
  if (itemIndex != -1) {
    if (newTagAdded && tags.length > 0) {
      setTimeout(() => {
        scrollTags(itemIndex);
      }, 300);
    } else {
      scrollTags(itemIndex);
    }
  }

  // 清空
  if (tags.value.length == 0) {
    dashboardSelect.value = true;
    bus.emit("nav-path", "");
    router.push({
      path: "/",
      replace: true,
    });
    localStorage.removeItem("menu-tags");
    return;
  }
  localStorage.setItem("menu-tags", JSON.stringify(tags.value));
});
// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    generateBreadcrumb(newPath);
  },
  { immediate: true },
);

/** 初始化 */
const start = () => {
  if (hasUserInfo()) {
    userInfo.value = getLocalStoreUserInfo();
  }
  loadTenantName();
};
/** 退出登录 */
const logout = () => {
  isLogout = true;
  menuStore.logoutTagHandler();
  delTokenUser();
  closeSSE();
  setTimeout(() => {
    isLogout = false;
  }, 1000);
  router.replace("/login");
};
/** 选择仪表盘菜单项 */
const selectDashboardHandler = () => {
  router.push("/admin/dashboard");
  dashboardSelect.value = true;
  bus.emit("nav-path", "");
};
/** 右键事件 */
const handlerContextmenu = (index: number) => {
  if (tags.value.length == 1) return;

  const element: Element | null = document.getElementById(`tab-${index}`);
  if (!element) return;

  contextmenu.isLeft = false;
  contextmenu.isRight = false;
  for (let i = 0; i < tags.value.length; i++) {
    if (i < index) {
      contextmenu.isLeft = true;
    } else if (i > index) {
      contextmenu.isRight = true;
    }
  }

  const rect = element.getBoundingClientRect();
  const menuWidth = 140;
  const windowWidth = window.innerWidth;

  let x = rect.left;
  let y = rect.top + rect.height + 5;

  // 检查右侧空间是否足够，如果不足则向左偏移
  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 10; // 10是边距
  }

  contextmenu.x = x;
  contextmenu.y = y;
  contextmenu.index = index;
  contextmenu.show = true;
};
/** 右键事件-关闭其他 */
const handlerContextmenuCloseOther = () => {
  const item = tags.value[contextmenu.index];
  handlerSelect(item);
  const arr = tags.value.filter((e) => e != item);
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    handlerRemoveTag(item);
  }
};
/** 右键事件-关闭所有 */
const handlerContextmenuCloseAll = () => {
  selectDashboardHandler();
  const arr = tags.value.filter(() => true);
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    handlerRemoveTag(item);
  }
};
/** 右键事件-关闭左侧 */
const handlerContextmenuCloseLeft = () => {
  let arr: any[] = [];
  for (let i = 0; i < tags.value.length; i++) {
    const element = tags.value[i];
    if (contextmenu.index == i) {
      break;
    }
    arr.push(element);
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    handlerRemoveTag(item);
  }
};
/** 右键事件-关闭右侧 */
const handlerContextmenuCloseRight = () => {
  let arr: any[] = [];
  for (let i = 0; i < tags.value.length; i++) {
    const element = tags.value[i];
    if (i <= contextmenu.index) {
      continue;
    }
    arr.push(element);
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    handlerRemoveTag(item);
  }
};
/** 滚动标签 */
const scrollTags = (index: number) => {
  const tagElement: Element | null = document.querySelector(".tabs");
  if (!tagElement) return;

  const element: any = document.getElementById(`tab-${index}`);
  if (!element) return;

  const tagRect = tagElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const elementLeftRelative = elementRect.left - tagRect.left;
  const elementRightRelative = elementLeftRelative + elementRect.width;
  // 如果元素在容器左侧不可见区域
  if (elementLeftRelative < 0) {
    tagElement.scrollTo({
      left: element.offsetLeft - 20,
      behavior: "smooth",
    });
    return;
  }

  // 如果元素在容器右侧不可见区域
  if (elementRightRelative > tagRect.width) {
    // 使用相对于标签容器的正确计算
    const overflowRight = elementRightRelative - tagRect.width;
    tagElement.scrollTo({
      left: tagElement.scrollLeft + overflowRight + 20,
      behavior: "smooth",
    });
  }
};

/** 从菜单树中查找指定路径对应的父级菜单 title */
const findParentTitle = (menuList: any[], targetPath: string): string => {
  for (const menu of menuList) {
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.addr === targetPath) {
          return menu.short_name || menu.name;
        }
      }
      const result = findParentTitle(menu.children, targetPath);
      if (result) return result;
    }
  }
  return "";
};
/** 选择标签 */
const handlerSelect = (item: any) => {
  dashboardSelect.value = false;
  router.push(item.fullPath);
  bus.emit("nav-path", item.path);
  menuStore.selectTagHandler(
    item.path,
    item.fullPath,
    item.name,
    item.meta || null,
  );
};
/** 删除标签 */
const handlerRemoveTag = (item: any) => {
  const res = menuStore.removeTagHandler(item.path);
  if (!res) return;

  if (item.select) {
    bus.emit("nav-path", res.path);
  }

  router.push({
    path: res.fullPath,
    replace: true,
  });
};
/** 点击事件 */
const layoutClick = () => {
  if (contextmenu.show) {
    contextmenu.show = false;
  }
};

/** 生成面包屑列表的函数 */
function generateBreadcrumb(path: string) {
  const menus = menuStore.menus; // 假设菜单数据存在 menuStore.menus 中
  const findMenu = (
    menuList: any[],
    path: string,
    breadcrumb: any[] = [],
  ): any[] => {
    for (let i = 0; i < menuList.length; i++) {
      const menu = menuList[i];
      const newBreadcrumb = [
        ...breadcrumb,
        { name: menu.name, addr: menu.addr },
      ];

      if (menu.addr === path) {
        return newBreadcrumb;
      }

      if (menu.children && menu.children.length > 0) {
        const result = findMenu(menu.children, path, newBreadcrumb);
        if (result.length > 0) {
          return result;
        }
      }
    }
    return [];
  };
  const result = findMenu(menus, path);
  if (result.length > 0) {
    breadcrumbList.value = result;
    return;
  }
  breadcrumbList.value = [];
}

onMounted(() => {
  if (route.name == "dashboard") {
    menuStore.uncheckTagHandler();
    dashboardSelect.value = true;
  }

  const itemIndex = tags.value.findIndex((e: any) => e.select);
  if (itemIndex != -1) {
    setTimeout(() => {
      scrollTags(itemIndex);
    }, 500);
  }

  // 监听仪表盘反选
  bus.on("uncheck-dashboard", (v: any) => {
    dashboardSelect.value = v;
  });
});

start();
</script>
<style lang="scss" scoped>
.layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: white;
  overflow: hidden;

  .app-notice {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background-color: red;
  }

  .notice-remote-login {
    height: 40px;
    background-color: rgb(233, 41, 16);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    position: relative;

    & h5 {
      font-size: 18px;
    }

    & .login-addr {
      margin-right: 20px;
    }

    & .login-ip {
      margin-left: 20px;
    }

    & .out {
      position: absolute;
      right: 15px;
    }
  }

  .layout-container {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;

    & .layout-main {
      flex: 1;
      min-width: 600px;
      display: flex;
      flex-direction: column;
      background-color: var(--layout-main-bg-color);

      .navbar-container {
        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        padding-left: 10px;
        background-color: #fff;

        .system-title {
          flex: 1;
          font-weight: 500;
          font-size: 25px;
        }
        .right-info {
          display: flex;
          align-items: center;
          column-gap: 20px;

          .active {
            display: flex;
            align-items: center;
            column-gap: 15px;
          }

          .user-info {
            display: flex;
            align-items: center;
            cursor: pointer;
            user-select: none;

            .avatar {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              margin-right: 10px;
            }
            .nickname {
              font-size: 14px;
              font-weight: 500;
              margin-right: 5px;
            }

            .user-meta {
              display: flex;
              flex-direction: column;
              line-height: 1.2;

              .user-meta-top {
                display: flex;
                align-items: center;
              }

              .tenant-name {
                margin-top: 2px;
                font-size: 12px;
                color: #909399;
              }
            }
          }
        }
      }

      & .tabs-container {
        position: relative;
        padding: 0 10px;
        display: flex;
        align-items: center;
        height: 45px;
        box-sizing: border-box;
        background-color: #fff;
        overflow: hidden;

        &::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background-color: #eaeef5c7;
          transform: scaleY(0.7);
        }

        &::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background-color: #eaeef5de;
          transform: scaleY(0.7);
        }

        & .left-box {
          margin-right: 10px;
          position: relative;
          max-width: 200px;
          height: 33px;
          box-sizing: border-box;
          display: flex;
          white-space: nowrap;
          overflow-x: scroll;
          column-gap: 15px;
          display: flex;
          align-items: center;

          & .tag {
            margin-right: 0 !important;
          }
        }

        & .line {
          width: 0px;
          background-color: #eaeef5;
          margin: 5px 0;
          margin-right: 2px;
          position: relative;

          &::after {
            content: "";
            position: absolute;
            right: 0;
            top: -3px;
            bottom: -3px;
            width: 10px;
            box-shadow: 6px 0 10px 5px #fff;
            z-index: 11;
          }
        }

        & .content-box {
          flex: 1;
          position: relative;
          height: 100%;

          & .tabs {
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            white-space: nowrap;
            overflow-x: scroll;
            padding-right: 10px;
            padding-left: 8px;
          }
        }

        & .tag {
          position: relative;
          padding-left: 10px;
          padding-right: 20px;
          user-select: none;
          cursor: pointer;
          position: relative;
          background-color: #f5f7fa;
          border-color: #e5e5eb;
          color: #717377;
          height: 30px;
          font-size: 13px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          margin-right: 7px;
          border-radius: 6px;
          background-color: #fff;

          &:hover {
            color: var(--el-color-primary);
            border-color: var(--el-color-primary);
            transition: all 0.3s;

            .icon {
              opacity: 1 !important;
              transition: all 0.2s;
              color: var(--el-color-primary) !important;
              z-index: 10;
            }
          }

          .tag-box {
            display: flex;
            align-items: center;
            z-index: 10;

            .icon {
              position: absolute;
              top: 50%;
              right: 4px;
              transform: translateY(-50%);
              opacity: 0;
            }

            .label {
              margin-left: 5px;
            }

            .meta-icon {
              width: 14px;
            }
          }
        }

        .tag-active {
          border-color: var(--el-color-primary);
          color: var(--el-color-primary);
          position: relative;
          z-index: 1;
          background-color: transparent;

          &::after {
            content: "";
            position: absolute;
            inset: 0;
            background-color: var(--el-color-primary);
            opacity: 0.09;
          }
        }
      }

      & .left-box::-webkit-scrollbar {
        width: 3px !important;
        height: 3px;
        display: none;
      }

      & .tabs::-webkit-scrollbar {
        width: 3px !important;
        height: 3px;
        display: none;
      }

      & ._page_container {
        flex: 1;
        min-height: 0;
        background-color: var(--layout-main-bg-color);
        position: relative;
        z-index: 10;
        overflow: hidden;
      }
    }
  }

  .contextmenu-container {
    position: fixed;
    left: 300px;
    top: 200px;
    padding: 10px 0;
    background-color: white;
    z-index: 10;
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    box-shadow:
      0px 16px 32px 0px rgba(27, 36, 44, 0.06),
      0px 0px 0px 1px rgba(27, 36, 44, 0.04);
    animation: show-contextmenu-container 0.3s ease-in-out forwards;
    opacity: 0;
    transform: translateY(10px);

    .content {
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      row-gap: 2px;

      .item {
        display: flex;
        justify-content: center;
        padding: 8px 15px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        user-select: none;

        .label {
          font-size: 14px;
          color: #272e35;
        }

        &:hover {
          background-color: var(--el-color-primary-light-9);
          .label {
            color: var(--el-color-primary);
          }
        }
        &:active {
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
    .footer {
      margin-top: 10px;

      .item {
        display: flex;
        justify-content: center;
        padding: 8px 30px;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        border-top: 1px solid #e9ecef;

        .label {
          font-size: 14px;
          color: #272e35;
        }
      }
    }
  }

  @keyframes show-contextmenu-container {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
