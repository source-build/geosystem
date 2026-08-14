import type { Directive, DirectiveBinding } from "vue";
import { usePermissionStore, waitForButtonPermissions } from "@/store/permission";

/**
 * v-permission 自定义指令
 * 根据当前浏览器路径自动匹配按钮权限，无权限则移除 DOM 元素
 *
 * 会等待按钮权限异步加载完成后再执行校验，避免权限未就绪时误删元素。
 *
 * 仅用于原生 HTML 元素（如 <button>、<div>），不要用在组件上
 * 组件场景请使用 v-if + checkPermission()
 *
 * 用法：
 *   <el-button v-permission="'add'">新增</el-button>
 *   <el-button v-permission="['edit', 'delete']">操作</el-button>
 */
export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    checkAndRemove(el, binding);
  },
  updated(el, binding) {
    checkAndRemove(el, binding);
  },
};

/** 已处理过的元素集合：每个元素只处理一次，避免 mounted/updated 重复执行导致 display 互相覆盖 */
const processedEls = new WeakSet<HTMLElement>();

/** 等待权限加载完成后，无权限则移除元素 */
function checkAndRemove(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  if (!binding.value) return;
  // 权限不变，每个元素只处理一次（updated 再次触发时直接跳过，避免覆盖）
  if (processedEls.has(el)) return;
  processedEls.add(el);

  // 先隐藏，避免权限未加载时按钮闪现
  el.style.display = "none";

  waitForButtonPermissions().then(() => {
    const store = usePermissionStore();
    const permissions = Array.isArray(binding.value) ? binding.value : [binding.value];
    const hasAny = permissions.some((name) => store.hasPermission(name));
    if (hasAny) {
      // 清除 inline display 恢复可见（不回写旧值，避免被旧逻辑捕获的 "none" 覆盖）
      el.style.display = "";
    } else {
      el.parentNode?.removeChild(el);
    }
  });
}

/**
 * 编程式权限校验函数
 * 用于 v-if 等场景，避免在组件上直接使用 v-permission
 *
 * 用法：
 *   <el-dropdown-item v-if="checkPermission('ban')">封禁</el-dropdown-item>
 *   <el-dropdown-item v-if="checkPermission(['edit', 'delete'])">操作</el-dropdown-item>
 */
export function checkPermission(value: string | string[]): boolean {
  const store = usePermissionStore();
  const permissions = Array.isArray(value) ? value : [value];
  return permissions.some((name) => store.hasPermission(name));
}

/**
 * 编程式权限校验函数（全路径匹配，异步）
 * 传入完整的权限字符（如 "/settings/pricing:add"），等待按钮权限加载完成后校验
 *
 * 用法：
 *   const hasAdd = ref(false)
 *   onMounted(async () => { hasAdd.value = await checkPermissionByFullPath('/settings/pricing:add') })
 *   <el-button v-if="hasAdd">新增</el-button>
 */
export async function checkPermissionByFullPath(value: string | string[]): Promise<boolean> {
  await waitForButtonPermissions();
  const store = usePermissionStore();
  const permissions = Array.isArray(value) ? value : [value];
  return permissions.some((perm) => {
    const lastColon = perm.lastIndexOf(":");
    if (lastColon === -1) return false;
    const path = perm.substring(0, lastColon);
    const name = perm.substring(lastColon + 1);
    return store.hasPermission(name, path);
  });
}
