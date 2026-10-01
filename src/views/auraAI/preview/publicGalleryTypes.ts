import type { AuraPreviewItem } from "./types";

export type PublicGalleryKind = "product" | "fashion";

export interface PublicGalleryPage {
  rows: AuraPreviewItem[];
  total: number;
  source: "snapshot";
}

export interface PublicGalleryRequest {
  kind: PublicGalleryKind;
  category?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}
