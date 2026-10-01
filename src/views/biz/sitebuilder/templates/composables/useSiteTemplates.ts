import { computed, ref } from "vue";
import { siteTemplates, type SiteTemplate } from "@/views/biz/sitebuilder/siteTemplates";

/** 管理站点模板筛选 */
export function useSiteTemplates() {
  /** 当前站点类型筛选 */
  const activeType = ref<"all" | SiteTemplate["siteType"]>("all");
  /** 过滤后的模板列表 */
  const templateList = computed(() => activeType.value === "all" ? siteTemplates : siteTemplates.filter((item) => item.siteType === activeType.value));

  return { activeType, templateList };
}
