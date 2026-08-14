<template>
  <div class="main-container">
    <el-aside :width="isCollapse ? '60px' : '200px'" class="aside">
      <div class="aside-header animation-show">
        <div class="box" :class="{ 'box-collapse': isCollapse }">
          <img class="logo" src="/logo.png" />
          <div v-show="!isElementCollapse">
            <span>{{ appName }}</span>
          </div>
        </div>
      </div>
      <div class="aside-menu-box">
        <el-menu
          class="aside-menu"
          router
          :default-active="defaultSelectPath"
          :collapse-transition="false"
          :collapse="isElementCollapse"
          @select="menuSelectHandler"
          :style="isElementCollapse ? '' : 'width:100%'"
        >
          <fit-menu-item
            :data="menus"
            :currentSelectPath="currentSelectPath"
            :isCollapse="isElementCollapse"
            activeStyleMode="background-color"
          />
        </el-menu>
      </div>
      <div class="aside-footer animation-show">
        <div
          class="footer-box"
          :class="{ 'footer-box-collapse': isElementCollapse }"
          @click="router.push('/biz/user/accountInfo')"
        >
          <div class="avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 3L3 8.5l9 12.5 9-12.5L17.5 3H6.5z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
                fill="none"
              />
              <path d="M3 8.5h18" stroke="currentColor" stroke-width="1.2" />
              <path
                d="M8.5 3l-2 5.5L12 21M15.5 3l2 5.5L12 21"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="user-info" v-show="!isElementCollapse">
            <div class="info-row">
              <span class="username">蓝鲸会员</span>
              <span class="flex-1"></span>
              <span class="icon-refresh" @click.stop="refreshAccountBalance">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </span>
              <span class="icon-arrow"></span>
            </div>
            <div class="balance-row">
              <span class="balance-label">算力</span>
              <span class="balance-value"><count-to :startVal="prevBalanceValue" :endVal="balanceDisplay.value" :duration="800" :decimals="balanceDisplay.decimals" />{{ balanceDisplay.suffix }}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        class="switch-open animation-show"
        :style="`left:${isCollapse ? 45 : 185}px`"
        @click="onIsCollapseChang"
      >
        <svg
          :style="`transform:rotate(${isCollapse ? 180 : 0}deg);`"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          focusable="false"
          aria-hidden="true"
          class=""
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7.31 8l2.97-2.97a.75.75 0 10-1.06-1.06l-3.5 3.5a.75.75 0 000 1.06l3.5 3.5a.75.75 0 101.06-1.06L7.31 8z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </el-aside>
  </div>
</template>
<script setup lang="ts">
import { useMenuStore } from "@/store/menu";
import { CountTo } from "vue3-count-to";
import { showToastFail } from "@/components/f-toast";
import {
  getTenantAccountInfo,
  getTenantUserAccountInfo,
} from "@/api/tenantAccount";
import bus from "@/utils/bus";

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const appName = "数据中台";
const defaultSelectPath = ref<string>("");
const currentSelectPath = ref<string>("");
const menus = ref(menuStore.menus);
const isCollapse = ref<boolean>(false);
const isElementCollapse = ref<boolean>(false);
const cacheCollapseStatus = window.localStorage.getItem("NAV_STATUS");
isCollapse.value = cacheCollapseStatus == "true";
isElementCollapse.value = isCollapse.value;

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
let accountBalanceType = "tenant";

watch(route, (v: any) => {
  currentSelectPath.value = v.path;
  defaultSelectPath.value = v.path;
  window.localStorage.setItem("NAV_PATH", v.path);
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

function run() {
  if (route.name == "dashboard") {
    defaultSelectPath.value = "";
    currentSelectPath.value = "";
  }

  if (route.fullPath != "/") {
    defaultSelectPath.value = route.fullPath;
  } else {
    defaultSelectPath.value = window.localStorage.getItem("NAV_PATH") || "";
  }

  if (defaultSelectPath.value) {
    currentSelectPath.value = defaultSelectPath.value;
  }
}
function onListen() {
  bus.on("nav-path", (v: any) => {
    if (v == "") {
      defaultSelectPath.value = "";
      currentSelectPath.value = "";
      return;
    }
    defaultSelectPath.value = v;
    menuSelectHandler(v, null, null);
  });
}
function onUnListen() {
  bus.off("nav-path");
}

onMounted(() => {
  onListen();
  bus.on("refresh-account-balance", forceRefreshAccountBalance);
  refreshAccountBalance();
});
onUnmounted(() => {
  onUnListen();
  bus.off("refresh-account-balance", forceRefreshAccountBalance);
});

/** 刷新账户算力 */
const refreshAccountBalance = async () => {
  if (accountBalanceType === "tenant") {
    await fetchTenantAccountBalance();
  } else {
    await fetchTenantUserAccountBalance();
  }
};

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

run();
</script>
<style lang="scss" scoped>
:deep(.el-sub-menu__title) {
  transition: all 0.2s !important;
}

.switch_team_btn {
  user-select: none;
  cursor: pointer;
  &:hover {
    color: #272727;
  }
}

.main-container{
  display: flex;
  padding: 6px 4px 6px 6px; //圆角菜单
  box-sizing: border-box;
}

.aside {
  position: relative;
  display: flex;
  flex-direction: column;
  transition: width 0.5s;
  border-right: 1px solid #f1f2f4;
  overflow-x: hidden;
  background-color: var(--layout-container-bg-color);
  z-index: 2;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  border-radius: 18px; //圆角菜单
}
.aside:hover .switch-open {
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
      width: 35px;
      transition: all 0.5s;
    }

    span {
      font-size: 26px;
      white-space: nowrap;
      margin-left: 10px;
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
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 100%
    );
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
  transition: all 0.2s;
  z-index: 100;
}

/* 隐藏滚动条 */
.aside-menu::-webkit-scrollbar {
  width: 0;
}
</style>
