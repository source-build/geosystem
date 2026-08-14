<template>
  <div class="aside">
    <asideLeftHorizontal v-if="menuShowType == 'left-horizontal'" />
    <asideLeftSubmenuHorizontal v-if="menuShowType == 'left-submenu-horizontal'" />
  </div>
</template>
<script setup lang="ts">
import { systemConfig } from "@/hooks/config";
import asideLeftHorizontal from "./components/asideLeftHorizontal.vue";
import asideLeftSubmenuHorizontal from "./components/asideLeftSubmenuHorizontal.vue";

const systemConf = systemConfig;
// 默认菜单类型 left-horizontal:侧边菜单栏 left-submenu-horizontal:侧边菜单栏二级菜单
const defaultMenuType = "left-submenu-horizontal";

// 菜单栏展示类型
const menuShowType = computed(() => {
  if (!systemConf.menuType) {
    return defaultMenuType;
  }

  if (!["left-submenu-horizontal", "left-horizontal"].includes(systemConf.menuType)) {
    return defaultMenuType;
  }

  return systemConf.menuType;
});
</script>
<style lang="scss" scoped>
.aside{
  display: flex;
}
</style>
