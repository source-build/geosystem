import type { SiteBlockType } from "@/views/biz/sitebuilder/types";

/** 模块类型元信息 */
export interface BlockTypeMeta {
  label: string;
  icon: string;
  color: string;
  description: string;
  promptPlaceholder: string;
}

const catalog = {
  hero: { label: "首屏介绍", icon: "Flag", color: "#2563eb", description: "页面顶部大标题与转化按钮", promptPlaceholder: "例如：面向制造业客户，一句话传达降本增效的价值。" },
  features: { label: "核心优势", icon: "Star", color: "#16a34a", description: "卖点列表，逐行展示", promptPlaceholder: "例如：围绕交付速度和售后保障展开，偏务实的表达。" },
  cta: { label: "行动号召", icon: "Bell", color: "#db2777", description: "醒目的转化引导区", promptPlaceholder: "例如：引导预约演示，语气热情但不过度推销。" },
  richText: { label: "图文段落", icon: "Notebook", color: "#0891b2", description: "小标题加多段正文", promptPlaceholder: "例如：讲述品牌创立故事，口语化、有温度。" },
  gallery: { label: "图片集", icon: "Picture", color: "#7c3aed", description: "多图网格展示", promptPlaceholder: "例如：图片为生产车间实拍，配简短说明文字。" },
  video: { label: "视频展示", icon: "VideoPlay", color: "#e11d48", description: "视频播放与封面图", promptPlaceholder: "例如：视频是产品演示，标题侧重功能亮点。" },
  cases: { label: "客户案例", icon: "TrophyBase", color: "#d97706", description: "案例成果与客户描述", promptPlaceholder: "例如：突出行业资质，面向采购负责人表达。" },
  stats: { label: "数据亮点", icon: "DataLine", color: "#ca8a04", description: "数字与说明的组合", promptPlaceholder: "例如：强调十年服务经验与续约率数据。" },
  quote: { label: "客户评价", icon: "ChatLineSquare", color: "#0d9488", description: "客户证言与署名", promptPlaceholder: "例如：保留客户原话的口吻，真实自然。" },
  logoWall: { label: "合作伙伴", icon: "Medal", color: "#475569", description: "合作品牌名称墙", promptPlaceholder: "例如：按行业头部客户优先排列。" },
  team: { label: "团队介绍", icon: "User", color: "#2563eb", description: "成员姓名、职位与简介", promptPlaceholder: "例如：突出核心成员的行业背景与资质。" },
  timeline: { label: "发展历程", icon: "Timer", color: "#ea580c", description: "按时间排列的重要节点", promptPlaceholder: "例如：只保留融资和获奖等关键里程碑。" },
  faq: { label: "常见问题", icon: "ChatDotRound", color: "#dc2626", description: "常见问答列表", promptPlaceholder: "例如：侧重售前咨询和交付周期类问题。" },
  contact: { label: "联系我们", icon: "Phone", color: "#0ea5e9", description: "电话、邮箱与地址", promptPlaceholder: "例如：注明工作日响应时间，降低咨询门槛。" },
} satisfies Record<SiteBlockType, BlockTypeMeta>;

/** 模块类型目录 */
export const blockTypeMeta: Record<string, BlockTypeMeta> = catalog;

/** 模块分组目录 */
export const blockGroups: Array<{ name: string; types: SiteBlockType[] }> = [
  { name: "基础", types: ["hero", "features", "cta"] },
  { name: "内容", types: ["richText", "gallery", "video", "cases"] },
  { name: "信任", types: ["stats", "quote", "logoWall"] },
  { name: "企业", types: ["team", "timeline", "faq", "contact"] },
];
