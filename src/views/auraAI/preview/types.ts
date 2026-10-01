export type AuraPreviewKind = "product" | "fashion";
export type AuraPreviewStatus = "success" | "partial" | "processing" | "failed";

export interface AuraPreviewImage {
  id: string;
  url: string;
  label: string;
  ratio?: string;
}

export interface AuraPreviewSection {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  ratio: string;
  resolution?: string;
  images: AuraPreviewImage[];
}

export interface AuraPreviewItem {
  id: string;
  kind: AuraPreviewKind;
  title: string;
  category: string;
  modelName: string;
  status: AuraPreviewStatus;
  createdAt: string;
  cost: number;
  coverUrl: string;
  sourceUrls: string[];
  tags: string[];
  likes: number;
  views: number;
  sections: AuraPreviewSection[];
}

export interface AuraPreviewMetric {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: "violet" | "pink" | "coral" | "green";
}

export interface AuraPreviewConsumePoint {
  date: string;
  value: number;
}

export interface AuraPreviewConsumeLog {
  id: string;
  createdAt: string;
  modelName: string;
  featureName: string;
  quantity: number;
  unit: string;
  cost: number;
  status: "success" | "refunded";
}

export interface AuraPreviewNotice {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "violet" | "pink" | "coral";
}

export interface AuraMenuItem {
  title: string;
  icon: string;
  path: string;
  fullEdition?: boolean;
}

export interface AuraMenuSection {
  group: string;
  items: AuraMenuItem[];
}
