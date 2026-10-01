import { computed, ref } from "vue";
import type { SiteBlock, SitePage, SiteSpec } from "@/views/biz/sitebuilder/types";
import { blockTypeMeta } from "../blockCatalog";
import { createEmptySiteSpec } from "../types";

/** 清理规格中的空列表条目（添加后未填写的内容不提交） */
export function sanitizeSiteSpec(spec: SiteSpec): SiteSpec {
  for (const page of spec.pages) {
    for (const block of page.blocks) {
      if (block.type === "gallery") {
        block.content.images = (block.content.images || []).filter((item: any) => String(item?.image_key || "").trim() !== "");
      }
      for (const [key, value] of Object.entries(block.content || {})) {
        if (!Array.isArray(value)) continue;
        block.content[key] = value.filter((item) =>
          typeof item === "object" && item !== null
            ? Object.values(item).some((field) => String(field ?? "").trim() !== "")
            : String(item ?? "").trim() !== "",
        );
      }
    }
  }
  return spec;
}

/** 管理站点编辑草稿 */
export function useSiteDraft() {
  /** 当前站点规格草稿 */
  const siteSpec = ref<SiteSpec>(createEmptySiteSpec());
  /** 当前激活页面 ID */
  const activePageId = ref("");
  /** 当前选中的模块 ID */
  const selectedBlockId = ref("");
  /** 页面列表 */
  const pageList = computed(() => siteSpec.value.pages);
  /** 当前激活页面 */
  const activePage = computed<SitePage>(() => {
    return siteSpec.value.pages.find((page) => page.id === activePageId.value) || siteSpec.value.pages[0];
  });
  /** 当前页面模块列表 */
  const blockList = computed(() => activePage.value?.blocks || []);
  /** 当前选中的模块 */
  const selectedBlock = computed(() => blockList.value.find((item) => item.id === selectedBlockId.value));

  /** 使用版本规格恢复草稿 */
  const setSiteSpec = (value?: SiteSpec) => {
    const spec = value && Array.isArray(value.pages) && value.pages.length ? JSON.parse(JSON.stringify(value)) : createEmptySiteSpec();
    for (const page of spec.pages) {
      page.prompt ||= "";
      for (const block of page.blocks) {
        block.prompt ||= "";
        if (block.type === "cases" && !Array.isArray(block.content.items)) {
          block.content.items = [{ title: "项目案例", client: "", image_key: "", description: block.content.description || "" }];
        }
        if (block.type === "cases") {
          for (const item of block.content.items) item.image_key ||= "";
        }
      }
    }
    siteSpec.value = spec;
    activePageId.value = spec.pages[0].id;
    selectedBlockId.value = spec.pages[0].blocks[0]?.id || "";
  };

  /** 切换编辑页面 */
  const selectPage = (id: string) => {
    if (activePageId.value === id) return;
    activePageId.value = id;
    selectedBlockId.value = activePage.value?.blocks[0]?.id || "";
  };

  /** 生成不重复的页面路径序号 */
  const nextPageIndex = () => {
    const paths = new Set(siteSpec.value.pages.map((page) => page.path));
    for (let i = 1; i <= 99; i++) {
      if (!paths.has(`/page-${i}`)) return i;
    }
    return siteSpec.value.pages.length + 1;
  };

  /** 新增空白页面(存在空模块页面时禁止连续新增) */
  const addPage = () => {
    if (siteSpec.value.pages.some((page) => !page.blocks.length)) {
      showToastFail("请先为空白页面添加模块，再新增页面");
      return false;
    }
    const index = nextPageIndex();
    const page: SitePage = { id: `page-${Date.now()}`, name: `页面 ${index}`, path: `/page-${index}`, prompt: "", blocks: [] };
    siteSpec.value.pages.push(page);
    activePageId.value = page.id;
    selectedBlockId.value = "";
    return true;
  };

  /** 删除页面(首页不可删除) */
  const removePage = (id: string) => {
    const pages = siteSpec.value.pages;
    const index = pages.findIndex((page) => page.id === id);
    if (index <= 0) return;
    pages.splice(index, 1);
    if (activePageId.value === id) {
      const next = pages[index - 1] || pages[0];
      activePageId.value = next.id;
      selectedBlockId.value = next.blocks[0]?.id || "";
    }
  };

  /** 更新页面信息 */
  const updatePage = (id: string, patch: Partial<Pick<SitePage, "name" | "path" | "prompt">>) => {
    const page = siteSpec.value.pages.find((item) => item.id === id);
    if (!page) return;
    if (patch.name !== undefined) page.name = patch.name;
    if (patch.path !== undefined && page.path !== "/") page.path = patch.path;
    if (patch.prompt !== undefined) page.prompt = patch.prompt;
  };

  /** 选中编辑模块 */
  const selectBlock = (id: string) => {
    selectedBlockId.value = id;
  };

  /** 按给定顺序重排当前页面模块 */
  const reorderBlocks = (orderedIds: string[]) => {
    const page = activePage.value;
    if (!page || orderedIds.length !== page.blocks.length) return;
    const blockMap = new Map(page.blocks.map((block) => [block.id, block]));
    const next = orderedIds.map((id) => blockMap.get(id)).filter(Boolean) as SiteBlock[];
    if (next.length === page.blocks.length) page.blocks = next;
  };

  /** 调整模块顺序 */
  const moveBlock = (id: string, direction: -1 | 1) => {
    const page = activePage.value;
    if (!page) return;
    const index = page.blocks.findIndex((item) => item.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= page.blocks.length) return;
    const next = [...page.blocks];
    [next[index], next[target]] = [next[target], next[index]];
    page.blocks = next;
  };

  /** 切换模块显示状态 */
  const toggleBlock = (id: string) => {
    const block = blockList.value.find((item) => item.id === id);
    if (block) block.visible = !block.visible;
  };

  /** 删除模块 */
  const removeBlock = (id: string) => {
    const page = activePage.value;
    if (!page) return;
    const index = page.blocks.findIndex((item) => item.id === id);
    if (index < 0) return;
    const next = page.blocks.filter((item) => item.id !== id);
    page.blocks = next;
    if (selectedBlockId.value === id) {
      const fallback = next[index] || next[index - 1];
      selectedBlockId.value = fallback?.id || "";
    }
  };

  /** 添加预置模块 */
  const addBlock = (type: SiteBlock["type"]) => {
    const contents: Record<SiteBlock["type"], Record<string, any>> = {
      hero: { headline: "让价值被看见", subheadline: "", button_text: "联系我们" },
      features: { items: ["优势一", "优势二", "优势三"] },
      cta: { headline: "准备好开始了吗？", description: "", button_text: "立即咨询" },
      richText: { title: "", paragraphs: ["在这里补充段落内容，每行一段。"], image_keys: [] },
      gallery: { images: [] },
      video: { video_key: "", cover_image_key: "" },
      cases: { items: [{ title: "项目案例", client: "客户名称", image_key: "", description: "展示值得信赖的成果与实践。" }] },
      stats: { items: [{ value: "10+", label: "服务客户" }] },
      quote: { items: [{ quote: "客户对我们的真实评价。", author: "", company: "" }] },
      logoWall: { items: ["合作伙伴名称"] },
      team: { items: [{ name: "成员姓名", role: "职位", description: "" }] },
      timeline: { items: [{ time: "2024", title: "公司成立", description: "" }] },
      faq: { items: [{ question: "常见问题", answer: "请在这里补充回答。" }] },
      contact: { phone: "", email: "", address: "", qr_image_key: "" },
    };
    const block: SiteBlock = { id: `${type}-${Date.now()}`, type, title: blockTypeMeta[type]?.label || type, visible: true, prompt: "", content: contents[type] };
    if (!activePage.value) return;
    activePage.value.blocks = [...activePage.value.blocks, block];
    selectedBlockId.value = block.id;
  };

  /** 校验最小站点规格 */
  const validateSiteSpec = () => {
    const pages = siteSpec.value.pages;
    if (!pages.length) return "至少需要一个页面";
    if (pages[0].path !== "/") return "首页路径必须为 /";
    const paths = new Set<string>();
    for (const page of pages) {
      if (!page.path) return `「${page.name}」缺少页面路径`;
      if (paths.has(page.path)) return `页面路径 ${page.path} 重复`;
      paths.add(page.path);
      if (!page.blocks.length) return `「${page.name}」至少需要一个模块`;
    }
    return "";
  };

  return {
    siteSpec,
    activePageId,
    selectedBlockId,
    pageList,
    blockList,
    selectedBlock,
    setSiteSpec,
    selectPage,
    addPage,
    removePage,
    updatePage,
    selectBlock,
    moveBlock,
    reorderBlocks,
    toggleBlock,
    removeBlock,
    addBlock,
    validateSiteSpec,
  };
}
