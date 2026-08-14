import router from "@/router";
import { useMenuStore } from "@/store/menu";

/** 返回上一页 */
export function goBack() {
  if (window.history.length > 1) {
    useMenuStore().removeTagHandler(router.currentRoute.value.path);
    router.back();
  }
}
