import type { AuraMenuSection } from "./types";

export const AURA_MENU: AuraMenuSection[] = [
  {
    group: "创作中心",
    items: [
      { title: "工作台", icon: "ai-workbenches", path: "/aura/workspace" },
      { title: "AI 商品套图", icon: "ai-text-to-image", path: "/aura/product-showcase" },
      { title: "AI 服饰套图", icon: "ai-painting", path: "/aura/fashion-showcase" },
      { title: "AI 生图", icon: "ai-text-to-image", path: "/aura/preview/ai-image", fullEdition: true },
      { title: "AI 视频创作", icon: "ai-live-video", path: "/aura/preview/ai-video", fullEdition: true },
      { title: "AI 绘图", icon: "ai-painting", path: "/aura/preview/ai-draw", fullEdition: true },
    ],
  },
  {
    group: "我的资产",
    items: [
      { title: "我的作品", icon: "ai-my-work", path: "/aura/works" },
      { title: "任务中心", icon: "ai-mission-center", path: "/aura/preview/tasks", fullEdition: true },
      { title: "算力中心", icon: "ai-computing-power-center", path: "/aura/compute" },
    ],
  },
];
