import { previewAsset } from "./assets";
import { fashionCaseSnapshot, productCaseSnapshot } from "./publicCasesSnapshot";
import type {
  AuraPreviewConsumeLog,
  AuraPreviewConsumePoint,
  AuraPreviewItem,
  AuraPreviewMetric,
  AuraPreviewNotice,
  AuraPreviewSection,
} from "./types";

const image = (id: string, path: string, label: string, ratio = "1:1") => ({
  id,
  url: previewAsset(path),
  label,
  ratio,
});

const productSections = (seed: number): AuraPreviewSection[] => [
  {
    id: `product-${seed}-hero`,
    name: "首屏视觉图",
    description: "突出产品质感与核心卖点",
    quantity: 2,
    ratio: "1:1",
    resolution: "2048 × 2048",
    images: [
      image(`p${seed}-h1`, `product/product-${((seed - 1) % 4) + 1}.svg`, "品牌主视觉"),
      image(`p${seed}-h2`, `product/product-${(seed % 4) + 1}.svg`, "卖点主视觉"),
    ],
  },
  {
    id: `product-${seed}-scene`,
    name: "场景氛围图",
    description: "适配社交媒体与详情页内容",
    quantity: 2,
    ratio: "4:5",
    resolution: "1600 × 2000",
    images: [
      image(`p${seed}-s1`, `product/scene-${((seed - 1) % 4) + 1}.svg`, "生活方式场景", "4:5"),
      image(`p${seed}-s2`, `product/scene-${(seed % 4) + 1}.svg`, "细节氛围场景", "4:5"),
    ],
  },
];

const fashionSections = (seed: number): AuraPreviewSection[] => [
  {
    id: `fashion-${seed}-studio`,
    name: "棚拍 Lookbook",
    description: "统一模特与灯光风格",
    quantity: 2,
    ratio: "3:4",
    resolution: "1536 × 2048",
    images: [
      image(`f${seed}-s1`, `fashion/fashion-${((seed - 1) % 4) + 1}.svg`, "正面造型", "3:4"),
      image(`f${seed}-s2`, `fashion/fashion-${(seed % 4) + 1}.svg`, "侧面造型", "3:4"),
    ],
  },
  {
    id: `fashion-${seed}-street`,
    name: "街景内容图",
    description: "适配种草与社交媒体传播",
    quantity: 2,
    ratio: "4:5",
    resolution: "1600 × 2000",
    images: [
      image(`f${seed}-c1`, `fashion/scene-${((seed - 1) % 4) + 1}.svg`, "城市街景", "4:5"),
      image(`f${seed}-c2`, `fashion/scene-${(seed % 4) + 1}.svg`, "度假场景", "4:5"),
    ],
  },
];

const productNames = [
  ["暮光香氛礼盒", "美妆个护", "Aura Vision Pro"],
  ["极简咖啡器具", "家居生活", "Aura Studio"],
  ["云感护肤套装", "美妆个护", "Aura Vision Pro"],
  ["未来感智能耳机", "数码科技", "Aura Render X"],
  ["东方茶礼套装", "食品饮料", "Aura Studio"],
  ["轻奢旅行箱", "户外出行", "Aura Render X"],
  ["植物能量饮品", "食品饮料", "Aura Vision Pro"],
  ["桌面氛围灯", "家居生活", "Aura Studio"],
] as const;

const fashionNames = [
  ["城市轻通勤系列", "都市通勤", "Aura Fashion Pro"],
  ["假日松弛感穿搭", "度假休闲", "Aura Fashion Pro"],
  ["新中式春夏系列", "东方美学", "Aura Portrait X"],
  ["户外机能胶囊", "运动户外", "Aura Portrait X"],
  ["静奢针织系列", "都市通勤", "Aura Fashion Pro"],
  ["海岸度假系列", "度假休闲", "Aura Portrait X"],
  ["复古丹宁企划", "街头潮流", "Aura Fashion Pro"],
  ["轻量羽绒系列", "运动户外", "Aura Portrait X"],
] as const;

const makeItems = (
  kind: "product" | "fashion",
  rows: readonly (readonly [string, string, string])[],
): AuraPreviewItem[] =>
  rows.map(([title, category, modelName], index) => {
    const seed = index + 1;
    const isProduct = kind === "product";
    const sections = isProduct ? productSections(seed) : fashionSections(seed);
    return {
      id: `demo-${kind}-${String(seed).padStart(2, "0")}`,
      kind,
      title,
      category,
      modelName,
      status: index === 5 ? "partial" : index === 7 ? "processing" : "success",
      createdAt: `2026-09-${String(20 - index).padStart(2, "0")} ${String(10 + (index % 7)).padStart(2, "0")}:30`,
      cost: 36 + index * 4,
      coverUrl: sections[0].images[0].url,
      sourceUrls: [
        previewAsset(isProduct ? `product/source-${(index % 4) + 1}.svg` : `fashion/source-${(index % 4) + 1}.svg`),
      ],
      tags: isProduct ? ["电商套图", "品牌视觉", category] : ["服饰套图", "虚拟模特", category],
      likes: 128 + index * 37,
      views: 1250 + index * 289,
      sections,
    };
  });

const demoProductItems = makeItems("product", productNames);
const demoFashionItems = makeItems("fashion", fashionNames);

/** 正式环境公开创作案例的脱敏静态快照。 */
export const productCases = productCaseSnapshot;
export const fashionCases = fashionCaseSnapshot;

/** “我的作品”只使用本地虚构数据，不读取或复制正式账户作品。 */
export const productWorks = demoProductItems.slice(0, 5).map((item, index) => ({
  ...item,
  id: `demo-work-product-${index + 1}`,
  title: `${item.title} · 演示成片`,
  likes: 0,
  views: 0,
}));
export const fashionWorks = demoFashionItems.slice(0, 5).map((item, index) => ({
  ...item,
  id: `demo-work-fashion-${index + 1}`,
  title: `${item.title} · 演示成片`,
  likes: 0,
  views: 0,
}));

export const auraMetrics: AuraPreviewMetric[] = [
  { label: "演示算力", value: "12,680", hint: "本地展示额度", icon: "Lightning", tone: "violet" },
  { label: "今日生成", value: "24", hint: "演示任务快照", icon: "PictureFilled", tone: "pink" },
  { label: "累计作品", value: "286", hint: "商品与服饰素材", icon: "Collection", tone: "coral" },
  { label: "生成成功率", value: "98.6%", hint: "演示模型统计", icon: "CircleCheck", tone: "green" },
];

export const consumeTrend: AuraPreviewConsumePoint[] = [
  82, 116, 94, 138, 126, 178, 156, 204, 188, 236, 214, 268, 232, 286,
].map((value, index) => ({ date: `09-${String(index + 8).padStart(2, "0")}`, value }));

export const consumeLogs: AuraPreviewConsumeLog[] = [
  ["商品套图", "Aura Vision Pro", 8, "张", 48, "success"],
  ["服饰套图", "Aura Fashion Pro", 6, "张", 42, "success"],
  ["商品套图", "Aura Studio", 4, "张", 20, "success"],
  ["辅助策划", "Aura Copy", 1, "次", 6, "success"],
  ["服饰套图", "Aura Portrait X", 8, "张", 56, "success"],
  ["任务退款", "Aura Vision Pro", 2, "张", 12, "refunded"],
  ["商品套图", "Aura Render X", 6, "张", 54, "success"],
  ["服饰套图", "Aura Fashion Pro", 4, "张", 28, "success"],
  ["辅助帮写", "Aura Copy", 2, "次", 8, "success"],
  ["商品套图", "Aura Studio", 8, "张", 40, "success"],
].map(([featureName, modelName, quantity, unit, cost, status], index) => ({
  id: `demo-log-${index + 1}`,
  createdAt: `2026-09-${String(21 - index).padStart(2, "0")} ${String(9 + (index % 8)).padStart(2, "0")}:20`,
  featureName: String(featureName),
  modelName: String(modelName),
  quantity: Number(quantity),
  unit: String(unit),
  cost: Number(cost),
  status: status as "success" | "refunded",
}));

export const auraNotices: AuraPreviewNotice[] = [
  { id: "notice-1", title: "商品套图演示已就绪", description: "可浏览首屏图、场景图与详情分组", time: "刚刚", tone: "violet" },
  { id: "notice-2", title: "服饰案例库已更新", description: "新增通勤、度假与新中式演示方案", time: "1 小时前", tone: "pink" },
  { id: "notice-3", title: "公开体验版提示", description: "所有数据均为本地脱敏演示快照", time: "今天", tone: "coral" },
];

export const runningTasks = [
  { id: "running-1", name: "秋季香氛礼盒", type: "商品套图", cost: 48, progress: 68 },
  { id: "running-2", name: "城市轻通勤系列", type: "服饰套图", cost: 42, progress: 36 },
];
