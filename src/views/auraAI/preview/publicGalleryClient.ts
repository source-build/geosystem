import { fashionCases, productCases } from "./fixtures";
import type {
  PublicGalleryKind,
  PublicGalleryPage,
  PublicGalleryRequest,
} from "./publicGalleryTypes";

function snapshotRows(kind: PublicGalleryKind, category?: string) {
  const rows = kind === "product" ? productCases : fashionCases;
  if (!category || category === "全部") return rows;
  return rows.filter((item) => item.category === category);
}

/**
 * 返回从正式环境公开案例脱敏生成的本地静态快照。
 * 体验版不会在浏览器中请求正式接口或读取登录凭证。
 */
export async function getPublicGalleryCategories(
  kind: PublicGalleryKind,
  signal?: AbortSignal,
): Promise<string[]> {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  return Array.from(
    new Set(snapshotRows(kind).map((item) => item.category).filter(Boolean)),
  );
}

export async function getPublicGallery(
  request: PublicGalleryRequest,
): Promise<PublicGalleryPage> {
  const {
    kind,
    category,
    page = 1,
    pageSize = 12,
    signal,
  } = request;

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const rows = snapshotRows(kind, category);
  const start = (page - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    source: "snapshot",
  };
}
