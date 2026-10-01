import { cloneSiteSpec, getSiteTemplate } from "./siteTemplates";
import type { SiteBuildHistoryItem, SiteProject, SiteRevision, SiteSpec } from "./types";

const makeProject = (
  id: number,
  name: string,
  slug: string,
  templateCode: string,
  updatedAt: string,
  version: number,
): SiteProject => {
  const template = getSiteTemplate(templateCode)!;
  const spec = cloneSiteSpec(template.siteSpec);
  spec.pages[0].blocks[0].content.headline = name.replace(/（演示）$/, "");
  return {
    id,
    name,
    slug,
    site_type: template.siteType,
    template_code: templateCode,
    knowledge_base_id: id + 9000,
    current_revision_id: id + 5000,
    version,
    page_count: spec.pages.length,
    block_count: spec.pages.reduce((sum, page) => sum + page.blocks.length, 0),
    logo_text: name.replace(/（演示）$/, ""),
    seo_title: `${name}｜本地体验样例`,
    seo_description: "这是完全虚构的本地体验数据，不对应任何真实企业或账户。",
    contact_button_text: template.settings.contact_button_text,
    primary_color: template.color,
    visual_style: template.style,
    draft_data: spec,
    media_preview_urls: {},
    created_at: "2026-01-08T09:00:00+08:00",
    updated_at: updatedAt,
  };
};

/** 完全虚构且仅驻留前端内存的体验项目。 */
export const demoSiteProjects: SiteProject[] = [
  makeProject(101, "星澜实验室（演示）", "stellar-lab-demo", "company-standard", "2026-09-18T15:24:00+08:00", 3),
  makeProject(102, "纸飞机计划（演示）", "paper-plane-demo", "product-launch", "2026-09-12T10:16:00+08:00", 2),
  makeProject(103, "北屿咨询方案（演示）", "north-isle-demo", "solution-service", "2026-08-29T17:40:00+08:00", 4),
  makeProject(104, "青禾概念品牌（演示）", "green-sprout-demo", "company-standard", "2026-08-15T11:05:00+08:00", 1),
  makeProject(105, "微光产品页（演示）", "glimmer-product-demo", "product-launch", "2026-07-30T09:48:00+08:00", 2),
  makeProject(106, "远岫服务蓝图（演示）", "distant-hill-demo", "solution-service", "2026-07-11T14:20:00+08:00", 1),
];

export const demoKnowledgeBases = [
  { id: 9101, label: "星尘产品手册（虚构演示）" },
  { id: 9102, label: "纸飞机品牌资料（虚构演示）" },
  { id: 9103, label: "北屿服务说明（虚构演示）" },
];

export function findDemoProject(projectId: number): SiteProject | undefined {
  const found = demoSiteProjects.find((item) => item.id === projectId);
  return found ? structuredClone(found) : undefined;
}

export function createDemoRevision(project: SiteProject): SiteRevision {
  const spec = (typeof project.draft_data === "object" && project.draft_data
    ? structuredClone(project.draft_data)
    : getSiteTemplate(project.template_code)?.siteSpec) as SiteSpec;
  return {
    id: project.current_revision_id || project.id + 5000,
    build_id: project.id + 7000,
    version: project.version || 1,
    source_type: "demo_fixture",
    change_summary: "本地体验快照",
    created_at: project.updated_at,
    project_id: project.id,
    site_spec: spec,
    site_settings: {},
    source_refs: [],
  };
}

export function getDemoBuildHistory(projectId: number): SiteBuildHistoryItem[] {
  if (!findDemoProject(projectId)) return [];
  return [
    {
      id: projectId + 7000,
      status: "completed",
      version: 1,
      deduct_amount: 0,
      billing_status: "free",
      page_count: 1,
      created_at: "2026-06-20T10:30:00+08:00",
    },
  ];
}
