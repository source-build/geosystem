<template>
  <div class="aside-left-submenu-horizontal">
    <div class="main-container">
      <div class="submenu-nav">
        <div class="header animation-show">
          <div class="box" :class="{ 'box-collapse': isCollapse }">
            <img class="logo" src="/logo.png" />
          </div>
        </div>
        <div class="menus animation-show hide-scrollbar">
          <div class="nav-container" :style="{ '--total-items': firstLevelMenus.length }">
            <div class="nav-items">
              <div v-for="(item, index) in firstLevelMenus" class="nav-item"
                :class="{ active: selectedIndex === index }" @click="selectItem(index)">
                <div class="box">
                  <div class="icon-box">
                    <f-svg-icon :name="item.icon" size="18px" :color="selectedIndex === index
                      ? 'var(--main-color)'
                      : '#c7c7c7'
                      " class="icon" />
                  </div>
                  <span class="label">{{ item.short_name || item.name }}</span>
                  <span v-if="isMenuLocked(item)" class="edition-dot" title="该分组为完整版能力">
                    <el-icon :size="9"><Lock /></el-icon>
                  </span>
                </div>
              </div>
            </div>
            <div class="glider-container">
              <div class="glider" :style="{ transform: `translateY(${selectedIndex * 100}%)` }"></div>
            </div>
          </div>
        </div>
        <div class="h-[1px]"></div>
      </div>
      <el-aside :width="selectedIndex < 0 ? '0px' : isCollapse ? '60px' : '180px'" class="aside">
        <div class="aside-header">
          <div class="box" :class="{ 'box-collapse': isCollapse }">
            <div v-show="!isElementCollapse" class="animation-show">
              <!-- <span>蓝鲸GEO</span> -->
              <img class="logo" src="/logo-text.svg" />
            </div>
          </div>
        </div>
        <div class="aside-menu-box">
          <el-menu class="aside-menu" router :default-active="defaultSelectPath" :collapse-transition="false"
            :collapse="isElementCollapse" @select="menuSelectHandler" :style="isElementCollapse ? '' : 'width:100%'">
            <fit-menu-item :data="currentSubMenus" :currentSelectPath="currentSelectPath"
              :isCollapse="isElementCollapse" activeStyleMode="linear-gradient" />
          </el-menu>
        </div>
        <div class="aside-footer animation-show">
          <div class="footer-box" :class="{ 'footer-box-collapse': isElementCollapse }" @click="jumpToAccount">
            <div class="avatar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 3L3 8.5l9 12.5 9-12.5L17.5 3H6.5z" stroke="currentColor" stroke-width="1.2"
                  stroke-linejoin="round" fill="none" />
                <path d="M3 8.5h18" stroke="currentColor" stroke-width="1.2" />
                <path d="M8.5 3l-2 5.5L12 21M15.5 3l2 5.5L12 21" stroke="currentColor" stroke-width="1.2"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="user-info" v-show="!isElementCollapse">
              <div class="info-row">
                <span class="username">蓝鲸会员</span>
                <span class="flex-1"></span>
                <span class="icon-refresh" @click.stop="refreshAccountBalance">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </span>
                <span class="icon-arrow"></span>
              </div>
              <div class="balance-row">
                <span class="balance-label">算力</span>
                <span class="balance-value"><count-to :startVal="prevBalanceValue" :endVal="balanceDisplay.value"
                    :duration="800" :decimals="balanceDisplay.decimals" />{{ balanceDisplay.suffix }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="switch-open animation-show" :style="`left:${isCollapse ? 90 : 235}px`" :class="{ show: isCollapse }"
          @click="onIsCollapseChang" v-if="selectedIndex >= 0">
          <svg :style="`transform:rotate(${isCollapse ? 180 : 0}deg);`" viewBox="0 0 16 16" fill="currentColor"
            xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" class="">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M7.31 8l2.97-2.97a.75.75 0 10-1.06-1.06l-3.5 3.5a.75.75 0 000 1.06l3.5 3.5a.75.75 0 101.06-1.06L7.31 8z"
              fill="currentColor"></path>
          </svg>
        </div>
      </el-aside>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useMenuStore } from "@/store/menu";
import { CountTo } from "vue3-count-to";
import {
  getTenantAccountInfo,
  getTenantUserAccountInfo,
} from "@/api/tenantAccount";
import bus from "@/utils/bus";
import { checkPermissionByFullPath } from "@/directives/permission";
import { getLocalStoreUserInfo } from "@/utils/auth";

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const defaultSelectPath = ref<string>("");
const currentSelectPath = ref<string>("");
const menus = ref(menuStore.menus);
const isCollapse = ref<boolean>(false);
const isElementCollapse = ref<boolean>(false);
const cacheCollapseStatus = window.localStorage.getItem("NAV_STATUS");
isCollapse.value = cacheCollapseStatus == "true";
isElementCollapse.value = isCollapse.value;
// 当前选中的索引
const selectedIndex = ref(0);
/** 账户算力 */
const accountBalance = ref(0);
/** 上一次算力展示值（用于滚动动画起始值） */
const prevBalanceValue = ref(0);

/** 算力展示值（<10000 直接显示整数，>=10000 显示"万"，万级向下取整到 1 位小数） */
const balanceDisplay = computed(() => {
  const val = accountBalance.value;
  if (val >= 10000) {
    // 向下取整到 1 位小数（65891 -> 6.5万，不四舍五入成 6.6万）
    return { value: Math.floor((val / 10000) * 10) / 10, decimals: 1, suffix: "万" };
  }
  return { value: val, decimals: 0, suffix: "" };
});

watch(accountBalance, (newVal, oldVal) => {
  prevBalanceValue.value = oldVal >= 10000 ? Math.floor((oldVal / 10000) * 10) / 10 : oldVal;
});
/** 上次刷新算力的时间戳 */
let lastFetchTime = 0;
// 账户算力的类型 tenant:租户账户算力 user:租户用户账户算力
let accountBalanceType = "tenant";

const isMenuLocked = (item: any): boolean => {
  if (item.locked) return true;
  const visibleChildren = (item.children || []).filter((child: any) => child.show == 1);
  return visibleChildren.length > 0 && visibleChildren.every((child: any) => isMenuLocked(child));
};

// 获取一级菜单
const firstLevelMenus = computed(() => {
  const menuItems = menus.value.filter(
    (item: any) => item.parent_id === 0 && item.show == 1,
  );
  return menuItems.map((item: any) => ({
    ...item,
    name: item.name.length === 4 ? item.name.substring(0, 2) : item.name,
  }));
});
// 根据当前选中的一级菜单，获取对应的子级菜单
const currentSubMenus = computed(() => {
  if (firstLevelMenus.value.length === 0 || selectedIndex.value < 0) return [];
  const selectedMenu = firstLevelMenus.value[selectedIndex.value];
  return selectedMenu.children || [];
});

/** 选择菜单项 */
const selectItem = (index: number) => {
  bus.emit("uncheck-dashboard", false);
  selectedIndex.value = index;
  if (currentSubMenus.value.length > 0) {
    const resp = currentSubMenus.value.filter((e: any) => e.show != 2);
    if (resp.length) {
      const firstAccessibleMenu = findFirstAccessibleMenu(resp[0]);
      if (firstAccessibleMenu && firstAccessibleMenu.addr) {
        currentSelectPath.value = firstAccessibleMenu.addr;
        defaultSelectPath.value = firstAccessibleMenu.addr;
        window.localStorage.setItem("NAV_PATH", firstAccessibleMenu.addr);
        scrollToSelectedItem();
        router.push(firstAccessibleMenu.addr);
      }
    }
  }
};
/** 递归查找第一个可访问的菜单项（最深层的有地址的菜单项） */
const findFirstAccessibleMenu = (menu: any): any => {
  if (menu.addr) {
    return menu;
  }
  if (menu.children && menu.children.length > 0) {
    return findFirstAccessibleMenu(menu.children[0]);
  }
  return null;
};
/** 检查并滚动到选中的菜单项 */
const scrollToSelectedItem = () => {
  nextTick(() => {
    const menusContainer = document.querySelector(".menus");
    const activeItem = document.querySelector(".nav-item.active");

    if (menusContainer && activeItem) {
      const containerRect = menusContainer.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      if (
        itemRect.top < containerRect.top ||
        itemRect.bottom > containerRect.bottom
      ) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  });
};

// 监听菜单变化
watch(
  () => menuStore.menus,
  (newMenus) => {
    menus.value = newMenus;
    if (selectedIndex.value >= firstLevelMenus.value.length) {
      selectedIndex.value = 0;
    }
    pathIndexMap.clear();
  },
  { deep: true },
);
watch(route, (v: any) => {
  currentSelectPath.value = v.path;
  // 查找匹配的菜单地址，用于 el-menu 的高亮
  const matchedMenuAddr = findMatchingMenuAddr(v.path);
  defaultSelectPath.value = matchedMenuAddr;
  window.localStorage.setItem("NAV_PATH", matchedMenuAddr);
  updateSelectedIndexByPath(v.path);
  scrollToSelectedItem();
});
watch(selectedIndex, () => {
  scrollToSelectedItem();
});

/** 展开/收起 */
const onIsCollapseChang = () => {
  const val = !isCollapse.value;
  if (val) {
    isElementCollapse.value = val;
    nextTick(() => {
      isCollapse.value = val;
    });
  } else {
    isCollapse.value = val;
    nextTick(() => {
      setTimeout(() => {
        isElementCollapse.value = val;
      }, 200);
    });
  }

  window.localStorage.setItem("NAV_STATUS", val.toString());
};
/** 菜单选择 */
const menuSelectHandler = (v: any, indexPath: any, item: any) => {
  // 监听｜仪表盘不选择
  bus.emit("uncheck-dashboard", false);
  window.localStorage.setItem("NAV_PATH", v);
  currentSelectPath.value = v;
};
/** 跳转到账户 */
const jumpToAccount = () => {
  const userInfo = getLocalStoreUserInfo();
  // 普通用户
  if (userInfo.platform_id.startsWith("3")) {
    router.push('/biz/user/accountInfo')
    return
  }
  // 租户用户
  router.push('/admin/enterprise/account')
};

function run() {
  if (route.name == "dashboard") {
    defaultSelectPath.value = "";
    currentSelectPath.value = "";
    selectedIndex.value = -2;
    return;
  }

  let pathToMatch = "";
  if (route.fullPath != "/") {
    pathToMatch = route.fullPath;
  } else {
    pathToMatch = window.localStorage.getItem("NAV_PATH") || "";
  }

  if (pathToMatch) {
    currentSelectPath.value = pathToMatch;
    // 查找匹配的菜单地址
    const matchedMenuAddr = findMatchingMenuAddr(pathToMatch);
    defaultSelectPath.value = matchedMenuAddr;
    updateSelectedIndexByPath(pathToMatch);
    scrollToSelectedItem();
  }
}
const pathIndexMap = new Map<string, number>();

/**
 * 检查当前路径是否匹配菜单地址（支持动态参数路由）
 *
 * 为什么需要这个函数：
 * - 问题：路由带参数时（如 /goods/detail/123），使用 === 精确匹配菜单地址（/goods/detail）会失败
 * - 解决：使用前缀匹配，判断当前路径是否"属于"该菜单项
 *
 * @param menuAddr - 菜单配置的地址，如 "/goods/detail"
 * @param currentPath - 当前浏览器路由路径，可能包含参数、查询字符串等，如 "/goods/detail/123?tab=info"
 * @returns 是否匹配
 *
 * 示例：
 * isPathMatch("/goods/detail", "/goods/detail/123") → true
 * isPathMatch("/goods/detail", "/goods/detail") → true
 * isPathMatch("/goods/detail", "/goods/list") → false
 */
function isPathMatch(menuAddr: string, currentPath: string): boolean {
  if (!menuAddr) return false;

  // 步骤1：清理路径，移除查询参数(?)和哈希(#)
  // 例如：/goods/detail/123?tab=info#section → /goods/detail/123
  const cleanPath = currentPath.split("?")[0].split("#")[0];
  const cleanMenuAddr = menuAddr.split("?")[0].split("#")[0];

  // 步骤2：精确匹配 - 路径完全相同
  // 例如：/goods/detail === /goods/detail
  if (cleanMenuAddr === cleanPath) {
    return true;
  }

  // 步骤3：前缀匹配 - 支持动态参数路由
  // 判断：当前路径是否以"菜单地址/"开头
  // 例如：/goods/detail/123 以 /goods/detail/ 开头 → true
  // 注意：必须加 '/' 避免误匹配（/goods/detail 不应匹配 /goods/detail-backup）
  if (cleanPath.startsWith(cleanMenuAddr + "/")) {
    return true;
  }

  return false;
}

/**
 * 查找匹配当前路径的菜单项地址（用于 el-menu 高亮）
 *
 * 为什么需要这个函数：
 * - 问题：el-menu 的 default-active 属性需要精确匹配菜单项的 index
 *   - 当前路由：/goods/detail/123
 *   - 菜单项 index：/goods/detail
 *   - 如果传入 /goods/detail/123 给 default-active，el-menu 无法高亮
 * - 解决：将带参数的路由路径转换为对应的菜单基础路径
 *
 * @param path - 当前路由路径，如 "/goods/detail/123?tab=info"
 * @returns 匹配的菜单地址，如 "/goods/detail"；如果没找到则返回原路径
 *
 * 示例：
 * findMatchingMenuAddr("/goods/detail/123") → "/goods/detail"
 * findMatchingMenuAddr("/goods/detail") → "/goods/detail"
 * findMatchingMenuAddr("/unknown/path") → "/unknown/path"
 */
function findMatchingMenuAddr(path: string): string {
  let bestMatchAddr = "";
  let bestMatchLength = 0;

  // 遍历所有一级菜单
  for (let i = 0; i < firstLevelMenus.value.length; i++) {
    const menu = firstLevelMenus.value[i];

    // 使用广度优先搜索遍历该菜单及其所有子菜单
    const queue: any[] = [menu];
    while (queue.length > 0) {
      const currentMenu = queue.shift()!;

      // 步骤1：检查当前菜单项是否匹配路径
      if (isPathMatch(currentMenu.addr, path)) {
        const menuAddrLength = currentMenu.addr.length;

        // 步骤2：采用最长匹配原则（选择最精确的匹配）
        // 例如：路径 /goods/detail/123
        // 菜单A: /goods (长度6) ✓匹配
        // 菜单B: /goods/detail (长度13) ✓匹配
        // 最终选择：/goods/detail（更精确）
        if (menuAddrLength > bestMatchLength) {
          bestMatchAddr = currentMenu.addr;
          bestMatchLength = menuAddrLength;
        }
      }

      // 步骤3：将子菜单加入队列继续搜索
      if (currentMenu.children && currentMenu.children.length > 0) {
        queue.push(...currentMenu.children);
      }
    }
  }

  // 返回找到的菜单地址，如果没找到则返回原路径
  return bestMatchAddr || path;
}

/** 根据路径更新选中的索引 */
function updateSelectedIndexByPath(path: string) {
  if (pathIndexMap.has(path)) {
    selectedIndex.value = pathIndexMap.get(path)!;
    return;
  }

  // 存储最佳匹配结果（最长匹配优先）
  let bestMatchIndex = -2;
  let bestMatchLength = 0;

  for (let i = 0; i < firstLevelMenus.value.length; i++) {
    const menu = firstLevelMenus.value[i];
    // 使用队列进行广度优先搜索
    const queue: any[] = [menu];
    while (queue.length > 0) {
      const currentMenu = queue.shift()!;
      if (isPathMatch(currentMenu.addr, path)) {
        const menuAddrLength = currentMenu.addr.length;
        // 选择最长匹配的菜单（更精确）
        if (menuAddrLength > bestMatchLength) {
          bestMatchIndex = i;
          bestMatchLength = menuAddrLength;
        }
      }
      if (currentMenu.children && currentMenu.children.length > 0) {
        queue.push(...currentMenu.children);
      }
    }
  }

  selectedIndex.value = bestMatchIndex;
  pathIndexMap.set(path, bestMatchIndex);
}
function onListen() {
  bus.on("nav-path", (v: any) => {
    if (v == "") {
      defaultSelectPath.value = "";
      currentSelectPath.value = "";
      selectedIndex.value = -2;
      return;
    }
    // 查找匹配的菜单地址
    const matchedMenuAddr = findMatchingMenuAddr(v);
    defaultSelectPath.value = matchedMenuAddr;
    currentSelectPath.value = v;
    window.localStorage.setItem("NAV_PATH", matchedMenuAddr);
    updateSelectedIndexByPath(v);
    scrollToSelectedItem();
  });
  bus.on("refresh-account-balance", forceRefreshAccountBalance);
}
function onUnListen() {
  bus.off("nav-path");
  bus.off("refresh-account-balance", forceRefreshAccountBalance);
}

/** 刷新账户算力 */
async function refreshAccountBalance() {
  if (accountBalanceType === "tenant") {
    await fetchTenantAccountBalance();
  } else if (accountBalanceType === "user") {
    await fetchTenantUserAccountBalance();
  }
}

/** 外部页面触发刷新算力（跳过限频） */
async function forceRefreshAccountBalance() {
  lastFetchTime = 0;
  await refreshAccountBalance();
}

/** 加载租户账户算力（10秒内仅允许刷新一次） */
async function fetchTenantAccountBalance() {
  const now = Date.now();
  const diff = now - lastFetchTime;
  if (diff < 10000) {
    const remain = Math.ceil((10000 - diff) / 1000);
    showToastFail(`${remain}秒后可刷新`);
    return;
  }
  lastFetchTime = now;
  try {
    const { data: response } = await getTenantAccountInfo();
    if (response?.result?.balance !== undefined) {
      accountBalance.value = parseFloat(response.result.balance) || 0;
    }
  } catch {
    // 请求失败保持默认值 0
  }
}

/** 加载用户账户算力（10秒内仅允许刷新一次） */
async function fetchTenantUserAccountBalance() {
  const now = Date.now();
  const diff = now - lastFetchTime;
  if (diff < 10000) {
    const remain = Math.ceil((10000 - diff) / 1000);
    showToastFail(`${remain}秒后可刷新`);
    return;
  }
  lastFetchTime = now;
  try {
    const { data: response } = await getTenantUserAccountInfo();
    if (response?.result?.balance !== undefined) {
      accountBalance.value = parseFloat(response.result.balance) || 0;
    }
  } catch {
    // 请求失败保持默认值 0
  }
}

onMounted(async () => {
  onListen();
  //  租户账户算力
  if (
    await checkPermissionByFullPath(
      "/admin/tenant/accountManage:GetAccountInfo",
    )
  ) {
    accountBalanceType = "tenant";
    fetchTenantAccountBalance();
  } else if (
    await checkPermissionByFullPath("/biz/diagnosis/aiDiagnosis:AccountInfo")
  ) {
    accountBalanceType = "user";
    fetchTenantUserAccountBalance();
  }
});
onUnmounted(() => {
  onUnListen();
});

run();
</script>
<style lang="scss" scoped>
:deep(.el-sub-menu__title) {
  transition: all 0.2s !important;
}

.aside-left-submenu-horizontal {
  display: flex;
  padding: 6px 4px 6px 6px;
  // background-color: var(--layout-main-bg-color);

  .main-container {
    display: flex;
    flex: 1;
    border-radius: 18px; //圆角菜单
    overflow: hidden;
  }

  .submenu-nav {
    background-color: var(--layout-container-bg-color);
    border-right: 1px solid #1d2432;
    display: flex;
    flex-direction: column;

    .header {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.2s;
      height: 70px;
      overflow: hidden;

      .box {
        display: flex;
        align-items: center;
        transition: all 0.2s;

        .logo {
          width: 40px;
          transition: all 0.5s;
        }
      }

      .box-collapse {
        .logo {
          width: 30px;
          transition: all 0.2s;
        }
      }
    }

    .menus {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      border-left: 1px solid #1d2432;

      .nav-container {
        --main-color: #f7e479;
        // --main-color: var(--el-color-primary-light-7);
        --main-color-opacity: #f7e4791c;
        display: flex;
        flex-direction: column;
        position: relative;

        .nav-items {
          position: relative;
          z-index: 1;
        }

        .nav-item {
          cursor: pointer;
          padding: 1rem;
          position: relative;
          color: #c7c7c7;
          transition: all 0.3s ease-in-out;

          .box {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 5px;

            .icon-box {
              .icon {
                margin-bottom: 6px;
                transition: all 0.2s ease-in-out;
              }
            }

            .label {
              font-size: 12px;
              white-space: nowrap;
              transition: all 0.2s ease-in-out;
            }

            .edition-dot {
              position: absolute;
              top: 8px;
              right: 8px;
              display: inline-flex;
              width: 15px;
              height: 15px;
              align-items: center;
              justify-content: center;
              border: 1px solid rgba(247, 228, 121, 0.25);
              border-radius: 50%;
              color: #f7e479;
              background: rgba(247, 228, 121, 0.08);
            }
          }

          &:hover {
            .icon {
              transform: scale(1.13);
            }
          }

          &.active {
            color: var(--main-color);

            &:hover {
              .icon {
                transform: scale(1);
              }
            }
          }
        }

        .glider-container {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(27, 27, 27, 1) 50%,
              rgba(0, 0, 0, 0) 100%);
          width: 1px;
          z-index: 0;
        }

        .glider {
          position: relative;
          height: calc(100% / var(--total-items, 3));
          /* 默认为3个选项 */
          width: 100%;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              var(--main-color) 50%,
              rgba(0, 0, 0, 0) 100%);
          transition: transform 0.5s ease;

          &::before {
            content: "";
            position: absolute;
            height: 60%;
            width: 300%;
            top: 50%;
            transform: translateY(-50%);
            background: var(--main-color);
            filter: blur(10px);
          }

          &::after {
            content: "";
            position: absolute;
            left: 0;
            height: 100%;
            width: 150px;
            background: linear-gradient(90deg,
                var(--main-color-opacity) 0%,
                rgba(0, 0, 0, 0) 40%);
          }
        }
      }
    }
  }
}

.aside {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: width 0.5s;
  overflow-x: hidden;
  background-color: var(--layout-container-bg-color);
  z-index: 2;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
  box-sizing: border-box;

  &:hover .switch-open {
    display: block;
  }

  .aside-header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
    height: 70px;
    overflow: hidden;

    .box {
      display: flex;
      align-items: center;
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      transition: all 0.2s;

      .logo {
        width: 80%;
        transition: all 0.5s;
      }

      span {
        font-size: 26px;
        white-space: nowrap;
        font-weight: 700;
        transition: all 0.2s;
        color: #dedede;
      }
    }

    .box-collapse {
      .logo {
        width: 20px;
        transition: all 0.2s;
      }
    }
  }
}

.aside-menu-box {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  .aside-menu {
    width: 100%;
    height: 100%;
    transition: all 0.2s;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
  }
}

.aside-footer {
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  height: 80px;
  position: relative;
  padding: 0 12px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 12px;
    right: 12px;
    height: 1px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.08) 50%,
        transparent 100%);
  }

  .footer-box {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .avatar {
      flex-shrink: 0;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.55);
      transition:
        color 0.3s,
        background 0.3s;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    &:hover .avatar {
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      margin-left: 10px;
      min-width: 0;
      flex: 1;

      .info-row {
        display: flex;
        align-items: center;
        gap: 4px;

        .username {
          font-size: 13px;
          color: #e0e0e0;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .icon-refresh {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition:
            color 0.2s,
            transform 0.3s;

          svg {
            width: 12px;
            height: 12px;
          }

          &:hover {
            color: rgba(255, 255, 255, 0.6);
            transform: rotate(90deg);
          }
        }

        .icon-arrow {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          position: relative;

          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 4px;
            width: 5px;
            height: 5px;
            border-right: 1.5px solid rgba(255, 255, 255, 0.25);
            border-bottom: 1.5px solid rgba(255, 255, 255, 0.25);
            transform: translateY(-60%) rotate(-45deg);
          }
        }
      }

      .balance-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-top: 3px;

        .balance-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
          white-space: nowrap;
        }

        .balance-value {
          font-size: 12px;
          color: #f7e479;
          font-weight: 600;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .footer-box-collapse {
    justify-content: center;
    padding: 8px;
  }
}

.switch-open {
  display: none;
  position: fixed;
  top: 23px;
  width: 25px;
  height: 25px;
  padding: 2px;
  background-color: #fff;
  color: var(--el-color-primary);
  border-radius: 50%;
  box-shadow:
    0 4px 8px rgba(32, 45, 64, 0.05),
    0 1px 4px rgba(32, 45, 64, 0.08);
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.5s;
  z-index: 100;

  &.show {
    display: flex !important;
  }
}

/* 隐藏滚动条 */
.aside-menu::-webkit-scrollbar {
  width: 0;
}
</style>
