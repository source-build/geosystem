import { createVNode, nextTick } from "vue";
import gtoast from "./f-toast.vue";
import { render } from "vue";

/**
 * 全局消息提示组件
 * 组件已在全局配置中注册，无需手动引入，直接调用即可。
 */

// loading 类型的单例 DOM
let loadingSnackbar: any = null;

// 非 loading 类型的多实例管理
interface ToastInstance {
  dom: HTMLElement;
  timer: any;
  id: number;
  offsetHeight: number;
}

let toastInstances: ToastInstance[] = [];
let toastIdCounter = 0;
const TOAST_GAP = 16; // toast 之间的间距
const TOAST_INITIAL_TOP = 50; // 第一个 toast 的 top 值

/** 显示消息提示 */
export function showToast(
  msg: string,
  type: string = "success",
  duration = 1000 * 2
) {
  // loading 类型保持单例模式
  if (type === "loading") {
    return showLoadingToast(msg);
  }

  // success 和 fail 类型支持多实例
  showMultiToast(msg, type, duration);
}

/** 显示 loading 类型的 toast（单例模式） */
function showLoadingToast(msg: string) {
  // 清除所有现有的 toast 提示
  clearAllToasts();

  // 清除之前的 loading
  if (loadingSnackbar) {
    render(null, loadingSnackbar);
    loadingSnackbar = null;
  }

  const divVNode = createVNode("div", { class: "f-toast-container" });
  render(divVNode, document.body);
  const div: any = divVNode.el;

  const comVNode = createVNode(gtoast, { msg, type: "loading" });
  render(comVNode, div);

  loadingSnackbar = div;

  return () => {
    render(null, div);
    loadingSnackbar = null;
  };
}

/** 显示多实例 toast（success/fail） */
function showMultiToast(msg: string, type: string, duration: number) {
  const id = toastIdCounter++;

  // 创建容器
  const container = document.createElement("div");
  container.className = "f-toast-container";
  container.style.cssText = "pointer-events: none;";
  document.body.appendChild(container);

  // 渲染组件
  const comVNode = createVNode(gtoast, { msg, type });
  render(comVNode, container);

  // 计算智能阅读时间
  if (msg && duration > 0) {
    let dr = (msg.length / 300) * 60 * 1000;
    if (dr > 1000 * 2) {
      duration = dr;
    }
  }

  // 创建实例对象
  const instance: ToastInstance = {
    dom: container,
    timer: null,
    id,
    offsetHeight: 0,
  };

  // 添加到实例列表
  toastInstances.push(instance);

  // 等待 DOM 渲染完成
  nextTick(() => {
    const toastElement = container.querySelector(
      ".f-success-toast, .f-fail-toast"
    ) as HTMLElement;
    if (!toastElement) {
      removeToastInstance(id);
      return;
    }

    // 获取高度
    instance.offsetHeight = toastElement.offsetHeight;

    // 计算并设置初始位置
    const topPosition = getToastTop(instance);
    toastElement.style.top = `${topPosition}px`;

    // 设置定时器
    if (duration > 0) {
      instance.timer = setTimeout(() => {
        removeToastInstance(id);
      }, duration);
    }
  });
}

/** 获取 toast 应该显示的 top 位置 */
function getToastTop(targetInstance: ToastInstance): number {
  let top = TOAST_INITIAL_TOP;

  for (const instance of toastInstances) {
    if (instance.id === targetInstance.id) {
      break;
    }
    top += instance.offsetHeight + TOAST_GAP;
  }

  return top;
}

/** 移除指定的 toast 实例 */
function removeToastInstance(id: number) {
  const index = toastInstances.findIndex((item) => item.id === id);
  if (index === -1) return;

  const instance = toastInstances[index];

  // 清除定时器
  if (instance.timer) {
    clearTimeout(instance.timer);
  }

  // 移除 DOM
  render(null, instance.dom);
  instance.dom.remove();

  // 从数组中移除
  toastInstances.splice(index, 1);

  // 更新剩余 toast 的位置
  updateAllToastPositions();
}

/** 更新所有 toast 的位置 */
function updateAllToastPositions() {
  let top = TOAST_INITIAL_TOP;
  toastInstances.forEach((instance) => {
    const toastElement = instance.dom.querySelector(
      ".f-success-toast, .f-fail-toast"
    ) as HTMLElement;
    if (toastElement) {
      toastElement.style.top = `${top}px`;
      top += instance.offsetHeight + TOAST_GAP;
    }
  });
}

/** 清除所有 toast 提示（不包括 loading） */
function clearAllToasts() {
  const instances = [...toastInstances];
  instances.forEach((instance) => {
    if (instance.timer) {
      clearTimeout(instance.timer);
    }
    render(null, instance.dom);
    instance.dom.remove();
  });

  // 清空数组
  toastInstances = [];
}

/** 成功提示 */
export function showToastOk(msg: string = "操作成功") {
  hideLoading();
  showToast(msg, "success");
}

/** 成功提示 */
export function showToastSuccess(msg: string = "操作成功") {
  hideLoading();
  showToast(msg, "success");
}

/** 失败提示 */
export function showToastFail(msg: string = "操作失败") {
  hideLoading();
  showToast(msg, "fail");
}

/** 错误提示 */
export function showToastError(msg: string = "操作失败") {
  hideLoading();
  showToast(msg, "fail");
}

/** 显示加载框 */
export function showLoading(msg: string = "加载中...") {
  showToast(msg, "loading");
}

/** 关闭加载框 */
export function hideLoading() {
  if (loadingSnackbar != null) {
    render(null, loadingSnackbar);
    loadingSnackbar = null;
  }
}
