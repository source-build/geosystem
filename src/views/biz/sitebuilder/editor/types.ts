import type { SiteBuildStatus, SiteSpec } from "@/views/biz/sitebuilder/types";

export interface EditorSettings {
  logo_text: string;
  logo_image_key: string;
  favicon_key: string;
  seo_title: string;
  seo_description: string;
  contact_button_text: string;
}

export interface BuildStatusView {
  status: SiteBuildStatus;
  label: string;
  type: "info" | "warning" | "success" | "danger";
}

export const buildStatusViews: Record<SiteBuildStatus, BuildStatusView> = {
  queued: { status: "queued", label: "等待构建", type: "info" },
  resolving_context: { status: "resolving_context", label: "冻结建站资料", type: "warning" },
  planning: { status: "planning", label: "规划全站创意", type: "warning" },
  generating_spec: { status: "generating_spec", label: "AI 生成页面", type: "warning" },
  validating_spec: { status: "validating_spec", label: "校验页面安全性", type: "warning" },
  rendering: { status: "rendering", label: "生成静态页面", type: "warning" },
  storing_artifact: { status: "storing_artifact", label: "保存产物", type: "warning" },
  completed: { status: "completed", label: "构建完成", type: "success" },
  failed: { status: "failed", label: "构建失败", type: "danger" },
  cancelled: { status: "cancelled", label: "已取消", type: "info" },
};

/** 创建默认站点规格 */
export function createEmptySiteSpec(): SiteSpec {
  return {
    schema_version: 1,
    theme: { primary_color: "#2563eb", style: "商务简约" },
    pages: [{
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
    }],
  };
}
