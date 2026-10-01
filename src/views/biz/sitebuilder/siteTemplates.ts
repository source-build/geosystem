import type { SiteSpec, SiteType } from "@/views/biz/sitebuilder/types";

export interface SiteTemplate {
  code: string;
  name: string;
  description: string;
  siteType: SiteType;
  style: string;
  color: string;
  blocks: string[];
  settings: Record<string, any>;
  siteSpec: SiteSpec;
}

/** 创建模板默认站点规格 */
function createDefaultSpec(primaryColor: string, style: string): SiteSpec {
  return {
    schema_version: 1,
    theme: { primary_color: primaryColor, style },
    pages: [
      {
        id: "home",
        name: "首页",
        path: "/",
        prompt: "",
        blocks: [
          { id: "hero", type: "hero", title: "首屏介绍", visible: true, prompt: "", content: { headline: "让价值被看见", subheadline: "用清晰的网站介绍企业、产品和服务。", button_text: "联系我们" } },
          { id: "features", type: "features", title: "核心优势", visible: true, prompt: "", content: { items: ["专业服务", "可信赖交付", "持续支持"] } },
          { id: "cases", type: "cases", title: "客户案例", visible: true, prompt: "", content: { items: [{ title: "项目案例一", client: "客户名称", image_key: "", description: "展示值得信赖的成果与实践。" }, { title: "项目案例二", client: "客户名称", image_key: "", description: "补充第二个具有代表性的客户案例。" }] } },
          { id: "faq", type: "faq", title: "常见问题", visible: true, prompt: "", content: { items: [{ question: "如何开始合作？", answer: "欢迎通过联系方式与我们沟通需求。" }] } },
          { id: "contact", type: "contact", title: "联系我们", visible: true, prompt: "", content: { phone: "", email: "", address: "", qr_image_key: "" } },
        ],
      },
    ],
  };
}

/** 受控站点模板目录 */
export const siteTemplates: SiteTemplate[] = [
  {
    code: "company-standard",
    name: "企业品牌官网",
    description: "适合展示公司实力、服务能力和品牌故事。",
    siteType: "company",
    style: "商务简约",
    color: "#2563eb",
    blocks: ["首屏介绍", "核心优势", "客户案例", "常见问题", "联系我们"],
    settings: { logo_text: "企业名称", contact_button_text: "联系我们" },
    siteSpec: createDefaultSpec("#2563eb", "商务简约"),
  },
  {
    code: "product-launch",
    name: "产品落地页",
    description: "突出产品价值、卖点和用户转化入口。",
    siteType: "product",
    style: "现代科技",
    color: "#7c3aed",
    blocks: ["首屏介绍", "产品卖点", "应用案例", "常见问题", "联系我们"],
    settings: { logo_text: "产品名称", contact_button_text: "立即咨询" },
    siteSpec: createDefaultSpec("#7c3aed", "现代科技"),
  },
  {
    code: "solution-service",
    name: "解决方案页",
    description: "适合聚焦行业问题、服务方案和落地成果。",
    siteType: "solution",
    style: "专业可信",
    color: "#0f766e",
    blocks: ["首屏介绍", "方案优势", "落地案例", "常见问题", "联系我们"],
    settings: { logo_text: "解决方案", contact_button_text: "获取方案" },
    siteSpec: createDefaultSpec("#0f766e", "专业可信"),
  },
];

/** 按模板编码获取模板 */
export function getSiteTemplate(code: string) {
  return siteTemplates.find((item) => item.code === code);
}

/** 深拷贝模板规格，避免编辑时修改注册表 */
export function cloneSiteSpec(siteSpec: SiteSpec): SiteSpec {
  return JSON.parse(JSON.stringify(siteSpec));
}
