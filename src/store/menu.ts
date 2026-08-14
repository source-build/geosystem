import bus from "@/utils/bus";
import { defineStore } from "pinia";

export interface TagItem {
  name: string;
  path: string;
  fullPath: string;
  select: boolean;
  meta?: any;
}

export const useMenuStore = defineStore("menu", {
  state: () => ({
    // 菜单列表(树结构)
    menus: [] as Array<any>,
    // 标签页列表
    tags: [] as Array<TagItem>,
  }),
  getters: {},
  actions: {
    /** 选中标签页（如果存在就选择，不存在就插入并选择）*/
    selectTagHandler(
      menuPath: string,
      fullPath: string,
      menuName: string,
      meta?: any,
    ) {
      if (!menuName) return;

      let currentIndex: number = -1;
      const is = this.tags.findIndex((e: TagItem, i) => {
        if (e.select) {
          currentIndex = i;
        }
        e.select = false;
        return e.path == menuPath;
      });
      if (is != -1) {
        for (let i = 0; i < this.tags.length; i++) {
          const item = this.tags[i];
          item.select = item.path == menuPath;
        }
        return;
      }
      // 仪表盘不处理
      if (menuName == "dashboard" || menuPath == "/admin/dashboard") {
        return;
      }

      // 选中导航栏(左侧菜单栏)
      bus.emit("nav-path", menuPath);

      const insertIndex =
        currentIndex === -1 ? this.tags.length : currentIndex + 1;
      let v = {
        name: menuName,
        path: menuPath,
        fullPath: fullPath,
        select: true,
        meta: meta || null,
      };
      this.tags.splice(insertIndex, 0, v);
    },
    /** 取消选中所有标签页 */
    uncheckTagHandler() {
      for (let i = 0; i < this.tags.length; i++) {
        this.tags[i].select = false;
      }
    },
    /** 退出登录时清空所有标签页 */
    logoutTagHandler() {
      for (let i = 0; i < this.tags.length; i++) {
        this.tags[i].select = false;
      }
      this.tags = [];
      localStorage.removeItem("menu-tags");
    },
    /** 移除标签 */
    removeTagHandler(menuPath: string): TagItem | undefined {
      const index = this.tags.findIndex((e: TagItem) => e.path == menuPath);
      if (index == -1) return;

      const delItem = this.tags.splice(index, 1)[0];
      if (!delItem.select) return;

      this.tags.forEach((e) => {
        e.select = false;
      });

      if (index > 0) {
        this.tags[index - 1].select = true;
        return this.tags[index - 1];
      }

      if (index == 0 && this.tags.length > 0) {
        this.tags[index].select = true;
        return this.tags[index];
      }

      const nextIndex = this.tags.find((e: TagItem) => e.select);
      if (!index) return;

      return nextIndex;
    },
    /** 根据菜单路径移除标签项，仅移除标签列表项 */
    removeTag(menuPath: string) {
      const index = this.tags.findIndex((e: TagItem) => e.path == menuPath);
      if (index == -1) return;

      this.tags.splice(index, 1);
    },
  },
});
