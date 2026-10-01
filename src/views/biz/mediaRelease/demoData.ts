import { mediaSnapshot } from "./preview/mediaSnapshot";

export type DemoMediaType = "news" | "self" | "wechat" | "weibo" | "xiaohongshu" | "shortVideo";

export interface DemoMedia {
  id: string;
  provider_media_id: string;
  type: DemoMediaType;
  name?: string;
  account_name?: string;
  price0?: number;
  price02?: number;
  price03?: number;
  note_art_price?: number;
  note_video_price?: number;
  fans?: number;
  reading?: number;
  followers_count?: number;
  note_art_avg_read?: number;
  note_video_avg_read?: number;
  pcbr?: number;
  mbr?: number;
  release_rate?: number;
  remarks?: string;
  area?: string;
  province?: string;
  city?: string;
  industry?: string;
  industry_type?: string;
  channel?: string;
  platform?: string;
  platform_name?: string;
  gender?: string;
  audience_gender?: string;
  audience_age?: string;
  audience_region?: string;
  price?: number;
  n_link?: boolean;
  contact_show?: boolean;
  gfrz?: number;
  self_vrz?: number;
  collection_type?: string;
  portal_type?: string;
  property?: string;
  [key: string]: unknown;
}

/** 媒体目录来自一次性正式公开目录快照；收藏和订单仍为独立虚构演示数据。 */
export const demoMediaList: DemoMedia[] = mediaSnapshot;

export const mediaTypeLabels: Record<DemoMediaType, string> = {
  news: "网媒",
  self: "自媒体",
  wechat: "公众号",
  weibo: "微博",
  xiaohongshu: "小红书",
  shortVideo: "短视频",
};

export interface DemoFavorite {
  id: string;
  group_id: string;
  provider_media_id: string;
  media_name: string;
  media_type: "normal" | "short_video" | "xiaohongshu";
  media_kind: DemoMediaType;
  media_price: number;
  media_status: number;
  created_at: string;
}

export const demoFavoriteGroups = [
  { id: "brand", name: "品牌传播", favorite_count: 3 },
  { id: "technology", name: "科技行业", favorite_count: 3 },
  { id: "lifestyle", name: "生活方式", favorite_count: 2 },
];

const favoriteSeeds = [
  ["fav-01", "brand", "snapshot-news-01", "2026-08-18 10:20", 1],
  ["fav-02", "brand", "snapshot-wechat-01", "2026-08-19 14:35", 1],
  ["fav-03", "brand", "snapshot-weibo-01", "2026-08-21 09:10", 1],
  ["fav-04", "technology", "snapshot-news-03", "2026-08-23 11:42", 1],
  ["fav-05", "technology", "snapshot-xiaohongshu-04", "2026-08-25 16:08", 1],
  ["fav-06", "technology", "snapshot-short-video-01", "2026-08-28 13:25", 1],
  ["fav-07", "lifestyle", "snapshot-xiaohongshu-02", "2026-09-01 10:05", 1],
  ["fav-08", "lifestyle", "snapshot-short-video-03", "2026-09-03 18:16", 2],
] as const;

/** 收藏关系、分组和时间均为虚构演示数据，仅引用公开目录快照中的展示项。 */
export const demoFavorites: DemoFavorite[] = favoriteSeeds.flatMap(([id, groupId, mediaId, createdAt, status]) => {
  const item = demoMediaList.find((media) => media.provider_media_id === mediaId);
  if (!item) return [];
  return [{
    id,
    group_id: groupId,
    provider_media_id: mediaId,
    media_name: item.account_name || item.name || "演示媒体",
    media_type: item.type === "shortVideo" ? "short_video" : item.type === "xiaohongshu" ? "xiaohongshu" : "normal",
    media_kind: item.type,
    media_price: Number(item.price ?? item.note_art_price ?? item.price0 ?? 0),
    media_status: status,
    created_at: createdAt,
  }];
});

export interface DemoOrder {
  id: string;
  order_no: string;
  article_title: string;
  article_content: string;
  submission_mode: number;
  status: number;
  provider_status: number;
  provider_media_type: number;
  provider_media_name: string;
  provider_media_subtype?: string;
  provider_media_channel?: string;
  power: number;
  refund_power: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  remark?: string;
  requirements: string[];
}

export const demoOrders: DemoOrder[] = [
  { id: "order-01", order_no: "DEMO-260901-001", article_title: "生成式搜索时代，品牌内容如何建立长期可见度", article_content: "## 内容摘要\n\n本文从用户问题、内容结构与可信信号三个维度，介绍品牌在生成式搜索场景中的内容建设思路。\n\n### 核心要点\n\n- 用真实问题组织内容主题\n- 通过结构化表达降低理解成本\n- 持续维护可验证的信息来源\n\n> 本稿件为公开体验版虚构内容，不对应任何真实订单。", submission_mode: 1, status: 3, provider_status: 3, provider_media_type: 1, provider_media_name: "未来商业观察", power: 2600, refund_power: 0, created_at: "2026-09-01 09:20", updated_at: "2026-09-02 15:40", published_at: "2026-09-02 15:40", remark: "保留三级标题，示例数据仅用于页面体验。", requirements: ["标题不超过30字", "正文保留来源说明", "发布前检查格式"] },
  { id: "order-02", order_no: "DEMO-260903-002", article_title: "一套面向团队协作的内容生产工作流", article_content: "## 项目背景\n\n团队希望减少重复沟通，并让选题、审核、发布形成清晰的协作链路。\n\n## 工作流建议\n\n1. 建立统一选题池\n2. 明确审核责任与交付标准\n3. 用复盘数据持续优化\n", submission_mode: 1, status: 2, provider_status: 2, provider_media_type: 2, provider_media_name: "数智运营手册", power: 7500, refund_power: 0, created_at: "2026-09-03 11:10", updated_at: "2026-09-04 09:35", remark: "内容已收稿，等待示例渠道处理。", requirements: ["保留编号列表", "不添加外部链接"] },
  { id: "order-03", order_no: "DEMO-260906-003", article_title: "城市服务品牌的内容触点设计", article_content: "## 转载说明\n\n该体验订单展示转载模式的详情结构。所有名称、时间与状态均为虚构信息。", submission_mode: 2, status: 6, provider_status: 3, provider_media_type: 3, provider_media_name: "城市新知局", provider_media_subtype: "头条", power: 13800, refund_power: 0, created_at: "2026-09-06 14:25", updated_at: "2026-09-08 12:10", published_at: "2026-09-07 18:30", requirements: ["注明内容来源", "保留原始段落结构"] },
  { id: "order-04", order_no: "DEMO-260910-004", article_title: "新品发布如何提炼三条社交传播信息", article_content: "## 社交传播建议\n\n将复杂的产品信息归纳为用户收益、使用场景与可信证据三层表达。", submission_mode: 1, status: 2, provider_status: 1, provider_media_type: 4, provider_media_name: "趋势发现官", power: 9200, refund_power: 0, created_at: "2026-09-10 10:40", updated_at: "2026-09-10 10:40", requirements: ["包含建议话题", "正文不超过800字"] },
  { id: "order-05", order_no: "DEMO-260914-005", article_title: "可持续生活方式的五个轻量实践", article_content: "## 笔记正文\n\n从节能、循环使用、绿色出行、理性消费和社区参与五个日常场景，分享更容易坚持的可持续实践。", submission_mode: 1, status: 7, provider_status: 4, provider_media_type: 5, provider_media_name: "低碳生活样本", provider_media_subtype: "图文笔记", power: 13800, refund_power: 13800, created_at: "2026-09-14 16:05", updated_at: "2026-09-16 11:20", remark: "体验订单已进入虚构退款完成状态。", requirements: ["配图不少于4张", "使用生活化表达"] },
  { id: "order-06", order_no: "DEMO-260918-006", article_title: "用三分钟讲清楚一项复杂技术", article_content: "## 视频脚本\n\n**开场：** 用一个常见问题引出主题。\n\n**中段：** 通过对比与示意拆解核心原理。\n\n**结尾：** 总结适用场景并给出行动建议。", submission_mode: 1, status: 5, provider_status: 2, provider_media_type: 6, provider_media_name: "三分钟看懂科技", provider_media_channel: "抖音", power: 26000, refund_power: 0, created_at: "2026-09-18 09:45", updated_at: "2026-09-19 17:05", remark: "虚构异常状态用于展示页面标签。", requirements: ["时长控制在3分钟内", "避免夸张结论", "字幕与旁白保持一致"] },
];
