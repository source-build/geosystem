export type SiteType = "company" | "product" | "solution";

export type SiteBuildStatus =
  | "queued"
  | "resolving_context"
  | "planning"
  | "generating_spec"
  | "validating_spec"
  | "rendering"
  | "storing_artifact"
  | "completed"
  | "failed"
  | "cancelled";

export type SiteBlockType =
  | "hero"
  | "features"
  | "cta"
  | "richText"
  | "gallery"
  | "video"
  | "cases"
  | "stats"
  | "quote"
  | "logoWall"
  | "team"
  | "timeline"
  | "faq"
  | "contact";

export interface SiteBlock {
  id: string;
  type: SiteBlockType;
  title: string;
  visible: boolean;
  prompt: string;
  theme_color?: string;
  content: Record<string, any>;
}

export interface SitePage {
  id: string;
  name: string;
  path: string;
  prompt: string;
  blocks: SiteBlock[];
}

export interface SiteSpec {
  schema_version: 1;
  theme: { primary_color: string; style: string };
  pages: SitePage[];
}

export interface SiteProject {
  id: number;
  name: string;
  slug: string;
  site_type: SiteType;
  template_code: string;
  knowledge_base_id?: number;
  current_revision_id?: number;
  version?: number;
  page_count?: number;
  block_count?: number;
  logo_text?: string;
  logo_image_key?: string;
  logo_image_url?: string;
  favicon_key?: string;
  favicon_url?: string;
  media_preview_urls?: Record<string, string>;
  seo_title?: string;
  seo_description?: string;
  contact_button_text?: string;
  primary_color?: string;
  visual_style?: string;
  draft_data?: string | Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SiteRevisionSummary {
  id: number;
  build_id: number;
  version: number;
  source_type: string;
  change_summary: string;
  created_at: string;
}

export interface SiteRevision extends SiteRevisionSummary {
  project_id: number;
  site_spec: SiteSpec;
  site_settings: Record<string, any>;
  source_refs: any[];
}

export interface SiteBuildEvent {
  id: number;
  status: SiteBuildStatus;
  message: string;
  created_at: string;
}

export interface SiteBuild {
  id: number;
  project_id: number;
  status: SiteBuildStatus;
  error_code?: string;
  error_message?: string;
  deduct_amount: number;
  billing_status: "free" | "pre_deducted" | "settling" | "consumed" | "refunding" | "refunded";
  billing_error?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteArtifact {
  id: number;
  build_id: number;
  artifact_type: string;
  storage_key: string;
  access_url: string;
  checksum: string;
  created_at: string;
}

export interface SiteBuildHistoryItem {
  id: number;
  status: SiteBuildStatus;
  version?: number;
  deduct_amount: number;
  billing_status: SiteBuild["billing_status"];
  error_message?: string;
  page_count?: number;
  created_at: string;
}

export interface UpdateSiteProjectPayload {
  name: string;
  site_type: SiteType;
  template_code: string;
  logo_text: string;
  logo_image_key: string;
  favicon_key: string;
  seo_title: string;
  seo_description: string;
  contact_button_text: string;
  primary_color: string;
  visual_style: string;
  draft_data: Record<string, any>;
}
