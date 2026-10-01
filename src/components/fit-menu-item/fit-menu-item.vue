<template>
  <template v-for="(item, index) in props.data">
    <!-- 目录 -->
    <el-sub-menu
      :index="`${item.id}`"
      v-if="item.type == 1 && item.show == 1"
      :disabled="item.status == 2"
    >
      <template #title>
        <div class="url_icon" v-if="item.icon_type == 1">
          <f-svg-icon
            :name="item.icon"
            size="18px"
            v-if="item.icon"
            :color="
              isChildActive(item)
                ? props.isCollapse
                  ? 'var(--el-color-primary)'
                  : '#fff'
                : '#dedede'
            "
            style="margin-right: 2px"
          />
        </div>
        <span v-text="item.name" style="font-weight: 400" />
        <span v-if="isLocked(item)" class="edition-badge">完整版</span>
      </template>
      <fit-menu-item
        :data="item.children"
        :parentIndex="`${index + 1}`"
        :currentSelectPath="props.currentSelectPath"
        v-if="item.children && item.children.length > 0"
        :activeStyleMode="activeStyleMode"
      />
    </el-sub-menu>

    <!-- 菜单 -->
    <el-menu-item
      :index="item.addr"
      v-else
      :disabled="item.status == 2"
      v-show="item.show == 1"
      :class="{ [menuItemClass]: isPathMatch(item.addr, props.currentSelectPath) }"
    >
      <div class="url_icon" v-if="item.icon_type == 1">
        <f-svg-icon
          :name="item.icon"
          size="18px"
          :color="isPathMatch(item.addr, props.currentSelectPath) ? '#fff' : '#dedede'"
          v-if="item.icon"
          style="margin-right: 2px"
        />
      </div>
      <template #title>
        <span class="menu-title-text">{{ item.name }}</span>
        <span v-if="isLocked(item)" class="edition-badge">完整版</span>
      </template>
    </el-menu-item>
  </template>
</template>
<script setup lang="ts" name="fitMenuItem">
const props = defineProps({
  data: {
    type: Array<any>,
    default: [],
  },
  parentIndex: {
    type: String,
    default: "",
  },
  currentSelectPath: {
    type: String,
    default: "",
  },
  isCollapse: {
    type: Boolean,
    default: false,
  },
  // 激活样式模式
  // linear-gradient 线性渐变
  // background-color 背景颜色
  activeStyleMode: {
    type: String,
    default: "linear-gradient",
  },
});

const isLocked = (item: any): boolean => {
  if (item.locked) return true;
  const visibleChildren = (item.children || []).filter((child: any) => child.show == 1);
  return visibleChildren.length > 0 && visibleChildren.every((child: any) => isLocked(child));
};

const menuItemClass = computed(() => {
  let className = "menu-item-active";
  // 线性渐变
  if (props.activeStyleMode === "linear-gradient") {
    className = "menu-item-linear-gradient-active";
  }
  return className;
});

/**
 * 检查当前路径是否匹配菜单地址（支持动态参数路由）
 *
 * 为什么需要这个函数：
 * - 问题：当路由包含参数时（如 /goods/detail/123），原来的精确匹配 === 会失败
 *   导致菜单项无法应用 active 样式类（menu-item-active）
 * - 解决：使用前缀匹配，让带参数的路由也能匹配到对应的菜单项
 *
 * @param menuAddr - 菜单项的地址，如 "/goods/detail"
 * @param currentPath - 当前路由路径，可能包含参数，如 "/goods/detail/123?tab=info"
 * @returns 是否匹配
 *
 * 使用场景：
 * - 判断是否添加 active 样式类（第42行）
 * - 判断图标颜色（第48行）
 * - 判断父菜单是否有子项被激活（第118行）
 *
 * 示例：
 * isPathMatch("/goods/detail", "/goods/detail/123") → true
 * isPathMatch("/goods/detail", "/goods/detail") → true
 * isPathMatch("/goods/detail", "/goods/list") → false
 */
const isPathMatch = (menuAddr: string, currentPath: string): boolean => {
  if (!menuAddr || !currentPath) return false;

  // 步骤1：清理路径，移除查询参数(?)和哈希(#)
  // 例如：/goods/detail/123?tab=info#section → /goods/detail/123
  const cleanPath = currentPath.split('?')[0].split('#')[0];
  const cleanMenuAddr = menuAddr.split('?')[0].split('#')[0];

  // 步骤2：精确匹配 - 路径完全相同
  // 例如：/goods/detail === /goods/detail
  if (cleanMenuAddr === cleanPath) {
    return true;
  }

  // 步骤3：前缀匹配 - 支持动态参数路由
  // 判断：当前路径是否以"菜单地址/"开头
  // 例如：/goods/detail/123 以 /goods/detail/ 开头 → true
  // 注意：必须加 '/' 避免误匹配（/goods/detail 不应匹配 /goods/detail-backup）
  if (cleanPath.startsWith(cleanMenuAddr + '/')) {
    return true;
  }

  return false;
};

/**
 * 递归检查菜单项或其子项是否被激活
 *
 * 用途：判断父级菜单的图标是否应该高亮
 * - 当访问 /goods/detail/123 时
 *
 * @param menuItem - 菜单项对象
 * @returns 该菜单项或其任意子项是否匹配当前路径
 */
const isChildActive = (menuItem: any): boolean => {
  if (!props.currentSelectPath) return false;

  // 检查当前菜单项是否匹配
  if (isPathMatch(menuItem.addr, props.currentSelectPath)) return true;

  // 递归检查所有子菜单
  if (menuItem.children) {
    return menuItem.children.some((child: any) => isChildActive(child));
  }

  return false;
};
</script>
<style lang="scss" scoped>
.menu-title-text { min-width: 0; overflow: hidden; font-weight: 400; text-overflow: ellipsis; }
.edition-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: auto;
  padding: 2px 5px;
  border: 1px solid rgba(247, 228, 121, 0.28);
  border-radius: 8px;
  color: #f7e479;
  background: rgba(247, 228, 121, 0.08);
  font-size: 9px;
  line-height: 1.2;
}
.url_icon {
  margin-right: 5px;
  display: flex;
  align-items: center;
  & .url_icon_img {
    width: 18px;
    object-fit: cover;
  }
}
.menu-item-active {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background-color: var(--el-color-primary);
  }
}
.menu-item-linear-gradient-active {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0%,
      var(--el-color-primary) 50%,
      rgba(0, 0, 0, 0) 100%
    );
  }
}
</style>
